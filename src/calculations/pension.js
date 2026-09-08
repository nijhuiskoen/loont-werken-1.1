import { PENSION_CONFIG, PENSION_MODEL_AANNAMES } from "../data/2026/pension.js";
import { getAowLeeftijd, AOW_BEDRAGEN } from "../data/2026/aow.js";
import { JAARRUIMTE_CONFIG } from "../data/2026/jaarruimte.js";
import { CIJFERS_JAAR } from "../data/2026/meta.js";

/* ============================================================
 * PENSIOENBEREKENINGEN — indicatief, 2e pijler (werkgeverspensioen)
 * ============================================================
 * Elke functie doet één ding en heeft een duidelijke input/output, zodat
 * duidelijk is wat een FEIT is (fiscale parameter, bron) en wat een
 * MODELAANNAME is (rendement, verdeling, omzetting naar uitkering).
 *
 * Belangrijk onderscheid dat in de hele module wordt aangehouden:
 * - "opbouw" (middelloon/DB)  → een stukje GEGARANDEERD pensioenRECHT (jaarlijkse uitkering)
 * - "inleg/premie" (DC)       → een bedrag dat wordt BELEGD; de latere uitkering hangt af van rendement
 * Deze twee zijn financieel niet hetzelfde en worden nooit door elkaar gebruikt.
 */

export const deeltijdfactor = (uren, fulltime)=> fulltime>0 ? Math.max(0, Math.min(1, uren/fulltime)) : 0;

/** Pensioengrondslag = (pensioengevend salaris, gemaximeerd) − franchise. */
export function calculatePensionGrondslag(pensioengevendFT, franchise){
  const cap = Math.min(pensioengevendFT||0, PENSION_CONFIG.maxPensioengevendLoon);
  return Math.max(0, cap - (franchise||0));
}

/** Middelloon (DB): jaarlijks opgebouwd pensioenRECHT (een stukje toekomstige jaaruitkering). */
export function calculatePensionAccrual({ grondslag, opbouwPct, dtf }){
  return grondslag * (opbouwPct||0) * dtf;
}

/**
 * Premieregeling (DC): jaarlijkse premie-inleg, optioneel gesplitst in
 * werkgevers- en werknemersdeel. Zonder eigen verdeling gebruiken we de
 * MODELAANNAME uit PENSION_MODEL_AANNAMES (nooit als officieel getal tonen).
 */
export function calculatePensionContribution({ grondslag, premiePct, dtf, werkgeversAandeel }){
  const totaal = grondslag * (premiePct||0) * dtf;
  const wgAandeel = werkgeversAandeel!=null ? werkgeversAandeel : PENSION_MODEL_AANNAMES.standaardWerkgeversAandeel;
  return { totaal, werkgever: totaal*wgAandeel, werknemer: totaal*(1-wgAandeel), wgAandeelIsAanname: werkgeversAandeel==null };
}

/**
 * Toekomstig pensioenvermogen bij een premieregeling: jaarlijkse inleg die
 * `jaren` lang met een MODELMATIG (dus niet gegarandeerd) rendement groeit.
 * Eenvoudige jaarlijkse annuïteit-vooraf; geen kosten/premievrijstelling verrekend.
 */
export function calculateFuturePensionPot({ jaarlijkseInleg, jaren, rendement }){
  const r = rendement!=null ? rendement : PENSION_MODEL_AANNAMES.nominaalRendement;
  if(jaren<=0 || jaarlijkseInleg<=0) return 0;
  if(Math.abs(r)<1e-9) return jaarlijkseInleg*jaren;
  return jaarlijkseInleg * (((1+r)**jaren - 1)/r) * (1+r);
}

/**
 * Grove, transparante omzetting van een pensioenpot naar een geschat
 * maandinkomen: vaste annuïteit over `uitkeringsjaren`, met het OPBOUW-
 * rendement dat na pensionering vaak lager/voorzichtiger wordt aangehouden.
 * GEEN sterftetafel, GEEN garantie — expliciet een model, geen offerte.
 */
export function calculateEstimatedMonthlyIncome({ pensioenvermogen, uitkeringsjaren, rendement }){
  const n = uitkeringsjaren!=null ? uitkeringsjaren : PENSION_MODEL_AANNAMES.uitkeringsjarenAanname;
  const r = rendement!=null ? rendement : PENSION_MODEL_AANNAMES.nominaalRendement/2; // voorzichtiger na pensionering
  if(pensioenvermogen<=0 || n<=0) return 0;
  const jaarlijks = Math.abs(r)<1e-9 ? pensioenvermogen/n : pensioenvermogen * (r/(1-(1+r)**-n));
  return jaarlijks/12;
}

/** AOW: apart van werken/uren — hangt af van geboortejaar, niet van uren. */
export function calculateAow(geboortejaar, leeftijd){
  const lft = getAowLeeftijd(geboortejaar);
  const jarenTot = leeftijd!=null ? Math.max(0, Math.round((lft.inJaren - leeftijd)*10)/10) : null;
  return {
    ...lft,
    jarenTot,
    brutoJaarAlleenstaand: AOW_BEDRAGEN.brutoJaarAlleenstaand,
    brutoJaarGehuwdPP: AOW_BEDRAGEN.brutoJaarGehuwdPP,
    bronBedragen: AOW_BEDRAGEN.bron, bronBedragenUrl: AOW_BEDRAGEN.bronUrl,
  };
}

