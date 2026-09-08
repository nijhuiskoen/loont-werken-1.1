import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Info, Pencil, Plus, Trash2 } from "lucide-react";
import CalculatorLayout from "../components/CalculatorLayout.jsx";
import { Euro, Pct, NumField } from "../components/FormFields.jsx";
import { RadioPills, RadioTiles } from "../components/ChoiceFields.jsx";
import { SRow } from "../components/ResultRow.jsx";
import InfoTip from "../components/InfoTip.jsx";
import { calculateChildcare } from "../calculations/childcare.js";
import { MAX_UURTARIEF, OPVANG } from "../data/2026/childcare.js";
import { CIJFERS_JAAR } from "../data/2026/meta.js";
import { CALCULATORS } from "../config/calculators.js";
import { eur } from "../utils/format.js";

const meerMinderWerken = CALCULATORS.find((c)=>c.id==="meer-minder-werken");
const STEP_LABELS = ["Situatie", "Inkomen", "Kinderen", "Opvang"];
const MAX_OPVANG_PER_KIND = 4;

const nieuwePersoon = ()=>({ bruto:0, periode:"maand", vakantiegeldPct:8, urenPerWeek:0 });
const nieuwOpvangvorm = ()=>({ type:"dagopvang", uurtarief:OPVANG.dagopvang.tarief, urenPerDag:OPVANG.dagopvang.uren, dagenPerWeek:2, underKOT:true });
const nieuwKind = (n)=>({ naam:`Kind ${n}`, opvang:[nieuwOpvangvorm()] });

function brutoJaarVan(p){
  const brutoPerMaand = p.periode==="jaar" ? p.bruto/12 : p.bruto;
  return brutoPerMaand*12*(1+ (p.vakantiegeldPct||0)/100);
}

