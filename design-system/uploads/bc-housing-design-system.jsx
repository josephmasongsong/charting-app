import { useState } from "react";
import {
  Check, X, Info, Lock, Users, PenLine, Plus, FolderPlus, Phone, MessageSquare,
  Newspaper, Headset, TriangleAlert, Mail, ChevronDown, ChevronRight,
  Home, Scale, Contact, UserCog,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
} from "recharts";

/* ============================================================
   BC HOUSING DESIGN TOKENS
   Sampled from production screenshots (Feedback Forms,
   PartnerHub, Branch Planning, Staff Directory, Power BI)

   v2 correction: PartnerHub chrome originally sampled at
   #003032/#014035 was dimmed by a modal backdrop. True
   surfaces: top nav #006265, sidebar #00866E.
   ============================================================ */
const T = {
  teal950: "#003032", teal700: "#006265",
  teal600: "#00866E", teal500: "#338185", seafoam: "#41C6A5",
  sidebar: "#00866E",
  blue700: "#005EA8", blue600: "#0073CE", blue100: "#BDD2ED",
  blue50: "#E2F6FF", tabBlue: "#2B5CE6",
  red700: "#BA0F17", red600: "#E70000", red100: "#FFE3E5", red50: "#FAF0F1",
  yellow50: "#FCF6DE", yellow800: "#856404",
  tan50: "#FDF8E7", tan700: "#8A7A3B",
  green600: "#28A745", green500: "#16A660",
  gold500: "#E9B949", gold400: "#FAC747", gold600: "#E9A800",
  sky400: "#60BDFF", tealLight: "#7FD1C0",
  ink: "#212529", gray700: "#495057", gray500: "#7E7E7E",
  gray300: "#DEE2E6", gray200: "#E6E6E6", gray100: "#F5F5F5", gray50: "#FAFAFA",
};
const FONT = `"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`;

/* ============================================================
   PRIMITIVES
   ============================================================ */

// ---- Button -------------------------------------------------
// variant: "primary" | "outline" | "teal" | "soft" | "destructive"
function Button({ variant = "primary", disabled, children, onClick, style }) {
  const base = {
    fontFamily: FONT, fontSize: 15, fontWeight: 400, borderRadius: 4,
    padding: "8px 18px", cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex", alignItems: "center", gap: 8,
    border: "1px solid transparent", transition: "background .15s",
  };
  const variants = {
    primary: { background: T.blue600, color: "#fff" },
    outline: { background: "#fff", color: T.blue600, borderColor: T.blue600 },
    teal: { background: T.teal700, color: "#fff" },
    soft: { background: "#6FC7E8", color: "#fff" },
    destructive: { background: T.red700, color: "#fff" },
  };
  const cls = { primary: "bch-btn-pri", outline: "bch-btn-out", teal: "bch-btn-teal", soft: "bch-btn-soft", destructive: "bch-btn-des" }[variant];
  const dis = disabled ? { background: T.blue100, color: "#fff", borderColor: "transparent" } : {};
  return (
    <button className={cls} disabled={disabled} onClick={onClick}
      style={{ ...base, ...variants[variant], ...dis, ...style }}>
      {children}
    </button>
  );
}

// ---- Required label + inputs -------------------------------
function RequiredLabel({ children, required, bold, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontSize: 15, marginBottom: 6, fontWeight: bold ? 700 : 400 }}>
      {children}{required && <span style={{ color: T.red700, marginLeft: 2 }}>*</span>}
    </label>
  );
}

const inputStyle = {
  width: "100%", fontFamily: FONT, fontSize: 15, color: T.ink,
  border: "1px solid #767676", borderRadius: 2, padding: "7px 10px", background: "#fff",
};
function Input(props) { return <input className="bch-input" style={inputStyle} {...props} />; }
function Textarea(props) { return <textarea className="bch-input" style={{ ...inputStyle, minHeight: 96, resize: "vertical" }} {...props} />; }
function Select({ children, ...props }) { return <select className="bch-input" style={inputStyle} {...props}>{children}</select>; }

function Radio({ label, ...props }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 15, cursor: "pointer" }}>
      <input type="radio" style={{ width: 16, height: 16, marginTop: 3, accentColor: T.blue600, cursor: "pointer" }} {...props} />
      <span>{label}</span>
    </label>
  );
}
function Checkbox({ label, ...props }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 15, cursor: "pointer" }}>
      <input type="checkbox" style={{ width: 16, height: 16, marginTop: 3, accentColor: T.blue600, cursor: "pointer" }} {...props} />
      <span>{label}</span>
    </label>
  );
}

