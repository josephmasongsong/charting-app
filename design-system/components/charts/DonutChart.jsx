import React from "react";
import { chartCard, chartTitle } from "./BarChart.jsx";

export function DonutChart({ title, data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const r = 42, cx = 60, cy = 60, sw = 24;
  return (
    <div style={chartCard}>
      {title && <p style={chartTitle}>{title}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * 2 * Math.PI * r;
            const gap = 2 * Math.PI * r - dash;
            const rotate = (acc / total) * 360 - 90;
            acc += d.value;
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={sw}
              strokeDasharray={`${dash} ${gap}`} transform={`rotate(${rotate} ${cx} ${cy})`} />;
          })}
        </svg>
        <div style={{ fontSize: 11.5, fontFamily: "var(--font-sans)" }}>
          {data.map((d) => (
            <div key={d.name} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ width: 10, height: 10, background: d.color, display: "inline-block", marginTop: 3 }} />
              <span><b>{d.name}</b><br /><span style={{ color: "var(--text-muted)" }}>{d.value.toFixed(2)} ({Math.round(d.value / total * 100)}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
