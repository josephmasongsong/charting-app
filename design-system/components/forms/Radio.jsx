import React from "react";
export function Radio({ label, ...props }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 15, fontFamily: "var(--font-sans)", cursor: "pointer" }}>
      <input type="radio" style={{ width: 16, height: 16, marginTop: 3, accentColor: "var(--action-primary)", cursor: "pointer" }} {...props} />
      <span>{label}</span>
    </label>
  );
}
