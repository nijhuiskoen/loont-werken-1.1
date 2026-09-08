/*
 * Belastingjaar-registry — voorbereid op meerdere jaren.
 *
 * Dupliceert bewust GEEN fiscale cijfers: die staan al gebrond in
 * src/data/2026/*.js. Dit bestand bundelt ze alleen per jaar, zodat een
 * calculator straks simpel `getTaxYear(2027)` kan aanroepen zodra dat jaar
 * is toegevoegd, zonder dat de rekenlogica hardcoded "2026" bevat.
 *
 * Nieuw jaar toevoegen: maak src/data/2027/*.js met de nieuwe officiële
 * cijfers, en voeg hieronder een entry `2027: {...}` toe.
 */
import { TAX } from "../data/2026/tax.js";
import { CIJFERS_JAAR, CIJFERS_BIJGEWERKT } from "../data/2026/meta.js";

export const TAX_YEARS = {
  2026: {
    jaar: 2026,
    tax: TAX,
    vakantiegeldStandaard: 0.08,   // wettelijk minimum, Wet minimumloon en minimumvakantiebijslag art. 15
    bron: "Belastingdienst",
    bronUrl: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/boxen_en_tarieven/box_1/",
    bijgewerkt: CIJFERS_BIJGEWERKT,
  },
};

export const DEFAULT_TAX_YEAR = CIJFERS_JAAR;
export const getTaxYear = (jaar)=> TAX_YEARS[jaar] || TAX_YEARS[DEFAULT_TAX_YEAR];
export const beschikbareJaren = ()=> Object.keys(TAX_YEARS).map(Number).sort();
