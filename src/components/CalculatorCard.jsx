import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* Kaart voor één calculator. Beschikbaar = link, anders een nette
   niet-klikbare "Binnenkort"-kaart. */
export default function CalculatorCard({ calculator }){
  const { icon, title, description, slug, available } = calculator;

  const inner = (
    <>
      <span className="cc-icon" aria-hidden="true">{icon}</span>
      <span className="cc-body">
        <span className="cc-title">{title}</span>
        <span className="cc-desc">{description}</span>
      </span>
      {available
        ? <span className="cc-foot go">Berekenen <ArrowRight size={15} aria-hidden="true"/></span>
        : <span className="cc-foot soon">Binnenkort</span>}
    </>
  );

  if(!available){
    return (
      <div className="cc is-soon" aria-label={`${title} — binnenkort beschikbaar`}>
        {inner}
      </div>
    );
  }
  return <Link to={slug} className="cc">{inner}</Link>;
}
