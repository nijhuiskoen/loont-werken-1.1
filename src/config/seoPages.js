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
      { heading: "Van €4.000 bruto naar netto", paragraphs: [
        "Een bruto maandsalaris is niet hetzelfde als wat er op je bankrekening komt. Van je brutoloon kunnen onder meer loonheffing en een werknemersbijdrage voor pensioen worden ingehouden.",
        "Een voorbeeldberekening geeft je een goede indicatie, maar je eigen nettoloon kan hiervan afwijken. Gebruik daarom de calculator voor jouw persoonlijke situatie."
      ]},
      { heading: "Wat bepaalt je nettosalaris?", paragraphs: [
        "Belangrijke factoren zijn onder meer je loonheffingskorting, leeftijd, pensioenregeling en eventuele andere inhoudingen. Ook vakantiegeld en een 13e maand kunnen je totale jaarlijkse inkomen beïnvloeden."
      ]},
      { heading: "€4.000 bruto in een gezin", paragraphs: [
        "Voor gezinnen is niet alleen je eigen nettoloon belangrijk. Het gezamenlijke inkomen, de verdeling van werkuren en kosten zoals kinderopvang kunnen bepalen hoeveel geld jullie uiteindelijk overhouden.",
        "Wil je weten wat er in jouw situatie op je rekening komt? Vul je eigen salaris en omstandigheden in bij de netto salaris calculator."
      ]}
    ],
    faqs: [
      ["Is €4.000 bruto een goed salaris?", "Of €4.000 bruto een passend salaris is, hangt af van je beroep, uren, ervaring en persoonlijke situatie. Deze pagina richt zich op de vertaling van bruto naar netto."],
      ["Is het netto bedrag voor iedereen hetzelfde?", "Nee. Onder andere loonheffingskorting en pensioen kunnen ervoor zorgen dat twee mensen met hetzelfde brutoloon een verschillend nettoloon hebben."],
      ["Heeft een 13e maand invloed op mijn netto inkomen?", "Ja. Een 13e maand is extra loon en kan daardoor invloed hebben op je totale jaarlijkse inkomen en de inhouding van loonheffing. De precieze verwerking hangt af van je loonadministratie."]
    ],
    relatedPages: ["/bruto-naar-netto", "/netto-salaris-3000-bruto"],
    sources: [
      { label: "Belastingdienst", url: "https://www.belastingdienst.nl", note: "Informatie over loonheffing en heffingskortingen." }
    ]
  },
  {
    slug: "/bruto-naar-netto",
    title: "Bruto naar netto berekenen 2026",
    metaDescription: "Van bruto naar netto: ontdek welke factoren bepalen wat je van je salaris overhoudt en bereken jouw persoonlijke nettosalaris voor 2026.",
    type: "guide",
    category: "Werk & inkomen",
    calculator: "/netto-salaris",
    calculatorLabel: "Bereken bruto naar netto",
    eyebrow: "Bruto naar netto",
    h1: "Bruto naar netto berekenen",
    intro: "Van een brutoloon gaat niet één vast percentage af. Je nettosalaris wordt onder andere beïnvloed door belasting, heffingskortingen, pensioen en andere inhoudingen.",
    sections: [
      { heading: "Wat is het verschil tussen bruto en netto?", paragraphs: [
        "Bruto is het loon dat met je werkgever is afgesproken voordat belastingen en andere inhoudingen worden verwerkt. Netto is het bedrag dat uiteindelijk aan je wordt uitbetaald.",
        "Daardoor kun je twee mensen met hetzelfde brutoloon hebben die toch een verschillend nettobedrag ontvangen."
      ]},
      { heading: "Welke factoren bepalen je nettoloon?", paragraphs: [
        "Loonheffingskortingen verlagen de belasting die over je inkomen wordt geheven. Ook pensioenpremies, andere inhoudingen en de manier waarop je werkgever je loon verwerkt kunnen verschil maken.",
        "De Belastingdienst publiceert hiervoor jaarlijks nieuwe tabellen en bedragen. Daarom moet een bruto-nettoberekening altijd gekoppeld zijn aan het juiste belastingjaar."
      ]},
      { heading: "Bereken jouw persoonlijke bruto-netto verschil", paragraphs: [
        "Een algemene tabel geeft slechts een indicatie. Vul je eigen bruto salaris en relevante gegevens in om een berekening te krijgen die beter aansluit bij jouw situatie."
      ]}
    ],
    faqs: [
      ["Waarom verschilt mijn nettoloon van dat van iemand anders met hetzelfde salaris?", "Onder andere loonheffingskorting, pensioen en andere inhoudingen kunnen verschillen. Daardoor kan het nettoloon bij hetzelfde brutoloon anders uitvallen."],
      ["Is bruto naar netto ieder jaar hetzelfde?", "Nee. Belastingtarieven, heffingskortingen en andere bedragen kunnen jaarlijks wijzigen. Daarom is het belangrijk om het juiste belastingjaar te gebruiken."],
      ["Kan ik mijn bruto jaarsalaris gebruiken?", "Ja. De calculator kan met een maandsalaris of jaarsalaris werken. Gebruik de eenheid die aansluit bij de informatie die je hebt."]
    ],
    relatedPages: ["/netto-salaris-4000-bruto", "/netto-salaris-3000-bruto", "/netto-salaris-5000-bruto"],
    sources: [
      { label: "Belastingdienst", url: "https://www.belastingdienst.nl", note: "Loonheffing, heffingskortingen en jaarlijkse tabellen." }
    ]
  },
  {
    slug: "/netto-salaris-3000-bruto",
    title: "€3.000 bruto naar netto in 2026",
    metaDescription: "Wat houd je over van €3.000 bruto per maand? Bekijk welke factoren je nettosalaris bepalen en bereken jouw persoonlijke situatie.",
    type: "salary-example",
    category: "Werk & inkomen",
    calculator: "/netto-salaris",
    calculatorLabel: "Bereken jouw netto salaris",
    eyebrow: "Netto salaris",
    h1: "€3.000 bruto naar netto",
    intro: "Wil je weten wat €3.000 bruto per maand ongeveer netto betekent? Het antwoord hangt af van je persoonlijke situatie en de inhoudingen op je loon.",
    sections: [
      { heading: "Wat houd je over van €3.000 bruto?", paragraphs: [
        "Het verschil tussen €3.000 bruto en je uiteindelijke nettoloon bestaat niet uit één vaste inhouding. Loonheffing, heffingskortingen en bijvoorbeeld pensioen kunnen allemaal invloed hebben op je uitbetaling.",
        "Gebruik daarom een persoonlijke berekening in plaats van alleen een algemene bruto-nettotabel."
      ]},
      { heading: "Werk je parttime?", paragraphs: [
        "Bij parttime werken is het belangrijk om te weten of het genoemde bedrag je werkelijke parttime salaris is of het fulltime salaris bij je functie. Voor een goede berekening moet het bedrag aansluiten op de periode die je invult."
      ]},
      { heading: "Wat betekent €3.000 bruto voor je gezin?", paragraphs: [
        "Voor ouders kan een salaris onderdeel zijn van een groter financieel plaatje. Een wijziging in uren kan bijvoorbeeld ook gevolgen hebben voor kinderopvang en het gezamenlijke huishoudinkomen."
      ]}
    ],
    faqs: [
      ["Is €3.000 bruto per maand hetzelfde als €36.000 bruto per jaar?", "Als je iedere maand €3.000 bruto verdient en er geen extra loon wordt meegerekend, is dat €36.000 bruto per jaar. Vakantiegeld, een 13e maand en andere beloningen kunnen het jaarlijkse totaal verhogen."],
      ["Hoeveel is €3.000 bruto bij 32 uur werken?", "Dat hangt ervan af of €3.000 het salaris voor 32 uur of het fulltime salaris is. Gebruik de netto salaris calculator met de juiste salaris- en ureninformatie voor jouw situatie."],
      ["Waarom is mijn netto bedrag niet precies hetzelfde als een online voorbeeld?", "Online voorbeelden gebruiken aannames. Je eigen pensioenregeling, heffingskorting en andere inhoudingen kunnen een andere uitkomst geven."]
    ],
    relatedPages: ["/bruto-naar-netto", "/netto-salaris-4000-bruto"],
    sources: [
      { label: "Belastingdienst", url: "https://www.belastingdienst.nl", note: "Actuele informatie over loonheffing en heffingskortingen." }
    ]
  },
  {
    slug: "/netto-salaris-5000-bruto",
    title: "€5.000 bruto naar netto in 2026",
    metaDescription: "Wat houd je over van €5.000 bruto per maand? Bekijk de belangrijkste factoren en bereken je persoonlijke nettosalaris.",
    type: "salary-example",
    category: "Werk & inkomen",
    calculator: "/netto-salaris",
    calculatorLabel: "Bereken jouw netto salaris",
    eyebrow: "Netto salaris",
    h1: "€5.000 bruto naar netto",
    intro: "Bij €5.000 bruto per maand wil je waarschijnlijk weten wat daarvan daadwerkelijk overblijft. Je nettoloon hangt af van meer dan alleen je brutoloon.",
    sections: [
      { heading: "Van €5.000 bruto naar je nettoloon", paragraphs: [
        "Je werkgever houdt loonheffing en mogelijk andere bedragen in op je bruto salaris. Heffingskortingen kunnen de uiteindelijke belastingdruk beïnvloeden.",
        "Daarnaast kan een pensioenregeling een aanzienlijk verschil maken tussen bruto en netto. Daarom is een persoonlijke berekening nuttiger dan één vast nettobedrag."
      ]},
      { heading: "Hoger salaris betekent niet automatisch hetzelfde netto percentage", paragraphs: [
        "Belasting en heffingskortingen zijn afhankelijk van het inkomen. Daardoor verandert de verhouding tussen bruto en netto wanneer je salaris stijgt."
      ]},
      { heading: "Ook interessant als je minder gaat werken", paragraphs: [
        "Verdien je €5.000 bruto bij een fulltime dienstverband en overweeg je minder te werken? Dan kan het interessant zijn om het verschil tussen bijvoorbeeld 40, 36 en 32 uur te bekijken."
      ]}
    ],
    faqs: [
      ["Is het nettopercentage bij €5.000 bruto hetzelfde als bij €3.000 bruto?", "Nee. Door de manier waarop belasting en heffingskortingen worden berekend kan het netto aandeel van het brutoloon veranderen bij een hoger inkomen."],
      ["Heeft pensioen invloed op mijn netto salaris?", "Ja. Een werknemersbijdrage voor pensioen kan op je loon worden ingehouden en verlaagt daardoor het bedrag dat je netto ontvangt."],
      ["Kan ik €5.000 bruto ook voor mijn partner berekenen?", "Ja. De netto salaris calculator kan worden gebruikt voor afzonderlijke personen. Voor een compleet gezinsbeeld kun je beide inkomens naast elkaar berekenen."]
    ],
    relatedPages: ["/bruto-naar-netto", "/netto-salaris-4000-bruto"],
    sources: [
      { label: "Belastingdienst", url: "https://www.belastingdienst.nl", note: "Actuele informatie over loonheffing en heffingskortingen." }
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
      { heading: "Wat gebeurt er met je salaris?", paragraphs: [
        "Ga je van 40 naar 32 uur, dan werk je 80% van een fulltime werkweek. Bij een gelijkblijvend uurloon komt je bruto salaris daardoor vaak uit op ongeveer 80% van het oude bedrag.",
        "Je netto inkomen daalt meestal niet in exact dezelfde verhouding, omdat de loonheffing mee verandert. De precieze uitkomst verschilt per persoon."
      ]},
      { heading: "Wat betekent minder werken voor je gezin?", paragraphs: [
        "Voor ouders is het salaris maar één onderdeel van de beslissing. Minder werken kan ook invloed hebben op kinderopvang, pensioenopbouw en het gezamenlijke huishoudinkomen.",
        "Juist daarom is het verstandig om de verandering als een totaalplaatje te bekijken in plaats van alleen het bruto salaris te vergelijken."
      ]},
      { heading: "Van 40 naar 32 uur: hoeveel vrije tijd koop je?", paragraphs: [
        "Je levert bij een overstap naar 32 uur doorgaans één volledige werkdag per week in. De financiële waarde daarvan kun je naast het verschil in vrije tijd leggen om te bepalen of de keuze bij jullie past."
      ]}
    ],
    faqs: [
      ["Daalt mijn nettoloon met 20%?", "Niet noodzakelijk. Je bruto salaris kan bij hetzelfde uurloon ongeveer 20% dalen, maar de loonheffing verandert ook. Daardoor kan het nettoverschil procentueel anders uitvallen."],
      ["Heeft minder werken invloed op mijn pensioen?", "Ja. Minder uren werken kan gevolgen hebben voor je pensioensopbouw. Je pensioenuitvoerder kan aangeven wat de wijziging in jouw specifieke regeling betekent."],
      ["Heeft minder werken invloed op kinderopvang?", "Dat kan. Je werkuren kunnen invloed hebben op de opvangbehoefte en daarmee op je kinderopvangkosten. De exacte gevolgen hangen af van jullie situatie."]
    ],
    relatedPages: ["/van-40-naar-36-uur", "/minder-werken-na-kind", "/netto-salaris-4000-bruto"],
    sources: [
      { label: "Rijksoverheid", url: "https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/wanneer-mag-ik-meer-of-minder-uren-werken", note: "Regels rond het verzoek om meer of minder uren te werken." }
    ]
  },
  {
    slug: "/van-40-naar-36-uur",
    title: "Van 40 naar 36 uur werken: wat verandert er financieel?",
    metaDescription: "Van 40 naar 36 uur werken? Bekijk wat er met je bruto en netto inkomen kan gebeuren en bereken jouw persoonlijke financiële verschil.",
    type: "guide",
    category: "Werk & inkomen",
    calculator: "/meer-minder-werken",
    calculatorLabel: "Bereken wat 36 uur werken betekent",
    eyebrow: "Minder werken",
    h1: "Van 40 naar 36 uur werken",
    intro: "Vier uur minder werken per week lijkt een kleine stap, maar kan op jaarbasis een duidelijk verschil maken in inkomen, vrije tijd en andere gezinskosten.",
    sections: [
      { heading: "Hoeveel salaris lever je in?", paragraphs: [
        "Als je uurloon gelijk blijft, werk je bij 36 uur 90% van een 40-urige werkweek. Je bruto salaris komt dan vaak uit op ongeveer 90% van het oorspronkelijke fulltime salaris.",
        "Het nettoverschil is niet automatisch precies 10%, omdat de loonheffing en heffingskortingen veranderen wanneer je inkomen verandert."
      ]},
      { heading: "Waarom 36 uur interessant kan zijn voor ouders", paragraphs: [
        "Een structurele vrije dag of kortere werkdagen kunnen extra tijd geven voor kinderen en gezin. Daar staat een lager inkomen tegenover. De beste keuze is daarom afhankelijk van jullie totale financiële plaatje."
      ]},
      { heading: "Kijk verder dan je salaris", paragraphs: [
        "Neem bij een vergelijking ook kinderopvang, pensioen en het inkomen van je partner mee. Een verandering in werkuren kan op meerdere plekken in het huishoudbudget doorwerken."
      ]}
    ],
    faqs: [
      ["Is 36 uur werken 10% minder salaris?", "Bij een gelijk uurloon is het bruto salaris bij 36 uur ongeveer 10% lager dan bij 40 uur. Het nettoverschil kan anders uitvallen door belastingen en heffingskortingen."],
      ["Kan ik mijn werkgever vragen om 36 uur te werken?", "Onder voorwaarden kun je schriftelijk een verzoek doen om je arbeidsduur te wijzigen. De exacte regels hangen onder meer af van je situatie en werkgever."],
      ["Wat gebeurt er met mijn pensioen als ik 36 uur ga werken?", "Minder werken kan leiden tot minder pensioenopbouw. Controleer bij je pensioenuitvoerder wat dit voor jouw regeling betekent."]
    ],
    relatedPages: ["/van-40-naar-32-uur", "/minder-werken-na-kind", "/bruto-naar-netto"],
    sources: [
      { label: "Rijksoverheid", url: "https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/wanneer-mag-ik-meer-of-minder-uren-werken", note: "Regels rond meer of minder uren werken." }
    ]
  },
  {
    slug: "/minder-werken-na-kind",
    title: "Minder werken na een kind: wat betekent dat financieel?",
    metaDescription: "Overweeg je minder te werken na de geboorte van je kind? Bekijk de financiële gevolgen voor salaris, kinderopvang en je gezin.",
    type: "guide",
    category: "Werk & inkomen",
    calculator: "/meer-minder-werken",
    calculatorLabel: "Bereken wat minder werken betekent",
    eyebrow: "Werk & gezin",
    h1: "Minder werken na een kind",
    intro: "Na de komst van een kind verandert niet alleen je agenda, maar vaak ook je financiële situatie. Minder werken kan aantrekkelijk zijn, maar het effect gaat verder dan alleen je salaris.",
    sections: [
      { heading: "Wat gebeurt er met je inkomen?", paragraphs: [
        "Minder uren betekent bij een gelijk uurloon doorgaans een lager bruto salaris. Het nettoverschil is afhankelijk van je inkomen en de manier waarop belastingen en heffingskortingen uitpakken.",
        "Daarom is het verstandig om de situatie voor en na de wijziging naast elkaar te zetten."
      ]},
      { heading: "Kinderopvang kan ook veranderen", paragraphs: [
        "Als je minder gaat werken, kan je behoefte aan kinderopvang afnemen. Daardoor kunnen je opvangkosten veranderen. De gevolgen voor kinderopvangtoeslag zijn afhankelijk van onder andere inkomen, opvanguren en het aantal kinderen."
      ]},
      { heading: "Vergeet pensioen niet", paragraphs: [
        "Minder werken kan ook invloed hebben op je toekomstige pensioenopbouw. Dat effect zie je niet direct in je maandbudget, maar hoort wel bij een goede afweging."
      ]},
      { heading: "Maak de vergelijking voor jullie gezin", paragraphs: [
        "Vergelijk niet alleen je oude en nieuwe salaris. Kijk naar het gezamenlijke inkomen, kinderopvang en andere kosten die door de verandering kunnen wijzigen. Zo krijg je een realistischer beeld van wat een dag minder werken jullie daadwerkelijk kost."
      ]}
    ],
    faqs: [
      ["Is minder werken na een kind financieel slim?", "Dat verschilt per gezin. Minder werken verlaagt meestal het inkomen, maar kan ook kinderopvangkosten en andere uitgaven veranderen. Daarnaast kan extra vrije tijd voor jullie belangrijk zijn."],
      ["Heeft minder werken invloed op kinderopvangtoeslag?", "Dat kan. De hoogte van de toeslag hangt onder andere samen met inkomen, opvanguren en de situatie van de ouder(s)."],
      ["Heeft minder werken invloed op mijn pensioen?", "Ja, minder werken kan gevolgen hebben voor je pensioensopbouw. Vraag je pensioenuitvoerder om een berekening voor jouw regeling."]
    ],
    relatedPages: ["/van-40-naar-32-uur", "/van-40-naar-36-uur", "/netto-kosten-kinderopvang"],
    sources: [
      { label: "Rijksoverheid", url: "https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/wanneer-mag-ik-meer-of-minder-uren-werken", note: "Informatie over het aanpassen van je arbeidsduur." },
      { label: "Rijksoverheid — kinderopvangtoeslag", url: "https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/kinderopvangtoeslag/bedragen-kinderopvangtoeslag-2026", note: "Actuele informatie over kinderopvangtoeslag in 2026." }
    ]
  },

  {
    slug: "/netto-kosten-kinderopvang",
    title: "Netto kosten kinderopvang berekenen in 2026",
    metaDescription: "Wat kost kinderopvang netto na kinderopvangtoeslag? Bekijk welke factoren de eigen bijdrage bepalen en bereken jullie persoonlijke situatie.",
    type: "guide",
    category: "Gezin & kinderen",
    calculator: "/kinderopvang",
    calculatorLabel: "Bereken jullie netto kinderopvangkosten",
    eyebrow: "Kinderopvang",
    h1: "Wat kost kinderopvang netto?",
    intro: "De factuur van de kinderopvang is niet hetzelfde als wat jullie uiteindelijk zelf betalen. Kinderopvangtoeslag kan een deel van de kosten vergoeden.",
    sections: [
      { heading: "Van bruto opvangkosten naar eigen bijdrage", paragraphs: [
        "Jullie bruto opvangkosten worden bepaald door onder andere het aantal uren en het uurtarief van de opvang. De kinderopvangtoeslag kan vervolgens een deel van de kosten vergoeden.",
        "Het bedrag dat na de toeslag overblijft, is jullie eigen bijdrage. Dat is het bedrag dat voor het gezinsbudget het meest relevant is."
      ]},
      { heading: "Waar hangt de kinderopvangtoeslag van af?", paragraphs: [
        "De hoogte van de kinderopvangtoeslag hangt onder andere af van het inkomen, het aantal kinderen, het soort opvang en het aantal opvanguren. De overheid stelt bovendien jaarlijks maximale uurprijzen vast.",
        "In 2026 zijn de maximale uurprijzen €11,23 voor dagopvang, €9,98 voor buitenschoolse opvang en €8,49 voor gastouderopvang. Een opvangorganisatie mag een hoger tarief rekenen; het verschil boven de maximum uurprijs komt dan voor rekening van de ouders."
      ]},
      { heading: "Waarom minder werken ook je opvangkosten kan veranderen", paragraphs: [
        "Als een van jullie minder gaat werken, kan de benodigde opvang veranderen. Daardoor kan een salarisverlaging gedeeltelijk worden gecompenseerd door lagere opvangkosten. Bereken daarom beide kanten van de keuze."
      ]}
    ],
    faqs: [
      ["Hoeveel kost kinderopvang netto?", "Dat verschilt per gezin. Het hangt onder andere af van het uurtarief, het aantal opvanguren, het aantal kinderen en het gezamenlijke inkomen."],
      ["Vergoedt de kinderopvangtoeslag het volledige uurtarief?", "Niet altijd. De toeslag wordt berekend tot de wettelijke maximum uurprijs. Als de opvang meer vraagt, betalen ouders het verschil boven die maximumprijs zelf."],
      ["Heeft minder werken invloed op mijn kinderopvangkosten?", "Dat kan. Minder werken kan betekenen dat je minder opvang nodig hebt. Ook het inkomen kan veranderen, waardoor de hoogte van de toeslag kan wijzigen."]
    ],
    relatedPages: ["/kinderopvang-2-dagen-per-week", "/kinderopvang-3-dagen-per-week", "/minder-werken-na-kind"],
    sources: [
      { label: "Rijksoverheid — bedragen kinderopvangtoeslag 2026", url: "https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/kinderopvangtoeslag/bedragen-kinderopvangtoeslag-2026", note: "Maximum uurprijzen en voorwaarden voor kinderopvangtoeslag in 2026." },
      { label: "Rijksoverheid — kosten kinderopvang", url: "https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/kinderopvangtoeslag/kosten-kinderopvang-in-nederland", note: "Uitleg over opvangkosten, toeslag en eigen bijdrage." }
    ]
  },
  {
    slug: "/kinderopvang-2-dagen-per-week",
    title: "Kinderopvang 2 dagen per week: wat kost dat netto?",
    metaDescription: "Wat kost 2 dagen kinderopvang per week? Bereken de bruto kosten, kinderopvangtoeslag en netto eigen bijdrage voor jullie gezin.",
    type: "guide",
    category: "Gezin & kinderen",
    calculator: "/kinderopvang",
    calculatorLabel: "Bereken jullie kinderopvangkosten",
    eyebrow: "Kinderopvang",
    h1: "Kinderopvang 2 dagen per week",
    intro: "Twee dagen opvang per week kan een grote maandelijkse kostenpost zijn. Wat jullie netto betalen hangt af van opvanguren, uurtarief, inkomen en het aantal kinderen.",
    sections: [
      { heading: "Hoeveel opvanguren zijn 2 dagen?", paragraphs: [
        "Twee opvangdagen betekenen niet automatisch hetzelfde aantal uren. Een opvangdag kan bijvoorbeeld acht of tien uur duren. Daarom is het voor een goede berekening belangrijk om met het werkelijke aantal opvanguren te rekenen."
      ]},
      { heading: "De bruto kosten zijn niet hetzelfde als de netto kosten", paragraphs: [
        "Begin met het aantal uren en het uurtarief van jullie opvang. Daarna wordt bekeken welk deel via kinderopvangtoeslag kan worden vergoed. Het resterende bedrag is jullie eigen bijdrage.",
        "Let op dat de kinderopvangtoeslag voor 2026 maximaal wordt berekend over de wettelijke maximum uurprijs."
      ]},
      { heading: "Twee dagen opvang combineren met minder werken", paragraphs: [
        "Als een van de ouders minder gaat werken om bijvoorbeeld een extra dag thuis te zijn, kan de opvangbehoefte veranderen. Daardoor moet je het effect op salaris én opvangkosten samen bekijken."
      ]}
    ],
    faqs: [
      ["Is 2 dagen kinderopvang per week veel?", "Dat hangt af van jullie werk- en gezinssituatie. In financiële zin zijn vooral het aantal uren per dag, het uurtarief en de kinderopvangtoeslag bepalend."],
      ["Kan ik 2 dagen opvang berekenen met meerdere kinderen?", "Ja. Gebruik de kinderopvangcalculator om de opvang voor meerdere kinderen en opvangvormen mee te nemen."],
      ["Waarom is mijn eigen bijdrage hoger dan verwacht?", "Een hoger opvangtarief dan de wettelijke maximum uurprijs kan een belangrijke oorzaak zijn. Het deel boven de maximum uurprijs wordt niet op dezelfde manier door de kinderopvangtoeslag vergoed."]
    ],
    relatedPages: ["/netto-kosten-kinderopvang", "/kinderopvang-3-dagen-per-week", "/minder-werken-na-kind"],
    sources: [
      { label: "Rijksoverheid — bedragen kinderopvangtoeslag 2026", url: "https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/kinderopvangtoeslag/bedragen-kinderopvangtoeslag-2026", note: "Actuele maximum uurprijzen en toeslagregels." }
    ]
  },
  {
    slug: "/kinderopvang-3-dagen-per-week",
    title: "Kinderopvang 3 dagen per week: wat betaal je netto?",
    metaDescription: "Bereken wat 3 dagen kinderopvang per week jullie netto kost. Bekijk de invloed van uren, uurtarief, inkomen en kinderopvangtoeslag.",
    type: "guide",
    category: "Gezin & kinderen",
    calculator: "/kinderopvang",
    calculatorLabel: "Bereken jullie netto kosten",
    eyebrow: "Kinderopvang",
    h1: "Kinderopvang 3 dagen per week",
    intro: "Drie dagen kinderopvang per week kan financieel flink verschillen per gezin. Het netto bedrag hangt vooral af van het aantal uren, het tarief van de opvang en jullie inkomen.",
    sections: [
      { heading: "Bereken eerst de bruto opvangkosten", paragraphs: [
        "Het aantal opvangdagen zegt nog niet genoeg. Vermenigvuldig het aantal uren per opvangdag met het aantal dagen en het uurtarief om de bruto kosten te bepalen."
      ]},
      { heading: "Daarna komt de kinderopvangtoeslag", paragraphs: [
        "De kinderopvangtoeslag is afhankelijk van onder andere jullie inkomen, het aantal kinderen en de soort opvang. De vergoeding kent bovendien een maximum uurprijs en een maximum aantal uren per kind per maand.",
        "In 2026 geldt voor kinderopvangtoeslag een maximum van 230 uur per kind per maand."
      ]},
      { heading: "Wat betekent drie dagen opvang voor werken?", paragraphs: [
        "Drie dagen opvang kan passen bij een gezin waarin beide ouders meerdere dagen werken. Als een van jullie minder gaat werken, kan het aantal benodigde opvanguren veranderen. Kijk daarom naar de combinatie van netto inkomen en netto opvangkosten."
      ]}
    ],
    faqs: [
      ["Hoeveel uur kinderopvang krijg je maximaal vergoed?", "In 2026 kan per kind maximaal 230 uur per maand voor kinderopvangtoeslag meetellen, onder de voorwaarden van de regeling."],
      ["Kan ik 3 dagen opvang berekenen voor verschillende opvangsoorten?", "Ja. De vergoeding en maximum uurprijs verschillen per soort opvang. Gebruik de calculator om jullie specifieke opvangvorm in te vullen."],
      ["Wat als mijn opvang meer vraagt dan de maximum uurprijs?", "Dan betalen jullie het deel boven de wettelijke maximum uurprijs zelf. De exacte netto eigen bijdrage hangt daarnaast af van jullie toeslagpercentage en overige gegevens."]
    ],
    relatedPages: ["/netto-kosten-kinderopvang", "/kinderopvang-2-dagen-per-week", "/minder-werken-na-kind"],
    sources: [
      { label: "Rijksoverheid — bedragen kinderopvangtoeslag 2026", url: "https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/kinderopvangtoeslag/bedragen-kinderopvangtoeslag-2026", note: "Maximum uurprijzen en maximum aantal uren in 2026." }
    ]
  }
];

export const findSeoPage = (slug) => SEO_PAGES.find((page) => page.slug === slug);
