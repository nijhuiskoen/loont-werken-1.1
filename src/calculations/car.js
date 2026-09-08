/* Bijtelling auto van de zaak. Logica ongewijzigd overgenomen uit v20. */

export const brutoBijtelling=(c)=>c.enabled?c.pctLow*Math.min(c.cataloguswaarde,30000)+c.pctHigh*Math.max(0,c.cataloguswaarde-30000):0;

export const nettoBijtelling=(c)=>c.enabled?Math.max(0,brutoBijtelling(c)-c.eigenBijdrage*12):0;
