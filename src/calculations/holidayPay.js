import { calculateNetSalary } from "./netSalary.js";
import { DEFAULT_TAX_YEAR, getTaxYear } from "../config/taxYears.js";

/*
 * Vakantiegeldberekening.
 *
 * Het bruto vakantiegeld is een percentage van het loon waarover in het
 * gekozen jaar vakantiegeld wordt opgebouwd. Voor het netto bedrag gebruiken
 * we bewust de bestaande bruto-netto-engine: we vergelijken de geschatte
 * jaarlijkse netto-uitkomst met en zonder vakantiegeld. Zo blijft de
 * berekening consistent met de Netto salaris-calculator en hoeven we geen
 * tweede fiscale rekenlogica te onderhouden.
 *
 * De netto uitkomst is indicatief. Werkgevers kunnen voor vakantiegeld de
 * tabel voor bijzondere beloningen / een herberekeningsmethode toepassen;
 * de uiteindelijke loonstrook kan daarom afwijken.
 */
export function calculateHolidayPay(input = {}) {
  const {
    brutoBedrag,
    brutoPeriode = "maand",
    vakantiegeldPct = null,
    loonheffingskorting = true,
    taxYear = DEFAULT_TAX_YEAR,
    salarisWijziging = null,
  } = input;

  const cfg = getTaxYear(taxYear);
  const vakPct = vakantiegeldPct == null
    ? cfg.vakantiegeldStandaard
    : Math.max(0, Number(vakantiegeldPct) || 0);

  let brutoPerJaarExclVak = 0;
  let brutoPerMaand = 0;

  if (salarisWijziging?.enabled) {
    const maandenEerstePeriode = Math.max(0, Math.min(12, Math.round(Number(salarisWijziging.maandenEerstePeriode) || 0)));
    const salaris1 = Math.max(0, Number(salarisWijziging.salaris1) || 0);
    const salaris2 = Math.max(0, Number(salarisWijziging.salaris2) || 0);
    const maandenTweedePeriode = 12 - maandenEerstePeriode;
    brutoPerJaarExclVak = salaris1 * maandenEerstePeriode + salaris2 * maandenTweedePeriode;
    brutoPerMaand = brutoPerJaarExclVak / 12;
  } else {
    const bedrag = Math.max(0, Number(brutoBedrag) || 0);
    brutoPerMaand = brutoPeriode === "jaar" ? bedrag / 12 : bedrag;
    brutoPerJaarExclVak = brutoPerMaand * 12;
  }

  if (!(brutoPerJaarExclVak > 0)) {
    return {
      berekenbaar: false,
      reason: "geen-inkomen",
      taxYear: cfg.jaar,
      vakPct,
      brutoPerMaand,
      brutoPerJaarExclVak,
      brutoVakantiegeld: 0,
      nettoVakantiegeldIndicatief: 0,
    };
  }

  const brutoVakantiegeld = brutoPerJaarExclVak * vakPct;

  // Gebruik de bestaande netto-salarisberekening als fiscale basis. Het
  // verschil tussen netto mét en zonder vakantiegeld is onze indicatie van
  // wat van de vakantiegelduitkering netto overblijft.
  const basis = {
    brutoBedrag: brutoPerJaarExclVak,
    brutoPeriode: "jaar",
    loonheffingskorting,
    vakantiegeldPct: 0,
    taxYear: cfg.jaar,
  };
  const zonderVakantiegeld = calculateNetSalary(basis);
  const metVakantiegeld = calculateNetSalary({
    ...basis,
    vakantiegeldPct: vakPct,
  });

  if (!zonderVakantiegeld.berekenbaar || !metVakantiegeld.berekenbaar) {
    return {
      berekenbaar: false,
      reason: zonderVakantiegeld.reason || metVakantiegeld.reason || "niet-berekenbaar",
      taxYear: cfg.jaar,
      vakPct,
      brutoPerMaand,
      brutoPerJaarExclVak,
      brutoVakantiegeld,
      nettoVakantiegeldIndicatief: 0,
    };
  }

  const nettoVakantiegeldIndicatief = Math.max(
    0,
    metVakantiegeld.nettoPerJaar - zonderVakantiegeld.nettoPerJaar,
  );

  return {
    berekenbaar: true,
    taxYear: cfg.jaar,
    brutoPerMaand,
    brutoPerJaarExclVak,
    vakPct,
    brutoVakantiegeld,
    nettoVakantiegeldIndicatief,
    nettoPercentage: brutoVakantiegeld > 0
      ? nettoVakantiegeldIndicatief / brutoVakantiegeld
      : 0,
    zonderVakantiegeld,
    metVakantiegeld,
  };
}