// ---- Alert --------------------------------------------------
// variant: "validation" | "destructive" | "warning" | "notice" | "empty"
function Alert({ variant = "validation", title, children }) {
  const styles = {
    validation: { background: T.red50 },
    destructive: { background: T.red100, borderLeft: `5px solid ${T.red700}`, color: T.red700, borderRadius: 2 },
    warning: { background: T.yellow50, color: T.yellow800 },
    notice: { background: "#FBEAEA" },
    empty: { background: T.tan50, color: T.tan700, border: "1px solid #F0E6C8" },
  };
  return (
    <div role="alert" style={{ padding: "16px 24px", borderRadius: 4, fontSize: 15, marginBottom: 12, ...styles[variant] }}>
      {title && (
        <div style={{ fontSize: 21, fontWeight: 700, display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: T.ink, color: "#fff", display: "inline-grid", placeItems: "center", flexShrink: 0 }}>
            <Info size={13} />
          </span>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ---- Modal --------------------------------------------------
function Modal({ open, onClose, title, footer, children, center }) {
  if (!open) return null;
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,48,50,.45)", display: "grid", placeItems: "center", zIndex: 100, padding: 16 }}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 6, overflow: "hidden", width: "min(560px,100%)", boxShadow: "0 8px 24px rgba(0,48,50,.22)", fontFamily: FONT }}>
        <div style={{ background: T.teal700, color: "#fff", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ fontSize: 21, fontWeight: 700, margin: 0 }}>{title}</h4>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", lineHeight: 1 }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 24, fontSize: 15, textAlign: center ? "center" : "left" }}>{children}</div>
        {footer && <div style={{ display: "flex", justifyContent: center ? "center" : "flex-end", gap: 12, padding: "0 24px 24px" }}>{footer}</div>}
      </div>
    </div>
  );
}

// ---- Wizard tabs -------------------------------------------
// parts: [{ label, state: "complete" | "active" | "upcoming" }]
function WizardTabs({ parts, onSelect }) {
  return (
    <div role="tablist" style={{ display: "flex", background: T.gray100, border: `1px solid ${T.gray300}`, borderRadius: "4px 4px 0 0", overflowX: "auto" }}>
      {parts.map((p, i) => (
        <button key={p.label} role="tab" aria-selected={p.state === "active"}
          onClick={() => onSelect && onSelect(i)}
          style={{
            padding: "14px 26px", fontSize: 15, fontFamily: FONT, whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            border: "none", borderRight: `1px solid ${T.gray300}`,
            background: p.state === "active" ? T.tabBlue : p.state === "complete" ? "#fff" : "transparent",
            color: p.state === "active" ? "#fff" : T.ink,
            fontWeight: p.state === "complete" ? 600 : 400,
          }}>
          {p.label}{p.state === "complete" && <Check size={15} strokeWidth={3.5} />}
        </button>
      ))}
    </div>
  );
}

function WizardPanel({ title, footer, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${T.gray300}`, borderTop: "none", padding: 24 }}>
      <div style={{ fontSize: 24, fontWeight: 700, paddingBottom: 16, borderBottom: `1px solid ${T.gray200}`, marginBottom: 16 }}>{title}</div>
      {children}
      {footer && <div style={{ borderTop: `1px solid ${T.gray200}`, marginTop: 24, paddingTop: 16, display: "flex", gap: 12 }}>{footer}</div>}
    </div>
  );
}

// ---- Stepper ------------------------------------------------
// steps: [{ label, icon, state: "done" | "current" | "pending" }]
function Stepper({ steps }) {
  const color = (s) => (s === "done" ? T.green600 : s === "current" ? T.gold500 : T.gray500);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "24px 0" }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "contents" }}>
          {i > 0 && (
            <div style={{
              flex: "0 0 90px", marginTop: 32,
              borderTop: `2.5px ${steps[i - 1].state === "done" && s.state !== "pending" ? "solid " + T.green600 : "dashed #BFBFBF"}`,
            }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 150 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "#fff",
              border: `2.5px solid ${s.state === "pending" ? T.gray300 : color(s.state)}`,
              display: "grid", placeItems: "center", color: color(s.state),
            }}>{s.icon}</div>
            <span style={{ fontSize: 12.5, fontWeight: 700, textDecoration: "underline", color: color(s.state) }}>{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- KPI card + data table ---------------------------------
function KpiCard({ value, label, tint }) {
  return (
    <div style={{ background: tint ? T.teal500 : T.teal700, color: "#fff", textAlign: "center", padding: 16, boxShadow: "0 2px 6px rgba(0,0,0,.12)" }}>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: ".5px" }}>{value}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function DataTable({ columns, rows, footer }) {
  const th = { background: T.teal700, color: "#fff", fontWeight: 700, padding: "10px 14px", border: "1px solid #0A7276", textAlign: "left" };
  const td = { padding: "9px 14px", border: `1px solid ${T.gray200}` };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, background: "#fff" }}>
      <thead><tr>{columns.map((c) => <th key={c.key} style={{ ...th, textAlign: c.num ? "right" : "left" }}>{c.label}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ background: i % 2 ? T.gray50 : "#fff" }}>
            {columns.map((c) => <td key={c.key} style={{ ...td, textAlign: c.num ? "right" : "left" }}>{r[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
      {footer && (
        <tfoot><tr>
          {columns.map((c) => (
            <td key={c.key} style={{ padding: "10px 14px", fontWeight: 700, background: "#AEDBD3", border: "1px solid #9CCFC6", textAlign: c.num ? "right" : "left" }}>
              {footer[c.key]}
            </td>
          ))}
        </tr></tfoot>
      )}
    </table>
  );
}

// ---- Staff directory ---------------------------------------
function AvatarTile({ initials, size = 56 }) {
  return (
    <div style={{ width: size, height: size, background: T.blue600, color: "#fff", fontSize: size / 3.1, fontWeight: 700, display: "grid", placeItems: "center", borderRadius: 3 }}>
      {initials}
    </div>
  );
}

function StaffRow({ person, selected, striped }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "72px 1.1fr 1.4fr 1.4fr .8fr 70px", gap: 12,
      alignItems: "center", padding: "12px 16px", fontSize: 14.5,
      borderBottom: `1px solid ${T.gray200}`,
      background: selected ? T.blue50 : striped ? T.gray100 : "#fff",
      boxShadow: selected ? `inset 4px 0 0 ${T.blue600}` : "none",
    }}>
      <AvatarTile initials={person.initials} />
      <div><b>{person.name}</b><div style={{ color: T.gray700, fontSize: 13.5 }}>{person.title}</div></div>
      <div>{person.dept}<div style={{ color: T.gray700, fontSize: 13.5 }}>{person.branch}</div></div>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ color: T.blue600 }}>{person.email}</a>
      <div style={{ color: T.gray700, fontSize: 13.5 }}>{person.phone}</div>
      <div style={{ display: "flex", gap: 10, color: T.blue600 }}><Phone size={17} /><MessageSquare size={17} /></div>
    </div>
  );
}

// ---- Toggle & Listbox --------------------------------------
function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        style={{
          position: "relative", width: 40, height: 20, borderRadius: 10, border: "none",
          cursor: "pointer", background: checked ? T.blue600 : T.gray500, transition: "background .15s", flexShrink: 0,
        }}>
        <span style={{
          position: "absolute", top: 3, left: checked ? 22 : 4, width: 14, height: 14,
          borderRadius: "50%", background: "#fff", transition: "left .15s",
        }} />
      </button>
      <span style={{ fontSize: 14.5 }}>{label ?? (checked ? "On" : "Off")}</span>
    </div>
  );
}

function Listbox({ options, value, onChange }) {
  return (
    <div role="listbox" style={{ border: "1px solid #767676", borderRadius: 2, maxWidth: 240, background: "#fff", fontSize: 14.5 }}>
      {options.map((o) => (
        <div key={o} role="option" aria-selected={o === value} onClick={() => onChange(o)}
          style={{ padding: "7px 10px", cursor: "pointer", background: o === value ? T.blue600 : "transparent", color: o === value ? "#fff" : T.ink }}>
          {o}
        </div>
      ))}
    </div>
  );
}

// ---- Sidebar navigation (PartnerHub shell) ------------------
function SideItem({ icon, label, active, indent, chevron, onClick }) {
  return (
    <button onClick={onClick} className="bch-side-item"
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: indent ? "9px 16px 9px 34px" : "11px 16px",
        fontSize: indent ? 13.5 : 14.5, color: "#fff", textAlign: "left",
        background: active ? (indent ? "rgba(255,255,255,.15)" : T.teal700) : "transparent",
        fontWeight: active ? 600 : 400,
        border: "none", cursor: "pointer", fontFamily: FONT,
      }}>
      {icon}{label}
      {chevron === "down" && <ChevronDown size={13} style={{ marginLeft: "auto" }} />}
      {chevron === "right" && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
    </button>
  );
}

function Sidebar({ activeItem, onSelect }) {
  const [orOpen, setOrOpen] = useState(true);
  const sub = ["Questionnaire", "Standards and Elements", "Declaration", "Site Visits", "Action Plan", "Appeal"];
  return (
    <nav aria-label="Main" style={{ width: 232, flexShrink: 0, background: T.sidebar, color: "#fff", padding: "12px 0" }}>
      <SideItem icon={<Newspaper size={17} />} label="Operational Review" chevron={orOpen ? "down" : "right"} onClick={() => setOrOpen(!orOpen)} />
      {orOpen && (
        <div style={{ background: T.teal700, margin: "2px 10px", borderRadius: 4, padding: "6px 0" }}>
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

// ---- Process timeline (mini stepper) ------------------------
function ProcessTimeline({ steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", margin: "16px 0" }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "contents" }}>
          {i > 0 && (
            <div style={{
              flex: "0 0 34px", marginBottom: 18,
              borderTop: `2px solid ${steps[i - 1].state === "done" ? T.green600 : T.gray300}`,
            }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 78 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 12,
              border: `2px solid ${s.state === "done" ? T.green600 : s.state === "current" ? T.teal600 : T.gray300}`,
              background: s.state === "done" ? T.green600 : "#fff",
              color: s.state === "done" ? "#fff" : s.state === "current" ? T.teal600 : T.gray500,
              fontWeight: s.state === "current" ? 700 : 400,
            }}>
              {s.state === "done" ? <Check size={14} strokeWidth={3} /> : i + 1}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: T.gray700 }}>{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Quick start card ---------------------------------------
function QuickStartCard({ title = "What would you like to do today?", actions = [] }) {
  return (
    <div style={{ background: T.teal600, color: "#fff", borderRadius: 6, padding: 24, maxWidth: 300, boxShadow: "0 2px 6px rgba(0,0,0,.12)" }}>
      <h4 style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.3, margin: "0 0 16px" }}>{title}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {actions.map((a) => (
          <button key={a} className="bch-qs-btn" style={{
            background: "#fff", color: T.teal700, border: "none", borderRadius: 4,
            padding: "9px 14px", fontFamily: FONT, fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>{a}</button>
        ))}
      </div>
    </div>
  );
}

// ---- Segmented progress bar ---------------------------------
// segments: [{ value (0-100), state: "complete" | "inProgress" }]
function SegmentedProgress({ label, segments }) {
  const segColor = { complete: T.green500, inProgress: T.gold400 };
  const done = segments.find((s) => s.state === "complete")?.value ?? 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
        <b style={{ fontWeight: 600 }}>{label}</b>
        <span style={{ color: T.gray700 }}>{done}% complete</span>
      </div>
      <div role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={100} aria-label={label}
        style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", background: T.gray200 }}>
        {segments.map((s, i) => <div key={i} style={{ width: `${s.value}%`, background: segColor[s.state] }} />)}
      </div>
    </div>
  );
}

// ---- Stat card ----------------------------------------------
// tone: "red" | "gold" | "blue" | "teal"
function StatCard({ tone = "teal", icon, title, sub }) {
  const tones = {
    red: { border: T.red600, iconBg: T.red100, iconFg: T.red600 },
    gold: { border: T.gold600, iconBg: "#FDF1D3", iconFg: "#B07C0A" },
    blue: { border: T.blue600, iconBg: T.blue50, iconFg: T.blue600 },
    teal: { border: T.teal600, iconBg: "#DCF2EC", iconFg: T.teal600 },
  }[tone];
  return (
    <div style={{
      background: "#fff", border: `1px solid ${T.gray300}`, borderLeft: `4px solid ${tones.border}`,
      borderRadius: 6, padding: 16, display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", background: tones.iconBg, color: tones.iconFg, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: T.gray700 }}>{sub}</div>
      </div>
    </div>
  );
}

// ---- Charts (Recharts, Power BI house style) ----------------
const CHART_FONT = { fontFamily: FONT, fontSize: 11, fill: T.gray700 };
const chartCard = { background: "#fff", border: `1px solid ${T.gray300}`, borderRadius: 6, padding: 16 };
const chartTitle = { fontSize: 14, fontWeight: 700, margin: "0 0 12px" };

function BranchBarChart() {
  const data = [
    { branch: "CORP SERV", regular: 104, shortTerm: 1 },
    { branch: "DAS", regular: 70, shortTerm: 0 },
    { branch: "OPERATIONS", regular: 68, shortTerm: 2 },
    { branch: "IT", regular: 60, shortTerm: 2 },
    { branch: "HR", regular: 10, shortTerm: 2 },
  ];
  return (
    <div style={chartCard}>
      <p style={chartTitle}>Total Approved FTE by Branch and Group</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 20, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={T.gray200} />
          <XAxis dataKey="branch" tickLine={false} axisLine={false} tick={CHART_FONT} interval={0} />
          <YAxis tickLine={false} axisLine={false} tick={{ ...CHART_FONT, fontSize: 10 }} />
          <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12.5 }} />
          <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 12 }} iconType="circle" iconSize={9} />
          <Bar dataKey="regular" name="Regular" fill={T.seafoam}>
            <LabelList dataKey="regular" position="top" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, fill: T.ink }} />
          </Bar>
          <Bar dataKey="shortTerm" name="Short Term" fill={T.sky400} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RegionBarChart() {
  const data = [
    { region: "FINANCIAL MGMT", fte: 79 }, { region: "CAM", fte: 59 },
    { region: "IT", fte: 48 }, { region: "LM DM OPERATIONS", fte: 36 },
    { region: "APP SERV MGMT", fte: 25 }, { region: "INT AUDIT MGMT", fte: 25 },
    { region: "RE_PR_MGT", fte: 11 }, { region: "AN_SYS_DEV", fte: 8 },
  ];
  return (
    <div style={chartCard}>
      <p style={chartTitle}>Total Approved FTE by Region</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 44, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="region" tickLine={false} axisLine={false} width={110} tick={{ ...CHART_FONT, fontSize: 10 }} />
          <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12.5 }} />
          <Bar dataKey="fte" name="Regular" fill={T.seafoam} barSize={14}>
            <LabelList dataKey="fte" position="right" style={{ fontFamily: FONT, fontSize: 10.5, fontWeight: 600, fill: T.ink }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function UnionDonutChart() {
  const data = [
    { name: "Administrative", value: 207, pct: "65%" },
    { name: "Excluded", value: 106, pct: "33%" },
    { name: "Maintenance/Service", value: 5.75, pct: "2%" },
  ];
  const colors = [T.teal700, T.seafoam, T.tealLight];
  return (
    <div style={chartCard}>
      <p style={chartTitle}>Total Approved FTE by Union Code</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={46} outerRadius={80} startAngle={90} endAngle={-270}>
              {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
            </Pie>
            <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12.5 }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 11.5 }}>
          {data.map((d, i) => (
            <div key={d.name} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ width: 10, height: 10, background: colors[i], display: "inline-block", marginTop: 3 }} />
              <span><b>{d.name}</b><br /><span style={{ color: T.gray700 }}>{d.value.toFixed(2)} ({d.pct})</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendLineChart() {
  const data = [
    { month: "Jan", occupied: 256, target: 252 }, { month: "Feb", occupied: 258, target: 254 },
    { month: "Mar", occupied: 258, target: 255 }, { month: "Apr", occupied: 264, target: 257 },
    { month: "May", occupied: 268, target: 258 }, { month: "Jun", occupied: 269, target: 260 },
    { month: "Jul", occupied: 274, target: 262 },
  ];
  return (
    <div style={chartCard}>
      <p style={chartTitle}>Occupied FTE trend</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={T.gray200} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ ...CHART_FONT, fontSize: 10 }} />
          <YAxis domain={[248, 280]} tickLine={false} axisLine={false} tick={{ ...CHART_FONT, fontSize: 10 }} />
          <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12.5 }} />
          <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 12 }} iconType="circle" iconSize={9} />
          <Line dataKey="occupied" name="Occupied" stroke={T.seafoam} strokeWidth={2.5} dot={{ r: 3.5, fill: T.seafoam }} />
          <Line dataKey="target" name="Target" stroke={T.blue600} strokeWidth={2.5} strokeDasharray="5 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---- Profile with developments -------------------------------
function DevelopmentItem({ dev }) {
  const badge = dev.status === "Operational"
    ? { background: "#DCF2EC", color: T.teal600 }
    : { background: "#FDF1D3", color: "#B07C0A" };
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.gray200}` }}>
      <div style={{ width: 44, height: 44, borderRadius: 3, background: T.teal600, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Home size={19} />
      </div>
      <div style={{ minWidth: 0 }}>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 14.5, fontWeight: 700, color: T.blue600 }}>{dev.name}</a>
        <div style={{ fontSize: 12.5, color: T.gray700 }}>{dev.address} · {dev.units} units</div>
      </div>
      <span style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 10, whiteSpace: "nowrap", ...badge }}>
        {dev.status}
      </span>
    </div>
  );
}

