import {
  TAX_2026, MAX_UURTARIEF_2026, OPVANG_2026, KOT_2026, VNG_PEUTER_2026,
  WPM_2026, CIJFERS_JAAR, CIJFERS_BIJGEWERKT, PENSION_CONFIG_2026
} from "../data/2026/meerMinderWerken.js";

const TAX = TAX_2026;
const MAX_UURTARIEF = MAX_UURTARIEF_2026;
const OPVANG = OPVANG_2026;
const KOT = KOT_2026;
const VNG_PEUTER = VNG_PEUTER_2026;
const WPM = WPM_2026;
const PENSION_CONFIG = PENSION_CONFIG_2026;

function kotPct(income){ let r=KOT[0]; for(const x of KOT) if(income>=x[0]) r=x; return {first:r[1], next:r[2]}; }
function incomeTax(y){ if(y<=TAX.s1) return TAX.t1*y; if(y<=TAX.s2) return TAX.t1*TAX.s1+TAX.t2*(y-TAX.s1); return TAX.t1*TAX.s1+TAX.t2*(TAX.s2-TAX.s1)+TAX.t3*(y-TAX.s2); }
const ahk=(y)=>Math.max(0, y<=TAX.ahkDrempel?TAX.ahkMax:TAX.ahkMax-TAX.ahkAfbouw*(y-TAX.ahkDrempel));
/* Arbeidskorting 2026 — officiële schijventabel Belastingdienst (nog niet AOW-gerechtigd). */
const arb=(y)=>{
  if(y<=0) return 0;
  if(y<=11965) return 0.08324*y;
  if(y<=25845) return 996 + 0.31009*(y-11965);
  if(y<=45592) return 5300 + 0.01950*(y-25845);
  if(y<=TAX.arbNul) return Math.max(0, TAX.arbMax - TAX.arbAfbouw*(y-TAX.arbStart));
  return 0;
};
const iack=(y)=>Math.min(TAX.iackMax,Math.max(0,TAX.iackOpbouw*(y-TAX.iackDrempel)));
const brutoBijtelling=(c)=>c.enabled?c.pctLow*Math.min(c.cataloguswaarde,30000)+c.pctHigh*Math.max(0,c.cataloguswaarde-30000):0;
const nettoBijtelling=(c)=>c.enabled?Math.max(0,brutoBijtelling(c)-c.eigenBijdrage*12):0;
const eur=(n,d=0)=>new Intl.NumberFormat("nl-NL",{style:"currency",currency:"EUR",minimumFractionDigits:d,maximumFractionDigits:d}).format(isFinite(n)?n:0);

function vngBijdrage(income){ let r=VNG_PEUTER[0]; for(const x of VNG_PEUTER) if(income>=x[0]) r=x; return { first:r[1], next:r[2] }; }

