import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Info, Users } from "lucide-react";
import CalculatorLayout from "../components/CalculatorLayout.jsx";
import { Euro, NumField, Pct } from "../components/FormFields.jsx";
import { RadioPills } from "../components/ChoiceFields.jsx";
import { calculateHolidayPay } from "../calculations/holidayPay.js";
import { DEFAULT_TAX_YEAR, getTaxYear } from "../config/taxYears.js";
import { eur } from "../utils/format.js";

const STEP_LABELS = ["Salaris", "Vakantiegeld", "Partner"];

function persoonDefault(cfg) {
  return {
    brutoBedrag: 0,
    brutoPeriode: "maand",
    vakantiegeldPct: Math.round(cfg.vakantiegeldStandaard * 1000) / 10,
    loonheffingskorting: true,
    salarisWijziging: {
      enabled: false,
      maandenEerstePeriode: 6,
      salaris1: 0,
      salaris2: 0,
    },
  };
}

function bereken(data, cfg) {
  return calculateHolidayPay({
    brutoBedrag: data.brutoBedrag,
    brutoPeriode: data.brutoPeriode,
    vakantiegeldPct: data.vakantiegeldPct / 100,
    loonheffingskorting: data.loonheffingskorting,
    taxYear: cfg.jaar,
    salarisWijziging: data.salarisWijziging,
  });
}

function ResultRow({ label, value, total, tone }) {
  return (
    <div className={`holiday-row${total ? " total" : ""}`}>
      <span>{label}</span>
      <strong className={tone || ""}>{value}</strong>
    </div>
  );
}

function PersoonResultaat({ naam, result }) {
  if (!result.berekenbaar) return null;
  return (
    <section className="holiday-result-card">
      <div className="holiday-card-head">
        <h3>{naam}</h3>
      </div>
      <ResultRow label="Bruto vakantiegeld" value={eur(result.brutoVakantiegeld)} />
      <ResultRow label="Geschat netto vakantiegeld" value={eur(result.nettoVakantiegeldIndicatief)} tone="good" total />
      <ResultRow label="Netto van bruto vakantiegeld" value={`${Math.round(result.nettoPercentage * 100)}%`} />
    </section>
  );
}

