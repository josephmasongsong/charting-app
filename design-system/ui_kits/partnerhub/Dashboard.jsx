function Dashboard({ sideActive, onSideSelect }) {
  const { Sidebar, ProcessTimeline, QuickStartCard, SegmentedProgress, StatCard, AppHeader } = window.BCHousingDesignSystem_3b2feb;
  const { Scale, TriangleAlert, Mail } = window.BCHousingDesignSystem_3b2feb;
  return (
    <div>
      <AppHeader variant="dark" right={
        <div style={{ display: "flex", gap: 16, fontSize: 13.5, color: "#fff" }}>
          <span>Operational Review ▾</span><span>Support ▾</span><span>Mailbox</span><span>Duong Tran ▾</span>
        </div>
      } />
      <div style={{ display: "flex", minHeight: 560, background: "var(--surface-muted)" }}>
        <Sidebar activeItem={sideActive} onSelect={onSideSelect} />
        <div style={{ flex: 1, padding: 24, minWidth: 0 }}>
          <h3 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 700, fontFamily: "var(--font-sans)" }}>Welcome to PartnerHub, Duong!</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 4px", fontFamily: "var(--font-sans)" }}>Provider: Hacienda MT</p>
          <ProcessTimeline steps={[
            { label: "Initiate", state: "done" }, { label: "Preliminary", state: "done" },
            { label: "Report", state: "current" }, { label: "Demonstrate", state: "pending" },
            { label: "Site Visit", state: "pending" }, { label: "Close", state: "pending" },
          ]} />
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, alignItems: "start" }}>
            <QuickStartCard actions={["Read about the New OR Process", "Submit Documents", "View my Action Plan", "View the Knowledge Base"]} />
            <div>
              <div style={{ background: "#fff", border: "1px solid var(--border-default)", borderRadius: 6, padding: 16, marginBottom: 12, fontFamily: "var(--font-sans)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  <div>
                    <b style={{ fontSize: 16 }}>Operational review 2026</b>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>STATUS: <b style={{ color: "var(--bch-gold-600)" }}>IN PROGRESS</b></div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", textAlign: "right" }}>
                    Document Submission Due Date<br /><b style={{ color: "var(--bch-green-500)" }}>September 15th 2026</b>
                  </div>
                </div>
                <b style={{ fontSize: 14 }}>Core Areas</b>
                <div style={{ marginTop: 10 }}>
                  <SegmentedProgress label="Organization and Governance" segments={[{ value: 62, state: "complete" }, { value: 20, state: "inProgress" }]} />
                  <SegmentedProgress label="Asset and Facility Management" segments={[{ value: 38, state: "complete" }, { value: 34, state: "inProgress" }]} />
                  <SegmentedProgress label="Client and Community Focus" segments={[{ value: 15, state: "complete" }, { value: 12, state: "inProgress" }]} />
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
  );
}
window.Dashboard = Dashboard;
