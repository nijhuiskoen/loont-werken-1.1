import { incomeTax, ahk, arb, calculateBijzonderTarief } from "./tax.js";
import { getAowLeeftijd } from "../data/2026/aow.js";
import { DEFAULT_TAX_YEAR, getTaxYear } from "../config/taxYears.js";

/* ============================================================
 * NETTO SALARIS — bruto naar netto voor één persoon, één dienstverband.
 * ============================================================
 * Hergebruikt bewust dezelfde belastingfuncties (incomeTax/ahk/arb) als de
 * "Deeltijd of voltijd na een kind?"-calculator — geen nieuwe fiscale
 * formules, alleen een andere, eenvoudigere invoer eromheen.
 *
 * Belangrijke conventie (consistent met de rest van het platform): het
 * ingevoerde bruto salaris is EXCLUSIEF vakantiegeld. Vakantiegeld wordt er
 * apart bovenop berekend, precies zoals op een Nederlandse loonstrook.
 *
 * Pensioenpremie wordt vóór de belasting van het loon afgetrokken
 * (pensioenpremie is fiscaal aftrekbaar — het loon waarover je belasting
 * betaalt is dus lager dan je bruto salaris). Er wordt GEEN premiepercentage
 * verzonnen: zonder eigen opgave rekent de calculator zonder pensioeninhouding
 * en zegt dat expliciet.
 */

export function calculateNetSalary(input){
  const {
    brutoBedrag, brutoPeriode = "maand",       // "maand" | "jaar"
    geboortejaar = null,
    loonheffingskorting = true,
    vakantiegeldPct = null,                     // null = gebruik jaarstandaard
    pensioen = { type: "geen" },                // { type:"geen" } | { type:"werkgever", premieType:"percentage"|"bedrag", premieWaarde:number }
    overigeInhoudingenPerMaand = 0,
    dertiendeMaand = { type: "geen" },           // { type:"geen"|"vast"|"pctJaar"|"pctMaand", waarde:number }
    taxYear = DEFAULT_TAX_YEAR,
  } = input;

  const cfg = getTaxYear(taxYear);
  const vakPct = vakantiegeldPct!=null ? vakantiegeldPct : cfg.vakantiegeldStandaard;

  // AOW-check: deze engine rekent met de tarieven voor mensen die nog geen
  // AOW ontvangen. Voor AOW-gerechtigden gelden andere premies (geen
  // AOW-premie in box 1, wel ouderenkorting) die hier niet zijn gemodelleerd
  // — liever dat expliciet zeggen dan een verzonnen tarief tonen.
  let aow = null;
  if(geboortejaar){
    aow = getAowLeeftijd(geboortejaar);
    const leeftijd = cfg.jaar - geboortejaar;
    if(leeftijd >= aow.inJaren){
      return { berekenbaar:false, reason:"aow", aow, taxYear:cfg.jaar };
    }
  }

  if(!(brutoBedrag>0)){
    return { berekenbaar:false, reason:"geen-inkomen", taxYear:cfg.jaar };
  }

  const brutoPerMaand = brutoPeriode==="jaar" ? brutoBedrag/12 : brutoBedrag;
  const brutoPerJaarExclVak = Math.max(0, brutoPerMaand) * 12;
  const vakantiegeldPerJaar = brutoPerJaarExclVak * Math.max(0, vakPct);
  const brutoPerJaar = brutoPerJaarExclVak + vakantiegeldPerJaar;

  // Pensioenpremie (werknemersdeel) — uitsluitend als de gebruiker die zelf opgeeft.
  let pensioenPremiePerJaar = 0;
  if(pensioen && pensioen.type==="werkgever"){
    if(pensioen.premieType==="bedrag"){
      pensioenPremiePerJaar = Math.max(0, pensioen.premieWaarde||0) * 12;
    } else {
      pensioenPremiePerJaar = brutoPerJaarExclVak * Math.max(0, (pensioen.premieWaarde||0)/100);
    }
  }
  const pensioenOpgegeven = pensioen && pensioen.type==="werkgever" && (pensioen.premieWaarde>0);

  const belastbaarInkomen = Math.max(0, brutoPerJaar - pensioenPremiePerJaar);
  const tax = incomeTax(belastbaarInkomen);
  const credits = loonheffingskorting ? (ahk(belastbaarInkomen) + arb(belastbaarInkomen)) : 0;
  const loonheffingPerJaar = Math.max(0, tax - credits);

  const overigeInhoudingenPerJaar = Math.max(0, overigeInhoudingenPerMaand||0) * 12;
  const nettoPerJaar = belastbaarInkomen - loonheffingPerJaar - overigeInhoudingenPerJaar;
  const nettoPerMaand = nettoPerJaar/12;

  // Indicatieve verdeling van het netto-vakantiegeld: het vakantiegeld wordt
  // in werkelijkheid via de cumulatieve loonheffingstabel belast; als
  // benadering passen we de gemiddelde effectieve belastingdruk van dit
  // salaris toe op het vakantiegeld-deel. Duidelijk als indicatie gelabeld.
  const gemiddeldeDruk = belastbaarInkomen>0 ? loonheffingPerJaar/belastbaarInkomen : 0;
  const nettoVakantiegeldIndicatief = vakantiegeldPerJaar * (1-gemiddeldeDruk);

  // 13e maand / eindejaarsuitkering — fiscaal een "bijzondere beloning":
  // belast tegen het bijzonder tarief (marginaal tarief op je herleide
  // jaarloon), NIET tegen het gewone maandtarief. Staat daarom volledig los
  // van het reguliere salaris hierboven.
  let bruto13eMaand = 0;
  if(dertiendeMaand && dertiendeMaand.type!=="geen"){
    const w = Math.max(0, dertiendeMaand.waarde||0);
    if(dertiendeMaand.type==="vast") bruto13eMaand = w;
    else if(dertiendeMaand.type==="pctJaar") bruto13eMaand = brutoPerJaarExclVak * (w/100);
    else if(dertiendeMaand.type==="pctMaand") bruto13eMaand = brutoPerMaand * (w/100);
  }
  const bijzonderTariefPct = bruto13eMaand>0 ? calculateBijzonderTarief(belastbaarInkomen, loonheffingskorting) : 0;
  const loonheffing13eMaand = bruto13eMaand * bijzonderTariefPct;
  const netto13eMaand = bruto13eMaand - loonheffing13eMaand;
  const totaalBrutoJaar = brutoPerJaar + bruto13eMaand;
  const totaalNettoJaar = nettoPerJaar + netto13eMaand;

  return {
    berekenbaar: true, taxYear: cfg.jaar, bron: cfg.bron, bronUrl: cfg.bronUrl,
    brutoPerMaand, brutoPerJaarExclVak, brutoPerJaar, vakantiegeldPerJaar, vakPct,
    pensioenPremiePerJaar, pensioenPremiePerMaand: pensioenPremiePerJaar/12, pensioenOpgegeven,
    belastbaarInkomen, loonheffingPerJaar, loonheffingPerMaand: loonheffingPerJaar/12,
    loonheffingskortingToegepast: loonheffingskorting,
    overigeInhoudingenPerJaar, overigeInhoudingenPerMaand: overigeInhoudingenPerJaar/12,
    nettoPerJaar, nettoPerMaand, nettoVakantiegeldIndicatief,
    nettoBrutoPercentage: brutoPerJaar>0 ? nettoPerJaar/brutoPerJaar : 0,
    aow,
    bruto13eMaand, loonheffing13eMaand, netto13eMaand, bijzonderTariefPct,
    totaalBrutoJaar, totaalNettoJaar,
  };
}
