import React from "react";

export function RequiredLabel({ children, required, bold, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontSize: 15, marginBottom: 6, fontWeight: bold ? 700 : 400, fontFamily: "var(--font-sans)", color: "var(--text-body)" }}>
      {children}{required && <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>}
    </label>
  );
}
