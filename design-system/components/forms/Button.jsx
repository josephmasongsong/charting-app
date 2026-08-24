import React from "react";

const VARIANTS = {
  primary: { background: "var(--action-primary)", color: "#fff" },
  outline: { background: "#fff", color: "var(--action-primary)", borderColor: "var(--action-primary)" },
  teal: { background: "var(--surface-chrome)", color: "#fff" },
  soft: { background: "#6FC7E8", color: "#fff" },
  destructive: { background: "var(--danger)", color: "#fff" },
};
const HOVER = {
  primary: "var(--action-primary-hover)",
  outline: "var(--action-selected)",
  teal: "var(--surface-chrome-dark)",
  soft: "#58B8DD",
  destructive: "#98060D",
};

export function Button({ variant = "primary", disabled, children, onClick, style, type = "button" }) {
  const [hover, setHover] = React.useState(false);
  const base = {
    fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 400, borderRadius: "var(--radius-control)",
    padding: "8px 18px", cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex", alignItems: "center", gap: 8,
    border: "1px solid transparent", transition: "background .15s",
  };
  const dis = disabled ? { background: "var(--action-primary-disabled)", color: "#fff", borderColor: "transparent" } : {};
  const hoverStyle = hover && !disabled ? { background: HOVER[variant] } : {};
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, ...VARIANTS[variant], ...hoverStyle, ...dis, ...style }}>
      {children}
    </button>
  );
}
