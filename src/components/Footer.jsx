import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { CATEGORIES, byCategory } from "../config/calculators.js";
import { CIJFERS_JAAR, CIJFERS_BIJGEWERKT } from "../data/2026/meta.js";

/*
 * Gedeelde footer. Leest de categorieën uit dezelfde registry als de
 * homepage, dus een nieuwe calculator verschijnt hier vanzelf mee.
 */
export default function Footer(){
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="sf-inner">
        <div className="sf-top">
          <div className="sf-brand">
            <Link to="/" className="brand">
              <span className="brand-mark" aria-hidden="true">€</span>
              <span className="brand-text">Ouders Financieel</span>
            </Link>
            <p className="sf-tagline">
              Financiële calculators voor ouders. Ontdek wat werken, opvang, wonen,
              verlof en kinderen betekenen voor jullie portemonnee.
            </p>
            <p className="sf-privacy">
              <Heart size={13} aria-hidden="true" /> Geen account nodig — je gegevens blijven op je eigen apparaat.
            </p>
          </div>

          <nav className="sf-cols" aria-label="Calculatorcategorieën">
            {CATEGORIES.map((cat) => {
              const items = byCategory(cat.id);
              if (!items.length) return null;
              return (
                <div className="sf-col" key={cat.id}>
                  <h3>{cat.icon} {cat.title}</h3>
                  <ul>
                    {items.map((c) => (
                      <li key={c.id}>
                        {c.available ? (
                          <Link to={c.slug}>{c.title}</Link>
                        ) : (
                          <span className="sf-soon">
                            <span className="sf-soon-title">{c.title}</span>
                            <span className="sf-soon-badge">Binnenkort</span>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="sf-bottom">
          <p className="sf-legal">
            Alle berekeningen zijn indicatief en geen financieel advies. Cijfers {CIJFERS_JAAR}
            (bijgewerkt {CIJFERS_BIJGEWERKT}). Je daadwerkelijke bedragen kunnen afwijken van je
            persoonlijke situatie, pensioenregeling en het beleid van je gemeente.
          </p>
          <p className="sf-copy">© {year} Ouders Financieel</p>
        </div>
      </div>
    </footer>
  );
}
