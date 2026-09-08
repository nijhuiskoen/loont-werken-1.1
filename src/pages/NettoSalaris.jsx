import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Info, Pencil, User, Users } from "lucide-react";
import CalculatorLayout from "../components/CalculatorLayout.jsx";
import { Euro, Pct, NumField } from "../components/FormFields.jsx";
import { RadioPills } from "../components/ChoiceFields.jsx";
import { SRow } from "../components/ResultRow.jsx";
import InfoTip from "../components/InfoTip.jsx";
import { calculateNetSalary } from "../calculations/netSalary.js";
import { getTaxYear, DEFAULT_TAX_YEAR } from "../config/taxYears.js";
import { CALCULATORS } from "../config/calculators.js";
import { eur } from "../utils/format.js";

const meerMinderWerken = CALCULATORS.find((c)=>c.id==="meer-minder-werken");
const STEP_LABELS = ["Salaris", "Situatie", "Extra's", "Inhoudingen"];

/* Standaardinvoer voor één persoon — gebruikt voor zowel "jij" als "je partner". */
function maakLeegPersoon(cfg){
  return {
    brutoBedrag: 0, brutoPeriode: "maand", geboortejaar: 0, loonheffingskorting: true,
    vakantiegeldPct: Math.round(cfg.vakantiegeldStandaard*1000)/10,
    pensioenType: "geen", premieType: "percentage", premieWaarde: 0,
    overigeInhoudingen: 0, dertiendeType: "geen", dertiendeWaarde: 0,
  };
}
function berekenPersoon(data, cfg){
  return calculateNetSalary({
    brutoBedrag: data.brutoBedrag, brutoPeriode: data.brutoPeriode,
    geboortejaar: data.geboortejaar>1900 ? data.geboortejaar : null,
    loonheffingskorting: data.loonheffingskorting,
    vakantiegeldPct: data.vakantiegeldPct/100,
    pensioen: data.pensioenType==="werkgever" ? { type:"werkgever", premieType:data.premieType, premieWaarde:data.premieWaarde } : { type:"geen" },
    overigeInhoudingenPerMaand: data.overigeInhoudingen,
    dertiendeMaand: { type: data.dertiendeType, waarde: data.dertiendeWaarde },
    taxYear: cfg.jaar,
  });
}

/* Compacte samenvattingskaart van één persoon, gebruikt in de gezamenlijke resultaatweergave. */
function PersoonSamenvatting({ naam, result }){
  if(!result.berekenbaar){
    return (
      <section className="scard" aria-label={`Inkomen ${naam}`}>
        <div className="head"><h3>{naam}</h3></div>
        <div className="banner" role="note">
          <Info size={17} aria-hidden="true"/>
          <p>Op basis van het ingevulde geboortejaar ontvangt {naam.toLowerCase()==="jij"?"je":naam} al AOW — daarvoor rekent deze calculator niet mee, om geen onjuist bedrag te tonen. {naam} telt daarom niet mee in het gezamenlijke totaal.</p>
        </div>
      </section>
    );
  }
  return (
    <section className="scard" aria-label={`Inkomen ${naam}`}>
      <div className="head"><h3>{naam}</h3></div>
      <SRow label="Bruto per maand" value={eur(result.brutoPerMaand)} />
      <SRow label="Netto per maand" value={eur(result.nettoPerMaand)} tone="good" />
      <SRow label="Netto per jaar" value={eur(result.nettoPerJaar)} tone="good" total />
      <SRow label="Effectief belastingpercentage" value={`${Math.round((1-result.nettoBrutoPercentage)*100)}%`} />
      {result.bruto13eMaand>0 && <SRow label="Netto 13e maand" value={eur(result.netto13eMaand)} tone="good" />}
    </section>
  );
}

