/* Deelbare link: de volledige situatie zit in de URL zelf, er gaat niets naar een server. */
/* --- Deelbare link: de hele situatie zit in de URL zelf, niets op een server. --- */
export function encodeShare(data){
  try{
    const json=JSON.stringify(data);
    const bytes=new TextEncoder().encode(json);
    let bin=""; bytes.forEach((b)=>{ bin+=String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  }catch(e){ return ""; }
}
export function decodeShare(token){
  try{
    const b64=token.replace(/-/g,"+").replace(/_/g,"/");
    const bin=atob(b64+"===".slice((b64.length+3)%4));
    const bytes=Uint8Array.from(bin, (c)=>c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }catch(e){ return null; }
}
export function readShareToken(){
  try{
    const u=new URL(window.location.href);
    return u.searchParams.get("d") || (u.hash.startsWith("#d=") ? u.hash.slice(3) : null);
  }catch(e){ return null; }
}
export function buildShareUrl(token){
  try{
    const u=new URL(window.location.href);
    u.hash=""; u.searchParams.set("d", token);
    return u.toString();
  }catch(e){ return ""; }
}

const nf0 = new Intl.NumberFormat("nl-NL",{maximumFractionDigits:0});
