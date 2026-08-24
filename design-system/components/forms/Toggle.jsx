import React from "react";

export function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-sans)" }}>
      <button role="switch" aria-checked={checked} onClick={() => onChange && onChange(!checked)}
        style={{
          position: "relative", width: 40, height: 20, borderRadius: 10, border: "none",
          cursor: "pointer", background: checked ? "var(--action-primary)" : "var(--bch-gray-500)", transition: "background .15s", flexShrink: 0,
        }}>
        <span style={{
          position: "absolute", top: 3, left: checked ? 22 : 4, width: 14, height: 14,
          borderRadius: "50%", background: "#fff", transition: "left .15s",
        }} />
      </button>
      <span style={{ fontSize: 14.5 }}>{label ?? (checked ? "On" : "Off")}</span>
    </div>
  );
}
