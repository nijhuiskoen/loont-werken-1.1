# SEO-architectuur

De app bevat een centrale SEO registry in `src/config/seoPages.js`, een herbruikbare `SeoLandingPage` en `SEOHead` voor title/meta/canonical/Open Graph/JSON-LD.

## Nieuwe SEO-pagina toevoegen

1. Voeg een inhoudelijk unieke pagina toe aan `src/config/seoPages.js`.
2. Koppel `calculator` aan een bestaande calculator wanneer relevant.
3. Gebruik alleen pagina's die een duidelijke zoekintentie en aanvullende gebruikerswaarde hebben.
4. De sitemap wordt tijdens `npm run build` automatisch bijgewerkt.

## Site URL

Standaard gebruikt de build `https://ouders-financieel.vercel.app` voor sitemap en robots. Voor het definitieve domein kan Vercel de environment variable `SITE_URL` krijgen, bijvoorbeeld:

`SITE_URL=https://www.ouders-financieel.nl`

De runtime canonical gebruikt de actuele origin, zodat de app bij een domeinwijziging niet per se opnieuw geconfigureerd hoeft te worden.
