import React, { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { nf0 } from "../utils/format.js";

/* Invoervelden. Overgenomen uit v20: leegmaakbare getalvelden met duizendtalnotatie,
   percentageveld met decimalen en een plus/min-stepper. */
export function NumField({ id, value, onCommit, ariaLabel, className="control num", group, allowDecimal, autoFocus, placeholder }){
  const fmt=(v)=>{ if(v===0||v==null||Number.isNaN(v)) return ""; return group?nf0.format(v):String(v); };
  const [txt,setTxt]=useState(fmt(value));
  const [foc,setFoc]=useState(false);
  useEffect(()=>{ if(!foc) setTxt(fmt(value)); },[value,foc]);
  const handle=(e)=>{
    if(group){
      const digits=e.target.value.replace(/\D/g,"");
      const n=digits?parseInt(digits,10):0;
      setTxt(digits?nf0.format(n):"");
      onCommit(n);
    } else {
      const clean=e.target.value.replace(allowDecimal?/[^0-9.,]/g:/[^0-9]/g,"");
      setTxt(clean);
      const n=parseFloat(clean.replace(",","."));
      onCommit(Number.isFinite(n)?n:0);
    }
  };
  return <input id={id} aria-label={ariaLabel} className={className} type="text"
    inputMode={allowDecimal?"decimal":"numeric"} autoFocus={autoFocus} placeholder={placeholder}
    value={txt} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} onChange={handle}
      onKeyDown={(e)=>{ if(e.key==="Enter"){ e.preventDefault(); e.currentTarget.blur(); } }} enterKeyHint="done" />;
}
export function Euro({ id, value, onChange, autoFocus, sm }){
  return (
    <div className={"euro"+(sm?" sm":"")}>
      <span className="sign" aria-hidden="true">€</span>
      <NumField id={id} className="euro-in" value={value} onCommit={onChange} autoFocus={autoFocus} group placeholder="0" />
      <span className="per" aria-hidden="true">/mnd</span>
    </div>
  );
}
export function Pct({ id, value, onChange, ariaLabel }){
  return (
    <div className="pctbox">
      <NumField id={id} className="pct-in" allowDecimal value={value} onCommit={onChange} ariaLabel={ariaLabel} placeholder="0" />
      <span className="pct-sign" aria-hidden="true">%</span>
    </div>
  );
}
export function Stepper({ label, value, onChange, step=1, min=0, max=80 }){
  const dec=()=>onChange(Math.max(min, Math.round((value-step)*100)/100));
  const inc=()=>onChange(Math.min(max, Math.round((value+step)*100)/100));
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`${label}: verlagen`} onClick={dec}><Minus size={16} aria-hidden="true"/></button>
      <input type="number" inputMode="numeric" className="num" aria-label={label} value={value}
        onChange={(e)=>onChange(Math.max(min,Math.min(max,parseFloat(e.target.value)||0)))} />
      <button type="button" aria-label={`${label}: verhogen`} onClick={inc}><Plus size={16} aria-hidden="true"/></button>
    </div>
  );
}
