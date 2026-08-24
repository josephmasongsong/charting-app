import React from "react";
export function DataTable({ columns, rows, footer }) {
  const th = { background: "var(--surface-chrome)", color: "#fff", fontWeight: 700, padding: "10px 14px", border: "1px solid #0A7276", textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: ".04em" };
  const td = { padding: "9px 14px", border: "1px solid var(--bch-gray-200)" };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, background: "#fff", fontFamily: "var(--font-sans)" }}>
      <thead><tr>{columns.map((c) => <th key={c.key} style={{ ...th, textAlign: c.num ? "right" : "left" }}>{c.label}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ background: i % 2 ? "var(--surface-muted)" : "#fff" }}>
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
