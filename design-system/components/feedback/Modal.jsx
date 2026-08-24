import React from "react";
import { X } from "../../assets/icons.jsx";

export function Modal({ open, onClose, title, footer, children, center }) {
  if (!open) return null;
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,48,50,.45)", display: "grid", placeItems: "center", zIndex: 100, padding: 16 }}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: "var(--radius-card)", overflow: "hidden", width: "min(560px,100%)", boxShadow: "var(--shadow-modal)", fontFamily: "var(--font-sans)" }}>
        <div style={{ background: "var(--surface-chrome)", color: "#fff", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ fontSize: 21, fontWeight: 700, margin: 0 }}>{title}</h4>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", lineHeight: 1, opacity: .9 }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 24, fontSize: 15, textAlign: center ? "center" : "left" }}>{children}</div>
        {footer && <div style={{ display: "flex", justifyContent: center ? "center" : "flex-end", gap: 12, padding: "0 24px 24px" }}>{footer}</div>}
      </div>
    </div>
  );
}
