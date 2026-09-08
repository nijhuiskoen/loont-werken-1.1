/*
 * Bewaren van de ingevulde gegevens op het apparaat van de gebruiker.
 * Er gaat niets naar een server.
 *
 * Gebruikt window.storage wanneer die beschikbaar is (artifact-omgeving) en
 * anders localStorage (normale browser/Vite-build). Valt stil terug als geen
 * van beide werkt, bijvoorbeeld in privé-modus.
 */
const STORE_KEY = "loont-werken:v1";

export async function saveState(data){
  const json = JSON.stringify(data);
  try{
    if(typeof window!=="undefined" && window.storage){ await window.storage.set(STORE_KEY, json); return true; }
  }catch(e){}
  try{
    if(typeof window!=="undefined" && window.localStorage){ window.localStorage.setItem(STORE_KEY, json); return true; }
  }catch(e){}
  return false;
}

export async function loadState(){
  try{
    if(typeof window!=="undefined" && window.storage){
      const r = await window.storage.get(STORE_KEY);
      if(r && r.value) return JSON.parse(r.value);
    }
  }catch(e){}
  try{
    if(typeof window!=="undefined" && window.localStorage){
      const v = window.localStorage.getItem(STORE_KEY);
      if(v) return JSON.parse(v);
    }
  }catch(e){}
  return null;
}

export async function clearState(){
  try{ if(typeof window!=="undefined" && window.storage) await window.storage.delete(STORE_KEY); }catch(e){}
  try{ if(typeof window!=="undefined" && window.localStorage) window.localStorage.removeItem(STORE_KEY); }catch(e){}
}
