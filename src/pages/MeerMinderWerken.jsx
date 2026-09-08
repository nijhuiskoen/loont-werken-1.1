import React, { useState, useMemo, useId, useEffect } from "react";
import { ArrowLeft, ArrowRight, Car, Check, RefreshCw, Users, Plus, Info, Trash2, Printer, Copy, Share2 } from "lucide-react";

import CalculatorLayout from "../components/CalculatorLayout.jsx";
import { NumField, Euro, Pct, Stepper } from "../components/FormFields.jsx";
import { RadioPills, RadioTiles } from "../components/ChoiceFields.jsx";
import { SRow } from "../components/ResultRow.jsx";
import { HoursChart } from "../components/HoursChart.jsx";

import { calculateScenario } from "../calculations/income.js";
import { calculatePension, calculatePensionContribution, calculateJaarruimte } from "../calculations/pension.js";
import { brutoBijtelling } from "../calculations/car.js";
import { PENSION_CONFIG, PENSION_MODEL_AANNAMES } from "../data/2026/pension.js";
import { JAARRUIMTE_CONFIG } from "../data/2026/jaarruimte.js";
import { MAX_UURTARIEF, OPVANG } from "../data/2026/childcare.js";
import { CIJFERS_JAAR, CIJFERS_BIJGEWERKT } from "../data/2026/meta.js";
import { eur } from "../utils/format.js";
import { saveState, loadState, clearState } from "../utils/storage.js";
import { encodeShare, decodeShare, readShareToken, buildShareUrl } from "../utils/share.js";

const newParent = (name)=>({ name, bruto:0, uren:32, car:{ enabled:false, cataloguswaarde:0, pctLow:0.22, pctHigh:0.22, eigenBijdrage:0 } });
const newChild = (n)=>({ name:"", opvang:[ { type:"dagopvang", urenPerDag:OPVANG.dagopvang.uren, uurtarief:OPVANG.dagopvang.tarief, days:[2,2], underKOT:true } ] });

const ASIDE = {
  household:{t:"Jullie gezin", d:"Wie werken er, en hoe heten ze?"},
  salary:{t:"Salaris", d:"Wat komt er maandelijks binnen?"},
  cars:{t:"Auto van de zaak", d:"De bijtelling telt mee voor de toeslag."},
  childcount:{t:"Kinderen", d:"Hoeveel gaan er naar de opvang?"},
  child:{t:"De opvang", d:"Per kind de details."},
  pension:{t:"Pensioen", d:"Wat betekent dit voor later?"},
};

