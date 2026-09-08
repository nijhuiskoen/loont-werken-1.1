/*
 * Jaarruimte 2026 (fiscale ruimte voor vrijwillige aanvullende pensioenopbouw
 * / lijfrente — 3e pijler).
 *
 * Officiële formule 2026: jaarruimte = 30% × premiegrondslag − 6,27 × Factor A
 * premiegrondslag = min(relevant inkomen vorig jaar, inkomensplafond) − AOW-franchise
 *
 * Bron: Belastingdienst, "Uitgaven voor inkomensvoorzieningen":
 * https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2026/uitgaven_voor_inkomensvoorzieningen
 * (bevestigd door meerdere financiële bronnen met dezelfde 2026-cijfers).
 *
 * BELANGRIJK: de jaarruimte van 2026 wordt berekend over het inkomen én de
 * pensioenopbouw (Factor A) van 2025 — niet van het huidige jaar. Factor A
 * staat op het Uniform Pensioenoverzicht (UPO). Zonder Factor A (bijvoorbeeld
 * zelfstandigen zonder werkgeverspensioen) is Factor A nul.
 */
export const JAARRUIMTE_CONFIG = {
  premiePercentage: 0.30,            // 30% van de premiegrondslag
  factorAVermenigvuldiger: 6.27,     // aftrek voor bestaande pensioenopbouw
  maxJaarruimte: 35589,              // 2026
  reserveringsruimteGrens: 42753,    // 2026 — ongebruikte jaarruimte laatste 10 jaar
  bron: "Belastingdienst",
  bronUrl: "https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2026/uitgaven_voor_inkomensvoorzieningen",
  hulpmiddelUrl: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/aftrekposten/lijfrentepremie",
};
