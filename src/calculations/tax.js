import { TAX } from "../data/2026/tax.js";

/* Inkomstenbelasting box 1 en heffingskortingen.
   Logica ongewijzigd overgenomen uit v20. */

export function incomeTax(y){ if(y<=TAX.s1) return TAX.t1*y; if(y<=TAX.s2) return TAX.t1*TAX.s1+TAX.t2*(y-TAX.s1); return TAX.t1*TAX.s1+TAX.t2*(TAX.s2-TAX.s1)+TAX.t3*(y-TAX.s2); }

export const ahk=(y)=>Math.max(0, y<=TAX.ahkDrempel?TAX.ahkMax:TAX.ahkMax-TAX.ahkAfbouw*(y-TAX.ahkDrempel));

/* Arbeidskorting 2026 — officiële schijventabel Belastingdienst (nog niet AOW-gerechtigd). */
export const arb=(y)=>{
  if(y<=0) return 0;
  if(y<=11965) return 0.08324*y;
  if(y<=25845) return 996 + 0.31009*(y-11965);
  if(y<=45592) return 5300 + 0.01950*(y-25845);
  if(y<=TAX.arbNul) return Math.max(0, TAX.arbMax - TAX.arbAfbouw*(y-TAX.arbStart));
  return 0;
};

export const iack=(y)=>Math.min(TAX.iackMax,Math.max(0,TAX.iackOpbouw*(y-TAX.iackDrempel)));

/*
 * Bijzonder tarief (voor 13e maand, bonus, gratificatie e.d.).
 *
 * De Belastingdienst publiceert hiervoor een aparte "tabel bijzondere
 * beloningen" (PDF, per jaar/leeftijd/LHK-variant). Die tabel is in essentie
 * het MARGINALE tarief op je herleide jaarloon: hoeveel belasting je zou
 * betalen over een euro extra op dat inkomen, inclusief het effect van de
 * afbouw van heffingskortingen. Omdat we die marginale rekenregel al hebben
 * (incomeTax/ahk/arb, dezelfde bronnen als de rest van deze rekenlaag),
 * leiden we het percentage hieruit af in plaats van de losse PDF-tabel over
 * te typen — zo blijft het gegarandeerd consistent met onze eigen schijven.
 *
 * Dit is een BEREKENDE BENADERING van de officiële tabel, geen letterlijke
 * kopie: de Belastingdienst werkt met vaste inkomensschijven (afgeronde
 * percentages per bandbreedte), wat een paar tiende procent kan schelen met
 * onze doorlopende curve. Vandaar de disclaimer in de UI.
 */
export function calculateBijzonderTarief(jaarloon, loonheffingskorting){
  const net = (y)=> incomeTax(y) - (loonheffingskorting ? (ahk(y)+arb(y)) : 0);
  const marginaal = net(jaarloon+1) - net(jaarloon);
  return Math.max(0, Math.min(0.60, marginaal));
}
