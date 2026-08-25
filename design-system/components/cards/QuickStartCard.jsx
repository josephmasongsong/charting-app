import React from "react";
import { Calendar, Package, Newspaper, Users, PenLine, FolderPlus, Upload, Bell, Home, Search, Mail, Plus, ChevronRight } from "lucide-react";

const ICONS = { Calendar, Package, Newspaper, Users, PenLine, FolderPlus, Upload, Bell, Home, Search, Mail, Plus };

function resolveIcon(icon, size) {
  if (!icon) return null;
  if (typeof icon === "string") { const C = ICONS[icon]; return C ? <C size={size} /> : null; }
  return React.isValidElement(icon) ? icon : React.createElement(icon, { size });
}

export function QuickStartCard({ title = "What would you like to do today?", actions = [], items = [], sub }) {
  const rich = items.length > 0;
  return (
    <div style={{ background: "var(--bch-teal-600)", color: "#fff", borderRadius: "var(--radius-card)", padding: 24, maxWidth: rich ? 340 : 300, boxShadow: "var(--shadow-card)", fontFamily: "var(--font-sans)" }}>
      <h4 style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>{title}</h4>
      {sub ? <p style={{ margin: "4px 0 0", fontSize: 13, opacity: .85 }}>{sub}</p> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {rich
          ? items.map((it) => (
              <button key={it.label || it.title} style={{
                display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%",
                background: "#fff", color: "var(--text-body)", border: "none", borderRadius: "var(--radius-control)",
                padding: "11px 12px", fontFamily: "var(--font-sans)", cursor: "pointer",
              }}>
                <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "var(--radius-control)", background: "var(--action-selected)", color: "var(--action-primary)", display: "grid", placeItems: "center" }}>
                  {resolveIcon(it.icon, 18)}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: "var(--text-body)" }}>{it.label || it.title}</span>
                  {it.sub ? <span style={{ display: "block", fontSize: 12.5, color: "var(--text-muted)", marginTop: 1 }}>{it.sub}</span> : null}
                </span>
                <ChevronRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              </button>
            ))
          : actions.map((a) => (
              <button key={a} style={{
                background: "#fff", color: "var(--surface-chrome)", border: "none", borderRadius: 4,
                padding: "9px 14px", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>{a}</button>
            ))}
      </div>
    </div>
  );
}
