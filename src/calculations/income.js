import { WPM } from "../utils/format.js";
import { incomeTax, ahk, arb, iack } from "./tax.js";
import { nettoBijtelling } from "./car.js";
import { calculateChildcare } from "./childcare.js";

/* Kern van de calculator: netto inkomen, opvangkosten, toeslag en besteedbaar bedrag
   voor één scenario. Inkomens-/belastingdeel ongewijzigd overgenomen uit v20.
   De kinderopvangberekening zelf is verplaatst naar calculations/childcare.js,
   zodat "Kinderopvangkosten" exact dezelfde regels gebruikt — geen dubbele logica. */
export function calculateScenario({ parents, vakantiegeld, dertiende, children, hours, si }){
  const maanden = dertiende ? 13 : 12;
  const annual = parents.map((p,i)=> p.bruto*(hours[i]/p.uren)*maanden*(1+vakantiegeld));
  const minAnnual = Math.min(...annual);
  const leastIdx = annual.indexOf(minAnnual);
  const nets = parents.map((p,i)=>{ const y=annual[i]; const credits=ahk(y)+arb(y)+(i===leastIdx?iack(y):0); return y-Math.max(0,incomeTax(y)-credits); });
  const nettoSamenMnd = nets.reduce((a,b)=>a+b,0)/12;
  const carNet = parents.reduce((s,p)=>s+nettoBijtelling(p.car),0);
  const toetsingsinkomen = annual.reduce((a,b)=>a+b,0)+carNet;
  const minParentHours = Math.min(...hours);

  const childrenVoorEngine = children.map((c)=>({
    opvang: (c.opvang||[]).map((o)=>({
      type:o.type, uurtarief:o.uurtarief, urenPerDag:o.urenPerDag,
      dagenPerWeek:o.days?.[si]??0, underKOT:o.underKOT,
    })),
  }));
  const cc = calculateChildcare({ children:childrenVoorEngine, toetsingsinkomen, minParentHoursPerWeek:minParentHours });

  return {
    nettoSamenMnd, toetsingsinkomen, pctFirst:cc.vergoedingspercentageEersteKind,
    opvangkosten:cc.opvangkostenPerMaand, toeslag:cc.toeslagPerMaand, eigenBijdrage:cc.eigenBijdragePerMaand,
    besteedbaar:nettoSamenMnd-cc.eigenBijdragePerMaand, werkurenMnd:hours.reduce((a,b)=>a+b,0)*WPM,
    hasSubsidie:cc.heeftGemeentesubsidie,
  };
}
