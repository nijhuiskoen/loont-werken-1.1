export default function CalculatorCard({ calculator }) {
  const content = (
    <>
      <div className="calculator-icon" aria-hidden="true">{calculator.icon}</div>
      <div className="calculator-card-body">
        <div className="calculator-card-title-row">
          <h3>{calculator.title}</h3>
          {!calculator.available && <span className="coming-soon">Binnenkort</span>}
        </div>
        <p>{calculator.description}</p>
      </div>
      {calculator.available && <span className="calculator-arrow" aria-hidden="true">→</span>}
    </>
  );
  return calculator.available
    ? <a className="calculator-card" href={calculator.path}>{content}</a>
    : <div className="calculator-card disabled" aria-disabled="true">{content}</div>;
}
