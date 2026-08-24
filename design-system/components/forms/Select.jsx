import React, { useState } from "react";
import { inputBaseStyle } from "./Input.jsx";
import { ChevronDown } from "../../assets/icons.jsx";
export function Select({ children, style, onFocus, onBlur, ...props }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block", width: "100%" }}>
      <select
        style={{
          ...inputBaseStyle, appearance: "none", WebkitAppearance: "none", paddingRight: 34, cursor: "pointer",
          accentColor: "var(--action-primary)", colorScheme: "light",
          borderColor: open ? "var(--action-primary)" : inputBaseStyle.border.split(" ")[2],
          boxShadow: open ? "0 0 0 3px var(--action-selected)" : "none",
          transition: "border-color .15s, box-shadow .15s",
          ...style,
        }}
        onFocus={(e) => { setOpen(true); onFocus && onFocus(e); }}
        onBlur={(e) => { setOpen(false); onBlur && onBlur(e); }}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} style={{
        position: "absolute", right: 10, top: "50%", pointerEvents: "none",
        color: open ? "var(--action-primary)" : "var(--bch-gray-500)",
        transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
        transition: "transform .15s, color .15s",
      }} />
    </span>
  );
}