function ProfileField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <b style={{ display: "block", fontSize: 16, marginBottom: 2 }}>{label}</b>
      <span style={{ fontSize: 14.5, color: T.gray700 }}>{children}</span>
    </div>
  );
}

// ---- App chrome ---------------------------------------------
function BrandMark({ dark = T.teal700 }) {
  return (
    <span style={{
      width: 30, height: 30, borderRadius: "50%", position: "relative", display: "inline-grid", placeItems: "center",
      background: "conic-gradient(#41C6A5 0 90deg, #7FD1C0 90deg 180deg, #ffffff 180deg 270deg, #2A9D8F 270deg 360deg)",
    }}>
      <span style={{ width: 12, height: 11, background: dark, clipPath: "polygon(50% 0,100% 42%,100% 100%,0 100%,0 42%)" }} />
    </span>
  );
}

function AppHeader({ variant = "teal", right }) {
  const bg = { teal: T.teal700, blue: T.blue600, dark: T.teal950 }[variant];
  return (
    <div style={{ background: bg, color: "#fff", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 17, letterSpacing: ".3px" }}>
        <BrandMark dark={bg} /> BC HOUSING
      </span>
      {right}
    </div>
  );
}

/* ============================================================
   SHOWCASE APP
   ============================================================ */
const SECTIONS = ["Buttons", "Wizard Form", "Inputs", "Alerts", "Modal", "Stepper", "Dashboard Layout", "Charts", "KPI & Table", "Staff Directory", "Profile"];

