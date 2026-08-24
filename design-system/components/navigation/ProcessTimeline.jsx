import React from "react";
export function ProcessTimeline({ steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", margin: "16px 0", fontFamily: "var(--font-sans)" }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "contents" }}>
          {i > 0 && (
            <div style={{
              flex: "0 0 34px", marginBottom: 18,
              borderTop: `2px solid ${steps[i - 1].state === "done" ? "var(--success)" : "var(--border-default)"}`,
            }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 78 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 12,
              border: `2px solid ${s.state === "done" ? "var(--success)" : s.state === "current" ? "var(--surface-sidebar)" : "var(--border-default)"}`,
              background: s.state === "done" ? "var(--success)" : "#fff",
              color: s.state === "done" ? "#fff" : s.state === "current" ? "var(--surface-sidebar)" : "var(--bch-gray-500)",
              fontWeight: s.state === "current" ? 700 : 400,
            }}>
              {s.state === "done" ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