function calc({ parents, vakantiegeld, dertiende, children, hours, si }){
  const maanden = dertiende ? 13 : 12;
  const annual = parents.map((p,i)=> p.bruto*(hours[i]/p.uren)*maanden*(1+vakantiegeld));
  const minAnnual = Math.min(...annual);
  const leastIdx = annual.indexOf(minAnnual);
  const nets = parents.map((p,i)=>{ const y=annual[i]; const credits=ahk(y)+arb(y)+(i===leastIdx?iack(y):0); return y-Math.max(0,incomeTax(y)-credits); });
  const nettoSamenMnd = nets.reduce((a,b)=>a+b,0)/12;
  const carNet = parents.reduce((s,p)=>s+nettoBijtelling(p.car),0);
  const toetsingsinkomen = annual.reduce((a,b)=>a+b,0)+carNet;
  const pct = kotPct(toetsingsinkomen);
  const minParentHours = Math.min(...hours);
  const cap = Math.min(1.4*minParentHours*WPM, 230);
  const vng = vngBijdrage(toetsingsinkomen);
  const maxDag = MAX_UURTARIEF.dagopvang;
  const childRows = children.map((c)=>{
    const forms = (c.opvang||[]).map((o)=>{ const careHours=(o.days?.[si]??0)*o.urenPerDag*WPM; return { type:o.type, tarief:o.uurtarief, underKOT:o.underKOT!==false, careHours, kosten:careHours*o.uurtarief }; });
    const kotCare = forms.filter((f)=>f.underKOT).reduce((a,f)=>a+f.careHours,0);
    const totalKosten = forms.reduce((a,f)=>a+f.kosten,0);
    return { forms, kotCare, totalKosten };
  });
  const ranked = childRows.map((r,i)=>({...r,i})).sort((a,b)=>b.totalKosten-a.totalKosten);
  let opvangkosten=0, toeslag=0, anySubsidie=false;
  ranked.forEach((r,rankIdx)=>{
    const childPct = rankIdx===0 ? pct.first : pct.next;
    const vb = rankIdx===0 ? vng.first : vng.next;
    const capFactor = (r.kotCare>cap && r.kotCare>0) ? cap/r.kotCare : 1;
    r.forms.forEach((f)=>{
      opvangkosten+=f.kosten;
      if(f.underKOT){
        const rate=MAX_UURTARIEF[f.type]??maxDag;
        toeslag+=f.careHours*Math.min(f.tarief,rate)*childPct*capFactor;
      } else {
        if(f.careHours>0) anySubsidie=true;
        const subsidiePerUur=Math.max(0, Math.min(f.tarief,maxDag)-vb);   // gemeente betaalt verschil tot max-dagtarief
        toeslag+=f.careHours*subsidiePerUur;
      }
    });
  });
  const eigenBijdrage = opvangkosten-toeslag;
  return { nettoSamenMnd, toetsingsinkomen, pctFirst:pct.first, opvangkosten, toeslag, eigenBijdrage, besteedbaar:nettoSamenMnd-eigenBijdrage, werkurenMnd:hours.reduce((a,b)=>a+b,0)*WPM, hasSubsidie:anySubsidie };
}

/* ================= styles ================= */


// Deeltijdfactor, gemaximeerd op 1 (meer dan fulltime telt niet extra).
const deeltijdfactor = (uren, fulltime)=> fulltime>0 ? Math.max(0, Math.min(1, uren/fulltime)) : 0;

/*
  input: { regeling:'middelloon'|'premie'|'onbekend', pensioengevendFT, franchise,
           opbouwPct, premiePct, fulltimeUren, urenNu, urenAlt, geboortejaar }
  Geeft indicatieve 2e-pijler-opbouw per jaar bij 'Nu' en 'Alternatief', plus het verschil.
  DB (middelloon) -> jaarlijks opgebouwd pensioenRECHT (jaarlijkse uitkering).
  DC (premie)     -> jaarlijkse premie-INLEG (géén uitkering; niet naar pensioenbedrag omgerekend).
*/
function calculatePension(input){
  const { regeling, pensioengevendFT, franchise, opbouwPct, premiePct, fulltimeUren, urenNu, urenAlt, geboortejaar } = input;
  const cap = Math.min(pensioengevendFT||0, PENSION_CONFIG.maxPensioengevendLoon);
  const grondslag = Math.max(0, cap - (franchise||0));          // fulltime pensioengrondslag
  const dtfNu = deeltijdfactor(urenNu, fulltimeUren);
  const dtfAlt = deeltijdfactor(urenAlt, fulltimeUren);
  const pct = regeling==='premie' ? (premiePct||0) : (opbouwPct||0);
  const jaarNu = grondslag * pct * dtfNu;
  const jaarAlt = grondslag * pct * dtfAlt;
  const verschilPerJaar = jaarAlt - jaarNu;                     // <0 = minder opbouw in Alternatief
  const leeftijd = geboortejaar ? (2026 - geboortejaar) : null;
  const jarenTotAOW = leeftijd!=null ? Math.max(0, PENSION_CONFIG.aowLeeftijd - leeftijd) : null;
  const berekenbaar = regeling!=='onbekend' && grondslag>0 && pct>0 && fulltimeUren>0;
  return { grondslag, dtfNu, dtfAlt, jaarNu, jaarAlt, verschilPerJaar, leeftijd, jarenTotAOW, berekenbaar, regeling, isDC: regeling==='premie' };
}


export { TAX, MAX_UURTARIEF, OPVANG, KOT, WPM, CIJFERS_JAAR, CIJFERS_BIJGEWERKT, kotPct, incomeTax, ahk, arb, iack, brutoBijtelling, nettoBijtelling, eur, VNG_PEUTER, vngBijdrage, calc, PENSION_CONFIG, deeltijdfactor, calculatePension };
