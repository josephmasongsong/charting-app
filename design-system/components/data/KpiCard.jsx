import React from "react";
export function KpiCard({ value, label, tint }) {
  return (
    <div style={{ background: tint ? "var(--bch-teal-500)" : "var(--surface-chrome)", color: "#fff", textAlign: "center", padding: 16, boxShadow: "var(--shadow-card)", fontFamily: "var(--font-sans)" }}>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: ".5px" }}>{value}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );
}
