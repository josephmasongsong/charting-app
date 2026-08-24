import React from "react";
export function Stepper({ steps }) {
  const color = (s) => (s === "done" ? "var(--success)" : s === "current" ? "var(--bch-gold-500)" : "var(--bch-gray-500)");
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "24px 0", fontFamily: "var(--font-sans)" }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "contents" }}>
          {i > 0 && (
            <div style={{
              flex: "0 0 90px", marginTop: 32,
              borderTop: `2.5px ${steps[i - 1].state === "done" && s.state !== "pending" ? "solid var(--success)" : "dashed #BFBFBF"}`,
            }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 150 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "#fff",
              border: `2.5px solid ${s.state === "pending" ? "var(--border-default)" : color(s.state)}`,
              display: "grid", placeItems: "center", color: color(s.state),
            }}>{s.icon}</div>
            <span style={{ fontSize: 12.5, fontWeight: 700, textDecoration: "underline", color: color(s.state) }}>{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
