import React from "react";
import { BarChart as RBarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList, Tooltip, ResponsiveContainer } from "recharts";

export const chartCard = { background: "#fff", border: "1px solid var(--border-default)", borderRadius: "var(--radius-card)", padding: 16, fontFamily: "var(--font-sans)" };
export const chartTitle = { fontSize: 14, fontWeight: 700, margin: "0 0 12px" };

// Shared house-style pieces (shadcn guide §4.11): gridlines #E6E6E6 horizontal only,
// no axis lines, labels 10–12px, value labels at bar ends, no motion.
export const gridStroke = "var(--bch-gray-200)";
export const tickStyle = (size) => ({ fontSize: size, fill: "var(--text-muted)", fontFamily: "var(--font-sans)" });
export const tooltipStyle = {
  contentStyle: { background: "var(--surface-card)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-card)", fontSize: 12, fontFamily: "var(--font-sans)", padding: "6px 10px" },
  labelStyle: { color: "var(--text-body)", fontWeight: 700 },
  itemStyle: { color: "var(--text-body)" },
};

export function ChartLegend({ series, marginTop = 8 }) {
  return (
    <div style={{ display: "flex", gap: 14, fontSize: 12, marginTop }}>
      {series.map((s) => <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, display: "inline-block" }} />{s.label}</span>)}
    </div>
  );
}

export function BarChart({ title, data, xKey, series, height = 220, layout = "vertical" }) {
  const horizontal = layout === "horizontal";
  return (
    <div style={chartCard}>
      {title && <p style={chartTitle}>{title}</p>}
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 460, height }}>
        {horizontal ? (
          <RBarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }} barCategoryGap="22%">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey={xKey} tickLine={false} axisLine={false} width={90} tick={tickStyle(10)} />
            <Tooltip cursor={{ fill: "var(--surface-muted)" }} {...tooltipStyle} />
            <Bar dataKey={series[0].key} name={series[0].label} fill={series[0].color} isAnimationActive={false}>
              <LabelList dataKey={series[0].key} position="right" fontSize={10.5} fontWeight={600} fill="var(--text-body)" />
            </Bar>
          </RBarChart>
        ) : (
          <RBarChart data={data} margin={{ top: 14, right: 10, bottom: 0, left: -20 }} barCategoryGap="20%" barGap={2}>
            <CartesianGrid vertical={false} stroke={gridStroke} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={tickStyle(11)} />
            <YAxis tickLine={false} axisLine={false} tick={tickStyle(10)} />
            <Tooltip cursor={{ fill: "var(--surface-muted)" }} {...tooltipStyle} />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} isAnimationActive={false}>
                <LabelList dataKey={s.key} position="top" fontSize={10} fontWeight={600} fill="var(--text-body)" />
              </Bar>
            ))}
          </RBarChart>
        )}
      </ResponsiveContainer>
      {!horizontal && series.length > 1 && <ChartLegend series={series} />}
    </div>
  );
}
