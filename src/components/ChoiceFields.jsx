import React from "react";

/* Keuzevelden als toegankelijke radiogroepen. Overgenomen uit v20. */
export function RadioPills({ legend, name, options, value, onChange }){
  return (
    <div className="rg" role="radiogroup" aria-label={legend}>
      <span className="rg-label">{legend}</span>
      <div className="rg-pills">
        {options.map((o)=>(
          <label className="opt pill" key={o}>
            <input type="radio" name={name} checked={value===o} onChange={()=>onChange(o)} />
            <span className="box">{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
export function RadioTiles({ legend, name, options, value, onChange }){
  return (
    <div className="rg" role="radiogroup" aria-label={legend}>
      <span className="rg-label">{legend}</span>
      <div className="rg-grid">
        {options.map((o)=>(
          <label className="opt tile" key={o.value}>
            <input type="radio" name={name} checked={value===o.value} onChange={()=>onChange(o.value)} />
            <span className="box"><span className="t">{o.label}</span><span className="s">{o.sub}</span></span>
          </label>
        ))}
      </div>
    </div>
  );
}