export default function NettoSalaris(){
  const cfg = getTaxYear(DEFAULT_TAX_YEAR);

  // --- wie: alleen ikzelf, of ik + partner ---
  const [modus, setModus] = useState("solo"); // "solo" | "samen"

  // --- invoer per persoon (zelfde velden/logica voor jij en partner) ---
  const [jij, setJij] = useState(()=>maakLeegPersoon(cfg));
  const [partner, setPartner] = useState(()=>maakLeegPersoon(cfg));
  const patchJij = (p)=>setJij((d)=>({...d, ...p}));
  const patchPartner = (p)=>setPartner((d)=>({...d, ...p}));

  // --- navigatie: fase = welk deel van de flow; stap = sub-stap 0..3 binnen jij/partner ---
  const [fase, setFase] = useState("wie"); // "wie" | "jij" | "partner" | "resultaat"
  const [stap, setStap] = useState(0);
  const [stapError, setStapError] = useState(false);

  const isPartnerFase = fase==="partner";
  const actief = isPartnerFase ? partner : jij;
  const patchActief = isPartnerFase ? patchPartner : patchJij;

  const resultJij = berekenPersoon(jij, cfg);
  const resultPartner = berekenPersoon(partner, cfg);
  const resultActief = isPartnerFase ? resultPartner : resultJij;

  const heeftInvoerActief = actief.brutoBedrag>0;
  const geblokkeerdDoorAowActief = !resultActief.berekenbaar && resultActief.reason==="aow";

  const scrollBoven = ()=>window.scrollTo({top:0, behavior:"instant"});

  const volgende = ()=>{
    if(fase==="wie"){ setFase("jij"); setStap(0); scrollBoven(); return; }
    if(stap===0){
      if(!heeftInvoerActief){ setStapError(true); return; }
      setStapError(false);
    }
    if(stap<3){ setStap(stap+1); scrollBoven(); return; }
    // laatste sub-stap van deze persoon afgerond
    if(fase==="jij" && modus==="samen"){ setFase("partner"); setStap(0); scrollBoven(); return; }
    setFase("resultaat"); scrollBoven();
  };
  const terug = ()=>{
    if(fase==="resultaat"){ setFase(modus==="samen" ? "partner" : "jij"); setStap(3); scrollBoven(); return; }
    if(stap>0){ setStap(stap-1); scrollBoven(); return; }
    if(fase==="partner"){ setFase("jij"); setStap(3); scrollBoven(); return; }
    if(fase==="jij"){ setFase("wie"); scrollBoven(); return; }
  };

  const titelStap0 = isPartnerFase ? "Wat verdient je partner?" : "Wat verdien je?";
  const uitlegStap0 = isPartnerFase
    ? "Vul het bruto salaris van je partner in zoals het op de loonstrook staat."
    : "Vul je bruto salaris in zoals het op je loonstrook staat.";
  const titelStap1 = isPartnerFase ? "Situatie van je partner" : "Jouw situatie";
  const titelStap2 = isPartnerFase ? "Heeft je partner extra’s bovenop het salaris?" : "Heb je extra’s bovenop je salaris?";
  const titelStap3 = isPartnerFase ? "Pensioen of andere inhoudingen bij je partner?" : "Heb je pensioen of andere inhoudingen?";
  const bezittelijk = isPartnerFase ? "je partner" : "je";

  // --- gezamenlijke totalen (alleen optellen wat daadwerkelijk berekenbaar is) ---
  const jijOk = resultJij.berekenbaar;
  const partnerOk = modus==="samen" && resultPartner.berekenbaar;
  const gezamenlijkNettoPerMaand = (jijOk?resultJij.nettoPerMaand:0) + (partnerOk?resultPartner.nettoPerMaand:0);
  const gezamenlijkNettoPerJaar = (jijOk?resultJij.nettoPerJaar:0) + (partnerOk?resultPartner.nettoPerJaar:0);
  const gezamenlijkBrutoPerJaar = (jijOk?resultJij.brutoPerJaar:0) + (partnerOk?resultPartner.brutoPerJaar:0);
  const gezamenlijkLoonheffing = (jijOk?resultJij.loonheffingPerJaar:0) + (partnerOk?resultPartner.loonheffingPerJaar:0);
  const gezamenlijkPensioen = (jijOk?resultJij.pensioenPremiePerJaar:0) + (partnerOk?resultPartner.pensioenPremiePerJaar:0);
  const gezamenlijkOverig = (jijOk?resultJij.overigeInhoudingenPerJaar:0) + (partnerOk?resultPartner.overigeInhoudingenPerJaar:0);
  const gezamenlijkPct = gezamenlijkBrutoPerJaar>0 ? gezamenlijkNettoPerJaar/gezamenlijkBrutoPerJaar : 0;

  return (
    <CalculatorLayout
      title="Netto salaris"
      intro={`Bereken wat je van je bruto salaris netto overhoudt, met de officiële ${cfg.jaar}-tarieven van de Belastingdienst.`}
      calculatorId="netto-salaris"
    >
      <div className="stack">

        {fase==="wie" && (
          <div className="pcard">
            <h3>Wat wil je berekenen?</h3>
            <p className="psub">Je kunt dit later nog aanpassen.</p>
            <div className="stack" style={{marginTop:16}}>
              <div className="bigchoice" role="radiogroup" aria-label="Wat wil je berekenen?">
                <label>
                  <input type="radio" name="ns-wie" checked={modus==="solo"} onChange={()=>setModus("solo")} />
                  <span className="dot" aria-hidden="true"></span>
                  <span className="txt"><strong><User size={15} aria-hidden="true" style={{verticalAlign:"-2px",marginRight:6}}/>Alleen mijn inkomen</strong><span>Bereken mijn bruto en netto salaris.</span></span>
                </label>
                <label>
                  <input type="radio" name="ns-wie" checked={modus==="samen"} onChange={()=>setModus("samen")} />
                  <span className="dot" aria-hidden="true"></span>
                  <span className="txt"><strong><Users size={15} aria-hidden="true" style={{verticalAlign:"-2px",marginRight:6}}/>Mijn inkomen + dat van mijn partner</strong><span>Bekijk het gezamenlijke inkomen van jullie huishouden.</span></span>
                </label>
              </div>
            </div>
            <div className="step-nav">
              <span className="spacer" />
              <button type="button" className="btn btn-primary" onClick={volgende}>Verder <ArrowRight size={17} aria-hidden="true"/></button>
            </div>
          </div>
        )}

        {(fase==="jij" || fase==="partner") && (<>
          <div className="step-progress-label">
            {modus==="samen" && <>{isPartnerFase ? "Inkomen van je partner" : "Jouw inkomen"} · </>}
            Stap {stap+1} van 4 · <strong>{STEP_LABELS[stap]}</strong>
          </div>
          <div className="step-progress" role="progressbar" aria-valuenow={stap+1} aria-valuemin={1} aria-valuemax={4} aria-label="Voortgang">
            {STEP_LABELS.map((_,i)=>(
              <span key={i} className={`bar${i===stap?" is-active":i<stap?" is-done":""}`} />
            ))}
          </div>

          <div
            className="pcard"
            onKeyDown={(e)=>{
              if(e.key!=="Enter" || e.shiftKey) return;
              const t=e.target;
              if(t.tagName==="INPUT" && !["checkbox","radio"].includes(t.type)){
                e.preventDefault();
                volgende();
              }
            }}
          >
            {stap===0 && (<>
              <h3>{titelStap0}</h3>
              <p className="psub">{uitlegStap0}</p>
              <div className="stack" style={{marginTop:16}}>
                <div className="field">
                  <label className="lab" htmlFor="ns-bruto">Bruto salaris</label>
                  <Euro id="ns-bruto" value={actief.brutoBedrag} onChange={(v)=>{patchActief({brutoBedrag:v}); if(v>0) setStapError(false);}} autoFocus />
                  {stapError && <span className="hint" style={{color:"var(--cost)"}}>Vul eerst het bruto salaris in om verder te gaan.</span>}
                </div>
                <RadioPills legend="Periode" name="ns-periode" options={["maand","jaar"]} value={actief.brutoPeriode} onChange={(v)=>patchActief({brutoPeriode:v})} />
              </div>
            </>)}

            {stap===1 && (<>
              <h3>{titelStap1}</h3>
              <p className="psub">Deze gegevens hebben invloed op de belasting en heffingskortingen.</p>
              <div className="stack" style={{marginTop:16}}>
                <div className="field">
                  <label className="lab" htmlFor="ns-gj">
                    Geboortejaar <span style={{fontWeight:400,color:"var(--ink-3)"}}>(optioneel)</span>
                    <InfoTip label="Waarom geboortejaar?">We checken hiermee of {bezittelijk==="je"?"je":"je partner"} al AOW ontvangt — dan gelden andere premies die deze calculator niet berekent.</InfoTip>
                  </label>
                  <NumField id="ns-gj" value={actief.geboortejaar} onCommit={(v)=>patchActief({geboortejaar:v})} placeholder="Bijv. 1990" />
                  {geblokkeerdDoorAowActief && (
                    <div className="banner" role="note" style={{marginTop:10}}>
                      <Info size={17} aria-hidden="true"/>
                      <p>Op basis van dit geboortejaar {isPartnerFase?"heeft je partner":"heb je"} de AOW-leeftijd ({resultActief.aow.jaren} jaar{resultActief.aow.maanden?` en ${resultActief.aow.maanden} maanden`:""}) al bereikt. Voor AOW-gerechtigden gelden andere premies — deze calculator rekent daar niet mee, om geen onjuist bedrag te tonen.</p>
                    </div>
                  )}
                </div>
                <div className="inset">
                  <span className="lab">
                    Loonheffingskorting
                    <InfoTip label="Wat is loonheffingskorting?">Een korting die de belasting verlaagt. Dit kan maar bij één werkgever tegelijk worden toegepast — meestal de hoofdwerkgever.</InfoTip>
                    <br/><span style={{fontSize:12.5,color:"var(--ink-3)",fontWeight:400}}>Bij de hoofdwerkgever meestal &ldquo;Ja&rdquo;</span>
                  </span>
                  <label className="switch">
                    <input type="checkbox" checked={actief.loonheffingskorting} onChange={(e)=>patchActief({loonheffingskorting:e.target.checked})} />
                    <span className="track" aria-hidden="true"></span>
                    <span className="sr-only">Loonheffingskorting toepassen</span>
                  </label>
                </div>
              </div>
            </>)}

            {stap===2 && (<>
              <h3>{titelStap2}</h3>
              <p className="psub">Vakantiegeld heeft bijna iedereen; een 13e maand niet.</p>
              <div className="stack" style={{marginTop:16}}>
                <div className="field">
                  <label className="lab" htmlFor="ns-vak">
                    Vakantiegeld
                    <InfoTip label="Wat is vakantiegeld?">Een wettelijk verplichte uitkering van minimaal 8% van het jaarsalaris, meestal in mei uitbetaald.</InfoTip>
                  </label>
                  <Pct id="ns-vak" ariaLabel="Vakantiegeld in procenten" value={actief.vakantiegeldPct} onChange={(v)=>patchActief({vakantiegeldPct:v})} />
                  <span className="hint">Wettelijk minimum is 8%. Het bruto salaris hierboven is exclusief dit vakantiegeld.</span>
                </div>

                <div>
                  <span className="rg-label">
                    13e maand / eindejaarsuitkering <span style={{fontWeight:400,color:"var(--ink-3)"}}>(optioneel)</span>
                    <InfoTip label="Wat is een 13e maand?">Een 13e maand telt fiscaal als &ldquo;bijzondere beloning&rdquo; en wordt tegen een ander tarief belast dan het gewone salaris.</InfoTip>
                  </span>
                  <div className="bigchoice" role="radiogroup" aria-label="13e maand of eindejaarsuitkering">
                    <label>
                      <input type="radio" name="ns-13e" checked={actief.dertiendeType==="geen"} onChange={()=>patchActief({dertiendeType:"geen"})} />
                      <span className="dot" aria-hidden="true"></span>
                      <span className="txt"><strong>Geen 13e maand</strong></span>
                    </label>
                    <label>
                      <input type="radio" name="ns-13e" checked={actief.dertiendeType==="vast"} onChange={()=>patchActief({dertiendeType:"vast"})} />
                      <span className="dot" aria-hidden="true"></span>
                      <span className="txt"><strong>Vast bedrag</strong><span>Bijvoorbeeld €2.500 eindejaarsuitkering.</span></span>
                    </label>
                    <label>
                      <input type="radio" name="ns-13e" checked={actief.dertiendeType==="pctJaar"} onChange={()=>patchActief({dertiendeType:"pctJaar"})} />
                      <span className="dot" aria-hidden="true"></span>
                      <span className="txt"><strong>Percentage van het bruto jaarsalaris</strong><span>Bijvoorbeeld 8,33% (= 1 maand op 12).</span></span>
                    </label>
                    <label>
                      <input type="radio" name="ns-13e" checked={actief.dertiendeType==="pctMaand"} onChange={()=>patchActief({dertiendeType:"pctMaand"})} />
                      <span className="dot" aria-hidden="true"></span>
                      <span className="txt"><strong>Percentage van het bruto maandsalaris</strong><span>Bijvoorbeeld 100% = één extra maandsalaris.</span></span>
                    </label>
                  </div>
                  {actief.dertiendeType!=="geen" && (
                    <div style={{marginTop:14}}>
                      <div className="field">
                        <label className="lab" htmlFor="ns-13e-waarde">{actief.dertiendeType==="vast" ? "Bedrag" : "Percentage"}</label>
                        {actief.dertiendeType==="vast"
                          ? <Euro id="ns-13e-waarde" value={actief.dertiendeWaarde} onChange={(v)=>patchActief({dertiendeWaarde:v})} />
                          : <Pct id="ns-13e-waarde" ariaLabel="Percentage voor de 13e maand" value={actief.dertiendeWaarde} onChange={(v)=>patchActief({dertiendeWaarde:v})} />}
                        <span className="hint">Wordt belast tegen het bijzonder tarief — zie het resultaat voor de precieze uitleg.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>)}

            {stap===3 && (<>
              <h3>{titelStap3} <span className="step-optional">Optioneel</span></h3>
              <p className="psub">Loonstrook niet exact uit het hoofd? Sla dit gerust over.</p>
              <div className="stack" style={{marginTop:16}}>
                <div>
                  <span className="rg-label">
                    Pensioenpremie
                    <InfoTip label="Wat is pensioenpremie?">Het deel van de pensioenopbouw dat je zelf betaalt. Verschilt sterk per werkgever en pensioenfonds — er is geen standaardpercentage.</InfoTip>
                  </span>
                  <div className="bigchoice" role="radiogroup" aria-label="Pensioenpremie">
                    <label>
                      <input type="radio" name="ns-pens" checked={actief.pensioenType==="geen"} onChange={()=>patchActief({pensioenType:"geen"})} />
                      <span className="dot" aria-hidden="true"></span>
                      <span className="txt"><strong>Geen inhouding / onbekend</strong><span>Er wordt dan zonder pensioenpremie gerekend. Houdt de werkgever wel premie in, dan valt het echte netto lager uit.</span></span>
                    </label>
                    <label>
                      <input type="radio" name="ns-pens" checked={actief.pensioenType==="werkgever"} onChange={()=>patchActief({pensioenType:"werkgever"})} />
                      <span className="dot" aria-hidden="true"></span>
                      <span className="txt"><strong>Er wordt pensioenpremie betaald</strong><span>Vul de eigen (werknemers)premie in.</span></span>
                    </label>
                  </div>
                  {actief.pensioenType==="werkgever" && (
                    <div className="stack" style={{marginTop:14, gap:14}}>
                      <RadioPills legend="Hoe wil je 'm invullen?" name="ns-premietype" options={["percentage","bedrag"]} value={actief.premieType} onChange={(v)=>patchActief({premieType:v})} />
                      {actief.premieType==="percentage" ? (
                        <div className="field">
                          <label className="lab" htmlFor="ns-premiepct">Werknemerspremie</label>
                          <Pct id="ns-premiepct" ariaLabel="Pensioenpremie in procenten van het bruto salaris" value={actief.premieWaarde} onChange={(v)=>patchActief({premieWaarde:v})} />
                          <span className="hint">Percentage van het bruto maandsalaris (excl. vakantiegeld). Staat op de loonstrook of het pensioenoverzicht.</span>
                        </div>
                      ) : (
                        <div className="field">
                          <label className="lab" htmlFor="ns-premiebedrag">Werknemerspremie per maand</label>
                          <Euro id="ns-premiebedrag" value={actief.premieWaarde} onChange={(v)=>patchActief({premieWaarde:v})} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="field">
                  <label className="lab" htmlFor="ns-overig">Overige inhoudingen per maand <span style={{fontWeight:400,color:"var(--ink-3)"}}>(optioneel)</span></label>
                  <Euro id="ns-overig" value={actief.overigeInhoudingen} onChange={(v)=>patchActief({overigeInhoudingen:v})} />
                  <span className="hint">Vul hier een vaste inhouding op de loonstrook in. Denk niet aan de pensioenpremie als die hierboven al is ingevuld. <strong>Niet</strong> voor bijtelling van een leaseauto — die telt fiscaal anders mee; daarvoor komt een aparte &ldquo;Auto van de zaak&rdquo;-calculator.</span>
                </div>
              </div>
            </>)}

            <div className="step-nav">
              <button type="button" className="btn-text" onClick={terug}><ArrowLeft size={16} aria-hidden="true"/> Terug</button>
              <button type="button" className="btn btn-primary" onClick={volgende}>
                {stap<3 ? <>Verder <ArrowRight size={17} aria-hidden="true"/></> : <>{(fase==="jij" && modus==="samen") ? <>Verder naar partner <ArrowRight size={17} aria-hidden="true"/></> : <>Bekijk resultaat <ArrowRight size={17} aria-hidden="true"/></>}</>}
              </button>
            </div>
          </div>
        </>)}

        {fase==="resultaat" && modus==="solo" && (()=>{
          // --- Alleen-ik: exact de bestaande resultaatweergave, ongewijzigd. ---
          const result = resultJij;
          const geblokkeerdDoorAow = !result.berekenbaar && result.reason==="aow";
          const heeftInvoer = jij.brutoBedrag>0;
          const vakantiegeldPct = jij.vakantiegeldPct;
          return (<>
            <button type="button" className="btn-text" onClick={terug} style={{marginBottom:4}}>
              <Pencil size={15} aria-hidden="true"/> Gegevens aanpassen
            </button>

            {geblokkeerdDoorAow && (
              <div className="banner" role="note">
                <Info size={18} aria-hidden="true"/>
                <p><strong>Deze calculator rekent met de tarieven voor mensen die nog geen AOW ontvangen.</strong> Op basis van dit geboortejaar ({jij.geboortejaar}) is de AOW-leeftijd ({result.aow.jaren} jaar{result.aow.maanden?` en ${result.aow.maanden} maanden`:""}) al bereikt. Voor AOW-gerechtigden gelden andere premies (geen AOW-premie, wel ouderenkorting) — die zijn hier niet meegenomen om geen onjuist bedrag te tonen.</p>
              </div>
            )}

            {heeftInvoer && result.berekenbaar && (<>
              <section className="hero" aria-label="Netto salaris">
                <div className="row">
                  <div>
                    <p className="label">Dit houd je netto over — per maand</p>
                    <p className="big">{eur(result.nettoPerMaand)}</p>
                  </div>
                  <div className="side">
                    <div className="k">Netto per jaar</div>
                    <div className="v num">{eur(result.nettoPerJaar)}</div>
                    <div className="k" style={{marginTop:4}}>{Math.round(result.nettoBrutoPercentage*100)}% van je bruto</div>
                  </div>
                </div>
                <p className="note">Van {eur(result.brutoPerMaand)} bruto per maand houd je ongeveer <strong>{eur(result.nettoPerMaand)}</strong> netto over. Dit is je <strong>structurele</strong> maandbedrag — vakantiegeld en een eventuele 13e maand komen hier los bovenop, zie hieronder.</p>
              </section>

              <section className="scard" aria-label="Overzicht">
                <div className="head"><h3>Overzicht</h3></div>
                <SRow label="Bruto per maand (excl. vakantiegeld)" value={eur(result.brutoPerMaand)} />
                <SRow label="Bruto per jaar (incl. vakantiegeld)" value={eur(result.brutoPerJaar)} />
                <SRow label={`Vakantiegeld per jaar (${vakantiegeldPct}%)`} value={eur(result.vakantiegeldPerJaar)} />
                <div className="result-divider" />
                {result.pensioenPremiePerJaar>0 && <SRow label="− Pensioenpremie" value={eur(result.pensioenPremiePerJaar)} tone="cost" />}
                <SRow label="− Loonheffing" value={eur(result.loonheffingPerJaar)} tone="cost" />
                {result.overigeInhoudingenPerJaar>0 && <SRow label="− Overige inhoudingen" value={eur(result.overigeInhoudingenPerJaar)} tone="cost" />}
                <SRow label="= Netto per jaar" value={eur(result.nettoPerJaar)} tone="good" total />
                <SRow label="Netto per maand" value={eur(result.nettoPerMaand)} tone="good" />

                <div style={{display:"flex",height:12,borderRadius:999,overflow:"hidden",background:"var(--surface-2)",marginTop:16}}>
                  <span style={{width:`${(result.loonheffingPerJaar/result.brutoPerJaar)*100}%`,background:"var(--cost)"}} />
                  {result.pensioenPremiePerJaar>0 && <span style={{width:`${(result.pensioenPremiePerJaar/result.brutoPerJaar)*100}%`,background:"var(--ink-3)"}} />}
                  {result.overigeInhoudingenPerJaar>0 && <span style={{width:`${(result.overigeInhoudingenPerJaar/result.brutoPerJaar)*100}%`,background:"var(--sponsored)"}} />}
                  <span style={{width:`${(result.nettoPerJaar/result.brutoPerJaar)*100}%`,background:"var(--good)"}} />
                </div>
                <div className="chartlegend" style={{marginTop:12}}>
                  <span><i style={{background:"var(--cost)"}}/>Loonheffing: {eur(result.loonheffingPerJaar)}/jr</span>
                  {result.pensioenPremiePerJaar>0 && <span><i style={{background:"var(--ink-3)"}}/>Pensioenpremie: {eur(result.pensioenPremiePerJaar)}/jr</span>}
                  {result.overigeInhoudingenPerJaar>0 && <span><i style={{background:"var(--sponsored)"}}/>Overig: {eur(result.overigeInhoudingenPerJaar)}/jr</span>}
                  <span><i style={{background:"var(--good)"}}/>Netto: {eur(result.nettoPerJaar)}/jr</span>
                </div>

                <div className="result-divider" />
                <SRow label="Waarvan netto vakantiegeld (indicatief)" value={eur(result.nettoVakantiegeldIndicatief)} />
                <SRow label="Effectief belastingpercentage" value={`${Math.round((1-result.nettoBrutoPercentage)*100)}%`} />
                {!result.pensioenOpgegeven && (
                  <p className="meta" style={{marginTop:12}}>Deze berekening bevat <strong>geen</strong> pensioenpremie. Houdt je werkgever wel premie in, dan is je echte nettoloon lager dan hierboven.</p>
                )}
              </section>

              {result.bruto13eMaand>0 && (
                <section className="scard" aria-label="13e maand">
                  <div className="head"><h3>13e maand / eindejaarsuitkering</h3></div>
                  <SRow label="Bruto jaarsalaris" value={eur(result.brutoPerJaar)} />
                  <SRow label="13e maand" value={eur(result.bruto13eMaand)} />
                  <SRow label="Totaal bruto" value={eur(result.totaalBrutoJaar)} tone="good" total />
                  <div className="result-divider" />
                  <SRow label="Netto regulier salaris per maand" value={eur(result.nettoPerMaand)} />
                  <SRow label={`Netto 13e maand (bijzonder tarief ${(result.bijzonderTariefPct*100).toFixed(1)}%)`} value={eur(result.netto13eMaand)} />
                  <SRow label="Netto per jaar (incl. 13e maand)" value={eur(result.totaalNettoJaar)} tone="good" total />
                  <p className="meta" style={{marginTop:12}}>Een 13e maand wordt fiscaal gezien als een <strong>bijzondere beloning</strong> en daarom belast tegen een ander tarief dan je reguliere salaris — vaak hoger, omdat het bovenop je jaarinkomen komt. Het percentage hierboven is een berekende benadering op basis van je jaarinkomen; de exacte inhouding hangt af van de loonadministratie van je werkgever en kan iets afwijken. Dit is een <strong>eenmalige</strong> uitbetaling, geen onderdeel van je normale maandelijkse nettoloon.</p>
                </section>
              )}

              {meerMinderWerken && (
                <section className="scard" aria-label="Verder berekenen">
                  <div className="head"><h3>Wil je weten wat er gebeurt als je minder of meer gaat werken?</h3></div>
                  <Link to={meerMinderWerken.slug} className="btn btn-primary" style={{marginTop:4}}>
                    Bereken meer/minder werken <ArrowRight size={17} aria-hidden="true"/>
                  </Link>
                </section>
              )}

              <p className="disc" style={{marginTop:0}}>Deze berekening is een indicatie. Je daadwerkelijke nettoloon kan afwijken door je persoonlijke situatie, pensioenregeling, werkgever en andere inhoudingen. Cijfers {cfg.jaar}, bron: {cfg.bron}.</p>
            </>)}
          </>);
        })()}

        {fase==="resultaat" && modus==="samen" && (<>
          <button type="button" className="btn-text" onClick={terug} style={{marginBottom:4}}>
            <Pencil size={15} aria-hidden="true"/> Gegevens aanpassen
          </button>

          {!jijOk && (
            <div className="banner" role="note">
              <Info size={18} aria-hidden="true"/>
              <p><strong>Voor jouw gegevens rekent deze calculator niet mee</strong> — op basis van het ingevulde geboortejaar wordt al AOW ontvangen, en daarvoor gelden andere premies.</p>
            </div>
          )}
          {modus==="samen" && !resultPartner.berekenbaar && resultPartner.reason==="aow" && (
            <div className="banner" role="note">
              <Info size={18} aria-hidden="true"/>
              <p><strong>Voor je partner rekent deze calculator niet mee</strong> — op basis van het ingevulde geboortejaar wordt al AOW ontvangen, en daarvoor gelden andere premies.</p>
            </div>
          )}

          {(jijOk || partnerOk) && (<>
            <section className="hero" aria-label="Gezamenlijk netto inkomen">
              <div className="row">
                <div>
                  <p className="label">Dit houdt jullie huishouden netto over — per maand</p>
                  <p className="big">{eur(gezamenlijkNettoPerMaand)}</p>
                </div>
                <div className="side">
                  <div className="k">Netto per jaar</div>
                  <div className="v num">{eur(gezamenlijkNettoPerJaar)}</div>
                  <div className="k" style={{marginTop:4}}>{Math.round(gezamenlijkPct*100)}% van jullie gezamenlijke bruto</div>
                </div>
              </div>
              <p className="note">Dit is het <strong>structurele</strong> gezamenlijke maandbedrag van {jijOk && partnerOk ? "jullie beiden" : "degene voor wie dit berekenbaar is"} — vakantiegeld en een eventuele 13e maand komen hier los bovenop.</p>
            </section>

            <div className="grid2col">
              <PersoonSamenvatting naam="Jij" result={resultJij} />
              <PersoonSamenvatting naam="Je partner" result={resultPartner} />
            </div>

            <section className="scard" aria-label="Overzicht huishouden">
              <div className="head"><h3>Overzicht huishouden</h3></div>
              <SRow label="Bruto per jaar (samen, incl. vakantiegeld)" value={eur(gezamenlijkBrutoPerJaar)} />
              <div className="result-divider" />
              {gezamenlijkPensioen>0 && <SRow label="− Pensioenpremie (samen)" value={eur(gezamenlijkPensioen)} tone="cost" />}
              <SRow label="− Loonheffing (samen)" value={eur(gezamenlijkLoonheffing)} tone="cost" />
              {gezamenlijkOverig>0 && <SRow label="− Overige inhoudingen (samen)" value={eur(gezamenlijkOverig)} tone="cost" />}
              <SRow label="= Netto per jaar (samen)" value={eur(gezamenlijkNettoPerJaar)} tone="good" total />
              <SRow label="Netto per maand (samen)" value={eur(gezamenlijkNettoPerMaand)} tone="good" />
              <SRow label="Effectief belastingpercentage (samen)" value={`${Math.round((1-gezamenlijkPct)*100)}%`} />
            </section>

            {(jijOk && resultJij.bruto13eMaand>0) && (
              <section className="scard" aria-label="13e maand — jij">
                <div className="head"><h3>13e maand — jij</h3></div>
                <SRow label="13e maand (bruto)" value={eur(resultJij.bruto13eMaand)} />
                <SRow label={`Netto 13e maand (bijzonder tarief ${(resultJij.bijzonderTariefPct*100).toFixed(1)}%)`} value={eur(resultJij.netto13eMaand)} tone="good" />
              </section>
            )}
            {(partnerOk && resultPartner.bruto13eMaand>0) && (
              <section className="scard" aria-label="13e maand — partner">
                <div className="head"><h3>13e maand — je partner</h3></div>
                <SRow label="13e maand (bruto)" value={eur(resultPartner.bruto13eMaand)} />
                <SRow label={`Netto 13e maand (bijzonder tarief ${(resultPartner.bijzonderTariefPct*100).toFixed(1)}%)`} value={eur(resultPartner.netto13eMaand)} tone="good" />
              </section>
            )}

            {meerMinderWerken && (
              <section className="scard" aria-label="Verder berekenen">
                <div className="head"><h3>Wil je weten wat er gebeurt als een van jullie minder of meer gaat werken?</h3></div>
                <Link to={meerMinderWerken.slug} className="btn btn-primary" style={{marginTop:4}}>
                  Bereken meer/minder werken <ArrowRight size={17} aria-hidden="true"/>
                </Link>
              </section>
            )}

            <p className="disc" style={{marginTop:0}}>Deze berekening is een indicatie voor jullie beiden afzonderlijk, daarna opgeteld. Belasting in box 1 wordt in Nederland individueel geheven — er is geen gezamenlijke belastingberekening toegepast. Jullie daadwerkelijke nettoloon kan afwijken door persoonlijke situatie, pensioenregeling, werkgever en andere inhoudingen. Cijfers {cfg.jaar}, bron: {cfg.bron}.</p>
          </>)}
        </>)}

      </div>
    </CalculatorLayout>
  );
}
