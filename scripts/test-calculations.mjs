import assert from "node:assert/strict";
import { incomeTax, ahk, arb, iack, calculatePension } from "../src/calculations/meerMinderWerken.js";
import { TAX_2026 } from "../src/data/2026/meerMinderWerken.js";

assert.equal(TAX_2026.s1, 38883);
assert.equal(incomeTax(0), 0);
assert.equal(Math.round(incomeTax(38883)), 13901);
assert.equal(ahk(29736), 3115);
assert.equal(ahk(78426), 0);
assert.equal(Math.round(arb(11965)), 996);
assert.equal(iack(6239), 0);
assert.equal(iack(33000), 3032);

const pension = calculatePension({
  regeling: "middelloon",
  pensioengevendFT: 60000,
  franchise: 19172,
  opbouwPct: 0.01875,
  premiePct: 0,
  fulltimeUren: 40,
  urenNu: 40,
  urenAlt: 32,
  geboortejaar: 1990,
});
assert.equal(Math.round(pension.dtfNu * 100), 100);
assert.equal(Math.round(pension.dtfAlt * 100), 80);
assert.ok(pension.verschilPerJaar < 0);

console.log("Calculation smoke tests passed.");
