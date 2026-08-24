import React from "react";

const STAT_TONES = {
  red: { border: "var(--bch-red-600)", iconBg: "var(--danger-surface)", iconFg: "var(--bch-red-600)" },
  gold: { border: "var(--bch-gold-600)", iconBg: "#FDF1D3", iconFg: "#B07C0A" },
  blue: { border: "var(--action-primary)", iconBg: "var(--action-selected)", iconFg: "var(--action-primary)" },
  teal: { border: "var(--bch-teal-600)", iconBg: "#DCF2EC", iconFg: "var(--bch-teal-600)" },
};

export function StatCard({ tone = "teal", icon, title, sub }) {
  const t = STAT_TONES[tone];
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border-default)", borderLeft: `4px solid ${t.border}`,
      borderRadius: "var(--radius-card)", padding: 16, display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-sans)",
    }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", background: t.iconBg, color: t.iconFg, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{sub}</div>
      </div>
    </div>
  );
}
