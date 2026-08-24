function StaffDirectory({ staff }) {
  const { AppHeader, StaffRow } = window.BCHousingDesignSystem_3b2feb;
  return (
    <div>
      <AppHeader variant="blue" right={<span style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", color: "var(--action-primary)", fontWeight: 700, display: "grid", placeItems: "center", fontSize: 14 }}>DT</span>} />
      <div style={{ background: "#fff", border: "1px solid var(--border-default)", borderTop: "none", padding: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {"ABCDEFGHI".split("").map((l) => (
            <span key={l} style={{
              width: 28, height: 28, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600, borderRadius: 3, cursor: "pointer", fontFamily: "var(--font-sans)",
              background: l === "D" ? "#fff" : "var(--action-primary)", color: l === "D" ? "var(--action-primary)" : "#fff",
              outline: l === "D" ? "2px solid var(--action-primary)" : "none", outlineOffset: -2,
            }}>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ border: "1px solid var(--border-default)", borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden", background: "#fff" }}>
        {staff.map((p, i) => <StaffRow key={p.email} person={p} selected={i === 0} striped={i % 2 === 1} />)}
      </div>
    </div>
  );
}
window.StaffDirectory = StaffDirectory;
