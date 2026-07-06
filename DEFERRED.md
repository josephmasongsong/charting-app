# Deferred Work

Decisions to **not do X yet**, each with the reason it was punted. This is not a
general backlog — every item here was consciously held back, and the _why-punted_
is the valuable part. Kept in-repo (not in an issue tracker) so it's legible to an
agent: point Claude Code at this file and it reads the task, the reason, and the
plan for free.

Knowledge and principles live in `SECOND_BRAIN.md`, not here — this file holds
things you _owe_, not things you _know_. Close an item → delete it.

Rough order reflects dependencies: Playwright unblocks the refactor and the
prev/next feature; the migration waits on everything.

---

### 1. Set up Playwright (or equivalent) for browser-based verification

- **Why now / why punted:** Deferred in Session 2 because the date picker was the better first agentic-loop task — but this is the thing that unblocks real UI verification, so it's first in line.
- **What:** The repo has no Playwright, Puppeteer, or Cypress. Bugs that manifest as React state issues, dropdown behavior, click handling, or form submission can't be agent-verified.
- **Why it matters:** Until this exists, the agentic verification loop is broken for UI work. Every UI bug fix requires manual handoff to the human. The "self-correcting chain" (build → screenshot → detect → fix → verify) is theoretical until this ships.
- **What to do:** Standalone task. Install Playwright, configure for the Next.js dev server, write one trivial smoke test, then write a regression test for the `DateRangeDialog` year-and-month bug as the first real test. Once in place, revisit the refactor below with Playwright as the safety net.

### 2. Fix the RBAC leak: Partners can see the monthly reporting screen

- **Why now / why punted:** Noticed when reopening the app in July 2026; deprioritized because the date picker was the better first agentic-loop task. This is the next real bug after the date picker is fully closed.
- **What:** Users with the "Partner" role can access the monthly reporting screen and should not be able to.
- **Why it matters:** Real security issue. Blast radius of getting an RBAC fix wrong is high — either the leak persists or authorized users get locked out.
- **What to do:** Treat as security-sensitive: tight scope, human-in-the-loop verification of _both_ the leak being closed _and_ authorized roles still having access. **Do not run this one purely agentic.** Verify against the actual role model before touching code.

### 3. Refactor DateRangeDialog to remove the URL-to-state mirroring useEffect

- **Why now / why punted:** Both Session 2 bugs traced to this pattern. The current fix gates the effect on the open transition but leaves the anti-pattern in place. Doing the real refactor without automated verification is risky — so it waits on Playwright (item 1).
- **What:** `src/components/reports/monthly/DateRangeDialog.tsx` uses a `useEffect` to copy URL params into local state. This is a known React anti-pattern. Each future field added must be initialized in two places (`useState` + reset effect) or risk drift.
- **Why it matters:** This component will keep generating subtle bugs as it grows. The current fix works but is a patch.
- **What to do:** Refactor to derive dialog state without the mirroring effect. Options: initialize state from `currentParams` only on mount; or compute displayed values directly from `currentParams` without local state. Do this only after Playwright is installed to catch regressions.
- **Check first (migrated from the unstable-references gotcha):** Before refactoring, read the parent component and verify how `currentParams` is constructed. If it's an inline object literal, memoize it or lift it appropriately — otherwise any prop-dependency-based effect you introduce will fire on every render.

### 4. Add prev/next period navigation buttons on the monthly report page

- **Why now / why punted:** Raised alongside the date picker bug; explicitly scoped out to keep the bugfix clean. Waits until the date picker work is fully stable and Playwright exists.
- **What:** Add "previous period" and "next period" navigation buttons above the date selection on the monthly report page, so users can move through periods without opening the picker each time.
- **Why it matters:** Small UX improvement, low risk. Good candidate for a follow-up agentic task.
- **What to do:** After the date picker regression is fully closed and Playwright is in place, take this on as a feature-add task. Should be small enough to one-shot with Claude Code.

### 5. Migrate Neon → Supabase for Canadian data residency

- **Why now / why punted:** **Not yet.** Privacy posture (no PII stored) reduces urgency. Revisit after the demo, after `CLAUDE.md` / rules / Second Brain are stood up, and after Playwright is in place as a safety net.
- **What:** The app currently uses Neon Postgres. Supabase offers Canadian regions, which was the original stated motivation in the intake doc.
- **Why it matters:** The intake doc emphasizes Canadian data hosting. The current Neon setup may not satisfy that, depending on region. Long-term, aligning with stated design intent matters for stakeholder trust and future audits.
- **What to do:** Design as a multi-session agentic exercise with explicit verification at each step — schema migration, client library swap, env var changes, deploy config.
