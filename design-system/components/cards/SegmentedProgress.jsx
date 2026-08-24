import React from "react";
export function SegmentedProgress({ label, segments }) {
  const segColor = { complete: "var(--success)", inProgress: "var(--bch-gold-400)" };
  const done = segments.find((s) => s.state === "complete")?.value ?? 0;
  return (
    <div style={{ marginBottom: 16, fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
        <b style={{ fontWeight: 600 }}>{label}</b>
        <span style={{ color: "var(--text-muted)" }}>{done}% complete</span>
      </div>
      <div role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={100} aria-label={label}
        style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", background: "var(--bch-gray-200)" }}>
        {segments.map((s, i) => <div key={i} style={{ width: `${s.value}%`, background: segColor[s.state] }} />)}
      </div>
    </div>
  );
}