export default function Vakantiegeld() {
  const cfg = getTaxYear(DEFAULT_TAX_YEAR);
  const [jij, setJij] = useState(() => persoonDefault(cfg));
  const [partner, setPartner] = useState(() => persoonDefault(cfg));
  const [partnerActief, setPartnerActief] = useState(false);
  const [stap, setStap] = useState(0);
  const [resultaat, setResultaat] = useState(false);
  const [error, setError] = useState("");

  const resultJij = bereken(jij, cfg);
  const resultPartner = partnerActief ? bereken(partner, cfg) : null;

  const patch = (setter) => (updates) => setter((current) => ({ ...current, ...updates }));
  const patchJij = patch(setJij);
  const patchPartner = patch(setPartner);
  const patchWijziging = (setter) => (updates) => setter((current) => ({
    ...current,
    salarisWijziging: { ...current.salarisWijziging, ...updates },
  }));

  const volgende = () => {
    setError("");
    if (stap === 0 && !(jij.brutoBedrag > 0 || (jij.salarisWijziging.enabled && jij.salarisWijziging.salaris1 > 0 && jij.salarisWijziging.salaris2 > 0))) {
      setError("Vul eerst je bruto salaris in.");
      return;
    }
    if (stap === 1) {
      if (partnerActief) {
        setStap(2);
        return;
      }
      setResultaat(true);
      return;
    }
    if (stap === 2) {
      if (!(partner.brutoBedrag > 0 || (partner.salarisWijziging.enabled && partner.salarisWijziging.salaris1 > 0 && partner.salarisWijziging.salaris2 > 0))) {
        setError("Vul eerst het bruto salaris van je partner in.");
        return;
      }
      setResultaat(true);
      return;
    }
    setStap((current) => Math.min(2, current + 1));
  };

  const terug = () => {
    setError("");
    if (resultaat) {
      setResultaat(false);
      setStap(partnerActief ? 2 : 1);
      return;
    }
    setStap((current) => Math.max(0, current - 1));
  };

  const persoonForm = (data, update, updateWijziging, naam, idPrefix) => (
    <>
      <div className="field">
        <label className="lab" htmlFor={`${idPrefix}-bruto`}>Bruto salaris</label>
        <Euro id={`${idPrefix}-bruto`} value={data.brutoBedrag} onChange={(v) => update({ brutoBedrag: v })} />
        <span className="hint">Vul je bruto salaris in exclusief vakantiegeld.</span>
      </div>

      <RadioPills
        legend="Periode"
        name={`${idPrefix}-periode`}
        options={["maand", "jaar"]}
        value={data.brutoPeriode}
        onChange={(v) => update({ brutoPeriode: v })}
      />

      <div className="holiday-option">
        <label className="holiday-toggle">
          <input
            type="checkbox"
            checked={data.salarisWijziging.enabled}
            onChange={(e) => updateWijziging({ enabled: e.target.checked })}
          />
          <span>
            <strong>Mijn salaris is in het afgelopen jaar veranderd</strong>
            <small>Dan berekenen we het vakantiegeld over beide salarisperiodes.</small>
          </span>
        </label>
      </div>

      {data.salarisWijziging.enabled && (
        <div className="holiday-change-box">
          <div className="holiday-change-grid">
            <div className="field">
              <label className="lab">Eerste salaris</label>
              <Euro id={`${idPrefix}-s1`} value={data.salarisWijziging.salaris1} onChange={(v) => updateWijziging({ salaris1: v })} />
            </div>
            <div className="field">
              <label className="lab">Aantal maanden</label>
              <NumField id={`${idPrefix}-m1`} className="control num" value={data.salarisWijziging.maandenEerstePeriode} onCommit={(v) => updateWijziging({ maandenEerstePeriode: Math.max(1, Math.min(11, v)) })} group placeholder="6" />
            </div>
          </div>
          <div className="field">
            <label className="lab">Daarna: bruto salaris per maand</label>
            <Euro id={`${idPrefix}-s2`} value={data.salarisWijziging.salaris2} onChange={(v) => updateWijziging({ salaris2: v })} />
          </div>
          <span className="hint">De overige maanden van het jaar worden automatisch aan de tweede periode toegerekend.</span>
        </div>
      )}
    </>
  );

  return (
    <CalculatorLayout
      title="Vakantiegeld berekenen"
      intro="Bereken hoeveel vakantiegeld je bruto en netto ontvangt."
      calculatorId="vakantiegeld"
    >
      {!resultaat ? (
        <div className="holiday-flow">
          <div className="step-progress-label">Stap {stap + 1} van 3 · <strong>{STEP_LABELS[stap]}</strong></div>
          <div className="step-progress" role="progressbar" aria-valuenow={stap + 1} aria-valuemin="1" aria-valuemax="3" aria-label="Voortgang">
            {STEP_LABELS.map((label, index) => <span key={label} className={`bar${index === stap ? " is-active" : index < stap ? " is-done" : ""}`} />)}
          </div>

          <div className="pcard holiday-card">
            {stap === 0 && (
              <>
                <h3>Wat verdien je?</h3>
                <p className="psub">We gebruiken je bruto salaris als basis voor de berekening.</p>
                <div className="stack holiday-stack">{persoonForm(jij, patchJij, patchWijziging(setJij), "je", "vak-jij")}</div>
              </>
            )}

            {stap === 1 && (
              <>
                <h3>Hoeveel vakantiegeld krijg je?</h3>
                <p className="psub">Het standaardpercentage is 8%. Je kunt hier je eigen percentage invullen.</p>
                <div className="stack holiday-stack">
                  <div className="field">
                    <label className="lab" htmlFor="vak-percentage">Vakantiegeldpercentage</label>
                    <Pct id="vak-percentage" ariaLabel="Vakantiegeldpercentage" value={jij.vakantiegeldPct} onChange={(v) => patchJij({ vakantiegeldPct: v })} />
                    <span className="hint">Het wettelijke minimum is meestal 8%. In je cao of arbeidsovereenkomst kan een hoger percentage staan.</span>
                  </div>

                  <div className="holiday-info">
                    <Info size={17} aria-hidden="true" />
                    <p>Vakantiegeld wordt berekend over het loon waarover je vakantiegeld opbouwt. Andere betalingen, zoals een eindejaarsuitkering, tellen niet automatisch mee.</p>
                  </div>

                  <div className="holiday-option">
                    <label className="holiday-toggle">
                      <input type="checkbox" checked={jij.loonheffingskorting} onChange={(e) => patchJij({ loonheffingskorting: e.target.checked })} />
                      <span><strong>Loonheffingskorting toepassen</strong><small>Meestal staat dit bij je werkgever op &ldquo;ja&rdquo;.</small></span>
                    </label>
                  </div>

                  <div className="holiday-payout">
                    <div>
                      <span className="rg-label">Wanneer krijg je je vakantiegeld?</span>
                      <span className="hint">Dit is informatief; je cao of arbeidsovereenkomst bepaalt de afspraak.</span>
                    </div>
                    <RadioPills legend="Uitbetaling" name="vak-uitbetaling" options={["mei", "juni", "anders"]} value={jij.uitbetaling || "mei"} onChange={(v) => patchJij({ uitbetaling: v })} />
                  </div>
                </div>
              </>
            )}

            {stap === 2 && (
              <>
                <h3>Ook het vakantiegeld van je partner?</h3>
                <p className="psub">Optioneel. Zo zie je straks het totale vakantiegeld van jullie samen.</p>
                <div className="holiday-option">
                  <label className="holiday-toggle">
                    <input type="checkbox" checked={partnerActief} onChange={(e) => setPartnerActief(e.target.checked)} />
                    <span><strong>Ja, bereken ook het vakantiegeld van mijn partner</strong><small>Je kunt de partnergegevens hieronder invullen.</small></span>
                  </label>
                </div>
                {partnerActief && <div className="stack holiday-stack">{persoonForm(partner, patchPartner, patchWijziging(setPartner), "je partner", "vak-partner")}</div>}
              </>
            )}

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="step-nav">
              {stap > 0 ? <button type="button" className="btn-text" onClick={terug}><ArrowLeft size={16} aria-hidden="true" /> Terug</button> : <span className="spacer" />}
              <button type="button" className="btn btn-primary" onClick={volgende}>
                {stap < 2 ? <>Verder <ArrowRight size={17} aria-hidden="true" /></> : <>Bekijk resultaat <ArrowRight size={17} aria-hidden="true" /></>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="holiday-result">
          <button type="button" className="btn-text" onClick={terug}><ArrowLeft size={16} aria-hidden="true" /> Gegevens aanpassen</button>

          {resultJij.berekenbaar && (
            <section className="holiday-hero" aria-label="Jouw vakantiegeld">
              <div>
                <span className="holiday-kicker">Jouw vakantiegeld</span>
                <strong>{eur(resultJij.brutoVakantiegeld)}</strong>
                <span>bruto per jaar</span>
              </div>
              <div className="holiday-hero-net">
                <span>Geschat netto</span>
                <strong>{eur(resultJij.nettoVakantiegeldIndicatief)}</strong>
              </div>
            </section>
          )}

          {resultJij.berekenbaar && (
            <section className="holiday-result-card">
              <div className="holiday-card-head"><h3>Overzicht</h3></div>
              <ResultRow label="Bruto salaris per maand" value={eur(resultJij.brutoPerMaand)} />
              <ResultRow label={`Vakantiegeldpercentage`} value={`${(resultJij.vakPct * 100).toFixed(2).replace(".00", "")} %`} />
              <ResultRow label="Bruto vakantiegeld" value={eur(resultJij.brutoVakantiegeld)} />
              <ResultRow label="Geschat netto vakantiegeld" value={eur(resultJij.nettoVakantiegeldIndicatief)} tone="good" total />
              <ResultRow label="Netto van bruto vakantiegeld" value={`${Math.round(resultJij.nettoPercentage * 100)}%`} />
              <ResultRow label="Uitbetaling" value={jij.uitbetaling === "juni" ? "Juni" : jij.uitbetaling === "anders" ? "Volgens afspraak" : "Mei"} />
            </section>
          )}

          {partnerActief && resultPartner?.berekenbaar && (
            <>
              <PersoonResultaat naam="Je partner" result={resultPartner} />
              <section className="holiday-total">
                <div>
                  <span>Vakantiegeld samen</span>
                  <strong>{eur(resultJij.brutoVakantiegeld + resultPartner.brutoVakantiegeld)}</strong>
                  <small>bruto per jaar</small>
                </div>
                <div>
                  <span>Geschat netto samen</span>
                  <strong>{eur(resultJij.nettoVakantiegeldIndicatief + resultPartner.nettoVakantiegeldIndicatief)}</strong>
                  <small>indicatief</small>
                </div>
              </section>
            </>
          )}

          <section className="holiday-explain">
            <h2>Wat houd je over?</h2>
            <p>Je vakantiegeld is bruto een percentage van het loon waarover je vakantiegeld opbouwt. Het netto bedrag is een schatting. De uiteindelijke inhouding kan verschillen door onder andere loonheffingskorting, je jaarinkomen, pensioen en andere inhoudingen.</p>
            <p>Vakantiegeld wordt meestal in mei of juni uitbetaald. Je werkgever moet het minimaal één keer per jaar uitbetalen; de exacte afspraak kan in je cao of arbeidsovereenkomst staan.</p>
          </section>

          <section className="holiday-content">
            <h2>Over vakantiegeld</h2>
            <h3>Wat is vakantiegeld?</h3>
            <p>Vakantiegeld is een jaarlijkse uitkering bovenop je gewone loon. Het wordt ook vakantiebijslag of vakantietoeslag genoemd.</p>
            <h3>Hoeveel vakantiegeld krijg je?</h3>
            <p>Het wettelijke minimum is meestal 8% van je brutojaarsalaris waarover vakantiegeld wordt opgebouwd. Je cao of arbeidsovereenkomst kan andere afspraken bevatten.</p>
            <h3>Wanneer krijg je vakantiegeld?</h3>
            <p>De meeste werknemers krijgen het vakantiegeld in mei of juni. Je werkgever betaalt het minimaal één keer per jaar.</p>
            <h3>Wordt vakantiegeld belast?</h3>
            <p>Ja. Vakantiegeld behoort tot je loon en er wordt loonheffing over ingehouden. De manier waarop je werkgever de loonheffing inhoudt kan verschillen van je gewone maandloon.</p>
          </section>

          <div className="holiday-disclaimer">
            <Info size={17} aria-hidden="true" />
            <p>Indicatieve berekening op basis van de {cfg.jaar}-regels. De daadwerkelijke uitkomst kan afwijken van je persoonlijke loonstrook. De Belastingdienst gebruikt voor bijzondere beloningen loonheffingstabellen en in bepaalde situaties kan een werkgever een herberekeningsmethode toepassen.</p>
          </div>

          <div className="holiday-related">
            <Users size={17} aria-hidden="true" />
            <span>Wil je je totale inkomen bekijken? Bekijk ook <a href="/netto-salaris">Netto salaris</a> of <a href="/meer-minder-werken">Meer/minder werken</a>.</span>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
