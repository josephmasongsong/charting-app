import React from "react";

export function Listbox({ options, value, onChange }) {
  return (
    <div role="listbox" style={{ border: "1px solid var(--border-input)", borderRadius: "var(--radius-input)", maxWidth: 240, background: "#fff", fontSize: 14.5, fontFamily: "var(--font-sans)" }}>
      {options.map((o) => (
        <div key={o} role="option" aria-selected={o === value} onClick={() => onChange && onChange(o)}
          style={{ padding: "7px 10px", cursor: "pointer", background: o === value ? "var(--action-primary)" : "transparent", color: o === value ? "#fff" : "var(--text-body)" }}>
          {o}
        </div>
      ))}
    </div>
  );
}
