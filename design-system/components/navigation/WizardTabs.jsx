import React from "react";
import { Check } from "lucide-react";
export function WizardTabs({ parts, onSelect }) {
  return (
    <div role="tablist" style={{ display: "flex", background: "var(--surface-muted)", border: "1px solid var(--border-default)", borderRadius: "4px 4px 0 0", overflowX: "auto", fontFamily: "var(--font-sans)" }}>
      {parts.map((p, i) => (
        <button key={p.label} role="tab" aria-selected={p.state === "active"}
          onClick={() => onSelect && onSelect(i)}
          style={{
            padding: "14px 26px", fontSize: 15, whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            border: "none", borderRight: "1px solid var(--border-default)",
            background: p.state === "active" ? "var(--focus-ring)" : p.state === "complete" ? "#fff" : "transparent",
            color: p.state === "active" ? "#fff" : "var(--text-body)",
            fontWeight: p.state === "complete" ? 600 : 400,
          }}>
          {p.label}{p.state === "complete" && <Check size={15} style={{ strokeWidth: 3.5 }} />}
        </button>
      ))}
    </div>
  );
}
