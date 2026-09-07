# Automatische controle van officiële cijfers

Loont-werken gebruikt versiegebonden data voor fiscale en financiële parameters. De rekenlogica staat los van deze data.

## Hoe het werkt

1. Officiële bronpagina's staan centraal in `src/config/sources.js`.
2. De GitHub Action `.github/workflows/check-government-sources.yml` controleert deze bronnen dagelijks.
3. Een hash van de inhoud wordt opgeslagen in `.source-monitor/state.json`.
4. Bij een inhoudelijke wijziging wordt een GitHub Issue aangemaakt.
5. Een wijziging op een bronpagina past de calculator **niet automatisch** aan.
6. Na menselijke controle wordt de relevante parameterdata aangepast en getest.
7. Na merge bouwt Vercel de nieuwe versie.

## Waarom niet volledig automatisch?

Een gewijzigde overheidswebpagina betekent niet automatisch dat een rekenparameter is gewijzigd. De overheid kan bijvoorbeeld tekst, navigatie of een documentlink wijzigen. Daarom is automatische detectie veilig, maar automatische wijziging van fiscale formules niet.

## Jaarversies

Parameters horen onder `src/data/<jaar>/` te staan. Voor 2027 wordt bijvoorbeeld `src/data/2027/` toegevoegd. Oude jaren blijven beschikbaar zodat historische berekeningen reproduceerbaar blijven.

## Testen

- `npm run test:calculations`
- `npm run build`
- `npm run check:sources`

De huidige monitor controleert officiële bronpagina's. Het automatisch uitlezen van PDF/XLSX-parameterbijlagen kan later als aparte, gecontroleerde updatepipeline worden toegevoegd.
