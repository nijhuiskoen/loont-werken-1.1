import { Suspense, lazy, useEffect, useState } from "react";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";

const MeerMinderWerken = lazy(() => import("./pages/MeerMinderWerken"));

function Loading() {
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>Laden…</div>;
}

function currentPath() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

export default function App() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPopState = () => setPath(currentPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onClick = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin || url.pathname === currentPath()) return;
      event.preventDefault();
      window.history.pushState({}, "", url.pathname + url.search + url.hash);
      setPath(currentPath());
      window.scrollTo(0, 0);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  let page;
  if (path === "/") page = <Home />;
  else if (path === "/meer-minder-werken") page = <MeerMinderWerken />;
  else page = <ComingSoon />;

  return <Suspense fallback={<Loading />}>{page}</Suspense>;
}
