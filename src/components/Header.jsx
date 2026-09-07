export default function Header() {
  const isHome = typeof window !== "undefined" && window.location.pathname === "/";
  return (
    <header className="site-header">
      <a href="/" className="brand" aria-label="Loont-werken home">
        <span className="brand-mark" aria-hidden="true">€</span>
        <span>loont-werken</span>
      </a>
      {!isHome && <a href="/" className="all-calculators">← Alle calculators</a>}
    </header>
  );
}
