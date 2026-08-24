import React from "react";
export function AppFooter() {
  return (
    <footer style={{ background: "var(--surface-chrome)", color: "#fff", textAlign: "center", padding: 24, fontSize: 14.5, fontFamily: "var(--font-sans)" }}>
      Copyright © {new Date().getFullYear()} <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#fff" }}>BC Housing</a>. All rights reserved.
    </footer>
  );
}
