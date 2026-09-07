export const calculators = [
  {
    id: "meer-minder-werken",
    title: "Meer/minder werken",
    description: "Wat levert meer of minder werken netto op?",
    icon: "💼",
    category: "Werk & inkomen",
    path: "/meer-minder-werken",
    available: true,
  },
  { id: "netto-salaris", title: "Netto salaris calculator", description: "Van bruto naar netto, inclusief vakantiegeld en pensioen.", icon: "💰", category: "Werk & inkomen", path: "/netto-salaris", available: false },
  { id: "vakantiegeld", title: "Vakantiegeld calculator", description: "Hoeveel vakantiegeld krijg ik netto?", icon: "💶", category: "Werk & inkomen", path: "/vakantiegeld", available: false },
  { id: "ouderschapsverlof", title: "Ouderschapsverlof calculator", description: "Wat kost één dag ouderschapsverlof per week?", icon: "👶", category: "Werk & inkomen", path: "/ouderschapsverlof", available: false },
  { id: "kinderopvang", title: "Kinderopvangkosten calculator", description: "Wat kost opvang netto per maand?", icon: "👶", category: "Gezin & kinderen", path: "/kinderopvang", available: false },
  { id: "gezinsbudget", title: "Gezinsbudget calculator", description: "Wat houden we maandelijks over met kinderen?", icon: "👨‍👩‍👧‍👦", category: "Gezin & kinderen", path: "/gezinsbudget", available: false },
  { id: "baby-eerste-jaar", title: "Baby eerste jaar kosten", description: "Wat kost een baby echt?", icon: "🍼", category: "Gezin & kinderen", path: "/baby-eerste-jaar", available: false },
  { id: "hypotheek-na-kind", title: "Maximale hypotheek na kind", description: "Wat kun je lenen als je minder gaat werken?", icon: "🏠", category: "Wonen", path: "/hypotheek-na-kind", available: false },
  { id: "hypotheek-maandlasten", title: "Hypotheek maandlasten", description: "Wat wordt mijn maandlast bij verschillende rentes?", icon: "🏠", category: "Wonen", path: "/hypotheek-maandlasten", available: false },
  { id: "koop-vs-huur", title: "Koop vs huur", description: "Wat is financieel gunstiger?", icon: "🏠", category: "Wonen", path: "/koop-vs-huur", available: false },
  { id: "pensioen-minder-werken", title: "Pensioen minder werken", description: "Wat doet één dag minder werken met pensioen?", icon: "👴", category: "Later", path: "/pensioen-minder-werken", available: false },
  { id: "auto-van-de-zaak", title: "Auto van de zaak", description: "Wat kost een leaseauto netto?", icon: "🚗", category: "Werk & vervoer", path: "/auto-van-de-zaak", available: false },
];

export const categories = ["Werk & inkomen", "Gezin & kinderen", "Wonen", "Later", "Werk & vervoer"];