/**
 * Jaarruimte 2026 (vrijwillige aanvullende opbouw, 3e pijler) — officiële
 * Belastingdienst-formule. Retourneert null als er te weinig gegevens zijn
 * (dan verwijst de UI naar het officiële hulpmiddel i.p.v. te gokken).
 */
export function calculateJaarruimte({ inkomenVorigJaar, factorA, franchise }){
  if(!(inkomenVorigJaar>0)) return null;
  const fr = franchise!=null ? franchise : PENSION_CONFIG.standaardFranchise;
  const premiegrondslag = Math.max(0, Math.min(inkomenVorigJaar, PENSION_CONFIG.maxPensioengevendLoon) - fr);
  const ruwe = JAARRUIMTE_CONFIG.premiePercentage*premiegrondslag - JAARRUIMTE_CONFIG.factorAVermenigvuldiger*(factorA||0);
  const jaarruimte = Math.max(0, Math.min(ruwe, JAARRUIMTE_CONFIG.maxJaarruimte));
  return { premiegrondslag, jaarruimte, config: JAARRUIMTE_CONFIG };
}

/**
 * Hoofdvergelijking "Nu" vs "Alternatief" — gebruikt door de wizard.
 * Backward compatible: alle velden die de UI al gebruikte (jaarNu, jaarAlt,
 * verschilPerJaar, jarenTotAOW, berekenbaar, isDC, grondslag, dtfNu/dtfAlt)
 * blijven bestaan; nieuwe velden zijn ernaast toegevoegd.
 */
export function calculatePension(input){
  const { regeling, pensioengevendFT, franchise, opbouwPct, premiePct, werkgeversAandeel,
          fulltimeUren, urenNu, urenAlt, geboortejaar, gewensteAOWLeeftijd } = input;

  const grondslag = calculatePensionGrondslag(pensioengevendFT, franchise);
  const dtfNu = deeltijdfactor(urenNu, fulltimeUren);
  const dtfAlt = deeltijdfactor(urenAlt, fulltimeUren);
  const isDC = regeling==='premie';
  const pct = isDC ? (premiePct||0) : (opbouwPct||0);

  // Backward-compatible kernvelden (DB: pensioenrecht; DC: premie-inleg).
  const jaarNu = isDC
    ? calculatePensionContribution({ grondslag, premiePct, dtf:dtfNu, werkgeversAandeel }).totaal
    : calculatePensionAccrual({ grondslag, opbouwPct, dtf:dtfNu });
  const jaarAlt = isDC
    ? calculatePensionContribution({ grondslag, premiePct, dtf:dtfAlt, werkgeversAandeel }).totaal
    : calculatePensionAccrual({ grondslag, opbouwPct, dtf:dtfAlt });
  const verschilPerJaar = jaarAlt - jaarNu;

  const leeftijd = geboortejaar ? (CIJFERS_JAAR - geboortejaar) : null;
  const aow = geboortejaar ? calculateAow(geboortejaar, leeftijd) : null;
  const jarenTotAOW = aow ? aow.jarenTot : null;
  const jarenTotPensioen = jarenTotAOW; // zonder apart pensioenmoment-invoer gelijk aan AOW-leeftijd

  const berekenbaar = regeling!=='onbekend' && grondslag>0 && pct>0 && fulltimeUren>0;

  // Nieuw: bij een premieregeling ook het opgebouwde VERMOGEN en een geschat
  // maandinkomen projecteren over de resterende jaren tot AOW-leeftijd.
  let vermogenNu=null, vermogenAlt=null, vermogenVerschil=null, geschatMaandinkomenNu=null, geschatMaandinkomenAlt=null;
  if(isDC && berekenbaar && jarenTotPensioen!=null && jarenTotPensioen>0){
    vermogenNu = calculateFuturePensionPot({ jaarlijkseInleg:jaarNu, jaren:jarenTotPensioen });
    vermogenAlt = calculateFuturePensionPot({ jaarlijkseInleg:jaarAlt, jaren:jarenTotPensioen });
    vermogenVerschil = vermogenAlt - vermogenNu;
    geschatMaandinkomenNu = calculateEstimatedMonthlyIncome({ pensioenvermogen:vermogenNu });
    geschatMaandinkomenAlt = calculateEstimatedMonthlyIncome({ pensioenvermogen:vermogenAlt });
  }

  return {
    // bestaande velden (ongewijzigd van naam/betekenis)
    grondslag, dtfNu, dtfAlt, jaarNu, jaarAlt, verschilPerJaar,
    leeftijd, jarenTotAOW, berekenbaar, regeling, isDC,
    // nieuw
    aow, jarenTotPensioen,
    vermogenNu, vermogenAlt, vermogenVerschil,
    geschatMaandinkomenNu, geschatMaandinkomenAlt,
    modelAannames: isDC ? {
      rendement: PENSION_MODEL_AANNAMES.nominaalRendement,
      uitkeringsjaren: PENSION_MODEL_AANNAMES.uitkeringsjarenAanname,
    } : null,
  };
}
