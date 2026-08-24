function FeedbackWizard({ activePart, setActivePart, situation, setSituation }) {
  const { AppHeader, WizardTabs, WizardPanel, Radio, Button } = window.BCHousingDesignSystem_3b2feb;
  const parts = [0, 1, 2, 3, 4, 5].map((i) => ({
    label: `Part ${i + 1}`, state: i < activePart ? "complete" : i === activePart ? "active" : "upcoming",
  }));
  const situations = [
    "Subsidized housing (landlord is BC Housing)",
    "Subsidized housing (landlord is a non-profit or co-op)",
    "Private market rental (landlord is an individual or company)",
    "Shelter or temporary housing",
    "Application or benefit",
    "BC Housing activity in the community",
    "Violation of the Homeowner Protection Act",
  ];
  return (
    <div>
      <AppHeader variant="teal" right={<nav style={{ display: "flex", gap: 16, fontSize: 15 }}><span style={{ borderRight: "1px solid rgba(255,255,255,.35)", paddingRight: 16 }}>Home</span><span>Feedback Forms</span></nav>} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 64px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", fontFamily: "var(--font-sans)" }}>Public Feedback Form</h1>
        <WizardTabs parts={parts} onSelect={(i) => i <= activePart && setActivePart(i)} />
        <WizardPanel title="Basic information" footer={<>
          <Button variant="outline" onClick={() => setActivePart(Math.max(0, activePart - 1))}>Previous</Button>
          <Button onClick={() => setActivePart(Math.min(5, activePart + 1))}>Next</Button>
        </>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
            <div>
              <div style={{ fontSize: 15, marginBottom: 6, fontFamily: "var(--font-sans)" }}>Pick the option that best describes the situation you'd like to give feedback about:<span style={{ color: "var(--danger)" }}> *</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {situations.map((s, i) => <Radio key={s} name="situation" label={s} checked={situation === i} onChange={() => setSituation(i)} />)}
              </div>
            </div>
            <p style={{ color: "var(--danger)", fontSize: 15, margin: 0, fontFamily: "var(--font-sans)" }}>
              Our team does not review tenancy or property maintenance complaints. Please visit our <a href="#" onClick={(e) => e.preventDefault()}>Feedback page</a> for more information.
            </p>
          </div>
        </WizardPanel>
      </div>
    </div>
  );
}
window.FeedbackWizard = FeedbackWizard;
