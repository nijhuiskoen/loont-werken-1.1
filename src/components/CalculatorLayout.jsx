import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { sourcesFor } from "../config/sources.js";
import { CALCULATORS } from "../config/calculators.js";
import SEOHead from "./SEOHead.jsx";

/*
 * Gemeenschappelijke schil voor calculators.
 *
 * bare=true  -> alleen een slanke terug-balk; de calculator bepaalt zelf de layout.
 *               (gebruikt door "Deeltijd of voltijd na een kind?", die een eigen split-screen heeft)
 * bare=false -> standaard structuur: titel, uitleg, inhoud, bronnen.
 */
export default function CalculatorLayout({ title, intro, calculatorId, bare=false, children }){
  const calculator = calculatorId ? CALCULATORS.find((c) => c.id === calculatorId) : null;
  const seoTitle = calculator?.seoTitle || title;
  const seoDescription = calculator?.seoDescription || intro;
  const seoPath = calculator?.slug || window.location.pathname;
  const seo = <SEOHead title={seoTitle} description={seoDescription} path={seoPath} type="WebApplication" />;
  if(bare){
    return (
      <>
        {seo}
        <nav className="calc-backbar">
          <Link to="/" className="backlink"><ArrowLeft size={16} aria-hidden="true"/> Alle calculators</Link>
        </nav>
        {children}
      </>
    );
  }
  const sources = calculatorId ? sourcesFor(calculatorId) : [];
  return (
    <>
      {seo}
      <Header compact />
      <main className="calc-shell">
        <Link to="/" className="backlink"><ArrowLeft size={16} aria-hidden="true"/> Alle calculators</Link>
        <h1 className="calc-title">{title}</h1>
        {intro && <p className="calc-intro">{intro}</p>}
        <div className="calc-content">{children}</div>
        {sources.length>0 && (
          <section className="calc-sources" aria-label="Gebruikte bronnen">
            <h2>Bronnen</h2>
            <ul>
              {sources.map((s)=>(
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
                  <span>{s.note}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
