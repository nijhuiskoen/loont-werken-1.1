import React from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import FeaturedCard from "../components/FeaturedCard.jsx";
import CalculatorCard from "../components/CalculatorCard.jsx";
import { featuredCalculators, otherCalculators, CALCULATORS } from "../config/calculators.js";
import { CIJFERS_JAAR } from "../data/2026/meta.js";

export default function Home(){
  const featured = featuredCalculators();
  const others = otherCalculators();
  const beschikbaar = CALCULATORS.filter((c)=>c.available).length;

  return (
    <>
      <Header />
      <main className="home">
        <section className="hero-home">
          <h1>Ouders Financieel</h1>
          <p>
            Financiële calculators voor ouders. Ontdek wat werken, opvang, wonen,
            verlof en kinderen financieel betekenen.
          </p>
          <p className="hero-meta">
            Rekent met de officiële cijfers van {CIJFERS_JAAR} ·{" "}
            {beschikbaar === 1 ? "1 calculator beschikbaar" : `${beschikbaar} calculators beschikbaar`}
          </p>
        </section>

        {featured.length>0 && (
          <div className="fc-grid" data-count={featured.length}>
            {featured.map((c)=>(<FeaturedCard key={c.id} calculator={c} />))}
          </div>
        )}

        <section className="calc-list" aria-labelledby="alle-calculators">
          <h2 id="alle-calculators">Alle calculators</h2>
          <div className="calc-grid">
            {others.map((c)=>(<CalculatorCard key={c.id} calculator={c} />))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
