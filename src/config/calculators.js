/*
 * Centrale registratie van alle calculators.
 * De homepage en de router lezen hier uit; een nieuwe calculator toevoegen
 * betekent: een regel hier + een page in src/pages/.
 */

export const CATEGORIES = [
  { id: "werk", title: "Werk & inkomen", icon: "💼", intro: "Wat levert werken jullie netto op?" },
  { id: "gezin", title: "Gezin & kinderen", icon: "👶", intro: "De kosten en toeslagen rond kinderen." },
  { id: "wonen", title: "Wonen", icon: "🏠", intro: "Huren, kopen en je hypotheek." },
  { id: "later", title: "Later", icon: "👴", intro: "Wat je keuzes nu betekenen voor later." },
  { id: "vervoer", title: "Werk & vervoer", icon: "🚗", intro: "Reizen en de auto van de zaak." },
];

export const CALCULATORS = [
  {
    id: "meer-minder-werken",
    icon: "💼",
    title: "Deeltijd of voltijd na een kind?",
    slug: "/meer-minder-werken",
    category: "werk",
    description: "Wat levert meer of minder werken netto op?",
    available: true,
    module: "MeerMinderWerken",
    order: 1,
    featured: true,
    seoTitle: "Meer of minder werken berekenen",
    seoDescription: "Bereken wat meer of minder werken betekent voor je bruto en netto inkomen.",
  },
  {
    id: "netto-salaris",
    icon: "💰",
    title: "Netto salaris",
    slug: "/netto-salaris",
    category: "werk",
    description: "Bruto → netto, incl. vakantiegeld en pensioen",
    available: true,
    module: "NettoSalaris",
    order: 5,
    featured: true,
    seoTitle: "Netto salaris berekenen",
    seoDescription: "Bereken wat je van je bruto salaris netto overhoudt, inclusief vakantiegeld, pensioen en 13e maand.",
  },
  {
    id: "vakantiegeld",
    icon: "💸",
    title: "Vakantiegeld",
    slug: "/vakantiegeld",
    category: "werk",
    description: "Hoeveel krijg ik netto?",
    available: true,
    module: "Vakantiegeld",
    order: 3,
    featured: true,
    seoTitle: "Vakantiegeld berekenen 2026 | Bruto en netto",
    seoDescription: "Bereken hoeveel vakantiegeld je in 2026 bruto en netto krijgt. Vul je salaris en vakantiegeldpercentage in en ontdek wat je ongeveer overhoudt.",
  },
  {
    id: "ouderschapsverlof",
    icon: "👶",
    title: "Ouderschapsverlof",
    slug: "/ouderschapsverlof",
    category: "werk",
    description: "Wat kost 1 dag ouderschapsverlof per week?",
    available: false,
    module: "Ouderschapsverlof",
    order: 4,
  },
  {
    id: "kinderopvang",
    icon: "👶",
    title: "Kinderopvangkosten",
    slug: "/kinderopvang",
    category: "gezin",
    description: "Wat kost opvang netto per maand?",
    available: true,
    module: "Kinderopvang",
    order: 2,
    seoTitle: "Kinderopvangkosten berekenen",
    seoDescription: "Bereken wat kinderopvang jullie netto kost na kinderopvangtoeslag.",
  },
  {
    id: "gezinsbudget",
    icon: "👨‍👩‍👧",
    title: "Gezinsbudget",
    slug: "/gezinsbudget",
    category: "gezin",
    description: "Wat houden we maandelijks over met kinderen?",
    available: false,
    module: "Gezinsbudget",
    order: 8,
  },
  {
    id: "baby-eerste-jaar",
    icon: "🍼",
    title: "Baby eerste jaar kosten",
    slug: "/baby-eerste-jaar",
    category: "gezin",
    description: "Wat kost een baby écht?",
    available: false,
    module: "BabyEersteJaar",
    order: 9,
  },
  {
    id: "hypotheek-na-kind",
    icon: "🏠",
    title: "Maximale hypotheek na kind",
    slug: "/hypotheek-na-kind",
    category: "wonen",
    description: "Wat kun je lenen als je minder gaat werken?",
    available: false,
    module: "HypotheekNaKind",
    order: 3,
  },
  {
    id: "hypotheek-maandlasten",
    icon: "🏠",
    title: "Hypotheek maandlasten",
    slug: "/hypotheek-maandlasten",
    category: "wonen",
    description: "Wat wordt mijn maandlast bij verschillende rentes?",
    available: false,
    module: "HypotheekMaandlasten",
    order: 6,
  },
  {
    id: "koop-vs-huur",
    icon: "🏠",
    title: "Koop vs huur",
    slug: "/koop-vs-huur",
    category: "wonen",
    description: "Wat is financieel gunstiger?",
    available: false,
    module: "KoopVsHuur",
    order: 12,
  },
  {
    id: "pensioen-minder-werken",
    icon: "👴",
    title: "Pensioen minder werken",
    slug: "/pensioen-minder-werken",
    category: "later",
    description: "Wat doet 1 dag minder werken met pensioen?",
    available: false,
    module: "PensioenMinderWerken",
    order: 11,
  },
  {
    id: "auto-van-de-zaak",
    icon: "🚗",
    title: "Auto van de zaak",
    slug: "/auto-van-de-zaak",
    category: "vervoer",
    description: "Wat kost een leaseauto netto?",
    available: false,
    module: "AutoVanDeZaak",
    order: 7,
  },
];

export const byCategory = (categoryId) =>
  CALCULATORS.filter((c) => c.category === categoryId);

export const findBySlug = (slug) =>
  CALCULATORS.find((c) => c.slug === slug);

/* Volgorde zoals op de overzichtspagina. */
export const orderedCalculators = () =>
  [...CALCULATORS].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

/* De uitgelichte calculators (bovenaan het overzicht, in kolommen).
   Alleen calculators die daadwerkelijk werken kunnen uitgelicht worden —
   een "Binnenkort"-tegel is nooit "meest gebruikt". Maximaal 4, zodat het
   raster nooit voller wordt dan de layout aankan.
   LET OP: dit is een handmatige redactionele keuze (het vlaggetje
   `featured` hieronder), geen gemeten gebruiksstatistiek — de app heeft
   geen backend/analytics, dus er is nergens een teller die bijhoudt wat
   bezoekers echt het meest gebruiken. */
export const featuredCalculators = () =>
  orderedCalculators().filter((c) => c.featured && c.available).slice(0, 4);

/* Backward compatible: de eerste uitgelichte calculator, of null. */
export const featuredCalculator = () => featuredCalculators()[0] || null;

/* Alle overige, in volgorde. */
export const otherCalculators = () =>
  orderedCalculators().filter((c) => !(c.featured && c.available));
