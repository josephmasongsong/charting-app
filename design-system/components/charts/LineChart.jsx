import React from "react";
import { chartCard, chartTitle } from "./BarChart.jsx";

export function LineChart({ title, data, xKey, series, height = 200 }) {
  const w = 460, pad = { t: 10, r: 10, b: 22, l: 30 };
  const vals = data.flatMap((d) => series.map((s) => d[s.key]));
  const max = Math.max(...vals), min = Math.min(...vals);
  const plotW = w - pad.l - pad.r, plotH = height - pad.t - pad.b;
  const x = (i) => pad.l + (i / (data.length - 1)) * plotW;
  const y = (v) => pad.t + plotH - ((v - min) / (max - min || 1)) * plotH;
  return (
    <div style={chartCard}>
      {title && <p style={chartTitle}>{title}</p>}
      <svg width="100%" viewBox={`0 0 ${w} ${height}`}>
        {[0, .5, 1].map((f) => <line key={f} x1={pad.l} x2={w - pad.r} y1={pad.t + plotH * f} y2={pad.t + plotH * f} stroke="var(--bch-gray-200)" />)}
        {series.map((s) => (
          <polyline key={s.key} fill="none" stroke={s.color} strokeWidth="2.5"
            strokeDasharray={s.dashed ? "5 4" : undefined}
            points={data.map((d, i) => `${x(i)},${y(d[s.key])}`).join(" ")} />
        ))}
        {series.filter((s) => !s.dashed).map((s) => data.map((d, i) => (
          <circle key={s.key + i} cx={x(i)} cy={y(d[s.key])} r="3.5" fill={s.color} />
        )))}
        {data.map((d, i) => <text key={i} x={x(i)} y={height - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-sans)">{d[xKey]}</text>)}
      </svg>
      <div style={{ display: "flex", gap: 14, fontSize: 12, marginTop: 4 }}>
        {series.map((s) => <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, display: "inline-block" }} />{s.label}</span>)}
      </div>
    </div>
  );
}
