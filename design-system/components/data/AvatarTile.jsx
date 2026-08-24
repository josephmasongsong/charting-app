import React from "react";

export function AvatarTile({ initials, size = 56 }) {
  return (
    <div style={{ width: size, height: size, background: "var(--action-primary)", color: "#fff", fontSize: size / 3.1, fontWeight: 700, display: "grid", placeItems: "center", borderRadius: "var(--radius-avatar)", fontFamily: "var(--font-sans)" }}>
      {initials}
    </div>
  );
}
