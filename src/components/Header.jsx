import React from "react";
import { Link } from "react-router-dom";
import { CIJFERS_JAAR } from "../data/2026/meta.js";

export default function Header({ compact=false }){
  return (
    <header className={"site-header"+(compact?" compact":"")}>
      <div className="site-header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">€</span>
          <span className="brand-text">Loont het?</span>
        </Link>
        <span className="brand-year">Cijfers {CIJFERS_JAAR}</span>
      </div>
    </header>
  );
}
