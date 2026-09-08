import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown, ExternalLink } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SEOHead from "../components/SEOHead.jsx";
import { findSeoPage } from "../config/seoPages.js";
import { findBySlug } from "../config/calculators.js";
import { CIJFERS_JAAR } from "../data/2026/meta.js";

export default function SeoLandingPage(){
  const { pathname } = useLocation();
  const page = findSeoPage(pathname);

  if(!page){
    return <><SEOHead title="Pagina niet gevonden" description="Deze pagina bestaat niet." noindex /><Header /><main className="seo-page"><div className="seo-article"><h1>Pagina niet gevonden</h1><p>Deze pagina bestaat niet.</p><Link className="btn btn-primary" to="/">Naar Ouders Financieel</Link></div></main><Footer /></>;
  }

  const calculator = findBySlug(page.calculator);
  const breadcrumbs = [
    { name: "Ouders Financieel", path: "/" },
    ...(calculator ? [{ name: calculator.title, path: calculator.slug }] : []),
    { name: page.h1, path: page.slug },
  ];
  const related = (page.relatedPages || []).map(findSeoPage).filter(Boolean);

  return (
    <>
      <SEOHead
        title={page.title}
        description={page.metaDescription}
        path={page.slug}
        breadcrumbs={breadcrumbs}
        faqs={page.faqs}
      />
      <Header />
      <main className="seo-page">
        <article className="seo-article">
          <nav className="seo-breadcrumbs" aria-label="Broodkruimels">
            {breadcrumbs.map((item, i) => (
              <React.Fragment key={item.path}>
                {i > 0 && <span aria-hidden="true">/</span>}
                {i === breadcrumbs.length - 1 ? <span aria-current="page">{item.name}</span> : <Link to={item.path}>{item.name}</Link>}
              </React.Fragment>
            ))}
          </nav>

          <header className="seo-hero">
            <span className="seo-eyebrow">{page.eyebrow}</span>
            <h1>{page.h1}</h1>
            <p>{page.intro}</p>
            <div className="seo-year">Gebaseerd op de {CIJFERS_JAAR}-gegevens die in Ouders Financieel worden gebruikt.</div>
          </header>

          <div className="seo-cta-card">
            <div>
              <strong>Bereken jouw persoonlijke situatie</strong>
              <span>Een voorbeeld is slechts een indicatie. Vul je eigen gegevens in voor een persoonlijk resultaat.</span>
            </div>
            {calculator && calculator.available && (
              <Link className="btn btn-primary" to={calculator.slug}>
                {page.calculatorLabel} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            )}
          </div>

          {page.sections.map((section) => (
            <section className="seo-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}

          {page.faqs?.length > 0 && (
            <section className="seo-section seo-faq" aria-labelledby="seo-faq-title">
              <h2 id="seo-faq-title">Veelgestelde vragen</h2>
              {page.faqs.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}<ChevronDown size={18} aria-hidden="true" /></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </section>
          )}

          {related.length > 0 && (
            <section className="seo-related" aria-labelledby="seo-related-title">
              <h2 id="seo-related-title">Meer over dit onderwerp</h2>
              <div className="seo-related-grid">
                {related.map((relatedPage) => (
                  <Link to={relatedPage.slug} className="seo-related-card" key={relatedPage.slug}>
                    <strong>{relatedPage.h1}</strong>
                    <span>{relatedPage.intro}</span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                ))}
                {calculator && <Link to={calculator.slug} className="seo-related-card">
                  <strong>{calculator.title}</strong>
                  <span>{calculator.description}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>}
              </div>
            </section>
          )}

          {page.sources?.length > 0 && (
            <section className="seo-sources" aria-labelledby="seo-sources-title">
              <h2 id="seo-sources-title">Bronnen</h2>
              <ul>
                {page.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      <strong>{source.label}</strong> <ExternalLink size={13} aria-hidden="true" />
                    </a>
                    <span>{source.note}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="seo-disclaimer">Indicatieve informatie op basis van de {CIJFERS_JAAR}-gegevens die in Ouders Financieel worden gebruikt. De daadwerkelijke uitkomst kan afwijken van je persoonlijke situatie of loonstrook.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
