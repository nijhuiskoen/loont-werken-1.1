import { KOT, VNG_PEUTER } from "../data/2026/childcare.js";

/* Kinderopvangtoeslagpercentage en VNG-ouderbijdrage. Logica ongewijzigd uit v20. */
export function kotPct(income){ let r=KOT[0]; for(const x of KOT) if(income>=x[0]) r=x; return {first:r[1], next:r[2]}; }
export function vngBijdrage(income){ let r=VNG_PEUTER[0]; for(const x of VNG_PEUTER) if(income>=x[0]) r=x; return { first:r[1], next:r[2] }; }