export default function BCHousingDesignSystem() {
  const [section, setSection] = useState("Buttons");
  const [modalOpen, setModalOpen] = useState(false);
  const [activePart, setActivePart] = useState(1);
  const [situation, setSituation] = useState(0);
  const [toggleOn, setToggleOn] = useState(true);
  const [listValue, setListValue] = useState("Value1");
  const [sideActive, setSideActive] = useState("Standards and Elements");

  const parts = [0, 1, 2, 3, 4, 5].map((i) => ({
    label: `Part ${i + 1}`,
    state: i < activePart ? "complete" : i === activePart ? "active" : "upcoming",
  }));

  const situations = [
    "Subsidized housing (landlord is BC Housing)",
    "Subsidized housing (landlord is a non-profit or co-op)",
    "Private market rental (landlord is an individual or company)",
    "Shelter or temporary housing",
    "Application or benefit",
    "BC Housing activity in the community",
    "Violation of the Homeowner Protection Act",
  ];

  const staff = [
    { initials: "MH", name: "Michael Huynh", title: "Mgr, IT Programs", dept: "Enterprise Business Systems", branch: "Information Management & Technology", email: "mhuynh@bchousing.org", phone: "604-439-4140" },
    { initials: "DS", name: "Daisy Stapleton", title: "Programs Specialist (SHP)", dept: "Supportive Housing Programs", branch: "Operations", email: "dstaplet@bchousing.org", phone: "604-761-9674" },
    { initials: "JH", name: "Judy Hu", title: "Business Systems Analyst", dept: "Enterprise Business Systems", branch: "Information Management & Technology", email: "jhu@bchousing.org", phone: "604-439-4141" },
  ];

  const sectionStyle = { background: "#fff", border: `1px solid ${T.gray300}`, borderRadius: 6, padding: 24 };
  const h3 = { fontSize: 16, fontWeight: 700, margin: "0 0 12px" };
  const hint = { fontSize: 13, color: T.gray700, marginTop: 12 };

  return (
    <div style={{ fontFamily: FONT, color: T.ink, background: T.gray100, minHeight: "100vh", fontSize: 16, lineHeight: 1.5 }}>
      <style>{`
        .bch-btn-pri:hover:not(:disabled){background:${T.blue700}!important}
        .bch-btn-out:hover:not(:disabled){background:${T.blue50}!important}
        .bch-btn-teal:hover:not(:disabled){background:${T.teal950}!important}
        .bch-btn-soft:hover:not(:disabled){background:#58B8DD!important}
        .bch-btn-des:hover:not(:disabled){background:#98060D!important}
        button:focus-visible,.bch-input:focus{outline:2px solid ${T.tabBlue};outline-offset:2px}
        .bch-input:focus{outline-offset:-1px}
        .bch-side-item:hover{background:rgba(255,255,255,.10)}
        .bch-qs-btn:hover{background:${T.blue50}!important}
        a{color:${T.blue600}}
      `}</style>

      {/* Chrome */}
      <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <AppHeader variant="teal" right={
          <nav style={{ display: "flex", gap: 16, fontSize: 15 }}>
            <span style={{ borderRight: "1px solid rgba(255,255,255,.35)", paddingRight: 16 }}>Home</span>
            <span>Feedback Forms</span>
          </nav>
        } />
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px 64px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 8px" }}>BC Housing Design System</h1>
        <p style={{ color: T.gray700, maxWidth: "68ch", margin: "0 0 24px" }}>
          React implementation of the BC Housing component library. Teal <code>#006265</code> is identity
          (chrome, headers, data); blue <code>#0073CE</code> is action (buttons, links, selection).
        </p>

        {/* Section switcher — itself built from the wizard tab pattern */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
          {SECTIONS.map((s) => (
            <button key={s} onClick={() => setSection(s)} style={{
              fontFamily: FONT, fontSize: 14, padding: "8px 14px", borderRadius: 4, cursor: "pointer",
              border: `1px solid ${section === s ? T.tabBlue : T.gray300}`,
              background: section === s ? T.tabBlue : "#fff",
              color: section === s ? "#fff" : T.ink,
            }}>{s}</button>
          ))}
        </div>

        {/* ---------------- BUTTONS ---------------- */}
        {section === "Buttons" && (
          <div style={sectionStyle}>
            <h3 style={h3}>Buttons</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <Button>Next</Button>
              <Button variant="outline">Previous</Button>
              <Button>Submit</Button>
              <Button><Plus size={16} /> Add files</Button>
              <Button variant="soft"><FolderPlus size={16} /> New folder</Button>
              <Button variant="teal">View my Operational Review</Button>
              <Button variant="destructive">Delete</Button>
              <Button disabled>Continue</Button>
            </div>
            <p style={hint}>
              primary #0073CE · hover #005EA8 · disabled #BDD2ED · radius 4px · padding 8px 18px.
              Teal is reserved for top-level entry CTAs — never inside a form flow.
            </p>
          </div>
        )}

        {/* ---------------- WIZARD FORM ---------------- */}
        {section === "Wizard Form" && (
          <div>
            <WizardTabs parts={parts} onSelect={(i) => i <= activePart && setActivePart(i)} />
            <WizardPanel
              title="Basic information"
              footer={<>
                <Button variant="outline" onClick={() => setActivePart(Math.max(0, activePart - 1))}>Previous</Button>
                <Button onClick={() => setActivePart(Math.min(5, activePart + 1))}>Next</Button>
              </>}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
                <div>
                  <RequiredLabel required>Pick the option that best describes the situation you'd like to give feedback about:</RequiredLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {situations.map((s, i) => (
                      <Radio key={s} name="situation" label={s} checked={situation === i} onChange={() => setSituation(i)} />
                    ))}
                  </div>
                </div>
                <p style={{ color: T.red700, fontSize: 15, margin: 0 }}>
                  Our team does not review tenancy or property maintenance complaints.
                  Please visit our <a href="#" onClick={(e) => e.preventDefault()}>Feedback page</a> for more information.
                </p>
              </div>
            </WizardPanel>
          </div>
        )}

        {/* ---------------- INPUTS ---------------- */}
        {section === "Inputs" && (
          <div style={sectionStyle}>
            <h3 style={h3}>Form inputs</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
              <div><RequiredLabel required>Legal First Name:</RequiredLabel><Input placeholder="Label" /></div>
              <div><RequiredLabel required>Legal Last Name:</RequiredLabel><Input placeholder="Label" /></div>
              <div>
                <RequiredLabel bold required>2. Type of work</RequiredLabel>
                <Select><option>Value</option><option>New program</option><option>Continuing work</option></Select>
              </div>
              <div>
                <RequiredLabel bold>4. Approval Required:</RequiredLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                  <Checkbox label="ExComm" />
                  <Checkbox label="Board" defaultChecked />
                </div>
              </div>
              <div>
                <RequiredLabel bold>Toggle</RequiredLabel>
                <div style={{ marginTop: 6 }}><Toggle checked={toggleOn} onChange={setToggleOn} /></div>
              </div>
              <div>
                <RequiredLabel bold>Listbox</RequiredLabel>
                <Listbox options={["Value1", "Value2", "Value3", "Value4"]} value={listValue} onChange={setListValue} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <RequiredLabel bold>12. Describe resource gaps or constraints to do this work</RequiredLabel>
                <Textarea placeholder="Enter text" />
              </div>
            </div>
            <p style={hint}>Inputs use a 1px #767676 border at 2px radius; required marks are a red * after the label. Toggle on-state and listbox selection use action blue #0073CE.</p>
          </div>
        )}

        {/* ---------------- ALERTS ---------------- */}
        {section === "Alerts" && (
          <div style={sectionStyle}>
            <h3 style={h3}>Alerts &amp; banners</h3>
            <Alert variant="validation" title="The form could not be submitted for the following reasons:">
              <a href="#" onClick={(e) => e.preventDefault()}>What is your purpose in filling in this form? is a required field.</a>
            </Alert>
            <Alert variant="destructive">Please download the appeal letter template and fill in required information.</Alert>
            <Alert variant="warning">
              The submission overdue notice today is in error. <b>You have until 12:00AM, July 1, 2023</b> to complete your submission and sign the declaration.
            </Alert>
            <Alert variant="notice">
              <b style={{ color: T.red700 }}>Please note that no board member/Primary board member is assigned yet.</b><br />
              Please assign a board member and primary board member in the following list using the Set as Board member function
            </Alert>
            <Alert variant="empty">There are no folders or files to display.</Alert>
          </div>
        )}

        {/* ---------------- MODAL ---------------- */}
        {section === "Modal" && (
          <div style={sectionStyle}>
            <h3 style={h3}>Modal dialog</h3>
            <Button onClick={() => setModalOpen(true)}>Open confirmation modal</Button>
            <p style={hint}>Teal title bar #006265, centered body copy for confirmations, centered footer actions.</p>
          </div>
        )}

        {/* ---------------- STEPPER ---------------- */}
        {section === "Stepper" && (
          <div style={{ ...sectionStyle, textAlign: "center" }}>
            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>
              Goal 2: Strengthened BC Housing service programs and community housing sector capacity
            </p>
            <Stepper steps={[
              { label: "Description Of Work", icon: <PenLine size={26} />, state: "done" },
              { label: "Stakeholders", icon: <Users size={26} />, state: "done" },
              { label: "Constraints", icon: <Lock size={26} />, state: "current" },
            ]} />
            <p style={hint}>complete #28A745 · current/locked #E9B949 · pending dashed #BFBFBF</p>
          </div>
        )}

        {/* ---------------- DASHBOARD LAYOUT ---------------- */}
        {section === "Dashboard Layout" && (
          <div style={{ border: `1px solid ${T.gray300}`, borderRadius: 6, overflow: "hidden", background: T.gray50 }}>
            {/* Top nav */}
            <div style={{ background: T.teal700, color: "#fff", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 15 }}>
                <BrandMark dark={T.teal700} /> BC HOUSING
              </span>
              <div style={{ display: "flex", gap: 16, fontSize: 13.5 }}>
                <span>Operational Review ▾</span><span>Support ▾</span><span>Mailbox</span><span>Duong Tran ▾</span>
              </div>
            </div>
            {/* Body: sidebar + content */}
            <div style={{ display: "flex", minHeight: 520 }}>
              <Sidebar activeItem={sideActive} onSelect={setSideActive} />
              <div style={{ flex: 1, padding: 24, minWidth: 0 }}>
                <h3 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 700 }}>Welcome to PartnerHub, Duong!</h3>
                <p style={{ color: T.gray700, fontSize: 14, margin: "0 0 4px" }}>Provider: Hacienda MT</p>

                <ProcessTimeline steps={[
                  { label: "Initiate", state: "done" }, { label: "Preliminary", state: "done" },
                  { label: "Report", state: "current" }, { label: "Demonstrate", state: "pending" },
                  { label: "Site Visit", state: "pending" }, { label: "Close", state: "pending" },
                ]} />

                <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, alignItems: "start" }}>
                  <QuickStartCard actions={[
                    "Read about the New OR Process", "Submit Documents",
                    "View my Action Plan", "View the Knowledge Base",
                  ]} />
                  <div>
                    <div style={{ background: "#fff", border: `1px solid ${T.gray300}`, borderRadius: 6, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        <div>
                          <b style={{ fontSize: 16 }}>Operational review 2026</b>
                          <div style={{ fontSize: 12.5, color: T.gray700 }}>STATUS: <b style={{ color: T.gold600 }}>IN PROGRESS</b></div>
                        </div>
                        <div style={{ fontSize: 12.5, color: T.gray700, textAlign: "right" }}>
                          Document Submission Due Date<br /><b style={{ color: T.green500 }}>September 15th 2026</b>
                        </div>
                      </div>
                      <b style={{ fontSize: 14 }}>Core Areas</b>
                      <div style={{ marginTop: 10 }}>
                        <SegmentedProgress label="Organization and Governance" segments={[{ value: 62, state: "complete" }, { value: 20, state: "inProgress" }]} />
                        <SegmentedProgress label="Asset and Facility Management" segments={[{ value: 38, state: "complete" }, { value: 34, state: "inProgress" }]} />
                        <SegmentedProgress label="Client and Community Focus" segments={[{ value: 15, state: "complete" }, { value: 12, state: "inProgress" }]} />
                        <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: T.gray700, flexWrap: "wrap" }}>
                          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: T.green500, marginRight: 5 }} />Complete</span>
                          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: T.gold400, marginRight: 5 }} />In progress</span>
                          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: T.gray200, marginRight: 5 }} />Not started</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
                      <StatCard tone="red" icon={<Scale size={19} />} title="Appeals" sub="1 in progress" />
                      <StatCard tone="gold" icon={<TriangleAlert size={19} />} title="Escalations" sub="2 in progress" />
                      <StatCard tone="blue" icon={<Mail size={19} />} title="Mailbox" sub="32 messages" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- CHARTS ---------------- */}
        {section === "Charts" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(380px,1fr))", gap: 16 }}>
              <BranchBarChart />
              <RegionBarChart />
              <UnionDonutChart />
              <TrendLineChart />
            </div>
            <p style={{ ...hint, marginTop: 16 }}>
              Series order: seafoam #41C6A5 → sky #60BDFF → teal ramp. Targets are dashed action blue.
              Gridlines #E6E6E6 horizontal only, labels 10–12px Segoe UI, value labels at bar ends.
            </p>
          </div>
        )}

        {/* ---------------- KPI & TABLE ---------------- */}
        {section === "KPI & Table" && (
          <div style={sectionStyle}>
            <h3 style={h3}>KPI cards &amp; data table</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
              <KpiCard value="318.75" label="Total Approved FTE" />
              <KpiCard value="311.75" label="Regular" />
              <KpiCard value="7.00" label="Short Term" />
              <KpiCard value="320" label="Total Positions" tint />
            </div>
            <DataTable
              columns={[
                { key: "branch", label: "Branch" },
                { key: "occ", label: "Occupied", num: true },
                { key: "vac", label: "Vacant", num: true },
                { key: "tot", label: "Total", num: true },
              ]}
              rows={[
                { branch: "CORP SERV", occ: "83.00", vac: "21.00", tot: "104.00" },
                { branch: "DAS", occ: "63.00", vac: "7.00", tot: "70.00" },
                { branch: "HR", occ: "10.00", vac: "0.00", tot: "10.00" },
                { branch: "IT", occ: "56.00", vac: "4.00", tot: "60.00" },
                { branch: "OPERATIONS", occ: "56.00", vac: "11.75", tot: "67.75" },
              ]}
              footer={{ branch: "Total", occ: "268.00", vac: "43.75", tot: "311.75" }}
            />
          </div>
        )}

        {/* ---------------- STAFF DIRECTORY ---------------- */}
        {section === "Staff Directory" && (
          <div>
            <AppHeader variant="blue" right={
              <span style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", color: T.blue600, fontWeight: 700, display: "grid", placeItems: "center", fontSize: 14 }}>DT</span>
            } />
            <div style={{ background: "#fff", border: `1px solid ${T.gray300}`, borderTop: "none", padding: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {"ABCDEFGHI".split("").map((l) => (
                  <span key={l} style={{
                    width: 28, height: 28, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600, borderRadius: 3, cursor: "pointer",
                    background: l === "D" ? "#fff" : T.blue600, color: l === "D" ? T.blue600 : "#fff",
                    outline: l === "D" ? `2px solid ${T.blue600}` : "none", outlineOffset: -2,
                  }}>{l}</span>
                ))}
              </div>
            </div>
            <div style={{ border: `1px solid ${T.gray300}`, borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden", background: "#fff" }}>
              {staff.map((p, i) => <StaffRow key={p.email} person={p} selected={i === 0} striped={i % 2 === 1} />)}
            </div>
          </div>
        )}

        {/* ---------------- PROFILE ---------------- */}
        {section === "Profile" && (
          <div>
            <AppHeader variant="blue" right={
              <span style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", color: T.blue600, fontWeight: 700, display: "grid", placeItems: "center", fontSize: 14 }}>DT</span>
            } />
            <div style={{
              background: "#fff", border: `1px solid ${T.gray300}`, borderTop: "none",
              borderRadius: "0 0 6px 6px", padding: 32,
              display: "grid", gridTemplateColumns: "240px 1fr 1.1fr", gap: 32,
            }}>
              <div>
                <div style={{
                  width: "100%", aspectRatio: "5/6", borderRadius: 3, color: "#fff",
                  background: "linear-gradient(160deg,#8FA6B5,#6B8496)",
                  display: "grid", placeItems: "center", fontSize: 56, fontWeight: 700,
                }}>SL</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>Sarah Lindqvist</div>
              </div>
              <div>
                <ProfileField label="Title">Portfolio Manager</ProfileField>
                <ProfileField label="Department">Supportive Housing Programs</ProfileField>
                <ProfileField label="Office Location">Home Office 3</ProfileField>
                <ProfileField label="E-mail">
                  <a href="#" onClick={(e) => e.preventDefault()}>slindqvist@bchousing.org</a>
                </ProfileField>
                <ProfileField label="Work Phone">Work: 604-439-4188<br />Mobile: 604-439-4189</ProfileField>
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Developments (4)</div>
                <DevelopmentItem dev={{ name: "Brick Lane Apartments", address: "1245 Main St, Vancouver", units: 45, status: "Operational" }} />
                <DevelopmentItem dev={{ name: "Hacienda MT", address: "880 Cambie St, Vancouver", units: 62, status: "Operational" }} />
                <DevelopmentItem dev={{ name: "Cedar Grove Terrace", address: "414 Columbia St, New Westminster", units: 38, status: "In development" }} />
                <DevelopmentItem dev={{ name: "Lillooet Commons", address: "102 Birch Ave, Pemberton", units: 24, status: "Operational" }} />
              </div>
            </div>
            <p style={{ ...hint, marginTop: 12 }}>
              Same three-column grammar as the staff profile, with a Developments list replacing the reporting
              structure. Development tiles use teal-600 #00866E (portfolio identity); names stay action blue.
              Status pills: Operational (teal) / In development (gold).
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: T.teal700, color: "#fff", textAlign: "center", padding: 24, fontSize: 14.5 }}>
        Copyright © 2026 <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#fff" }}>BC Housing</a>. All rights reserved.
      </footer>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirmation for Final Appeal"
        center
        footer={<>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={() => setModalOpen(false)}>Proceed</Button>
        </>}>
        <p style={{ margin: "0 0 16px" }}>
          By selecting confirm below, the <b>level of your Appeal</b> will update from <b>Formal</b> to <b>Final</b>.
        </p>
        <p style={{ margin: 0 }}>
          You are required to upload a completed Final Appeal letter from the template on the following screen should you proceed.
        </p>
      </Modal>
    </div>
  );
}
