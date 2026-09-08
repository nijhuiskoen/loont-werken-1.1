/*
 * AOW (1e pijler) — 2026.
 *
 * BELANGRIJK: de AOW-leeftijd hangt af van je geboortedatum, niet van hoeveel
 * je werkt. AOW bouw je op door in Nederland te wonen/werken (2% per
 * verzekerd jaar tussen 15 jaar en je AOW-leeftijd), dus minder uren werken
 * verandert je AOW niet.
 *
 * Bronnen:
 * - Rijksoverheid, AOW-leeftijd: https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/algemene-ouderdomswet-aow/aow-leeftijd
 * - Rijksoverheid, hoogte AOW: https://www.rijksoverheid.nl/vraag-en-antwoord/algemene-ouderdomswet-aow/hoe-hoog-is-mijn-aow
 * - SVB, AOW-bedragen: https://www.svb.nl/nl/aow/bedragen-aow/aow-bedragen
 *
 * De AOW-leeftijd wordt door het kabinet steeds ca. 5 jaar vooruit vastgesteld
 * (gekoppeld aan de levensverwachting, art. 7a AOW). Voor geboortejaren ver in
 * de toekomst bestaat dus nog geen officieel vastgestelde leeftijd — dat
 * maken we in de UI expliciet zichtbaar in plaats van een getal te verzinnen.
 */

export const AOW_BEDRAGEN = {
  brutoJaarAlleenstaand: 19651,   // per 1-1-2026 — SVB
  brutoJaarGehuwdPP: 13465,       // per 1-1-2026, per persoon — SVB
  bron: "SVB", bronUrl: "https://www.svb.nl/nl/aow/bedragen-aow/aow-bedragen",
  geldigVanaf: "2026-01-01",
};

/*
 * Tabel: AOW-leeftijd per geboortejaar (jaargranulariteit — de exacte knik
 * ligt soms midden in een geboortejaar; zie svb.nl voor de precieze datum).
 * `vast: true`  = officieel bij wet vastgesteld.
 * `vast: false` = nog niet definitief; laatst bekende waarde als planningsaanname.
 */
const AOW_LEEFTIJD_TABEL = [
  { totGeboortejaar: 1959, jaren: 67, maanden: 0, vast: true },   // AOW in 2025/2026
  { totGeboortejaar: 1963, jaren: 67, maanden: 3, vast: true },   // AOW in 2028 t/m 2031
  { totGeboortejaar: Infinity, jaren: 67, maanden: 3, vast: false }, // nog niet vastgesteld
];

export function getAowLeeftijd(geboortejaar){
  const rij = AOW_LEEFTIJD_TABEL.find((r)=> geboortejaar <= r.totGeboortejaar) || AOW_LEEFTIJD_TABEL.at(-1);
  return {
    jaren: rij.jaren,
    maanden: rij.maanden,
    inJaren: rij.jaren + rij.maanden/12,
    vastgesteld: rij.vast,
    bron: "Rijksoverheid",
    bronUrl: "https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/algemene-ouderdomswet-aow/aow-leeftijd",
  };
}
