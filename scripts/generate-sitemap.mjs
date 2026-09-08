import fs from "node:fs";
import path from "node:path";
import { CALCULATORS } from "../src/config/calculators.js";
import { SEO_PAGES } from "../src/config/seoPages.js";

const siteUrl = (process.env.SITE_URL || "https://ouders-financieel.vercel.app").replace(/\/$/, "");
const publicRoutes = ["/"];
const calculatorRoutes = CALCULATORS.filter((c) => c.available).map((c) => c.slug);
const seoRoutes = SEO_PAGES.map((p) => p.slug);
const routes = [...new Set([...publicRoutes, ...calculatorRoutes, ...seoRoutes])];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join("\n") +
  `\n</urlset>\n`;

fs.writeFileSync(path.join("dist", "sitemap.xml"), xml);
fs.writeFileSync(path.join("dist", "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`Generated sitemap with ${routes.length} URLs for ${siteUrl}`);
