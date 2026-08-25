import React from "react";
import { Home } from "lucide-react";
export function DevelopmentItem({ dev }) {
  const badge = dev.status === "Operational"
    ? { background: "#DCF2EC", color: "var(--bch-teal-600)" }
    : { background: "#FDF1D3", color: "#B07C0A" };
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--bch-gray-200)", fontFamily: "var(--font-sans)" }}>
      <div style={{ width: 44, height: 44, borderRadius: "var(--radius-avatar)", background: "var(--bch-teal-600)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Home size={19} />
      </div>
      <div style={{ minWidth: 0 }}>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 14.5, fontWeight: 700, color: "var(--action-primary)" }}>{dev.name}</a>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{dev.address} · {dev.units} units</div>
      </div>
      <span style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 10, whiteSpace: "nowrap", ...badge }}>
        {dev.status}
      </span>
    </div>
  );
}
