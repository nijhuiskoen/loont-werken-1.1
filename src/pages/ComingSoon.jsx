import { calculators } from "../config/calculators";
import "../styles/home.css";

export default function ComingSoon() {
  const slug = typeof window !== "undefined" ? window.location.pathname.slice(1).replace(/\/$/, "") : "";
  const calculator = calculators.find((c) => c.path.slice(1) === slug);
  return (
    <div className="home" lang="nl">
      <header className="home-header"><a href="/" className="home-brand"><span className="brand-mark">€</span><span>loont-werken</span></a></header>
      <main className="coming-main">
        <div className="coming-icon">{calculator?.icon || "🧮"}</div>
        <span className="eyebrow">Binnenkort beschikbaar</span>
        <h1>{calculator?.title || "Deze calculator"}</h1>
        <p>{calculator?.description || "Deze calculator wordt momenteel gebouwd."}</p>
        <a className="back-button" href="/">← Alle calculators</a>
      </main>
    </div>
  );
}