export default function Kinderopvang(){
  const [fase, setFase] = useState("stap"); // "stap" | "resultaat"
  const [stap, setStap] = useState(0);
  const [stapError, setStapError] = useState("");

  const [heeftPartner, setHeeftPartner] = useState(true);
  const [inkomenType, setInkomenType] = useState("schatten"); // "schatten" | "invoeren"
  const [toetsingsinkomenDirect, setToetsingsinkomenDirect] = useState(0);
  const [persoon1, setPersoon1] = useState(nieuwePersoon());
  const [persoon2, setPersoon2] = useState(nieuwePersoon());
  const patch1 = (p)=>setPersoon1((d)=>({...d,...p}));
  const patch2 = (p)=>setPersoon2((d)=>({...d,...p}));

  const [kinderen, setKinderen] = useState([nieuwKind(1)]);
  const setAantalKinderen = (n)=>setKinderen((huidig)=>{
    const a=[...huidig]; while(a.length<n) a.push(nieuwKind(a.length+1)); return a.slice(0,n);
  });
  const patchKind = (i,p)=>setKinderen((ks)=>ks.map((k,j)=>j===i?{...k,...p}:k));
  const patchOpvang = (ki,oi,p)=>setKinderen((ks)=>ks.map((k,j)=> j!==ki?k:{...k,opvang:k.opvang.map((o,l)=>l===oi?{...o,...p}:o)}));
  const addOpvang = (ki)=>setKinderen((ks)=>ks.map((k,j)=> {
    if(j!==ki || k.opvang.length>=MAX_OPVANG_PER_KIND) return k;
    return {...k, opvang:[...k.opvang, nieuwOpvangvorm()]};
  }));
  const removeOpvang = (ki,oi)=>setKinderen((ks)=>ks.map((k,j)=> j!==ki?k:{...k,opvang: k.opvang.length>1 ? k.opvang.filter((_,l)=>l!==oi) : k.opvang}));

  // --- berekening ---
  const toetsingsinkomen = inkomenType==="invoeren"
    ? toetsingsinkomenDirect
    : brutoJaarVan(persoon1) + (heeftPartner ? brutoJaarVan(persoon2) : 0);
  const urenP1 = persoon1.urenPerWeek>0 ? persoon1.urenPerWeek : null;
  const urenP2 = heeftPartner && persoon2.urenPerWeek>0 ? persoon2.urenPerWeek : null;
  const minParentHoursPerWeek = inkomenType==="invoeren"
    ? null
    : (urenP1!=null && (!heeftPartner || urenP2!=null) ? Math.min(urenP1, heeftPartner?urenP2:urenP1) : null);

  const kinderenVoorEngine = kinderen.map((k)=>({ opvang:k.opvang }));
  const result = calculateChildcare({ children:kinderenVoorEngine, toetsingsinkomen, minParentHoursPerWeek });

  const heeftInvoer = kinderen.some((k)=>k.opvang.some((o)=>o.dagenPerWeek>0 && o.uurtarief>0));

  const scrollBoven = ()=>window.scrollTo({top:0, behavior:"instant"});
  const volgende = ()=>{
    if(stap===1 && inkomenType==="schatten" && persoon1.bruto<=0 && toetsingsinkomen<=0){
      setStapError("Vul een inkomen in, of vul direct het toetsingsinkomen in.");
      return;
    }
    if(stap===1 && inkomenType==="invoeren" && toetsingsinkomenDirect<=0){
      setStapError("Vul het toetsingsinkomen in om verder te gaan.");
      return;
    }
    setStapError("");
    if(stap<3){ setStap(stap+1); scrollBoven(); return; }
    if(!heeftInvoer){ setStapError("Vul bij minstens één kind de opvangdagen en het uurtarief in."); return; }
    setStapError("");
    setFase("resultaat"); scrollBoven();
  };
  const terug = ()=>{
    if(fase==="resultaat"){ setFase("stap"); setStap(3); scrollBoven(); return; }
    setStapError("");
    if(stap>0){ setStap(stap-1); scrollBoven(); return; }
  };

  return (
    <CalculatorLayout
      title="Kinderopvangkosten"
      intro={`Bereken wat kinderopvang jullie netto kost per maand — bruto kosten, kinderopvangtoeslag en eigen bijdrage, met de officiële ${CIJFERS_JAAR}-regels.`}
      calculatorId="kinderopvang"
    >
      <div className="stack">

        {fase==="stap" && (<>
          <div className="step-progress-label">
            Stap {stap+1} van 4 · <strong>{STEP_LABELS[stap]}</strong>
          </div>
          <div className="step-progress" role="progressbar" aria-valuenow={stap+1} aria-valuemin={1} aria-valuemax={4} aria-label="Voortgang">
            {STEP_LABELS.map((_,i)=>(<span key={i} className={`bar${i===stap?" is-active":i<stap?" is-done":""}`} />))}
          </div>

          <div
            className="pcard"
            onKeyDown={(e)=>{
              if(e.key!=="Enter" || e.shiftKey) return;
              const t=e.target;
              if(t.tagName==="INPUT" && !["checkbox","radio"].includes(t.type)){ e.preventDefault(); volgende(); }
            }}
          >
            {stap===0 && (<>
              <h3>Jullie situatie</h3>
              <p className="psub">Kinderopvangtoeslag kijkt naar het inkomen van jou én een eventuele toeslagpartner samen.</p>
              <div className="stack" style={{marginTop:16}}>
                <div>
                  <span className="rg-label">
                    Heb je een toeslagpartner?
                    <InfoTip label="Wat is een toeslagpartner?">Meestal je partner met wie je samenwoont of getrouwd bent. Bij Dienst Toeslagen telt het inkomen van je toeslagpartner altijd mee, ook als die zelf geen kinderopvang gebruikt.</InfoTip>
                  </span>
                  <div className="bigchoice" role="radiogroup" aria-label="Toeslagpartner">
                    <label>
                      <input type="radio" name="ko-partner" checked={heeftPartner} onChange={()=>setHeeftPartner(true)} />
                      <span className="dot" aria-hidden="true"></span>
                      <span className="txt"><strong>Ja</strong><span>Jullie inkomen telt samen mee voor de toeslag.</span></span>
                    </label>
                    <label>
                      <input type="radio" name="ko-partner" checked={!heeftPartner} onChange={()=>setHeeftPartner(false)} />
                      <span className="dot" aria-hidden="true"></span>
                      <span className="txt"><strong>Nee</strong><span>Alleen jouw inkomen telt mee.</span></span>
                    </label>
                  </div>
                </div>
              </div>
            </>)}

            {stap===1 && (<>
              <h3>Jullie inkomen</h3>
              <p className="psub">De hoogte van de toeslag hangt af van het <strong>toetsingsinkomen</strong> — het gezamenlijke bruto jaarinkomen{heeftPartner?" van jou en je partner":""}.</p>
              <div className="stack" style={{marginTop:16}}>
                <RadioPills legend="Hoe wil je dit invullen?" name="ko-inkomentype" options={["schatten","invoeren"]} value={inkomenType} onChange={setInkomenType} />
                {inkomenType==="invoeren" ? (
                  <div className="field">
                    <label className="lab" htmlFor="ko-ti">
                      Toetsingsinkomen per jaar
                      <InfoTip label="Waar vind ik dit?">Je toetsingsinkomen staat op je (voorlopige) aanslag inkomstenbelasting, of je kunt het schatten als je gezamenlijke bruto jaarinkomen.</InfoTip>
                    </label>
                    <Euro id="ko-ti" value={toetsingsinkomenDirect} onChange={setToetsingsinkomenDirect} />
                    <span className="hint">Weet je dit niet precies? Kies dan &ldquo;schatten&rdquo; hierboven — dan rekenen we het voor je uit op basis van jullie salaris.</span>
                  </div>
                ) : (<>
                  <div className="opvangcard">
                    <div className="opvanghead"><span className="t">Jij</span></div>
                    <div className="grid2col">
                      <div className="field">
                        <label className="lab" htmlFor="ko-p1-bruto">Bruto salaris</label>
                        <Euro id="ko-p1-bruto" value={persoon1.bruto} onChange={(v)=>patch1({bruto:v})} />
                      </div>
                      <div className="field">
                        <label className="lab" htmlFor="ko-p1-uren">Uren per week (werk)</label>
                        <NumField id="ko-p1-uren" value={persoon1.urenPerWeek} onCommit={(v)=>patch1({urenPerWeek:v})} placeholder="Bijv. 32" />
                      </div>
                    </div>
                    <span className="hint">Bruto per maand, exclusief vakantiegeld (standaard 8% meegerekend).</span>
                  </div>
                  {heeftPartner && (
                    <div className="opvangcard">
                      <div className="opvanghead"><span className="t">Je partner</span></div>
                      <div className="grid2col">
                        <div className="field">
                          <label className="lab" htmlFor="ko-p2-bruto">Bruto salaris</label>
                          <Euro id="ko-p2-bruto" value={persoon2.bruto} onChange={(v)=>patch2({bruto:v})} />
                        </div>
                        <div className="field">
                          <label className="lab" htmlFor="ko-p2-uren">Uren per week (werk)</label>
                          <NumField id="ko-p2-uren" value={persoon2.urenPerWeek} onCommit={(v)=>patch2({urenPerWeek:v})} placeholder="Bijv. 24" />
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="hint">
                    <InfoTip label="Waarom uren per week?">Het aantal uren waarvoor je toeslag kunt krijgen hangt samen met de gewerkte uren van de minst werkende ouder (max. 140% daarvan, met een bovengrens van 230 uur per kind per maand). Vul je dit niet in, dan gaan we uit van de volledige 230 uur.</InfoTip>
                    {" "}Toetsingsinkomen (geschat): <strong>{eur(toetsingsinkomen)}</strong> per jaar.
                  </p>
                </>)}
                {stapError && <p className="hint" style={{color:"var(--cost)"}}>{stapError}</p>}
              </div>
            </>)}

            {stap===2 && (<>
              <h3>Jullie kinderen</h3>
              <p className="psub">Voor hoeveel kinderen betaal je kinderopvang?</p>
              <div className="stack" style={{marginTop:16}}>
                <RadioPills legend="Aantal kinderen" name="ko-aantal" options={[1,2,3,4]} value={kinderen.length} onChange={setAantalKinderen} />
                {kinderen.map((k,i)=>(
                  <div className="field" key={i}>
                    <label className="lab" htmlFor={`ko-naam-${i}`}>Naam kind {i+1} <span style={{fontWeight:400,color:"var(--ink-3)"}}>(optioneel)</span></label>
                    <input id={`ko-naam-${i}`} className="control" value={k.naam} onChange={(e)=>patchKind(i,{naam:e.target.value})} placeholder={`Kind ${i+1}`} />
                  </div>
                ))}
              </div>
            </>)}

            {stap===3 && (<>
              <h3>De opvang</h3>
              <p className="psub">Vul per kind de opvang in. Gaat een kind naar meerdere vormen (bijv. gastouder én BSO)? Voeg ze apart toe.</p>
              <div className="stack" style={{marginTop:16}}>
                {kinderen.map((k,ki)=>(
                  <div key={ki}>
                    <span className="rg-label">{k.naam || `Kind ${ki+1}`}</span>
                    <div className="stack" style={{gap:12}}>
                      {k.opvang.map((o,oi)=>(
                        <div className="opvangcard" key={oi}>
                          <div className="opvanghead">
                            <span className="t">Opvangvorm {oi+1}</span>
                            {k.opvang.length>1 && <button type="button" className="btn-remove" onClick={()=>removeOpvang(ki,oi)}><Trash2 size={14} aria-hidden="true"/> Verwijderen</button>}
                          </div>
                          <RadioTiles legend="Soort opvang" name={`ko-soort-${ki}-${oi}`} value={o.type}
                            onChange={(t)=>patchOpvang(ki,oi,{type:t, urenPerDag:OPVANG[t].uren, uurtarief:OPVANG[t].tarief})}
                            options={Object.entries(OPVANG).map(([val,v])=>({value:val,label:v.label,sub:v.sub}))} />
                          <div className="grid2col" style={{marginTop:14}}>
                            <div className="field">
                              <label className="lab" htmlFor={`ko-tarief-${ki}-${oi}`}>Uurtarief (werkelijk)</label>
                              <NumField id={`ko-tarief-${ki}-${oi}`} allowDecimal value={o.uurtarief} onCommit={(v)=>patchOpvang(ki,oi,{uurtarief:v})} placeholder="Bijv. 11,47" />
                            </div>
                            <div className="field">
                              <label className="lab" htmlFor={`ko-urendag-${ki}-${oi}`}>Uren per opvangdag</label>
                              <NumField id={`ko-urendag-${ki}-${oi}`} allowDecimal value={o.urenPerDag} onCommit={(v)=>patchOpvang(ki,oi,{urenPerDag:v})} placeholder="Bijv. 10,5" />
                            </div>
                          </div>
                          <div className="field" style={{marginTop:14}}>
                            <label className="lab" htmlFor={`ko-dagen-${ki}-${oi}`}>Dagen per week</label>
                            <NumField id={`ko-dagen-${ki}-${oi}`} value={o.dagenPerWeek} onCommit={(v)=>patchOpvang(ki,oi,{dagenPerWeek:v})} placeholder="Bijv. 2" />
                          </div>
                          <div className="inset" style={{marginTop:14}}>
                            <span className="lab">Valt onder kinderopvangtoeslag?</span>
                            <label className="switch">
                              <input type="checkbox" checked={o.underKOT!==false} onChange={(e)=>patchOpvang(ki,oi,{underKOT:e.target.checked})} />
                              <span className="track" aria-hidden="true"></span>
                              <span className="sr-only">Valt onder kinderopvangtoeslag</span>
                            </label>
                          </div>
                          {o.underKOT!==false
                            ? <p className="hint">Kinderopvangtoeslag tot max {eur(MAX_UURTARIEF[o.type],2)} per uur ({OPVANG[o.type].label}). Vraagt de opvang meer? Dat verschil betaal je zelf.</p>
                            : <p className="hint">Geen kinderopvangtoeslag. Inkomensafhankelijke ouderbijdrage volgens de VNG-adviestabel {CIJFERS_JAAR} — de gemeente betaalt het verschil tot {eur(MAX_UURTARIEF.dagopvang,2)}/uur. Gemeenten kunnen hiervan afwijken.</p>}
                        </div>
                      ))}
                      {k.opvang.length<MAX_OPVANG_PER_KIND ? (
                        <button type="button" className="btn-add" onClick={()=>addOpvang(ki)}><Plus size={17} aria-hidden="true"/><span>Opvangvorm toevoegen</span></button>
                      ) : (
                        <p className="hint">Maximum van {MAX_OPVANG_PER_KIND} opvangvormen per kind bereikt.</p>
                      )}
                    </div>
                  </div>
                ))}
                {stapError && <p className="hint" style={{color:"var(--cost)"}}>{stapError}</p>}
              </div>
            </>)}

            <div className="step-nav">
              {stap>0
                ? <button type="button" className="btn-text" onClick={terug}><ArrowLeft size={16} aria-hidden="true"/> Terug</button>
                : <span className="spacer" />}
              <button type="button" className="btn btn-primary" onClick={volgende}>
                {stap<3 ? <>Verder <ArrowRight size={17} aria-hidden="true"/></> : <>Bekijk resultaat <ArrowRight size={17} aria-hidden="true"/></>}
              </button>
            </div>
          </div>
        </>)}

        {fase==="resultaat" && (<>
          <button type="button" className="btn-text" onClick={terug} style={{marginBottom:4}}>
            <Pencil size={15} aria-hidden="true"/> Gegevens aanpassen
          </button>

          <section className="hero" aria-label="Netto kosten kinderopvang">
            <div className="row">
              <div>
                <p className="label">Dit betaal je netto voor kinderopvang</p>
                <p className="big">{eur(result.eigenBijdragePerMaand)}</p>
              </div>
              <div className="side">
                <div className="k">Per jaar</div>
                <div className="v num">{eur(result.eigenBijdragePerJaar)}</div>
                <div className="k" style={{marginTop:4}}>{Math.round(result.vergoedPercentageGemiddeld*100)}% van de kosten vergoed</div>
              </div>
            </div>
            <p className="note">Van {eur(result.opvangkostenPerMaand)} bruto opvangkosten per maand krijg je ongeveer {eur(result.toeslagPerMaand)} kinderopvangtoeslag — je betaalt zelf <strong>{eur(result.eigenBijdragePerMaand)}</strong> per maand.</p>
          </section>

          {result.heeftGemeentesubsidie && (
            <div className="banner" role="note">
              <Info size={17} aria-hidden="true"/>
              <p>Bij één of meer opvangvormen heb je aangegeven dat er geen kinderopvangtoeslag geldt. Daarvoor is een inkomensafhankelijke gemeentelijke ouderbijdrage (VNG-adviestabel) toegepast — gemeenten mogen hiervan afwijken.</p>
            </div>
          )}
          {!result.urenkoppelingActief && (
            <div className="banner" role="note">
              <Info size={17} aria-hidden="true"/>
              <p>Je hebt geen gewerkte uren ingevuld — we zijn daarom uitgegaan van het volledige maximum van 230 toeslagbare uren per kind per maand. Werk je (of je partner) minder, dan kan je werkelijke toeslag lager uitvallen.</p>
            </div>
          )}

          <section className="scard" aria-label="Overzicht">
            <div className="head"><h3>Overzicht</h3></div>
            <SRow label="Bruto opvangkosten" value={eur(result.opvangkostenPerMaand)} />
            <SRow label="Kinderopvangtoeslag" value={"− "+eur(result.toeslagPerMaand)} tone="good" />
            <SRow label="Zelf te betalen" value={eur(result.eigenBijdragePerMaand)} tone="cost" total />
            <div className="result-divider" />
            <SRow label="Bruto opvangkosten per jaar" value={eur(result.opvangkostenPerJaar)} />
            <SRow label="Kinderopvangtoeslag per jaar" value={eur(result.toeslagPerJaar)} tone="good" />
            <SRow label="Netto kosten per jaar" value={eur(result.eigenBijdragePerJaar)} tone="cost" total />
            <SRow label="Toetsingsinkomen (gebruikt voor de toeslag)" value={eur(toetsingsinkomen)} />
            <SRow label="Vergoedingspercentage eerste kind" value={`${Math.round(result.vergoedingspercentageEersteKind*100)}%`} />
          </section>

          {kinderen.map((k,ki)=>{
            const kr = result.perKind[ki];
            if(!kr) return null;
            return (
              <section className="scard" aria-label={`Resultaat ${k.naam||("Kind "+(ki+1))}`} key={ki}>
                <div className="head"><h3>{k.naam || `Kind ${ki+1}`} <span className="step-optional">{kr.rang==="eerste"?"1e kind":"volgend kind"}</span></h3></div>
                {k.opvang.map((o,oi)=>(
                  <p className="meta" key={oi} style={{marginBottom:6}}>{OPVANG[o.type].label} · {o.dagenPerWeek} dag(en)/week · {o.urenPerDag} uur/dag{o.underKOT===false?" · gemeentelijke bijdrage":""}</p>
                ))}
                <SRow label="Bruto opvangkosten" value={eur(kr.opvangkostenPerMaand)} />
                <SRow label="Toeslag / bijdrage" value={"− "+eur(kr.toeslagPerMaand)} tone="good" />
                <SRow label="Zelf te betalen" value={eur(kr.eigenBijdragePerMaand)} tone="cost" total />
                {kr.kostenBovenMaximumUurprijs>0 && (
                  <p className="meta" style={{marginTop:10}}>Waarvan {eur(kr.kostenBovenMaximumUurprijs)}/mnd boven de maximale uurprijs — dat deel wordt nooit vergoed, ongeacht inkomen.</p>
                )}
                {kr.urenBovenMaximum && (
                  <p className="meta" style={{marginTop:6}}>Let op: dit kind gaat meer uren naar de opvang ({Math.round(kr.toetsbareUren)} toeslagbare uren zijn het maximum) dan waarvoor toeslag wordt gegeven. De uren erboven betaal je volledig zelf.</p>
                )}
              </section>
            );
          })}

          <section className="scard" aria-label="Wat betaal je echt?">
            <div className="head"><h3>Wat betaal je echt?</h3></div>
            <p className="meta">De overheid vergoedt maximaal een deel van de opvangkosten, tot een <strong>maximumuurprijs</strong> per opvangsoort. Vraagt de opvang meer dan dat maximum? Dan betaal je het verschil altijd zelf, ongeacht je inkomen. Onder het maximum bepaalt je toetsingsinkomen welk <strong>percentage</strong> van de kosten wordt vergoed — hoe lager het inkomen, hoe hoger het percentage (tot 96%). Voor het kind met de hoogste opvangkosten geldt het gunstigste ("eerste kind") percentage; voor de andere kinderen een iets lager ("volgend kind") percentage.</p>
          </section>

          {meerMinderWerken && (
            <section className="scard" aria-label="Verder berekenen">
              <div className="head"><h3>Wat gebeurt er als je meer of minder gaat werken?</h3></div>
              <p className="meta" style={{marginBottom:12}}>Andere werkuren veranderen niet alleen je inkomen, maar ook hoeveel toeslagbare opvanguren je hebt.</p>
              <Link to={meerMinderWerken.slug} className="btn btn-primary">
                Bereken het effect <ArrowRight size={17} aria-hidden="true"/>
              </Link>
            </section>
          )}

          <p className="disc" style={{marginTop:0}}>Dit is een indicatieve berekening. De uiteindelijke kinderopvangtoeslag kan afwijken op basis van je persoonlijke situatie en de gegevens die bij Dienst Toeslagen bekend zijn. Doe voor een bindende berekening altijd de officiële proefberekening bij Dienst Toeslagen. Cijfers {CIJFERS_JAAR}.</p>
        </>)}
      </div>
    </CalculatorLayout>
  );
}
