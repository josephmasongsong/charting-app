import React from "react";
export const chartCard = { background: "#fff", border: "1px solid var(--border-default)", borderRadius: "var(--radius-card)", padding: 16, fontFamily: "var(--font-sans)" };
export const chartTitle = { fontSize: 14, fontWeight: 700, margin: "0 0 12px" };

export function BarChart({ title, data, xKey, series, height = 220, layout = "vertical" }) {
  const w = 460, pad = { t: 10, r: 10, b: 24, l: layout === "horizontal" ? 90 : 30 };
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key] || 0)));
  const plotW = w - pad.l - pad.r, plotH = height - pad.t - pad.b;
  const n = data.length;
  return (
    <div style={chartCard}>
      {title && <p style={chartTitle}>{title}</p>}
      <svg width="100%" viewBox={`0 0 ${w} ${height}`} style={{ overflow: "visible" }}>
        {layout === "vertical" && [0, .5, 1].map((f) => (
          <line key={f} x1={pad.l} x2={w - pad.r} y1={pad.t + plotH * f} y2={pad.t + plotH * f} stroke="var(--bch-gray-200)" />
        ))}
        {layout === "vertical" ? data.map((d, i) => {
          const bandW = plotW / n, groupW = bandW * 0.6, barW = groupW / series.length;
          return series.map((s, si) => {
            const val = d[s.key] || 0;
            const bh = (val / max) * plotH;
            const x = pad.l + i * bandW + bandW * 0.2 + si * barW;
            const y = pad.t + plotH - bh;
            return (
              <g key={s.key}>
                <rect x={x} y={y} width={barW - 2} height={bh} fill={s.color} />
                <text x={x + (barW - 2) / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-body)" fontFamily="var(--font-sans)">{val}</text>
              </g>
            );
          });
        }) : data.map((d, i) => {
          const bandH = plotH / n, barH = bandH * 0.55;
          const val = d[series[0].key] || 0;
          const bw = (val / max) * plotW;
          const y = pad.t + i * bandH + (bandH - barH) / 2;
          return (
            <g key={i}>
              <rect x={pad.l} y={y} width={bw} height={barH} fill={series[0].color} />
              <text x={pad.l + bw + 6} y={y + barH / 2 + 3} fontSize="10.5" fontWeight="600" fill="var(--text-body)" fontFamily="var(--font-sans)">{val}</text>
              <text x={pad.l - 6} y={y + barH / 2 + 3} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-sans)">{d[xKey]}</text>
            </g>
          );
        })}
        {layout === "vertical" && data.map((d, i) => {
          const bandW = plotW / n;
          return <text key={i} x={pad.l + i * bandW + bandW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-sans)">{d[xKey]}</text>;
        })}
      </svg>
      {layout === "vertical" && series.length > 1 && (
        <div style={{ display: "flex", gap: 14, fontSize: 12, marginTop: 8 }}>
          {series.map((s) => <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, display: "inline-block" }} />{s.label}</span>)}
        </div>
      )}
    </div>
  );
}
