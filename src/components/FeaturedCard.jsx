import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";

/* Kaart voor een uitgelichte calculator. Staat naast 1-3 andere in een raster
   (zie .fc-grid), dus compacter dan een volledige-breedte hero. */
export default function FeaturedCard({ calculator, badge=true }){
  if(!calculator) return null;
  const { icon, title, description, slug } = calculator;
  return (
    <Link to={slug} className="fc">
      {badge && <span className="fc-badge"><Star size={12} aria-hidden="true"/> Meest gebruikt</span>}
      <span className="fc-icon" aria-hidden="true">{icon}</span>
      <span className="fc-title">{title}</span>
      <span className="fc-desc">{description}</span>
      <span className="fc-cta">Start de berekening <ArrowRight size={17} aria-hidden="true"/></span>
    </Link>
  );
}
