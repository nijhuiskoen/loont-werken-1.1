import { useEffect } from "react";

const SITE_NAME = "Ouders Financieel";

function upsertMeta(attribute, value, content){
  if(!content) return;
  let el = document.head.querySelector(`meta[${attribute}="${value}"]`);
  if(!el){
    el = document.createElement("meta");
    el.setAttribute(attribute, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href){
  if(!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if(!el){
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id, data){
  let el = document.head.querySelector(`script[data-seo-jsonld="${id}"]`);
  if(!el){
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.seoJsonld = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function SEOHead({
  title,
  description,
  path = "/",
  type = "WebPage",
  breadcrumbs = [],
  noindex = false,
}){
  useEffect(() => {
    const origin = window.location.origin;
    const canonical = new URL(path, origin).href;

    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow");
    upsertLink("canonical", canonical);

    upsertMeta("property", "og:title", title || SITE_NAME);
    upsertMeta("property", "og:description", description || "");
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:site_name", SITE_NAME);

    const graph = [{
      "@type": type,
      "@id": `${canonical}#page`,
      url: canonical,
      name: title || SITE_NAME,
      description: description || "",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: origin + "/" }
    }];

    if(breadcrumbs.length){
      graph.push({
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumbs`,
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: new URL(item.path, origin).href
        }))
      });
    }

    upsertJsonLd("page", { "@context": "https://schema.org", "@graph": graph });

    return () => {
      // Keep the head state lightweight; the next route overwrites these values.
    };
  }, [title, description, path, type, noindex, JSON.stringify(breadcrumbs)]);

  return null;
}
