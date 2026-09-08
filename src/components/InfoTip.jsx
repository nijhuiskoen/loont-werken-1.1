import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

/*
 * Klein "Waarom?"-icoon dat bij klik een korte uitleg toont.
 * Herbruikbaar op elke calculator — geen losse implementatie per pagina.
 */
export default function InfoTip({ label = "Uitleg", children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className="infotip" ref={ref}>
      <button
        type="button"
        className="infotip-btn"
        aria-expanded={open}
        aria-label={`${label}: meer uitleg`}
        onClick={() => setOpen((o) => !o)}
      >
        <Info size={13} aria-hidden="true" />
      </button>
      {open && (
        <span className="infotip-pop" role="tooltip">
          {children}
        </span>
      )}
    </span>
  );
}
