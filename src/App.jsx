import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CALCULATORS } from "./config/calculators.js";

/*
 * App.jsx doet alleen de applicatiestructuur en routing.
 * Elke calculator zit in zijn eigen page-module en wordt pas geladen
 * wanneer de gebruiker die route opent (code splitting).
 */

const Home = lazy(()=>import("./pages/Home.jsx"));

/* Pages per module-naam uit de registry. Vite kan deze paden statisch analyseren. */
const PAGES = {
  MeerMinderWerken:     lazy(()=>import("./pages/MeerMinderWerken.jsx")),
  NettoSalaris:         lazy(()=>import("./pages/NettoSalaris.jsx")),
  Vakantiegeld:         lazy(()=>import("./pages/Vakantiegeld.jsx")),
  Ouderschapsverlof:    lazy(()=>import("./pages/Ouderschapsverlof.jsx")),
  Kinderopvang:         lazy(()=>import("./pages/Kinderopvang.jsx")),
  Gezinsbudget:         lazy(()=>import("./pages/Gezinsbudget.jsx")),
  BabyEersteJaar:       lazy(()=>import("./pages/BabyEersteJaar.jsx")),
  HypotheekNaKind:      lazy(()=>import("./pages/HypotheekNaKind.jsx")),
  HypotheekMaandlasten: lazy(()=>import("./pages/HypotheekMaandlasten.jsx")),
  KoopVsHuur:           lazy(()=>import("./pages/KoopVsHuur.jsx")),
  PensioenMinderWerken: lazy(()=>import("./pages/PensioenMinderWerken.jsx")),
  AutoVanDeZaak:        lazy(()=>import("./pages/AutoVanDeZaak.jsx")),
};

function Loading(){
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true"></span>
      <span>Laden…</span>
    </div>
  );
}

export default function App(){
  return (
    <div className="app" lang="nl">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          {CALCULATORS.map((c)=>{
            const Page = PAGES[c.module];
            if(!Page) return null;
            return <Route key={c.id} path={c.slug} element={<Page />} />;
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
