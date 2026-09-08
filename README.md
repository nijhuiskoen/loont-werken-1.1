# Loont het? — financiële calculators voor Nederlandse gezinnen

Platform met rekentools die laten zien wat werken, kinderen en wonen betekenen
voor de portemonnee. Alle berekeningen zijn indicatief en geen financieel advies.

## Starten

```bash
npm install
npm run dev      # ontwikkelserver
npm run build    # productiebuild naar dist/
npm run preview  # productiebuild lokaal bekijken
node test/regression.mjs   # regressietest op de rekenlaag
```

## Architectuur

De gegevensstroom is bewust één richting:

```
pages (UI)  →  calculations (rekenfuncties)  →  data/<jaar> (fiscale cijfers)
```

Een page bevat dus geen fiscale bedragen, en een rekenfunctie geen JSX.

```
src/
  App.jsx              routing + lazy loading, niets meer
  main.jsx             entrypoint
  config/
    calculators.js     registry: alle calculators, categorieën, routes
    sources.js         officiële bronnen per calculator
  data/2026/           ALLE jaarafhankelijke cijfers
    meta.js            jaartal + datum laatste update
    tax.js             belastingschijven en heffingskortingen
    childcare.js       opvangvormen, max uurtarieven, KOT-tabel, VNG-tabel
    pension.js         pensioen- en AOW-parameters
  calculations/        pure functies, geen UI
    tax.js             incomeTax, ahk, arb, iack
    car.js             bijtelling
    allowances.js      kotPct, vngBijdrage
    income.js          calculateScenario — de kern van de calculator
    pension.js         calculatePension
  components/          herbruikbare UI
  pages/               één page per calculator
  styles/
    app.css            stijl van de calculator (ongewijzigd uit v20)
    platform.css       homepage, navigatie, gedeelde layout
  utils/               format, opslag, deelbare link
test/regression.mjs    controleert dat de rekenlaag dezelfde bedragen geeft
```

## Een nieuwe calculator toevoegen

1. Zet de fiscale cijfers in `src/data/<jaar>/`.
2. Schrijf een pure rekenfunctie in `src/calculations/`.
3. Maak `src/pages/JouwCalculator.jsx` (gebruik `CalculatorLayout`).
4. Zet `available: true` en het juiste `module` in `src/config/calculators.js`.
5. Voeg de page toe aan de `PAGES`-map in `src/App.jsx`.
6. Vul `SOURCES_BY_CALCULATOR` in `src/config/sources.js`.

De homepage en routing pakken de calculator daarna automatisch op.

## Jaarlijks bijwerken

Alle bedragen die per jaar wijzigen staan in `src/data/2026/`. Maak voor een
nieuw jaar een map `src/data/2027/`, werk de waarden bij met de officiële
bronnen en pas de imports in `src/calculations/` aan. Werk ook
`CIJFERS_BIJGEWERKT` in `meta.js` bij — dat wordt in de app getoond.

## Privacy

Er is geen backend. Ingevulde gegevens blijven op het apparaat van de gebruiker
(`utils/storage.js`) en een deelbare link codeert de situatie in de URL zelf
(`utils/share.js`).
