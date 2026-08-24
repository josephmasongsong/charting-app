import React from "react";
import { BrandMark } from "./BrandMark.jsx";
export function AppHeader({ variant = "teal", right }) {
  const bg = { teal: "var(--surface-chrome)", blue: "var(--action-primary)", dark: "var(--surface-chrome-dark)" }[variant];
  return (
    <div style={{ background: bg, color: "#fff", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", fontFamily: "var(--font-sans)" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 17, letterSpacing: ".3px" }}>
        <BrandMark dark={bg} /> BC HOUSING
      </span>
      {right}
    </div>
  );
}
