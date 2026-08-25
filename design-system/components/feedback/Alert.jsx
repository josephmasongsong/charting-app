import React from "react";
import { Info } from "lucide-react";

const ALERT_STYLES = {
  validation: { background: "var(--danger-surface, #FAF0F1)" },
  destructive: { background: "var(--danger-surface)", borderLeft: "5px solid var(--danger)", color: "var(--danger)", borderRadius: 2 },
  warning: { background: "var(--warning-surface)", color: "var(--warning-text)" },
  notice: { background: "#FBEAEA" },
  empty: { background: "var(--bch-tan-50)", color: "var(--bch-tan-700)", border: "1px solid #F0E6C8" },
};

export function Alert({ variant = "validation", title, children }) {
  return (
    <div role="alert" style={{ padding: "16px 24px", borderRadius: 4, fontSize: 15, marginBottom: 12, fontFamily: "var(--font-sans)", ...ALERT_STYLES[variant] }}>
      {title && (
        <div style={{ fontSize: 21, fontWeight: 700, display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--text-body)", color: "#fff", display: "inline-grid", placeItems: "center", flexShrink: 0 }}>
            <Info size={13} />
          </span>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
