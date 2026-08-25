import React from "react";
import { LineChart as RLineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { chartCard, chartTitle, gridStroke, tickStyle, tooltipStyle, ChartLegend } from "./BarChart.jsx";

// §4.11 line: solid series 2.5px with r=3.5 dots; reference/target series are
// dashed "5 4" action-blue with no dots. Y domain hugs the data (trend-vs-target
// charts are read for the gap, not the absolute level).
export function LineChart({ title, data, xKey, series, height = 200 }) {
  return (
    <div style={chartCard}>
      {title && <p style={chartTitle}>{title}</p>}
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 460, height }}>
        <RLineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={tickStyle(10)} />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip cursor={{ stroke: gridStroke }} {...tooltipStyle} />
          {series.map((s) => (
            <Line key={s.key} type="linear" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5}
              strokeDasharray={s.dashed ? "5 4" : undefined}
              dot={s.dashed ? false : { r: 3.5, fill: s.color, stroke: s.color, strokeWidth: 0 }}
              activeDot={s.dashed ? false : { r: 5, fill: s.color, stroke: "#fff", strokeWidth: 1.5 }}
              isAnimationActive={false} />
          ))}
        </RLineChart>
      </ResponsiveContainer>
      <ChartLegend series={series} marginTop={4} />
    </div>
  );
}
