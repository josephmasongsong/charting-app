import React from "react";
export const inputBaseStyle = {
  width: "100%", fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--text-body)",
  border: "1px solid var(--border-input)", borderRadius: "var(--radius-input)", padding: "7px 10px", background: "#fff",
  outlineOffset: -1,
};
export function Input(props) { return <input style={inputBaseStyle} {...props} />; }
