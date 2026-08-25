import React from "react";
import { AvatarTile } from "./AvatarTile.jsx";
import { Phone, MessageSquare } from "lucide-react";

export function StaffRow({ person, selected, striped }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "72px 1.1fr 1.4fr 1.4fr .8fr 70px", gap: 12,
      alignItems: "center", padding: "12px 16px", fontSize: 14.5, fontFamily: "var(--font-sans)",
      borderBottom: "1px solid var(--bch-gray-200)",
      background: selected ? "var(--action-selected)" : striped ? "var(--surface-muted)" : "#fff",
      boxShadow: selected ? "inset 4px 0 0 var(--action-primary)" : "none",
    }}>
      <AvatarTile initials={person.initials} />
      <div><b>{person.name}</b><div style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{person.title}</div></div>
      <div>{person.dept}<div style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{person.branch}</div></div>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--action-primary)" }}>{person.email}</a>
      <div style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{person.phone}</div>
      <div style={{ display: "flex", gap: 10, color: "var(--action-primary)" }}><Phone size={17} /><MessageSquare size={17} /></div>
    </div>
  );
}
