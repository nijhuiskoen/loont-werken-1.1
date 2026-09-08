/* Getal- en geldnotatie (nl-NL). Ongewijzigd overgenomen uit v20. */
export const eur=(n,d=0)=>new Intl.NumberFormat("nl-NL",{style:"currency",currency:"EUR",minimumFractionDigits:d,maximumFractionDigits:d}).format(isFinite(n)?n:0);
export const nf0 = new Intl.NumberFormat("nl-NL",{maximumFractionDigits:0});
export const WPM = 52 / 12;   // gemiddelde weken per maand
