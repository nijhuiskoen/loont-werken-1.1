/**
 * Centrale registratie van redactionele SEO-landingspagina's.
 * Alleen pagina's met een eigen zoekintentie en nuttige aanvullende inhoud
 * horen hier thuis. Voeg niet automatisch voor ieder keyword een pagina toe.
 */
export const SEO_PAGES = [
  {
    slug: "/netto-salaris-4000-bruto",
    title: "€4.000 bruto naar netto: wat houd je over?",
    metaDescription: "Bereken wat €4.000 bruto per maand ongeveer netto oplevert. Bekijk de belangrijkste factoren en bereken daarna jouw persoonlijke nettosalaris.",
    type: "salary-example",
    category: "Werk & inkomen",
    calculator: "/netto-salaris",
    calculatorLabel: "Bereken jouw netto salaris",
    eyebrow: "Netto salaris",
    h1: "€4.000 bruto naar netto",
    intro: "Wat houd je over als je €4.000 bruto per maand verdient? Dat hangt onder andere af van loonheffingskorting, pensioen en je persoonlijke situatie.",
    sections: [
      {
        heading: "Van €4.000 bruto naar netto",
        paragraphs: [
          "Een bruto maandsalaris is niet hetzelfde als wat er op je bankrekening komt. Van je brutoloon kunnen onder meer loonheffing en een werknemersbijdrage voor pensioen worden ingehouden.",
          "Een voorbeeldberekening geeft je een goede indicatie, maar je eigen nettoloon kan hiervan afwijken. Gebruik daarom de calculator voor jouw persoonlijke situatie."
        ]
      },
      {
        heading: "Wat bepaalt je nettosalaris?",
        paragraphs: [
          "Belangrijke factoren zijn onder meer je loonheffingskorting, leeftijd, pensioenregeling en eventuele andere inhoudingen. Ook vakantiegeld en een 13e maand kunnen je totale jaarlijkse inkomen beïnvloeden."
        ]
      }
    ],
    faqs: [
      ["Is €4.000 bruto een goed salaris?", "Of €4.000 bruto een passend salaris is, hangt af van je beroep, uren, ervaring en persoonlijke situatie. Deze pagina richt zich op de vertaling van bruto naar netto."],
      ["Is het netto bedrag voor iedereen hetzelfde?", "Nee. Onder andere loonheffingskorting en pensioen kunnen ervoor zorgen dat twee mensen met hetzelfde brutoloon een verschillend nettoloon hebben."]
    ]
  },
  {
    slug: "/van-40-naar-32-uur",
    title: "Van 40 naar 32 uur werken: wat betekent dat voor je inkomen?",
    metaDescription: "Wat gebeurt er met je netto inkomen als je van 40 naar 32 uur gaat werken? Bekijk de financiële gevolgen en bereken jouw persoonlijke situatie.",
    type: "guide",
    category: "Werk & inkomen",
    calculator: "/meer-minder-werken",
    calculatorLabel: "Bereken wat 32 uur werken betekent",
    eyebrow: "Minder werken",
    h1: "Van 40 naar 32 uur werken",
    intro: "Een dag minder werken betekent meestal een lager bruto salaris, maar niet automatisch dat je nettoloon met precies 20% daalt. Belastingen, heffingskortingen en andere inkomensafhankelijke effecten spelen mee.",
    sections: [
      {
        heading: "Wat gebeurt er met je salaris?",
        paragraphs: [
          "Ga je van 40 naar 32 uur, dan werk je 80% van een fulltime werkweek. Je bruto salaris daalt daardoor in veel gevallen naar ongeveer 80% van het oude bedrag.",
          "Je netto inkomen daalt meestal minder sterk dan je bruto inkomen, omdat je over een lager inkomen ook minder belasting betaalt. De precieze uitkomst verschilt per persoon."
        ]
      },
      {
        heading: "Denk ook aan de gevolgen voor je gezin",
        paragraphs: [
          "Minder werken kan invloed hebben op kinderopvang, pensioenopbouw en het gezamenlijke huishoudinkomen. Daarom is het nuttig om niet alleen naar je salaris te kijken, maar naar het totale plaatje."
        ]
      }
    ],
    faqs: [
      ["Is 32 uur werken financieel voordeliger?", "Dat hangt af van je persoonlijke situatie. Minder werken verlaagt je inkomen, maar kan ook gevolgen hebben voor bijvoorbeeld kinderopvang en andere kosten."],
      ["Daalt mijn nettoloon met 20%?", "Niet noodzakelijk. Bij een lager brutoloon verandert ook de loonheffing. Daardoor is de procentuele daling van je nettoloon vaak anders dan de daling van je bruto salaris."]
    ]
  },
  {
    slug: "/kosten-kinderopvang",
    title: "Kinderopvangkosten berekenen: wat betaal je netto?",
    metaDescription: "Bereken wat kinderopvang netto per maand kost na kinderopvangtoeslag. Bekijk welke factoren je eigen bijdrage bepalen.",
    type: "guide",
    category: "Gezin & kinderen",
    calculator: "/kinderopvang",
    calculatorLabel: "Bereken jullie kinderopvangkosten",
    eyebrow: "Kinderopvang",
    h1: "Wat kost kinderopvang netto?",
    intro: "De rekening van de kinderopvang is niet hetzelfde als wat je uiteindelijk zelf betaalt. De kinderopvangtoeslag kan een deel van de kosten vergoeden.",
    sections: [
      {
        heading: "Waar hangen de netto kosten van af?",
        paragraphs: [
          "De netto kosten hangen onder andere af van het aantal opvanguren, het uurtarief, het aantal kinderen en het gezamenlijke toetsingsinkomen. Ook de opvangvorm en de regels voor kinderopvangtoeslag spelen een rol.",
          "Gebruik de calculator om jullie situatie in te vullen en het verschil tussen de bruto opvangkosten, toeslag en eigen bijdrage te bekijken."
        ]
      },
      {
        heading: "Waarom is jullie inkomen belangrijk?",
        paragraphs: [
          "De hoogte van de kinderopvangtoeslag is gekoppeld aan het toetsingsinkomen. Bij twee partners wordt het inkomen voor de toeslag in veel situaties gezamenlijk bekeken."
        ]
      }
    ],
    faqs: [
      ["Is kinderopvangtoeslag al van de rekening af?", "De toeslag verlaagt uiteindelijk wat je zelf draagt, maar hoe dit administratief wordt verwerkt kan verschillen. Kijk voor jullie persoonlijke situatie naar de berekening van bruto kosten, toeslag en eigen bijdrage."],
      ["Kan ik meerdere kinderen invullen?", "Ja. De kinderopvangcalculator van Ouders Financieel is bedoeld om meerdere kinderen en opvangvormen mee te nemen."]
    ]
  }
];

export const findSeoPage = (slug) => SEO_PAGES.find((page) => page.slug === slug);
