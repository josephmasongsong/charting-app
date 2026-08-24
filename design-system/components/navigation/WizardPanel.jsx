import React from "react";
export function WizardPanel({ title, footer, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border-default)", borderTop: "none", padding: 24, fontFamily: "var(--font-sans)" }}>
      <div style={{ fontSize: 24, fontWeight: 700, paddingBottom: 16, borderBottom: "1px solid var(--bch-gray-200)", marginBottom: 16 }}>{title}</div>
      {children}
      {footer && <div style={{ borderTop: "1px solid var(--bch-gray-200)", marginTop: 24, paddingTop: 16, display: "flex", gap: 12 }}>{footer}</div>}
    </div>
  );
}
