import React from "react";
import { eur } from "../utils/format.js";

/* Lijngrafiek: besteedbaar inkomen over een reeks werkuren. Overgenomen uit v20. */
export function HoursChart({ points, currentA, currentB, nameA, nameB, parentName }){
  if(!points.length) return null;
  const W=680,H=260,ML=64,MR=18,MT=18,MB=42;
  const xs=points.map(p=>p.uren), ys=points.map(p=>p.besteedbaar);
  const x0=Math.min(...xs), x1=Math.max(...xs);
  const pad=(Math.max(...ys)-Math.min(...ys))*0.15 || 100;
  const y0=Math.min(...ys)-pad, y1=Math.max(...ys)+pad;
  const px=(u)=> ML + (u-x0)/((x1-x0)||1) * (W-ML-MR);
  const py=(v)=> MT + (1-(v-y0)/((y1-y0)||1)) * (H-MT-MB);
  const d=points.map((p,i)=>`${i?"L":"M"}${px(p.uren).toFixed(1)},${py(p.besteedbaar).toFixed(1)}`).join(" ");
  const area=`${d} L${px(x1).toFixed(1)},${(H-MB).toFixed(1)} L${px(x0).toFixed(1)},${(H-MB).toFixed(1)} Z`;
  const ticks=[y0+(y1-y0)*0.15, y0+(y1-y0)*0.5, y0+(y1-y0)*0.85];
  const mark=(u,label,color)=>{
    const p=points.reduce((a,b)=>Math.abs(b.uren-u)<Math.abs(a.uren-u)?b:a);
    return { cx:px(p.uren), cy:py(p.besteedbaar), label, color, val:p.besteedbaar, uren:p.uren };
  };
  const m=[mark(currentA,nameA,"#6D28D9"), mark(currentB,nameB,"#DB2777")];
  return (
    <figure className="chart">
      <figcaption>Besteedbaar per maand als <strong>{parentName}</strong> meer of minder werkt</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" width="100%"
        aria-label={`Grafiek: besteedbaar inkomen per maand bij verschillende werkuren van ${parentName}. Bij ${m[0].uren} uur ${eur(m[0].val)}, bij ${m[1].uren} uur ${eur(m[1].val)}.`}>
        <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.22"/><stop offset="100%" stopColor="#6D28D9" stopOpacity="0"/>
        </linearGradient></defs>
        {ticks.map((t,i)=>(<g key={i}>
          <line x1={ML} y1={py(t)} x2={W-MR} y2={py(t)} stroke="var(--line)" strokeWidth="1"/>
          <text x={ML-10} y={py(t)+4} textAnchor="end" fontSize="11" fill="var(--ink-3)">{eur(t)}</text>
        </g>))}
        <path d={area} fill="url(#cg)"/>
        <path d={d} fill="none" stroke="#6D28D9" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {points.filter((p)=>p.uren%4===0).map((p,i)=>(
          <text key={i} x={px(p.uren)} y={H-MB+20} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{p.uren}u</text>
        ))}
        <text x={(ML+W-MR)/2} y={H-6} textAnchor="middle" fontSize="11" fill="var(--ink-3)">uren per week</text>
        {m.map((k,i)=>(<g key={i}>
          <line x1={k.cx} y1={MT} x2={k.cx} y2={H-MB} stroke={k.color} strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
          <circle cx={k.cx} cy={k.cy} r="6" fill="#fff" stroke={k.color} strokeWidth="3"/>
        </g>))}
      </svg>
      <div className="chartlegend">
        {m.map((k,i)=>(<span key={i}><i style={{background:k.color}}/>{k.label}: {k.uren}u · {eur(k.val)}/mnd</span>))}
      </div>
    </figure>
  );
}
