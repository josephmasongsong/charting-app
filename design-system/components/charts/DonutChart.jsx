import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import { chartCard, chartTitle } from "./BarChart.jsx";

// §4.11 donut: innerRadius 46 / outerRadius 80, starts at 12 o'clock and runs
// clockwise (startAngle 90 → endAngle -270), legend to the right with value + percent.
const INNER = 46, OUTER = 80, BOX = OUTER * 2 + 4;

export function DonutChart({ title, data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={chartCard}>
      {title && <p style={chartTitle}>{title}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <PieChart width={BOX} height={BOX}>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
            innerRadius={INNER} outerRadius={OUTER} startAngle={90} endAngle={-270}
            stroke="none" isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
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
