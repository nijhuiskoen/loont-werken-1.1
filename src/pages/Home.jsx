import CalculatorCard from "../components/CalculatorCard";
import { calculators, categories } from "../config/calculators";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="home" lang="nl">
      <header className="home-header">
        <div className="home-brand"><span className="brand-mark">€</span><span>loont-werken</span></div>
      </header>
      <main className="home-main">
        <section className="home-hero">
          <span className="eyebrow">Financiële calculators voor gezinnen</span>
          <h1>Wat wil je berekenen?</h1>
          <p>Ontdek wat werken, kinderen, wonen en financiële keuzes betekenen voor jullie portemonnee.</p>
        </section>
        <div className="calculator-groups">
          {categories.map((category) => {
            const items = calculators.filter((c) => c.category === category);
            return (
              <section className="calculator-group" key={category}>
                <h2>{category}</h2>
                <div className="calculator-grid">
                  {items.map((calculator) => <CalculatorCard key={calculator.id} calculator={calculator} />)}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
