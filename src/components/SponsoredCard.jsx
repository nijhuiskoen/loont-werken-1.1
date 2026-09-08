import React from "react";
import { Megaphone } from "lucide-react";

/*
 * Kaart voor gesponsorde / affiliate content.
 *
 * Gebruikt bewust de aparte --sponsored kleurtoken (amber), nooit de
 * merkkleur of de CTA-kleur — zo blijft gesponsorde content in één oogopslag
 * te onderscheiden van onze eigen navigatie en acties.
 *
 * Het "Advertentie"-label is verplicht en niet uit te schakelen: reclame moet
 * in Nederland herkenbaar zijn als reclame (Reclame Code Commissie / regels
 * rond oneerlijke handelspraktijken). De kleur alleen is daarvoor niet genoeg.
 *
 * Voorbeeld:
 *   <SponsoredCard
 *     partner="Voorbeeld Hypotheken"
 *     title="Vergelijk hypotheekrentes"
 *     description="Zie in 2 minuten welke aanbieder bij jouw situatie past."
 *     ctaLabel="Vergelijk nu"
 *     href="https://partner.example/aanbevolen-link"
 *   />
 */
export default function SponsoredCard({ partner, title, description, ctaLabel = "Bekijk aanbod", href }){
  return (
    <a
      className="sponsored-card"
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`Advertentie van ${partner}: ${title}`}
    >
      <span className="sponsored-badge">
        <Megaphone size={12} aria-hidden="true" /> Advertentie
      </span>
      <span className="sponsored-partner">{partner}</span>
      <span className="sponsored-title">{title}</span>
      {description && <span className="sponsored-desc">{description}</span>}
      <span className="sponsored-cta">{ctaLabel}</span>
    </a>
  );
}
