import React, { useState } from "react";
import { ChevronDown, ChevronRight, Newspaper, Headset, TriangleAlert, Mail, Contact, UserCog } from "lucide-react";

export function SideItem({ icon, label, active, indent, chevron, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: indent ? "9px 16px 9px 34px" : "11px 16px",
        fontSize: indent ? 13.5 : 14.5, color: "#fff", textAlign: "left",
        background: active ? (indent ? "rgba(255,255,255,.15)" : "var(--surface-chrome)") : (hover ? "rgba(255,255,255,.10)" : "transparent"),
        fontWeight: active ? 600 : 400,
        border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
      }}>
      {icon}{label}
      {chevron === "down" && <ChevronDown size={13} style={{ marginLeft: "auto" }} />}
      {chevron === "right" && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
    </button>
  );
}

export function Sidebar({ activeItem, onSelect }) {
  const [orOpen, setOrOpen] = useState(true);
  const sub = ["Questionnaire", "Standards and Elements", "Declaration", "Site Visits", "Action Plan", "Appeal"];
  return (
    <nav aria-label="Main" style={{ width: 232, flexShrink: 0, background: "var(--surface-sidebar)", color: "#fff", padding: "12px 0" }}>
      <SideItem icon={<Newspaper size={17} />} label="Operational Review" chevron={orOpen ? "down" : "right"} onClick={() => setOrOpen(!orOpen)} />
      {orOpen && (
        <div style={{ background: "var(--surface-chrome)", margin: "2px 10px", borderRadius: 4, padding: "6px 0" }}>
          {sub.map((s) => <SideItem key={s} label={s} indent active={activeItem === s} onClick={() => onSelect && onSelect(s)} />)}
        </div>
      )}
      <SideItem icon={<Headset size={17} />} label="Support" chevron="right" />
      <SideItem icon={<TriangleAlert size={17} />} label="Escalation" />
      <SideItem icon={<Mail size={17} />} label="Mailbox" />
      <SideItem icon={<Contact size={17} />} label="Contacts" />
      <SideItem icon={<UserCog size={17} />} label="Manage Users" />
    </nav>
  );
}