function MeerMinderWerkenCalculator(){
  const uid = useId();
  const [step, setStep] = useState(0);
  const [vakantiegeld, setVakantiegeld] = useState(0.08);
  const [dertiende, setDertiende] = useState(false);
  const [saveState_, setSaveState_] = useState("idle");   // idle | saved | unavailable
  const [hydrated, setHydrated] = useState(false);
  const [fromLink, setFromLink] = useState(false);
  const [parents, setParents] = useState([
    { name:"", bruto:0, uren:40, car:{ enabled:false, cataloguswaarde:0, pctLow:0.22, pctHigh:0.22, eigenBijdrage:0 } },
    { name:"", bruto:0, uren:40, car:{ enabled:false, cataloguswaarde:0, pctLow:0.22, pctHigh:0.22, eigenBijdrage:0 } },
  ]);
  const [children, setChildren] = useState([]);
  const [scenarios, setScenarios] = useState([
    { name:"Nu", hours:[40,40] },
    { name:"Alternatief", hours:[32,32] },
  ]);
  const [pension, setPension] = useState({ enabled:false, forParent:0, geboortejaar:0, regeling:"middelloon", pensioengevendFT:0, franchise:PENSION_CONFIG.standaardFranchise, opbouwPct:1.875, premiePct:30, fulltimeUren:40, inkomenVorigJaar:0, factorA:0 });

  const patchParent=(i,x)=>setParents((p)=>p.map((v,j)=>j===i?{...v,...x}:v));
  const patchCar=(i,x)=>setParents((p)=>p.map((v,j)=>j===i?{...v,car:{...v.car,...x}}:v));
  const patchChild=(i,x)=>setChildren((c)=>c.map((v,j)=>j===i?{...v,...x}:v));
  const patchOpvang=(ci,oi,x)=>setChildren((cs)=>cs.map((c,j)=> j!==ci?c:{...c,opvang:c.opvang.map((o,k)=>k!==oi?o:{...o,...x})}));
  const MAX_OPVANG_PER_KIND = 4;   // evenveel als er opvangvormen bestaan (dagopvang/bso/gastouder/peuterspeelzaal)
  const addOpvang=(ci)=>setChildren((cs)=>cs.map((c,j)=> {
    if(j!==ci || c.opvang.length>=MAX_OPVANG_PER_KIND) return c;
    return {...c,opvang:[...c.opvang,{ type:"peuterspeelzaal", urenPerDag:OPVANG.peuterspeelzaal.uren, uurtarief:OPVANG.peuterspeelzaal.tarief, days:[2,2], underKOT:true }]};
  }));
  const removeOpvang=(ci,oi)=>setChildren((cs)=>cs.map((c,j)=> j!==ci?c:{...c,opvang:c.opvang.length>1?c.opvang.filter((_,k)=>k!==oi):c.opvang}));
  const setOpvangDays=(ci,oi,sci,val)=>setChildren((cs)=>cs.map((c,j)=> j!==ci?c:{...c,opvang:c.opvang.map((o,k)=>{ if(k!==oi) return o; const d=[...(o.days||[0,0])]; d[sci]=val; return {...o,days:d}; })}));
  const patchScenario=(i,x)=>setScenarios((s)=>s.map((v,j)=>j===i?{...v,...x}:v));
  const patchPension=(x)=>setPension((p)=>({...p,...x}));
  const jaarloonVan=(i)=>{ const pr=parents[i]; if(!pr||!pr.bruto||!pr.uren) return 0; return Math.round(pr.bruto*(40/pr.uren)*(dertiende?13:12)*(1+vakantiegeld)); };
  const setPensionParent=(i)=>{ setPension((p)=>({...p, forParent:i, pensioengevendFT:jaarloonVan(i)})); };
  const setHours=(si,pi,val)=>setScenarios((s)=>s.map((v,j)=>{ if(j!==si) return v; const h=[...v.hours]; h[pi]=val; return {...v,hours:h}; }));
  const setParentCount=(n)=>{
    setParents((p)=>{ const a=[...p]; while(a.length<n) a.push(newParent(`Ouder ${a.length+1}`)); return a.slice(0,n); });
    setScenarios((s)=>s.map((sc)=>{ const h=[...sc.hours]; while(h.length<n) h.push(32); return {...sc, hours:h.slice(0,n)}; }));
  };
  const setParentUren=(i,val)=>{ patchParent(i,{uren:val}); setScenarios((s)=>s.map((sc,j)=>{ if(j!==0) return sc; const h=[...sc.hours]; h[i]=val; return {...sc,hours:h}; })); };
  const setChildCount=(n)=>{
    setChildren((c)=>{ const a=[...c]; while(a.length<n) a.push(newChild(a.length+1)); return a.slice(0,n); });
  };

  const flow = useMemo(()=>{
    const f=[{k:"intro"},{k:"household"}];
    parents.forEach((_,i)=>f.push({k:"salary",i}));
    f.push({k:"cars"},{k:"childcount"});
    children.forEach((_,i)=>f.push({k:"child",i}));
    f.push({k:"scenario",i:0},{k:"scenario",i:1},{k:"pension"},{k:"result"});
    return f;
  },[parents.length, children.length]);

  const idx=Math.min(step, flow.length-1);
  const cur=flow[idx];
  const total=flow.length-2;                 // steps excluding intro + result
  // Sluit het mobiele toetsenbord voordat we van stap wisselen.
  const dismissKeyboard = ()=>{
    try{
      const el=document.activeElement;
      if(el && typeof el.blur==="function" && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) el.blur();
    }catch(e){}
  };
  const navLock = React.useRef(0);
  const canNav = ()=>{ const t=Date.now(); if(t-navLock.current<400) return false; navLock.current=t; return true; };
  const next=()=>{ if(!canNav()) return; dismissKeyboard(); setStep((s)=>Math.min(s+1, flow.length-1)); };
  const back=()=>{ if(!canNav()) return; dismissKeyboard(); setStep((s)=>Math.max(s-1, 0)); };
  const goto=(k,i)=>{ dismissKeyboard(); setStep(flow.findIndex((f)=>f.k===k && (i===undefined||f.i===i))); };

  const results=scenarios.map((sc,si)=>calculateScenario({ parents, vakantiegeld, dertiende, children, hours:sc.hours, si }));
  const [A,B]=results;
  const diffBesteedbaar=A.besteedbaar-B.besteedbaar;
  const diffUren=A.werkurenMnd-B.werkurenMnd;
  const perUur=diffUren!==0 ? diffBesteedbaar/diffUren : 0;
  const moreScenario=diffUren>=0 ? scenarios[0] : scenarios[1];
  const winner=A.besteedbaar>=B.besteedbaar ? 0 : 1;
  const isResult=cur.k==="result";
  const floorReached=children.length>0 && results.every((r)=> r.pctFirst<=0.366);
  const heroSummary=`Elk extra werkuur in scenario ${moreScenario.name} levert netto ${eur(Math.abs(perUur),2)} op. Dat is ${eur(Math.abs(diffBesteedbaar))} meer besteedbaar per maand, voor ${Math.abs(Math.round(diffUren))} extra werkuren per maand.`;
  // ---- validatie: wat moet ingevuld zijn voordat je verder kunt ----
  const stepErrors = (()=>{
    const e=[];
    const uOK=(u)=> Number.isFinite(u) && u>0 && u<=80;
    if(cur.k==="household"){
      parents.forEach((p,i)=>{ if(!p.name || !p.name.trim()) e.push(`Vul de naam van ouder ${i+1} in.`); });
    }
    if(cur.k==="salary"){
      const p=parents[cur.i];
      if(!(p.bruto>0)) e.push(`Vul het bruto maandsalaris van ${p.name||"deze ouder"} in.`);
      if(!uOK(p.uren)) e.push("Vul een geldig aantal uren per week in (1 tot 80).");
      if(cur.i===0){
        if(!(vakantiegeld>=0 && vakantiegeld<=0.25)) e.push("Vul een realistisch vakantiegeldpercentage in (0 tot 25%).");
      }
    }
    if(cur.k==="cars"){
      parents.forEach((p)=>{ if(p.car.enabled){
        if(!(p.car.cataloguswaarde>0)) e.push(`Vul de cataloguswaarde van de auto van ${p.name||"deze ouder"} in.`);
        if(p.car.eigenBijdrage<0) e.push("De eigen bijdrage kan niet negatief zijn.");
        if(!(p.car.pctLow>=0 && p.car.pctLow<=1)) e.push("Vul een geldig bijtellingspercentage in.");
      }});
    }
    if(cur.k==="child"){
      const c=children[cur.i];
      if(!c.name || !c.name.trim()) e.push("Vul de naam van het kind in.");
      if(!c.opvang || c.opvang.length===0) e.push("Voeg minstens één opvangvorm toe.");
      (c.opvang||[]).forEach((o,oi)=>{
        if(!(o.urenPerDag>0 && o.urenPerDag<=24)) e.push(`Opvangvorm ${oi+1}: vul geldige uren per opvangdag in.`);
        if(!(o.uurtarief>0)) e.push(`Opvangvorm ${oi+1}: vul het uurtarief in.`);
      });
    }
    if(cur.k==="scenario"){
      const sc=scenarios[cur.i];
      if(!sc.name || !sc.name.trim()) e.push("Geef dit scenario een naam.");
      parents.forEach((p,pi)=>{ if(!uOK(sc.hours[pi])) e.push(`Vul geldige uren in voor ${p.name||("ouder "+(pi+1))} (1 tot 80).`); });
      children.forEach((c,ci)=>{ (c.opvang||[]).forEach((o,oi)=>{ const d=o.days?.[cur.i]??0; if(d<0||d>7) e.push(`${c.name||("Kind "+(ci+1))}: opvangdagen moeten tussen 0 en 7 liggen.`); }); });
      if(cur.i===1){
        const same = scenarios[0].hours.every((h,i)=>h===scenarios[1].hours[i]) &&
          children.every((c)=>(c.opvang||[]).every((o)=>(o.days?.[0]??0)===(o.days?.[1]??0)));
        if(same) e.push("Dit scenario is gelijk aan het eerste — pas de uren of opvangdagen aan om te kunnen vergelijken.");
      }
    }
    if(cur.k==="pension" && pension.enabled){
      const jaar=new Date().getFullYear();
      if(!(pension.geboortejaar>1930 && pension.geboortejaar<=jaar)) e.push("Vul een geldig geboortejaar in.");
      if(!(pension.fulltimeUren>0 && pension.fulltimeUren<=80)) e.push("Vul geldige fulltime uren per week in.");
      if(pension.regeling!=="onbekend"){
        if(!(pension.pensioengevendFT>0)) e.push("Vul het pensioengevend jaarsalaris in.");
        if(pension.franchise<0) e.push("De franchise kan niet negatief zijn.");
        const pctv = pension.regeling==="premie" ? pension.premiePct : pension.opbouwPct;
        if(!(pctv>0 && pctv<=40)) e.push(pension.regeling==="premie" ? "Vul een realistisch premiepercentage in (0 tot 40%)." : "Vul een realistisch opbouwpercentage in (0 tot 40%).");
      }
    }
    return e;
  })();
  const [showErrors,setShowErrors]=useState(false);
  useEffect(()=>{ setShowErrors(false); },[step]);
  // Vul het pensioengevend salaris automatisch bij zodra pensioen wordt aangezet.
  useEffect(()=>{
    if(pension.enabled && !pension.pensioengevendFT){
      const ft=jaarloonVan(Math.min(pension.forParent, parents.length-1));
      if(ft>0) setPension((p)=>({...p, pensioengevendFT:ft}));
    }
  }, [pension.enabled]);
  const blocked = stepErrors.length>0;
  const [copied,setCopied]=useState(false);
  const [linkCopied,setLinkCopied]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  const shareData=()=>({ v:1, parents, children, scenarios, pension, vakantiegeld, dertiende });
  const makeShareLink=async()=>{
    const url=buildShareUrl(encodeShare(shareData()));
    setShareUrl(url);
    try{
      if(navigator.share){ await navigator.share({ title:"Deeltijd of voltijd na een kind?", url }); return; }
      await navigator.clipboard.writeText(url);
      setLinkCopied(true); setTimeout(()=>setLinkCopied(false),2400);
    }catch(e){ /* url blijft zichtbaar in het veld */ }
  };
  const buildSummary=()=>{
    const L=[];
    L.push("Deeltijd of voltijd na een kind? — samenvatting");
    L.push(`Cijfers ${CIJFERS_JAAR} · indicatief, geen financieel advies`);
    L.push("");
    scenarios.forEach((sc,i)=>{
      const r=results[i];
      L.push(`${sc.name}: ${parents.map((p,pi)=>`${p.name||"ouder "+(pi+1)} ${sc.hours[pi]}u`).join(", ")}`);
      L.push(`  Netto samen: ${eur(r.nettoSamenMnd)}/mnd`);
      if(children.length){ L.push(`  Opvangkosten: ${eur(r.opvangkosten)}/mnd · toeslag: ${eur(r.toeslag)}/mnd · eigen bijdrage: ${eur(r.eigenBijdrage)}/mnd`); }
      L.push(`  Besteedbaar: ${eur(r.besteedbaar)}/mnd`);
      L.push("");
    });
    L.push(`Verschil: ${eur(Math.abs(diffBesteedbaar))}/mnd bij ${Math.abs(Math.round(diffUren))} extra werkuren/mnd`);
    L.push(`Per extra werkuur: ${eur(Math.abs(perUur),2)}`);
    if(pension.enabled && pens.berekenbaar){
      L.push("");
      L.push(`Pensioen (${pParentName}): ${eur(pens.jaarNu)}/jr vs ${eur(pens.jaarAlt)}/jr — verschil ${pMinder?"−":"+"}${eur(pAbs)}/jr`);
    }
    L.push("");
    L.push("Indicatieve berekening; daadwerkelijke bedragen kunnen afwijken.");
    return L.join("\n");
  };
  const copySummary=async()=>{
    const txt=buildSummary();
    try{ await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(()=>setCopied(false),2200); }
    catch(e){ try{ window.prompt("Kopieer de samenvatting:", txt); }catch(e2){} }
  };
  const errRef = React.useRef(null);
  const errId = uid+"-errors";
  const tryNext = ()=>{
    if(blocked){ if(!canNav()) return; setShowErrors(true); setTimeout(()=>{ try{ errRef.current && errRef.current.focus(); }catch(e){} },0); }
    else { next(); }
  };
  const [chartParent, setChartParent] = useState(0);
  const cp = Math.min(chartParent, parents.length-1);
  const chartPoints = useMemo(()=>{
    if(!parents[cp] || !parents[cp].bruto) return [];
    const pts=[];
    for(let u=Math.max(8,16); u<=40; u+=1){
      const hours=[...scenarios[0].hours]; hours[cp]=u;
      const r=calculateScenario({ parents, vakantiegeld, dertiende, children, hours, si:0 });
      pts.push({ uren:u, besteedbaar:r.besteedbaar });
    }
    return pts;
  }, [parents, vakantiegeld, dertiende, children, scenarios, cp]);

  const nextLabel=flow[idx+1] && flow[idx+1].k==="result" ? "Bekijk overzicht" : "Verder";
  const pFp=Math.min(pension.forParent, parents.length-1);
  const pParentName=(parents[pFp]||parents[0]).name;
  const pens=calculatePension({ regeling:pension.regeling, pensioengevendFT:pension.pensioengevendFT, franchise:pension.franchise, opbouwPct:pension.opbouwPct/100, premiePct:pension.premiePct/100, fulltimeUren:pension.fulltimeUren, urenNu:scenarios[0].hours[pFp]??0, urenAlt:scenarios[1].hours[pFp]??0, geboortejaar:pension.geboortejaar });
  const pAbs=Math.abs(pens.verschilPerJaar);
  const pMinder=pens.verschilPerJaar<0;

  // Bij elke stapwissel terug naar de top, zodat de nieuwe stap in beeld staat.
  useEffect(()=>{
    dismissKeyboard();
    const toTop=()=>{
      try{ window.scrollTo(0,0); }catch(e){}
      if(typeof document!=="undefined"){
        if(document.scrollingElement) document.scrollingElement.scrollTop=0;
        if(document.documentElement) document.documentElement.scrollTop=0;
        if(document.body) document.body.scrollTop=0;
      }
    };
    toTop();
    // Op mobiel duwt een sluitend toetsenbord de pagina terug; nog een keer na de animatie.
    const r=requestAnimationFrame(toTop);
    const t1=setTimeout(toTop,120), t2=setTimeout(toTop,340);
    return ()=>{ cancelAnimationFrame(r); clearTimeout(t1); clearTimeout(t2); };
  }, [step]);

  // --- Opslaan: bij openen inladen, daarna automatisch bewaren ---
  useEffect(()=>{
    let alive=true;
    (async()=>{
      const tok=readShareToken();
      const shared=tok?decodeShare(tok):null;
      const d = shared || await loadState();
      if(alive && d){
        if(d.parents) setParents(d.parents);
        if(d.children) setChildren(d.children);
        if(d.scenarios) setScenarios(d.scenarios);
        if(d.pension) setPension(d.pension);
        if(typeof d.vakantiegeld==="number") setVakantiegeld(d.vakantiegeld);
        if(typeof d.dertiende==="boolean") setDertiende(d.dertiende);
      }
      if(alive && shared){
        setFromLink(true);
        setStep(999);   // wordt geklemd op de laatste stap: het overzicht
      }
      if(alive) setHydrated(true);
    })();
    return ()=>{ alive=false; };
  }, []);
  useEffect(()=>{
    if(!hydrated) return;
    const t=setTimeout(async()=>{
      const ok=await saveState({ parents, children, scenarios, pension, vakantiegeld, dertiende });
      setSaveState_(ok?"saved":"unavailable");
    }, 600);
    return ()=>clearTimeout(t);
  }, [hydrated, parents, children, scenarios, pension, vakantiegeld, dertiende]);
  const resetAll = async ()=>{
    await clearState();
    setParents([{ name:"", bruto:0, uren:40, car:{ enabled:false, cataloguswaarde:0, pctLow:0.22, pctHigh:0.22, eigenBijdrage:0 } },
                { name:"", bruto:0, uren:40, car:{ enabled:false, cataloguswaarde:0, pctLow:0.22, pctHigh:0.22, eigenBijdrage:0 } }]);
    setChildren([]);
    setScenarios([{ name:"Nu", hours:[40,40] },{ name:"Alternatief", hours:[32,32] }]);
    setPension({ enabled:false, forParent:0, geboortejaar:0, regeling:"middelloon", pensioengevendFT:0, franchise:PENSION_CONFIG.standaardFranchise, opbouwPct:1.875, premiePct:30, fulltimeUren:40, inkomenVorigJaar:0, factorA:0 });
    setVakantiegeld(0.08); setDertiende(false); setStep(0);
  };
  const aside = cur.k==="scenario" ? {t:cur.i===0?"Scenario 1":"Scenario 2", d:cur.i===0?"Hoe werken jullie nu?":"Waar wil je mee vergelijken?"} : (ASIDE[cur.k]||{t:"",d:""});

  if(cur.k==="intro"){
    return (
      <div className="app" lang="nl">
        <div className="introfull">
          <div className="introcard">
            <div className="badge" aria-hidden="true"><Users size={30}/></div>
            <h1>Deeltijd of voltijd na een kind?</h1>
            <p>Een paar korte vragen over je gezin, en je ziet meteen wat meer of minder werken netto oplevert — inclusief belasting, kinderopvangtoeslag en de auto van de zaak.</p>
            <button className="btn btn-lg" onClick={next}>Beginnen <ArrowRight size={19} aria-hidden="true"/></button>
            <p className="fine">Indicatief · cijfers {CIJFERS_JAAR} (bijgewerkt {CIJFERS_BIJGEWERKT}) · geen financieel advies · daadwerkelijke bedragen kunnen afwijken</p>
          </div>
        </div>
      </div>
    );
  }

  if(isResult){
    return (
      <div className="app" lang="nl">
        <div className="rwrap">
          <div className="rhead">
            <span className="kick">Overzicht</span>
            <h1>Jullie uitkomst</h1>
            <p className="qsub">Pas hieronder de salarissen, uren en opvangdagen aan — alles rekent live mee.</p>
          </div>
          <section className="hero" aria-label="Belangrijkste uitkomst">
            <p className="sr-only" aria-live="polite">{heroSummary}</p>
            <div className="row" aria-hidden="true">
              <div>
                <p className="label">Elk extra werkuur in “{moreScenario.name}” levert netto op</p>
                <p className="big">{eur(Math.abs(perUur),2)}<small> /uur</small></p>
              </div>
              <div className="side">
                <div className="k">Verschil besteedbaar</div>
                <div className="v num">{eur(Math.abs(diffBesteedbaar))}<small> /mnd</small></div>
                <div className="k" style={{marginTop:4}}>{Math.abs(Math.round(diffUren))} extra werkuren/mnd</div>
              </div>
            </div>
            <p className="note">Dit is wat overblijft van elk extra uur werken — ná belasting én ná de extra opvang die dat werken nodig maakt. Ligt het laag, dan verkoop je je tijd goedkoop.</p>
          </section>
          {floorReached && (
            <div className="banner" role="note">
              <Info size={18} aria-hidden="true"/>
              <p><strong>Bij jullie inkomen staat de kinderopvangtoeslag op het minimum</strong> (36,5% voor het eerste kind). Minder gaan werken levert daardoor nauwelijks extra toeslag op — het verschil komt vooral uit het nettosalaris.</p>
            </div>
          )}
          <div className="grid2">
            {scenarios.map((sc,si)=>{
              const r=results[si];
              return (
                <section className={`scard${si===winner?" win":""}`} key={si} aria-label={`Scenario ${sc.name}`}>
                  <div className="head"><h3>{sc.name}</h3>{si===winner && <span className="tag"><Check size={13} aria-hidden="true"/> meeste over</span>}</div>
                  <div className="tweaks">
                    {parents.map((p,pi)=>(
                      <div className="tweak" key={"rp"+pi}>
                        <span className="k">{p.name} · uren/week</span>
                        <Stepper label={`${p.name} uren per week in ${sc.name}`} value={sc.hours[pi]} onChange={(v)=>setHours(si,pi,v)} />
                      </div>
                    ))}
                    {children.map((c,ci)=> (c.opvang||[]).map((o,oi)=>(
                      <div className="tweak" key={"rc"+ci+"_"+oi}>
                        <span className="k">{c.name||`Kind ${ci+1}`} · {OPVANG[o.type].label}</span>
                        <Stepper label={`${c.name||("Kind "+(ci+1))} ${OPVANG[o.type].label} dagen in ${sc.name}`} value={o.days?.[si]??0} max={7} onChange={(v)=>setOpvangDays(ci,oi,si,v)} />
                      </div>
                    )))}
                  </div>
                  <SRow label="Netto inkomen samen/mnd" value={eur(r.nettoSamenMnd)} />
                  {children.length>0 && <>
                    <SRow label="Opvangkosten/mnd" value={eur(r.opvangkosten)} tone="cost" />
                    <SRow label={r.hasSubsidie?"Toeslag + gemeentebijdrage/mnd":"Kinderopvangtoeslag/mnd"} value={eur(r.toeslag)} tone="good" />
                    <SRow label="Eigen bijdrage opvang/mnd" value={eur(r.eigenBijdrage)} tone="cost" />
                  </>}
                  <SRow label="Besteedbaar/mnd" value={eur(r.besteedbaar)} tone="good" total />
                  <p className="meta">Toetsingsinkomen {eur(r.toetsingsinkomen)}{children.length>0?` · toeslag 1e kind ${(r.pctFirst*100).toFixed(1)}%`:""}</p>
                </section>
              );
            })}
          </div>
            {pension.enabled ? (
              <section className="scard" aria-label="Pensioen">
                <div className="head"><h3>Pensioen · {pParentName}</h3></div>

                {pens.aow && (
                  <div className="banner" role="note" style={{marginBottom:14,background:"var(--primary-tint)",borderColor:"var(--primary-line)",color:"var(--primary-ink)"}}>
                    <Info size={17} aria-hidden="true" style={{color:"var(--primary)"}}/>
                    <p><strong>AOW blijft gelijk.</strong> Je AOW bouw je op door in Nederland te wonen, niet door te werken — minder uren verlagen je AOW dus niet. Jouw AOW-leeftijd: <strong>{pens.aow.jaren} jaar{pens.aow.maanden?` en ${pens.aow.maanden} maanden`:""}</strong>{!pens.aow.vastgesteld?" (nog niet definitief vastgesteld door het kabinet — laatst bekende waarde als planning)":""}.{pens.jarenTotAOW!=null?` Nog ± ${pens.jarenTotAOW} jaar te gaan.`:""} Bruto AOW {CIJFERS_JAAR}: {eur(pens.aow.brutoJaarAlleenstaand)}/jaar (alleenstaand) of {eur(pens.aow.brutoJaarGehuwdPP)}/jaar p.p. (samenwonend).</p>
                  </div>
                )}

                {pens.berekenbaar ? (<>
                  <SRow label={`Opbouw bij ${scenarios[0].name} (${scenarios[0].hours[pension.forParent]} u)`} value={eur(pens.jaarNu)+"/jr"} />
                  <SRow label={`Opbouw bij ${scenarios[1].name} (${scenarios[1].hours[pension.forParent]} u)`} value={eur(pens.jaarAlt)+"/jr"} />
                  <SRow label={pens.isDC?"Verschil premie-inleg/jaar":"Verschil pensioenopbouw/jaar"} value={(pMinder?"−":"+")+eur(pAbs)} tone={pMinder?"cost":"good"} total />
                  <p className="meta" style={{marginTop:12,color:"var(--ink-2)"}}>
                    {pens.isDC
                      ? <>Je legt naar schatting <strong>{eur(pAbs)} {pMinder?"minder":"meer"}</strong> premie per jaar in — dit is inleg, nog geen uitkering. Wat dat later oplevert hangt af van rendement (zie hieronder).</>
                      : <>Je bouwt naar schatting <strong>{eur(pAbs)} {pMinder?"minder":"meer"}</strong> pensioen (jaarlijkse uitkering) per jaar op. Doe je dit 10 jaar, dan is je pensioen ~<strong>{eur(pAbs*10)} per jaar {pMinder?"lager":"hoger"}</strong> — en dat levenslang vanaf je pensioendatum. Dit is dus geen gemiste inleg maar een lagere gegarandeerde uitkering.</>}
                  </p>

                  {pens.isDC && (()=>{ const split = calculatePensionContribution({ grondslag:pens.grondslag, premiePct:pension.premiePct/100, dtf:pens.dtfNu, werkgeversAandeel:null }); return (
                    <p className="meta" style={{marginTop:6}}>Indicatieve verdeling bij {scenarios[0].name} (aanname, geen officieel gegeven — verschilt per cao): werkgever ~{eur(split.werkgever)}/jr · werknemer ~{eur(split.werknemer)}/jr (standaard {Math.round(PENSION_MODEL_AANNAMES.standaardWerkgeversAandeel*100)}/{Math.round((1-PENSION_MODEL_AANNAMES.standaardWerkgeversAandeel)*100)}-verdeling).</p>
                  ); })()}

                  <div style={{marginTop:12,paddingTop:8,borderTop:"1px solid var(--line)"}}>
                    <p className="meta" style={{margin:"0 0 4px"}}>{pens.isDC?"Gemiste/extra premie-inleg over de jaren:":"Effect op je jaarlijkse pensioen na:"}</p>
                    {[1,5,10].map((n)=>(<SRow key={n} label={`${n} jaar`} value={(pMinder?"−":"+")+eur(pAbs*n)} tone={pMinder?"cost":"good"} />))}
                    {pens.jarenTotAOW!=null && pens.jarenTotAOW>0 && (<SRow label={`Tot AOW (± ${pens.jarenTotAOW} jaar)`} value={(pMinder?"−":"+")+eur(pAbs*pens.jarenTotAOW)} tone={pMinder?"cost":"good"} />)}
                  </div>

                  {pens.isDC && pens.vermogenNu!=null && (
                    <div style={{marginTop:12,paddingTop:8,borderTop:"1px solid var(--line)"}}>
                      <p className="meta" style={{margin:"0 0 4px"}}>Geschat pensioenvermogen op je AOW-leeftijd — modelmatige projectie, géén gegarandeerd rendement ({Math.round(pens.modelAannames.rendement*100)}% per jaar aangenomen):</p>
                      <SRow label={`Bij ${scenarios[0].name}`} value={eur(pens.vermogenNu)} />
                      <SRow label={`Bij ${scenarios[1].name}`} value={eur(pens.vermogenAlt)} />
                      <SRow label="Verschil pensioenvermogen" value={(pMinder?"−":"+")+eur(Math.abs(pens.vermogenVerschil))} tone={pMinder?"cost":"good"} total />
                      <p className="meta" style={{marginTop:8}}>Omgerekend naar een geschat maandinkomen (vaste uitkering over {pens.modelAannames.uitkeringsjaren} jaar; geen sterftetafel of verzekeringsofferte): ~{eur(pens.geschatMaandinkomenNu)}/mnd → ~{eur(pens.geschatMaandinkomenAlt)}/mnd.</p>
                    </div>
                  )}

                  <details className="help" style={{marginTop:12}}>
                    <summary>Hoe is dit berekend?</summary>
                    <p>Regeling: <strong>{pens.isDC?"premieregeling":"middelloon"}</strong> · pensioengevend salaris (FT) {eur(pension.pensioengevendFT)} · franchise {eur(pension.franchise)} · grondslag {eur(pens.grondslag)} · {pens.isDC?`premie ${pension.premiePct}%`:`opbouw ${pension.opbouwPct}%`} · deeltijdfactor {scenarios[0].name} {(pens.dtfNu*100).toFixed(0)}% → {scenarios[1].name} {(pens.dtfAlt*100).toFixed(0)}%.</p>
                    <p>Formule: (pensioengevend salaris − franchise) × {pens.isDC?"premie%":"opbouw%"} × deeltijdfactor. Jij vulde salaris, regeling en percentages zelf in; franchise/percentages hebben officiële {CIJFERS_JAAR}-standaarden als startwaarde.</p>
                    <p>Pensioenregelingen veranderen door de Wet toekomst pensioenen (uiterlijk 1 januari 2028 aangepast) — er bestaat geen universele formule die voor iedereen exact klopt.</p>
                    <p>Bronnen: Belastingdienst (Centraal Aanspreekpunt Pensioenen, fiscale kaders), SVB (AOW-bedragen), Rijksoverheid (AOW-leeftijd, Wtp-overgang), Pensioenduidelijkheid.nl (uitleg nieuwe stelsel).</p>
                  </details>
                  <p className="disc">Deze berekening is een indicatie op basis van de door jou ingevulde gegevens en gebruikte aannames — geen officiële pensioenprognose. Je daadwerkelijke pensioen hangt af van je pensioenregeling, uitvoerder, toekomstige premie, rendement, indexatie, de overgang naar het nieuwe pensioenstelsel en je persoonlijke situatie. Controleer je pensioen bij je uitvoerder en via mijnpensioenoverzicht.nl.</p>
                </>) : (
                  <>
                    <p className="meta" style={{color:"var(--ink-2)"}}>Niet genoeg gegevens voor een exacte berekening — bijvoorbeeld omdat je regeling onbekend is of gegevens ontbreken. Je pensioenregeling bepaalt hoe je pensioen wordt opgebouwd, en door de overgang naar het nieuwe pensioenstelsel verschilt dat per regeling.</p>
                    <p className="meta">Vul je regeling, pensioengevend salaris, franchise en opbouw-/premiepercentage in — of gebruik je gegevens van <strong>mijnpensioenoverzicht.nl</strong>.</p>
                  </>
                )}
              </section>
            ) : (
              <section className="scard" aria-label="Pensioen">
                <div className="head"><h3>Pensioen</h3></div>
                <p className="meta" style={{color:"var(--ink-2)"}}>Wil je ook zien wat meer of minder werken voor je pensioen betekent? <button className="btn-text" style={{padding:0,fontSize:14}} onClick={()=>goto("pension")}>Vul je pensioengegevens in →</button></p>
              </section>
            )}
          {chartPoints.length>0 && (
            <div>
              <HoursChart points={chartPoints} currentA={scenarios[0].hours[cp]} currentB={scenarios[1].hours[cp]}
                nameA={scenarios[0].name} nameB={scenarios[1].name} parentName={parents[cp].name||`ouder ${cp+1}`} />
              {parents.length>1 && (
                <div className="chartpick" role="group" aria-label="Kies wiens uren de grafiek toont">
                  {parents.map((p,i)=>(
                    <button key={i} type="button" aria-pressed={cp===i} onClick={()=>setChartParent(i)}>{p.name||`Ouder ${i+1}`}</button>
                  ))}
                </div>
              )}
              <p className="meta">De grafiek varieert alleen de uren van deze ouder; de rest blijft zoals in “{scenarios[0].name}”.</p>
            </div>
          )}

          <section className="pcard" aria-label="Inkomen aanpassen">
            <h3>Inkomen aanpassen</h3>
            <p className="psub">Verandert er iets aan de salarissen? Pas ze hier aan.</p>
            {parents.map((p,i)=>(
              <div className="prow" key={i}>
                <span className="pk">{p.name}<small>bruto/mnd, bij {p.uren} u/week</small></span>
                <div className="pc"><Euro sm id={`${uid}rsal${i}`} value={p.bruto} onChange={(v)=>patchParent(i,{bruto:v})} /></div>
              </div>
            ))}
            <div className="prow">
              <span className="pk">Vakantiegeld<small>percentage van het jaarsalaris</small></span>
              <div className="pc"><Pct id={`${uid}rvak`} ariaLabel="Vakantiegeld in procenten" value={Math.round(vakantiegeld*10000)/100} onChange={(v)=>setVakantiegeld((v||0)/100)} /></div>
            </div>
            <div className="prow">
              <span className="pk">Dertiende maand<small>extra maandsalaris per jaar</small></span>
              <div className="pc" style={{justifyContent:"flex-end"}}>
                <label className="switch">
                  <input type="checkbox" checked={dertiende} onChange={(e)=>setDertiende(e.target.checked)} />
                  <span className="track" aria-hidden="true"></span>
                  <span className="sr-only">Dertiende maand</span>
                </label>
              </div>
            </div>
          </section>
          <div className="res-actions">
            <button className="btn btn-primary" onClick={()=>goto("scenario",0)}><RefreshCw size={16} aria-hidden="true"/> Andere uren proberen</button>
            <button className="btn btn-ghost" onClick={()=>{ try{ window.print(); }catch(e){} }}><Printer size={16} aria-hidden="true"/> Opslaan als pdf</button>
            <button className="btn btn-ghost" onClick={makeShareLink}><Share2 size={16} aria-hidden="true"/> {linkCopied?"Link gekopieerd!":"Deel deze berekening"}</button>
            <button className="btn btn-ghost" onClick={copySummary}><Copy size={16} aria-hidden="true"/> {copied?"Gekopieerd!":"Kopieer samenvatting"}</button>
            <button className="btn btn-ghost" onClick={resetAll}>Opnieuw beginnen</button>
          </div>
          {shareUrl && (
            <div className="sharebox">
              <label className="lab" htmlFor={uid+"-share"}>Deelbare link — hierin staat jullie ingevulde situatie. Deel 'm alleen met wie je vertrouwt.</label>
              <input id={uid+"-share"} className="control" readOnly value={shareUrl} onFocus={(e)=>e.target.select()} />
            </div>
          )}
          {fromLink && (
            <div className="banner" role="note" style={{background:"var(--primary-tint)",borderColor:"var(--primary-line)",color:"var(--primary-ink)"}}>
              <Info size={17} aria-hidden="true" style={{color:"var(--primary)"}}/>
              <p><strong>Je bekijkt een gedeelde berekening.</strong> Je kunt alles hieronder gewoon aanpassen — de wijzigingen blijven op dit apparaat en veranderen niets bij de afzender.</p>
            </div>
          )}
          <p className="savedhint">
            <span className="yearbadge">Cijfers {CIJFERS_JAAR} · bijgewerkt {CIJFERS_BIJGEWERKT}</span>
            {saveState_==="saved" ? <span>· Je gegevens worden automatisch bewaard op dit apparaat.</span>
              : saveState_==="unavailable" ? <span>· Opslaan is hier niet beschikbaar; je gegevens gelden alleen deze sessie.</span> : null}
          </p>
          <p className="legal"><strong>Let op:</strong> dit is een indicatieve berekening op basis van de 2026-regels (schijven, heffingskortingen, IACK, kinderopvangtoeslag- en VNG-tabel, bijtelling, pensioen). Geen financieel advies. Je daadwerkelijke bedragen kunnen afwijken, afhankelijk van je precieze inkomen, je pensioenregeling en -uitvoerder, en het beleid van je gemeente (die van de VNG-adviestabel mag afwijken). Voor bindende bedragen: de proefberekening van de Belastingdienst, je pensioenuitvoerder/mijnpensioenoverzicht.nl en je gemeente. Arbeidskorting is voor lage inkomens vereenvoudigd; bijtelling telt mee in het toetsingsinkomen, niet in de cash-nettolonen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app" lang="nl">
      <div className="split">
        <aside className="aside">
          <div className="brandrow">Werk &amp; opvang · 2026</div>
          <div className="stepno"><span className="big">{String(idx).padStart(2,"0")}</span><span className="tot">/ {String(total).padStart(2,"0")}</span></div>
          <h2 className="asideT">{aside.t}</h2>
          <p className="asideD">{aside.d}</p>
          <div className="pdots" role="progressbar" aria-valuenow={idx} aria-valuemin={1} aria-valuemax={total} aria-valuetext={`Stap ${idx} van ${total}`}>
            {Array.from({length:total}).map((_,n)=>(<i key={n} className={(n+1<idx?"on ":"")+(n+1===idx?"cur":"")} />))}
          </div>
        </aside>

        <main className="main" onPointerDown={(e)=>{ const t=e.target; if(t && !/^(INPUT|TEXTAREA|SELECT|BUTTON|LABEL)$/.test(t.tagName) && !t.closest("label,button")) dismissKeyboard(); }}>
          <div className="mcontent">
            <div key={step} className="q step-anim" onKeyDown={(e)=>{
              if(e.key!=="Enter" || e.shiftKey) return;
              const t=e.target;
              if(t.tagName==="INPUT" && !["checkbox","radio"].includes(t.type)){
                e.preventDefault();
                tryNext();
              }
            }}>

              {cur.k==="household" && (<>
                <h1>Hoe ziet jullie gezin eruit?</h1>
                <p className="qsub">Vul de namen van de ouders in.</p>
                <div className="qstack">
                  <RadioPills legend="Aantal ouders" name="ouders" options={[1,2]} value={parents.length} onChange={setParentCount} />
                  {parents.map((p,i)=>(
                    <div className="field" key={i}>
                      <label className="lab" htmlFor={`${uid}pn${i}`}>Naam ouder {i+1}</label>
                      <input id={`${uid}pn${i}`} className="control" enterKeyHint="done" onKeyDown={(e)=>{ if(e.key==="Enter"){ e.preventDefault(); e.currentTarget.blur(); } }} placeholder="Voornaam" value={p.name} onChange={(e)=>patchParent(i,{name:e.target.value})} />
                    </div>
                  ))}
                </div>
              </>)}

              {cur.k==="salary" && (<>
                <h1>Wat verdient {parents[cur.i].name}?</h1>
                <p className="qsub">Bruto per maand zoals het nu op de loonstrook staat, exclusief vakantiegeld.</p>
                <div className="qstack">
                  <div className="field">
                    <label className="lab" htmlFor={`${uid}sal`}>Bruto maandsalaris</label>
                    <Euro id={`${uid}sal`} autoFocus value={parents[cur.i].bruto} onChange={(v)=>patchParent(cur.i,{bruto:v})} />
                  </div>
                  <div className="inset">
                    <span className="lab">Hoeveel uur werkt {parents[cur.i].name} nu per week?</span>
                    <Stepper label={`Huidige uren per week van ${parents[cur.i].name}`} value={parents[cur.i].uren} onChange={(v)=>setParentUren(cur.i,v)} />
                  </div>
                  <p className="hint">Op basis hiervan berekenen we automatisch het uurloon — je hoeft zelf niets naar 40 uur om te rekenen.</p>
                  {cur.i===0 && (<>
                    <div className="inset">
                      <span className="lab">Vakantiegeld<br/><span style={{fontSize:12,color:"var(--ink-3)",fontWeight:400}}>Meestal 8% — decimalen mogen (8,33%)</span></span>
                      <Pct id={`${uid}vak`} ariaLabel="Vakantiegeld in procenten" value={Math.round(vakantiegeld*10000)/100} onChange={(v)=>setVakantiegeld((v||0)/100)} />
                    </div>
                    <div className="inset">
                      <span className="lab">Dertiende maand<br/><span style={{fontSize:12,color:"var(--ink-3)",fontWeight:400}}>Een extra maandsalaris per jaar</span></span>
                      <label className="switch">
                        <input type="checkbox" checked={dertiende} onChange={(e)=>setDertiende(e.target.checked)} />
                        <span className="track" aria-hidden="true"></span>
                        <span className="sr-only">Dertiende maand</span>
                      </label>
                    </div>
                  </>)}
                </div>
              </>)}

              {cur.k==="cars" && (<>
                <h1>Heeft iemand een auto van de zaak?</h1>
                <p className="qsub">De bijtelling telt mee in het inkomen en beïnvloedt de kinderopvangtoeslag.</p>
                <div className="qstack">
                  {parents.map((p,i)=>(
                    <div key={i} style={{border:"1px solid var(--line)",borderRadius:"var(--r-md)",padding:18}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:8,fontWeight:600}}><Car size={18} aria-hidden="true" style={{color:"var(--primary)"}}/> {p.name}</span>
                        <label className="switch">
                          <input type="checkbox" checked={p.car.enabled} onChange={(e)=>patchCar(i,{enabled:e.target.checked})} />
                          <span className="track" aria-hidden="true"></span>
                          <span className="sr-only">Auto van de zaak voor {p.name}</span>
                        </label>
                      </div>
                      {p.car.enabled && (
                        <div className="qstack" style={{marginTop:18,gap:16}}>
                          <div className="field"><label className="lab" htmlFor={`${uid}cat${i}`}>Cataloguswaarde van de auto</label>
                            <NumField id={`${uid}cat${i}`} group value={p.car.cataloguswaarde} onCommit={(v)=>patchCar(i,{cataloguswaarde:v})} placeholder="Bijv. 35.000" />
                            <span className="hint">De nieuwprijs incl. btw en bpm. Staat op je leasecontract of loonstrook (soms &ldquo;fiscale waarde&rdquo;).</span></div>
                          <div className="field"><label className="lab" htmlFor={`${uid}eb${i}`}>Wat betaal je zelf per maand?</label>
                            <NumField id={`${uid}eb${i}`} group value={p.car.eigenBijdrage} onCommit={(v)=>patchCar(i,{eigenBijdrage:v})} placeholder="0" />
                            <span className="hint">Je eigen bijdrage die van je brutoloon gaat. Betaal je niets? Laat leeg.</span></div>
                          <div className="grid2col">
                            <div className="field"><label className="lab" htmlFor={`${uid}pl${i}`}>Bijtelling % t/m €30.000</label>
                              <NumField id={`${uid}pl${i}`} allowDecimal value={Math.round(p.car.pctLow*1000)/10} onCommit={(v)=>patchCar(i,{pctLow:v/100})} placeholder="0" /></div>
                            <div className="field"><label className="lab" htmlFor={`${uid}ph${i}`}>Bijtelling % daarboven</label>
                              <NumField id={`${uid}ph${i}`} allowDecimal value={Math.round(p.car.pctHigh*1000)/10} onCommit={(v)=>patchCar(i,{pctHigh:v/100})} placeholder="0" /></div>
                          </div>
                          <p className="hint">Elektrisch op kenteken 2025 = 17% t/m €30.000. Hybride, benzine of diesel = 22%. Bruto bijtelling {eur(brutoBijtelling(p.car))} per jaar.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>)}

              {cur.k==="childcount" && (<>
                <h1>Hoeveel kinderen gaan naar de opvang?</h1>
                <p className="qsub">Kies het aantal; daarna vul je per kind de opvang in.</p>
                <div className="qstack">
                  <RadioPills legend="Aantal kinderen op de opvang" name="kinderen" options={[0,1,2,3,4]} value={children.length} onChange={setChildCount} />
                </div>
              </>)}

              {cur.k==="child" && (<>
                <h1>Wat voor opvang heeft {children[cur.i].name||`kind ${cur.i+1}`}?</h1>
                <p className="qsub">Kind {cur.i+1} van {children.length}. Je kunt meerdere opvangvormen toevoegen.</p>
                <div className="qstack">
                  <div className="field">
                    <label className="lab" htmlFor={`${uid}cn`}>Naam van het kind</label>
                    <input id={`${uid}cn`} className="control" placeholder={`Kind ${cur.i+1}`} value={children[cur.i].name} onChange={(e)=>patchChild(cur.i,{name:e.target.value})} />
                  </div>
                  {children[cur.i].opvang.map((o,oi)=>(
                    <div key={oi} className="opvangcard">
                      <div className="opvanghead">
                        <span className="t">Opvangvorm {oi+1}</span>
                        {children[cur.i].opvang.length>1 && (<button type="button" className="btn-remove" onClick={()=>removeOpvang(cur.i,oi)}><Trash2 size={14} aria-hidden="true"/> Verwijderen</button>)}
                      </div>
                      <RadioTiles legend="Soort opvang" name={`opvang${cur.i}_${oi}`} value={o.type}
                        onChange={(t)=>patchOpvang(cur.i,oi,{type:t, urenPerDag:OPVANG[t].uren, uurtarief:OPVANG[t].tarief})}
                        options={Object.entries(OPVANG).map(([k,v])=>({value:k,label:v.label,sub:v.sub}))} />
                      <div className="grid2col" style={{marginTop:16}}>
                        <div className="field">
                          <span className="lab">Uren per opvangdag</span>
                          <Stepper label="Uren per opvangdag" value={o.urenPerDag} step={0.5} max={13} onChange={(v)=>patchOpvang(cur.i,oi,{urenPerDag:v})} />
                        </div>
                        <div className="field">
                          <label className="lab" htmlFor={`${uid}tar${oi}`}>Uurtarief (€)</label>
                          <NumField id={`${uid}tar${oi}`} allowDecimal value={o.uurtarief} onCommit={(v)=>patchOpvang(cur.i,oi,{uurtarief:v})} placeholder="0" />
                        </div>
                      </div>
                      <div className="inset" style={{marginTop:14}}>
                        <span className="lab">Valt onder kinderopvangtoeslag?</span>
                        <label className="switch">
                          <input type="checkbox" checked={o.underKOT!==false} onChange={(e)=>patchOpvang(cur.i,oi,{underKOT:e.target.checked})} />
                          <span className="track" aria-hidden="true"></span>
                          <span className="sr-only">Valt onder kinderopvangtoeslag voor opvangvorm {oi+1}</span>
                        </label>
                      </div>
                      {o.underKOT!==false
                        ? <p className="hint">Kinderopvangtoeslag tot max {eur(MAX_UURTARIEF[o.type],2)} per uur ({OPVANG[o.type].label}).</p>
                        : <p className="hint">Geen kinderopvangtoeslag. Inkomensafhankelijke ouderbijdrage volgens de VNG-adviestabel 2026; de gemeente betaalt het verschil tot {eur(MAX_UURTARIEF.dagopvang,2)}/uur. Gemeenten kunnen hiervan afwijken.</p>}
                    </div>
                  ))}
                  {children[cur.i].opvang.length < MAX_OPVANG_PER_KIND ? (
                    <button type="button" className="btn-add" onClick={()=>addOpvang(cur.i)}><Plus size={17} aria-hidden="true"/><span>Opvangvorm toevoegen</span></button>
                  ) : (
                    <p className="hint">Je hebt het maximum van {MAX_OPVANG_PER_KIND} opvangvormen per kind bereikt.</p>
                  )}
                  <p className="hint">Gaat je kind naar meerdere vormen (bijv. gastouder én peuterspeelzaal)? Voeg ze apart toe — elk heeft eigen uren, tarief en toeslagregeling. De dagen per vorm vul je bij de scenario's in.</p>
                </div>
              </>)}

              {cur.k==="scenario" && (<>
                <h1>{cur.i===0?"Hoe werken jullie nu?":"Wat wil je daarmee vergelijken?"}</h1>
                <p className="qsub">{cur.i===0?"De huidige uren en opvangdagen.":"Bijvoorbeeld allebei een dag minder werken."}</p>
                <div className="qstack">
                  <div className="field">
                    <label className="lab" htmlFor={`${uid}sn`}>Naam van dit scenario</label>
                    <input id={`${uid}sn`} className="control" value={scenarios[cur.i].name} onChange={(e)=>patchScenario(cur.i,{name:e.target.value})} />
                  </div>
                  {parents.map((p,pi)=>(
                    <div className="inset" key={"p"+pi}>
                      <span className="lab">{p.name} — uren per week</span>
                      <Stepper label={`${p.name} uren per week in ${scenarios[cur.i].name}`} value={scenarios[cur.i].hours[pi]} onChange={(v)=>setHours(cur.i,pi,v)} />
                    </div>
                  ))}
                  {children.map((c,ci)=> (c.opvang||[]).map((o,oi)=>(
                    <div className="inset" key={"c"+ci+"_"+oi}>
                      <span className="lab">{c.name||`Kind ${ci+1}`} · {OPVANG[o.type].label} — dagen/week</span>
                      <Stepper label={`${c.name||("Kind "+(ci+1))} ${OPVANG[o.type].label} dagen in ${scenarios[cur.i].name}`} value={o.days?.[cur.i]??0} max={7} onChange={(v)=>setOpvangDays(ci,oi,cur.i,v)} />
                    </div>
                  )))}
                  <div style={{background:"var(--primary-tint)",border:"1px solid var(--primary-line)",borderRadius:"var(--r-md)",padding:"14px 18px",fontSize:15,color:"var(--primary-ink)"}}>
                    Besteedbaar in dit scenario: <strong className="num">{eur(results[cur.i].besteedbaar)}/mnd</strong>
                  </div>
                </div>
              </>)}

              {cur.k==="pension" && (<>
                <h1>Wat betekent dit voor je pensioen later?</h1>
                <p className="qsub">Minder werken betekent meestal ook minder pensioenopbouw. Deze stap is optioneel — sla 'm gerust over.</p>
                <p className="hint">Pensioenregelingen veranderen door de Wet toekomst pensioenen (uiterlijk 1 januari 2028 aangepast). Er bestaat daardoor geen universele rekenformule — controleer je persoonlijke pensioen altijd bij je pensioenuitvoerder.</p>
                <div className="qstack">
                  <div className="inset">
                    <span className="lab">Pensioen meeberekenen<br/><span style={{fontSize:12.5,color:"var(--ink-3)",fontWeight:400}}>Je hebt hier ongeveer 1 minuut voor nodig</span></span>
                    <label className="switch">
                      <input type="checkbox" checked={pension.enabled} onChange={(e)=>patchPension({enabled:e.target.checked})} />
                      <span className="track" aria-hidden="true"></span>
                      <span className="sr-only">Pensioenberekening aanzetten</span>
                    </label>
                  </div>

                  {!pension.enabled && (
                    <div className="explain" style={{background:"var(--primary-tint)",borderColor:"var(--primary-line)"}}>
                      <div className="body" style={{padding:"14px 16px"}}>
                        <p style={{color:"var(--primary-ink)"}}><strong>Goed om te weten:</strong> je AOW verandert niet als je minder gaat werken. Die bouw je op door in Nederland te wonen. Het gaat hier alleen om het pensioen dat je via je werkgever opbouwt.</p>
                      </div>
                    </div>
                  )}

                  {pension.enabled && (<>
                    {parents.length>1 && (
                      <RadioTiles legend="Voor wie berekenen we het?" name="pparent" value={pension.forParent}
                        onChange={setPensionParent}
                        options={parents.map((p,i)=>({value:i,label:p.name||`Ouder ${i+1}`,sub:`${scenarios[0].hours[i]}→${scenarios[1].hours[i]} uur`}))} />
                    )}

                    <div className="grid2col">
                      <div className="field"><label className="lab" htmlFor={`${uid}gj`}>In welk jaar ben je geboren?</label>
                        <NumField id={`${uid}gj`} value={pension.geboortejaar} onCommit={(v)=>patchPension({geboortejaar:v})} placeholder="1990" />
                        <span className="hint">Zo weten we hoeveel jaar je nog tot je AOW hebt.</span></div>
                      <div className="field"><label className="lab" htmlFor={`${uid}ft`}>Fulltime is bij jou hoeveel uur?</label>
                        <NumField id={`${uid}ft`} value={pension.fulltimeUren} onCommit={(v)=>patchPension({fulltimeUren:v})} placeholder="40" />
                        <span className="hint">Meestal 36, 38 of 40 uur.</span></div>
                    </div>

                    <div>
                      <span className="rg-label">Hoe bouw je pensioen op?</span>
                      <div className="bigchoice" role="radiogroup" aria-label="Hoe bouw je pensioen op">
                        <label>
                          <input type="radio" name="preg" checked={pension.regeling==="middelloon"} onChange={()=>patchPension({regeling:"middelloon"})} />
                          <span className="dot" aria-hidden="true"></span>
                          <span className="txt"><strong>Ik bouw een vast pensioenbedrag op</strong><span>Op je pensioenoverzicht staat een <em>opbouwpercentage</em> (vaak rond 1,7–1,875%). Dit heet een middelloonregeling.</span></span>
                        </label>
                        <label>
                          <input type="radio" name="preg" checked={pension.regeling==="premie"} onChange={()=>patchPension({regeling:"premie"})} />
                          <span className="dot" aria-hidden="true"></span>
                          <span className="txt"><strong>Er wordt een premie voor mij ingelegd</strong><span>Je werkgever legt een percentage van je salaris in, dat wordt belegd. Dit is de nieuwe pensioenregeling.</span></span>
                        </label>
                        <label>
                          <input type="radio" name="preg" checked={pension.regeling==="onbekend"} onChange={()=>patchPension({regeling:"onbekend"})} />
                          <span className="dot" aria-hidden="true"></span>
                          <span className="txt"><strong>Ik weet het niet</strong><span>Dan laten we het pensioenbedrag leeg — we tonen wel wat er verder verandert.</span></span>
                        </label>
                      </div>
                    </div>

                    <details className="explain">
                      <summary>Waar vind ik deze gegevens?</summary>
                      <div className="body">
                        <p>Log in op <strong>mijnpensioenoverzicht.nl</strong> met DigiD — daar staat al je pensioen bij elkaar. Of pak het jaarlijkse pensioenoverzicht (UPO) van je pensioenfonds erbij.</p>
                        <p>Weet je het even niet? Laat de standaardwaarden staan. Die komen uit de officiële {CIJFERS_JAAR}-regels en geven een redelijke schatting.</p>
                      </div>
                    </details>

                    {pension.regeling!=="onbekend" && (
                      <div className="advanced">
                        <p className="adv-t">De cijfers van je regeling</p>
                        <p className="adv-s">Deze hebben we alvast ingevuld met de officiële {CIJFERS_JAAR}-waarden. Staan er op jouw overzicht andere getallen? Pas ze dan hier aan.</p>
                        <div className="qstack" style={{gap:18}}>
                          <div className="field">
                            <label className="lab" htmlFor={`${uid}pgs`}>Je jaarsalaris bij fulltime werken</label>
                            <NumField id={`${uid}pgs`} group value={pension.pensioengevendFT} onCommit={(v)=>patchPension({pensioengevendFT:v})} placeholder="0" />
                            <span className="hint">Bruto per jaar, inclusief vakantiegeld. We hebben dit uit je salaris geschat.</span>
                          </div>
                          <div className="field">
                            <label className="lab" htmlFor={`${uid}fr`}>Deel waarover je géén pensioen opbouwt (franchise)</label>
                            <NumField id={`${uid}fr`} group value={pension.franchise} onCommit={(v)=>patchPension({franchise:v})} placeholder="0" />
                            <span className="hint">Over dit eerste stuk van je salaris bouw je geen pensioen op, omdat je daarvoor later AOW krijgt. Officieel {CIJFERS_JAAR}: {eur(PENSION_CONFIG.standaardFranchise)}.</span>
                          </div>
                          <div className="field">
                            <label className="lab" htmlFor={`${uid}op`}>{pension.regeling==="premie" ? "Premiepercentage" : "Opbouwpercentage per jaar"}</label>
                            <Pct id={`${uid}op`} ariaLabel={pension.regeling==="premie"?"Premiepercentage":"Opbouwpercentage per jaar"}
                              value={pension.regeling==="premie"?pension.premiePct:pension.opbouwPct}
                              onChange={(v)=> pension.regeling==="premie"?patchPension({premiePct:v}):patchPension({opbouwPct:v})} />
                            <span className="hint">{pension.regeling==="premie"
                              ? `Het percentage dat jaarlijks voor je wordt ingelegd. Wettelijk maximum ${CIJFERS_JAAR}: 30%.`
                              : `Het percentage pensioen dat je per jaar opbouwt. Wettelijk maximum ${CIJFERS_JAAR}: 1,875%.`}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <details className="explain">
                      <summary>Jaarruimte: extra fiscaal voordelig pensioen opbouwen (optioneel)</summary>
                      <div className="body">
                        <p>Naast je werkgeverspensioen mag je vaak ook zelf fiscaal voordelig bijsparen (bijv. via lijfrente). Hoeveel dat is — je <strong>jaarruimte</strong> — hangt af van je inkomen van vorig jaar en je Factor A (te vinden op je UPO).</p>
                        <div className="grid2col" style={{marginTop:12}}>
                          <div className="field">
                            <label className="lab" htmlFor={`${uid}ivj`}>Bruto inkomen {CIJFERS_JAAR-1}</label>
                            <NumField id={`${uid}ivj`} group value={pension.inkomenVorigJaar} onCommit={(v)=>patchPension({inkomenVorigJaar:v})} placeholder="0" />
                          </div>
                          <div className="field">
                            <label className="lab" htmlFor={`${uid}fa`}>Factor A (van je UPO, optioneel)</label>
                            <NumField id={`${uid}fa`} group value={pension.factorA} onCommit={(v)=>patchPension({factorA:v})} placeholder="0" />
                            <span className="hint">Onbekend? Laat op 0 — dat is de veilige aanname als je geen werkgeverspensioen hebt.</span>
                          </div>
                        </div>
                        {(()=>{ const jr = calculateJaarruimte({ inkomenVorigJaar:pension.inkomenVorigJaar, factorA:pension.factorA }); return jr ? (
                          <p style={{marginTop:10}}>Indicatieve jaarruimte {CIJFERS_JAAR}: <strong>{eur(jr.jaarruimte)}</strong> (30% × premiegrondslag {eur(jr.premiegrondslag)} − 6,27 × Factor A, max {eur(JAARRUIMTE_CONFIG.maxJaarruimte)}).</p>
                        ) : (
                          <p style={{marginTop:10}}>Vul je inkomen van {CIJFERS_JAAR-1} in om je indicatieve jaarruimte te zien.</p>
                        ); })()}
                        <p>Dit is een controle-indicatie — je kunt ook nog <strong>reserveringsruimte</strong> hebben van de laatste 10 jaar (tot {eur(JAARRUIMTE_CONFIG.reserveringsruimteGrens)}). Gebruik voor een exacte, bindende berekening het <a href={JAARRUIMTE_CONFIG.hulpmiddelUrl} target="_blank" rel="noopener noreferrer">hulpmiddel Lijfrentepremie van de Belastingdienst</a>.</p>
                      </div>
                    </details>
                  </>)}
                </div>
              </>)}

            </div>
          </div>
          {showErrors && blocked && (
            <div className="err" role="alert" id={errId} ref={errRef} tabIndex={-1} style={{margin:"0 24px"}}>
              <Info size={17} aria-hidden="true"/>
              <div>{stepErrors.length===1 ? <span>{stepErrors[0]}</span> : <ul>{stepErrors.map((m,i)=>(<li key={i}>{m}</li>))}</ul>}</div>
            </div>
          )}
          <p className="wnote">Indicatieve berekening op basis van de 2026-regels. Je daadwerkelijke bedragen kunnen afwijken van je persoonlijke situatie, je pensioenregeling en het beleid van je gemeente.</p>
          <div className="mfoot">
            <button className="btn-text" onClick={back} onPointerUp={(e)=>{ if(e.pointerType==="touch"){ e.preventDefault(); back(); } }}><ArrowLeft size={16} aria-hidden="true"/> Terug</button>
            <button className="btn btn-primary" onClick={tryNext} onPointerUp={(e)=>{ if(e.pointerType==="touch"){ e.preventDefault(); tryNext(); } }} aria-disabled={blocked} aria-describedby={showErrors&&blocked?errId:undefined} title={blocked?"Vul eerst de verplichte velden in":undefined}>{nextLabel} <ArrowRight size={18} aria-hidden="true"/></button>
          </div>
        </main>
      </div>
    </div>
  );
}


/* De calculator houdt zijn eigen volledige layout (split-screen wizard);
   CalculatorLayout levert alleen de terug-navigatie. */
export default function MeerMinderWerken(){
  return (
    <CalculatorLayout bare calculatorId="meer-minder-werken">
      <MeerMinderWerkenCalculator />
    </CalculatorLayout>
  );
}
