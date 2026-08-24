function Profile() {
  const { AppHeader, ProfileField, DevelopmentItem } = window.BCHousingDesignSystem_3b2feb;
  return (
    <div>
      <AppHeader variant="blue" right={<span style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", color: "var(--action-primary)", fontWeight: 700, display: "grid", placeItems: "center", fontSize: 14 }}>DT</span>} />
      <div style={{ background: "#fff", border: "1px solid var(--border-default)", borderTop: "none", borderRadius: "0 0 6px 6px", padding: 32, display: "grid", gridTemplateColumns: "220px 1fr 1.1fr", gap: 32, fontFamily: "var(--font-sans)" }}>
        <div>
          <div style={{ width: "100%", aspectRatio: "5/6", borderRadius: 3, color: "#fff", background: "linear-gradient(160deg,#8FA6B5,#6B8496)", display: "grid", placeItems: "center", fontSize: 56, fontWeight: 700 }}>SL</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>Sarah Lindqvist</div>
        </div>
        <div>
          <ProfileField label="Title">Portfolio Manager</ProfileField>
          <ProfileField label="Department">Supportive Housing Programs</ProfileField>
          <ProfileField label="Office Location">Home Office 3</ProfileField>
          <ProfileField label="E-mail"><a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--action-primary)" }}>slindqvist@bchousing.org</a></ProfileField>
          <ProfileField label="Work Phone">Work: 604-439-4188<br />Mobile: 604-439-4189</ProfileField>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Developments (4)</div>
          <DevelopmentItem dev={{ name: "Brick Lane Apartments", address: "1245 Main St, Vancouver", units: 45, status: "Operational" }} />
          <DevelopmentItem dev={{ name: "Hacienda MT", address: "880 Cambie St, Vancouver", units: 62, status: "Operational" }} />
          <DevelopmentItem dev={{ name: "Cedar Grove Terrace", address: "414 Columbia St, New Westminster", units: 38, status: "In development" }} />
          <DevelopmentItem dev={{ name: "Lillooet Commons", address: "102 Birch Ave, Pemberton", units: 24, status: "Operational" }} />
        </div>
      </div>
    </div>
  );
}
window.Profile = Profile;
