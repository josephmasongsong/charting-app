import React from "react";
import { AvatarTile } from "./AvatarTile.jsx";
import { Upload, UserCog, Bell, TriangleAlert, Newspaper, Mail, Users, PenLine, FolderPlus, Check, Info, Lock, MessageSquare, Phone, User, Calendar, Package, Clock } from "lucide-react";

const ICONS = { Upload, UserCog, Bell, TriangleAlert, Newspaper, Mail, Users, PenLine, FolderPlus, Check, Info, Lock, MessageSquare, Phone, User, Calendar, Package, Clock };

const TONES = {
  warning: { bg: "var(--warning-surface)", fg: "var(--warning-text)" },
  danger: { bg: "var(--danger-surface)", fg: "var(--danger)" },
  info: { bg: "var(--action-selected)", fg: "var(--action-primary)" },
  success: { bg: "var(--bch-green-50, #EDF6EF)", fg: "var(--success)" },
  teal: { bg: "#E3F3F0", fg: "var(--bch-teal-700)" },
  neutral: { bg: "var(--bch-gray-100)", fg: "var(--text-muted)" },
};

function resolveIcon(icon, size, style) {
  if (!icon) return null;
  if (typeof icon === "string") {
    const C = ICONS[icon];
    return C ? <C size={size} style={style} /> : null;
  }
  return React.isValidElement(icon) ? icon : React.createElement(icon, { size, style });
}

function TypeChip({ type }) {
  const tone = TONES[type.tone] || TONES.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: tone.bg, color: tone.fg, borderRadius: 999, padding: "2px 9px 2px 7px", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {resolveIcon(type.icon, 12)}{type.label}
    </span>
  );
}

function ActivityRow({ item, avatarSize }) {
  const tone = TONES[item.tone] || TONES.warning;
  const Wrap = item.href ? "a" : "div";
  const wrapProps = item.href
    ? { href: item.href, style: { display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", borderBottom: "1px solid var(--bch-gray-200)", textDecoration: "none", color: "inherit" } }
    : { style: { display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", borderBottom: "1px solid var(--bch-gray-200)" } };
  return (
    <Wrap {...wrapProps}>
      {item.initials
        ? <AvatarTile initials={item.initials} size={avatarSize} />
        : <div style={{ width: avatarSize, height: avatarSize, borderRadius: "var(--radius-avatar)", background: tone.bg, color: tone.fg, display: "grid", placeItems: "center", flexShrink: 0 }}>
            {resolveIcon(item.icon || "TriangleAlert", Math.round(avatarSize / 2))}
          </div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {item.type ? <TypeChip type={item.type} /> : null}
          <span style={{ fontSize: 13.5, color: item.href ? "var(--action-primary)" : "var(--text-body)", textWrap: "pretty" }}>
            {item.actor ? <><b>{item.actor}</b>{" "}</> : null}{item.action}{item.target ? <> <b>{item.target}</b></> : null}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{item.time}</div>
      </div>
    </Wrap>
  );
}

export function ActivityFeed({
  title = "Activity", meta, groups = [], items = null, pageSize = 2, initialCount = 2,
  avatarSize = 32, emptyLabel = "You're all caught up", width = 380, onLoadMore,
}) {
  const flat = Array.isArray(items);
  const list = flat ? [{ items }] : groups;
  const [visible, setVisible] = React.useState(initialCount);
  const hasMore = list.some((g) => visible < (g.items || []).length);
  const shown = flat ? Math.min(visible, items.length) : 0;
  const loadMore = () => {
    const next = visible + pageSize;
    setVisible(next);
    if (onLoadMore) onLoadMore(next);
  };
  return (
    <div style={{ width, background: "var(--surface-card)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-card)", fontFamily: "var(--font-sans)", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-body)" }}>{title}</h4>
        {meta ? <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{meta}</span> : null}
      </div>
      {list.map((group, gi) => (
        <div key={gi}>
          {group.label
            ? <div style={{ padding: "8px 16px", background: "var(--surface-muted)", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border-default)" }}>
                {resolveIcon(group.icon, 15, { color: "var(--bch-teal-700)" })}
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".03em", color: "var(--text-muted)", textTransform: "uppercase" }}>{group.label}</span>
              </div>
            : null}
          {(group.items || []).slice(0, visible).map((item, i) => (
            <ActivityRow key={i} item={item} avatarSize={avatarSize} />
          ))}
        </div>
      ))}
      {hasMore
        ? <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <button onClick={loadMore} style={{ width: "100%", background: "#fff", color: "var(--action-primary)", border: "1px solid var(--action-primary)", borderRadius: "var(--radius-control)", padding: "8px 14px", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Load more</button>
            {flat ? <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Showing {shown} of {items.length}</span> : null}
          </div>
        : <div style={{ padding: "14px 16px", textAlign: "center", fontSize: 12.5, color: "var(--text-muted)" }}>{emptyLabel}</div>}
    </div>
  );
}
