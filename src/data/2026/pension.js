/*
 * Pensioenparameters 2026 — 2e pijler (werkgeverspensioen).
 *
 * Dit bestand maakt bewust onderscheid tussen twee soorten getallen:
 *
 * 1. OFFICIËLE FISCALE PARAMETERS — vastgesteld door de overheid, gelden voor
 *    iedereen. Elke waarde heeft een bron.
 * 2. MODELAANNAMES — omdat elke pensioenregeling anders is (fonds,
 *    verzekeraar, cao), gebruiken we hiervoor standaardwaarden als de
 *    gebruiker zijn eigen regeling niet kent. Deze zijn NIET van de overheid
 *    en worden in de UI altijd als "aanname" gelabeld, nooit als feit.
 *
 * Belangrijke context: Nederland zit door de Wet toekomst pensioenen in een
 * overgang naar een nieuw pensioenstelsel; uiterlijk 1 januari 2028 moeten
 * alle regelingen zijn omgezet. Er bestaat daardoor geen universele
 * pensioenformule. Zie: https://www.rijksoverheid.nl/themas/werk/pensioen/overgang-naar-nieuwe-pensioenstelsel
 * en https://www.pensioenduidelijkheid.nl/
 */

/* ---------- 1. Officiële fiscale parameters (Belastingdienst) ---------- */
export const PENSION_FISCAAL = {
  maxPensioengevendLoon: {
    value: 137800,
    bron: "Belastingdienst / SZW", geldigVanaf: "2026-01-01",
    bronUrl: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/boxen_en_tarieven/box_1/",
  },
  standaardFranchise: {
    value: 19172,   // 100/75 AOW-franchise, meest gebruikte franchise in cao's
    bron: "Belastingdienst (Centraal Aanspreekpunt Pensioenen)", geldigVanaf: "2026-01-01",
  },
  maxOpbouwMiddelloon: {
    value: 0.01875,  // fiscaal max. opbouwpercentage middelloon (overgangsrecht t/m 2028)
    bron: "Belastingdienst — Wet toekomst pensioenen (overgangsrecht)",
  },
  maxPremiePct: {
    value: 0.30,     // fiscaal max. leeftijdsonafhankelijke premie (nieuw stelsel)
    bron: "Belastingdienst — Wet toekomst pensioenen",
  },
};

/* Vlakke, backward-compatible export voor code die alleen de getallen nodig heeft. */
export const PENSION_CONFIG = {
  maxPensioengevendLoon: PENSION_FISCAAL.maxPensioengevendLoon.value,
  standaardFranchise: PENSION_FISCAAL.standaardFranchise.value,
  maxOpbouwMiddelloon: PENSION_FISCAAL.maxOpbouwMiddelloon.value,
  maxPremiePct: PENSION_FISCAAL.maxPremiePct.value,
};

/* ---------- 2. Modelaannames (GEEN officiële cijfers — expliciet labelen in UI) ---------- */
export const PENSION_MODEL_AANNAMES = {
  // Standaard werkgevers/werknemersverdeling van de premie, ALLEEN gebruikt
  // als de gebruiker zijn eigen verdeling niet weet. Verschilt enorm per cao.
  standaardWerkgeversAandeel: 0.667,   // ≈ 2/3 werkgever, 1/3 werknemer — gangbaar gemiddelde, geen wet
  // Rendement en horizon voor de indicatieve pensioenpot-projectie (premieregeling).
  // GEEN gegarandeerd rendement — puur een modelmatige aanname.
  nominaalRendement: 0.04,     // 4% per jaar nominaal, vóór aftrek kosten
  inflatieaanname: 0.02,       // 2% per jaar, voor koopkrachtweergave
  // Voor het omzetten van een pensioenpot naar een geschat maandinkomen:
  // een vaste annuïteit vanaf de pensioenleeftijd tot een aannameleeftijd.
  // Verzekeraars gebruiken hiervoor sterftetafels; dat repliceren we niet —
  // dit is een grove, transparante benadering, geen offerte.
  uitkeringsjarenAanname: 20,  // bijv. pensioenleeftijd tot ~87 jaar
};
