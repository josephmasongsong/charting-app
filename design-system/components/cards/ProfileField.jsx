import React from "react";
export function ProfileField({ label, children }) {
  return (
    <div style={{ marginBottom: 16, fontFamily: "var(--font-sans)" }}>
      <b style={{ display: "block", fontSize: 16, marginBottom: 2 }}>{label}</b>
      <span style={{ fontSize: 14.5, color: "var(--text-muted)" }}>{children}</span>
    </div>
  );
}
