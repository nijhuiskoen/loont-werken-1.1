import React from "react";

/* Eén regel in een resultaatkaart. Overgenomen uit v20. */
export function SRow({ label, value, tone, total }){
  return (
    <div className={`srow${total?" total":""}`}>
      <span className="k">{label}</span>
      <span className={`v num${tone?" "+tone:""}`}>{value}</span>
    </div>
  );
}
