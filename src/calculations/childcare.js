import { MAX_UURTARIEF } from "../data/2026/childcare.js";
import { WPM } from "../utils/format.js";
import { kotPct, vngBijdrage } from "./allowances.js";

/* ============================================================
 * KINDEROPVANGKOSTEN + KINDEROPVANGTOESLAG
 * ============================================================
 * Deze functie is de ENIGE plek waar deze berekening staat. Zowel
 * "Deeltijd of voltijd na een kind?" als "Kinderopvangkosten" roepen 'm aan,
 * zodat er nooit twee losse implementaties van dezelfde toeslagregels
 * kunnen ontstaan.
 *
 * Officiële systematiek (Rijksoverheid / Dienst Toeslagen, 2026):
 * - Toeslag = min(werkelijk uurtarief, maximum uurtarief per opvangsoort)
 *   × toetsbare uren × vergoedingspercentage.
 * - Het vergoedingspercentage hangt af van het gezamenlijke toetsingsinkomen
 *   en is hoger voor het "eerste kind" dan voor "volgende kinderen" — waarbij
 *   het kind met de hoogste opvangkosten als eerste kind wordt gerekend
 *   (gunstigst voor het gezin, zoals de Belastingdienst dit ook toepast).
 * - Toetsbare uren per kind per maand = min(140% × gewerkte uren van de
 *   minst werkende ouder, 230 uur). Boven de 230 uur bestaat geen recht op
 *   toeslag, ongeacht de gewerkte uren.
 * - Gesubsidieerde (niet-KOT) peuteropvang volgt een andere regeling: geen
 *   kinderopvangtoeslag, maar een inkomensafhankelijke gemeentelijke
 *   ouderbijdrage (VNG-adviestabel). Gemeenten mogen hiervan afwijken.
 *
 * Bronnen: rijksoverheid.nl/onderwerpen/kinderopvangtoeslag/bedragen-kinderopvangtoeslag-2026,
 * belastingdienst.nl (Dienst Toeslagen) — "Voor hoeveel opvanguren krijg ik
 * kinderopvangtoeslag?", VNG-adviestabel ouderbijdrage peuteropvang 2026.
 *
 * input.children: [{ opvang: [{ type, uurtarief, urenPerDag, dagenPerWeek, underKOT }] }]
 * input.toetsingsinkomen: gezamenlijk (of individueel) toetsingsinkomen, per jaar
 * input.minParentHoursPerWeek: gewerkte uren/week van de minst werkende ouder;
 *   null/0 = onbekend, dan wordt alleen de absolute 230-uursgrens toegepast
 *   (geen extra beperking via de 140%-koppeling — expliciet als aanname tonen in de UI).
 */
export function calculateChildcare({ children, toetsingsinkomen, minParentHoursPerWeek }){
  const pct = kotPct(toetsingsinkomen || 0);
  const vng = vngBijdrage(toetsingsinkomen || 0);
  const maxDag = MAX_UURTARIEF.dagopvang;
  const urenkoppelingActief = minParentHoursPerWeek!=null && minParentHoursPerWeek>0;
  const cap = urenkoppelingActief ? Math.min(1.4*minParentHoursPerWeek*WPM, 230) : 230;

  const ruw = (children||[]).map((c, index)=>{
    const forms = (c.opvang||[]).map((o)=>{
      const careHoursPerMaand = Math.max(0,(o.dagenPerWeek||0)) * Math.max(0,(o.urenPerDag||0)) * WPM;
      const kosten = careHoursPerMaand * Math.max(0, o.uurtarief||0);
      return { type:o.type, uurtarief:Math.max(0,o.uurtarief||0), careHoursPerMaand, kosten, underKOT: o.underKOT!==false };
    });
    const kotUren = forms.filter((f)=>f.underKOT).reduce((a,f)=>a+f.careHoursPerMaand,0);
    const totaalKosten = forms.reduce((a,f)=>a+f.kosten,0);
    return { index, forms, kotUren, totaalKosten };
  });

  const gerangschikt = [...ruw].sort((a,b)=>b.totaalKosten-a.totaalKosten);

  let opvangkostenPerMaand=0, toeslagPerMaand=0, heeftGemeentesubsidie=false;
  const perKindRuw = [];
  gerangschikt.forEach((r, rang)=>{
    const kindPct = rang===0 ? pct.first : pct.next;
    const vngPct = rang===0 ? vng.first : vng.next;
    const capFactor = (r.kotUren>cap && r.kotUren>0) ? cap/r.kotUren : 1;
    let kindKosten=0, kindToeslag=0, bovenMaximum=0;
    const vormen = r.forms.map((f)=>{
      kindKosten += f.kosten;
      const maxTariefVoorVorm = MAX_UURTARIEF[f.type] ?? maxDag;
      let vormToeslag = 0;
      if(f.underKOT){
        vormToeslag = f.careHoursPerMaand * Math.min(f.uurtarief, maxTariefVoorVorm) * kindPct * capFactor;
        bovenMaximum += Math.max(0, f.uurtarief - maxTariefVoorVorm) * f.careHoursPerMaand;
      } else {
        if(f.careHoursPerMaand>0) heeftGemeentesubsidie = true;
        const subsidiePerUur = Math.max(0, Math.min(f.uurtarief, maxDag) - vngPct);
        vormToeslag = f.careHoursPerMaand * subsidiePerUur;
      }
      kindToeslag += vormToeslag;
      return { ...f, maxTariefVoorVorm, toeslagPerMaand: vormToeslag };
    });
    opvangkostenPerMaand += kindKosten;
    toeslagPerMaand += kindToeslag;
    perKindRuw.push({
      index: r.index, rang: rang===0?"eerste":"volgend", vergoedingspercentage: kindPct,
      opvangkostenPerMaand: kindKosten, toeslagPerMaand: kindToeslag,
      eigenBijdragePerMaand: kindKosten-kindToeslag, vormen,
      urenBovenMaximum: r.kotUren>cap, toetsbareUren: Math.min(r.kotUren, cap),
      kostenBovenMaximumUurprijs: bovenMaximum,
    });
  });

  perKindRuw.sort((a,b)=>a.index-b.index); // oorspronkelijke volgorde terug, voor nette weergave

  const eigenBijdragePerMaand = opvangkostenPerMaand - toeslagPerMaand;
  return {
    perKind: perKindRuw,
    opvangkostenPerMaand, toeslagPerMaand, eigenBijdragePerMaand,
    opvangkostenPerJaar: opvangkostenPerMaand*12,
    toeslagPerJaar: toeslagPerMaand*12,
    eigenBijdragePerJaar: eigenBijdragePerMaand*12,
    vergoedPercentageGemiddeld: opvangkostenPerMaand>0 ? toeslagPerMaand/opvangkostenPerMaand : 0,
    vergoedingspercentageEersteKind: pct.first,
    heeftGemeentesubsidie, urenkoppelingActief, maximumUrenPerMaand: cap,
  };
}
