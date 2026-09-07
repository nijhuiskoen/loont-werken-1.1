import fs from "node:fs/promises";
import crypto from "node:crypto";
import { OFFICIAL_SOURCES } from "../src/config/sources.js";

const stateFile = ".source-monitor/state.json";
const stateDir = ".source-monitor";
const previous = await readState();
const results = [];

for (const source of OFFICIAL_SOURCES) {
  try {
    const response = await fetch(source.url, {
      headers: { "user-agent": "loont-werken-source-monitor/1.0" },
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.text();
    const normalized = body.replace(/\s+/g, " ").trim();
    const hash = crypto.createHash("sha256").update(normalized).digest("hex");
    const old = previous.sources?.[source.id]?.hash ?? null;
    results.push({ ...source, status: old && old !== hash ? "changed" : old ? "unchanged" : "new", hash, checkedAt: new Date().toISOString() });
  } catch (error) {
    results.push({ ...source, status: "error", error: error.message, checkedAt: new Date().toISOString() });
  }
}

const changed = results.filter((r) => r.status === "changed");
const errors = results.filter((r) => r.status === "error");
const next = { generatedAt: new Date().toISOString(), sources: Object.fromEntries(results.map((r) => [r.id, r])) };
await fs.mkdir(stateDir, { recursive: true });
await fs.writeFile(stateFile, JSON.stringify(next, null, 2) + "\n");

console.log(`Checked ${results.length} official sources.`);
for (const r of results) console.log(`${r.status.padEnd(10)} ${r.authority}: ${r.title}`);

if (changed.length) {
  console.log("\nCHANGES DETECTED:");
  for (const r of changed) console.log(`- ${r.authority}: ${r.title} (${r.url})`);
  process.exitCode = 2;
}
if (errors.length) {
  console.log("\nSOURCE CHECK ERRORS:");
  for (const r of errors) console.log(`- ${r.authority}: ${r.title}: ${r.error}`);
  // Network failures are not treated as evidence of a data change.
  if (!changed.length) process.exitCode = 1;
}

async function readState() {
  try { return JSON.parse(await fs.readFile(stateFile, "utf8")); } catch { return {}; }
}
