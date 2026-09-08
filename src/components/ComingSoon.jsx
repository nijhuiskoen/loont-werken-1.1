import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Hammer } from "lucide-react";
import CalculatorLayout from "./CalculatorLayout.jsx";

export default function ComingSoon({ calculator }){
  return (
    <CalculatorLayout title={calculator?.title || "Deze calculator"} intro={calculator?.description}>
      <div className="soon-panel">
        <div className="soon-icon" aria-hidden="true"><Hammer size={22}/></div>
        <h2>Nog in de maak</h2>
        <p>
          Deze calculator is er nog niet. We bouwen ze één voor één, zodat elke berekening
          op officiële cijfers klopt in plaats van op een snelle schatting.
        </p>
        <Link to="/meer-minder-werken" className="btn btn-primary">
          Probeer &ldquo;Deeltijd of voltijd na een kind?&rdquo; <ArrowRight size={17} aria-hidden="true"/>
        </Link>
      </div>
    </CalculatorLayout>
  );
}
