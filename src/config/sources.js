/*
 * Bronnen die calculators kunnen tonen.
 * Alleen de bronnen die in de bestaande calculator al gebruikt werden —
 * hier is geen nieuwe fiscale informatie toegevoegd.
 */

export const SOURCES = {
  belastingdienst: {
    label: "Belastingdienst",
    note: "Belastingschijven, heffingskortingen en arbeidskortingstabel",
    url: "https://www.belastingdienst.nl",
  },
  belastingdienstCAP: {
    label: "Belastingdienst — Centraal Aanspreekpunt Pensioenen",
    note: "Fiscale pensioenkaders en AOW-franchise",
    url: "https://www.belastingdienst.nl",
  },
  toeslagen: {
    label: "Toeslagen (Belastingdienst)",
    note: "Kinderopvangtoeslag: percentages en maximum uurtarieven",
    url: "https://www.toeslagen.nl",
  },
  rijksoverheid: {
    label: "Rijksoverheid",
    note: "AOW-leeftijd en pensioenstelsel",
    url: "https://www.rijksoverheid.nl/onderwerpen/pensioen",
  },
  rijksoverheidVakantiegeld: {
    label: "Rijksoverheid — vakantiegeld",
    note: "Hoogte en uitbetaling van vakantiegeld",
    url: "https://www.rijksoverheid.nl/vraag-en-antwoord/vakantiedagen-en-vakantiegeld/hoe-hoog-is-mijn-vakantiegeld",
  },
  svb: {
    label: "SVB",
    note: "AOW-bedragen",
    url: "https://www.svb.nl/nl/aow/bedragen-aow/aow-bedragen",
  },
  vng: {
    label: "VNG",
    note: "Adviestabel ouderbijdrage gesubsidieerde peuteropvang",
    url: "https://vng.nl",
  },
  mijnpensioenoverzicht: {
    label: "Mijnpensioenoverzicht.nl",
    note: "Je persoonlijke pensioengegevens",
    url: "https://www.mijnpensioenoverzicht.nl/",
  },
};

/* Welke bronnen horen bij welke calculator. */
export const SOURCES_BY_CALCULATOR = {
  "meer-minder-werken": [
    "belastingdienst",
    "toeslagen",
    "vng",
    "belastingdienstCAP",
    "rijksoverheid",
    "svb",
    "mijnpensioenoverzicht",
  ],
  "netto-salaris": [
    "belastingdienst",
    "rijksoverheid",
  ],
  "vakantiegeld": [
    "rijksoverheidVakantiegeld",
    "belastingdienst",
  ],
  "kinderopvang": [
    "toeslagen",
    "belastingdienst",
    "rijksoverheid",
    "vng",
  ],
};

export const sourcesFor = (calculatorId) =>
  (SOURCES_BY_CALCULATOR[calculatorId] || []).map((k) => SOURCES[k]).filter(Boolean);
