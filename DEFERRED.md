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

### 2. Decide whether `/reports/monthly` needs a role gate at all

- **Why now / why punted:** This item used to read "Partners can see the monthly reporting screen". **The Partner role was removed entirely on 2026-09-09** (type, pickers, invite/PATCH whitelists, `isPartner`), so the leak as originally written cannot occur — no account can hold that role, and both write paths reject it with a 400. There were zero Partner accounts at removal time, so nothing was migrated.
- **What remains:** The screen itself is still not role-gated. `src/app/reports/monthly/page.tsx` has no `requireRole` call; the only role logic is inside `src/server/actions/reports.ts`, which scopes rows (`session.user.role === 'admin' ? sql\`true\` : eq(..., session.user.id)`) rather than denying access. So any authenticated `user` can open the report and see their own data.
- **Why it matters:** That may well be correct — a TEW seeing their own numbers is the point of the screen. The open question is whether a non-admin should see the screen at all, which is a product decision, not a bug.
- **What to do:** Confirm the intent with the TEW team. If non-admins should be blocked, add `await requireRole('admin')` to the page and verify **both** that a `user` account is redirected and that admins still get through. Do not assume the row-scoping is a substitute for a gate.

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

### 6. Decide the site-inventory direction (par levels, request-stock flow)

- **Why now / why punted:** Surfaced repeatedly during the August 2026 redesign conversion: the design-system templates show par-level sublines, low-stock pills, a warning banner, and a "Request stock" action on `/sites/[id]` — but the schema has no par column and no restock/request flow exists. Reviewing the redesign's open decisions on 2026-08-23, the call was to keep this deferred rather than pick a direction mid-redesign.
- **What:** Decide whether site inventory grows toward (a) per-site par levels (a `site_supplies` column + admin UI) driving low-stock states everywhere, and/or (b) a worker-facing request-stock flow. Until then the `/sites/[id]` "Request stock" button and par-level TODOs stay stubbed.
- **Why it matters:** Touches schema, two forms, and reporting; guessing wrong bakes in a workflow the TEW team doesn't actually run.
- **What to do:** Product conversation with the TEW team first, then a schema plan, then wire the stubbed UI. Two constant thresholds now exist as stopgaps, both to fold into par levels when they land: the distribution form warns when a hand-out would leave ≤3 on hand (ratified 2026-08-25), and the dashboard's Needs Attention rail flags any tracked site supply under 10 units (`LOW_STOCK_THRESHOLD` in `/api/dashboard`, chosen 2026-08-25).

### 7. Feature backlog surfaced by the redesign (shelved 2026-08-25)

- **Why now / why punted:** The redesign conversion surfaced a set of features the design system implies but the app never had. (One of the original six — the dashboard tenant-referrals card — is closed: referrals shipped as a real entity on 2026-09-09. The card was never actually a live stub by then; it had been deleted in `bb87b11`.) Reviewing the open decisions, the call was to shelve the whole set rather than spec any mid-redesign.
- **What:** User invitations (an `user_invited` activity verb already exists with no sender), a distribution **Edit** flow (create/delete exist, no update), per-event and per-distribution CSV exports (only the monthly-report export exists), admin reset-password, and an email-verification flow (the half-built `email_verified` column and its admin toggle were removed on 2026-09-09 rather than left as a field nothing set; a real flow would start from scratch).
- **Why it matters:** Each is user-visible surface the templates gesture at; leaving them undecided invites ad-hoc half-builds.
- **What to do:** Pick any item and spec it as its own task. Each needs product input first (who can invite? what does "verified" gate?); none blocks the redesign.

### 8. Referrals in the monthly report (deferred 2026-09-09)

- **Why now / why punted:** The `referrals` entity shipped 2026-09-09 (form, API, detail page, admin table, activity feed). Reporting was scoped out of that build deliberately: `/reports/monthly` is the app's most complex screen, and adding an aggregate there is a bigger change than the entity itself.
- **What:** `docs/gaps/log-out-of-scope-request.md` line 41 and `docs/gaps/reports-monthly.md` both specify a "Tenant Referrals" card — total, delta vs the previous period, a donut by `referred_to`, and a stacked bar by `channel`.
- **Why it matters:** Referrals are currently visible in the activity feed and the admin table only. The monthly report is what the TEW team actually sends upward, so referral work stays invisible to stakeholders until this lands.
- **What to do:** Six touchpoints, all following the `supplyDistributions` precedent: a current-period aggregate and a near-duplicate previous-period aggregate plus growth block in `src/server/actions/reports.ts`; `ReferralSummary` / `MonthlyReferralGrowth` in `src/components/reports/monthly/types.ts` and the fields on `MonthlyActivityReportData`; a `ReferralsSidebar.tsx` plus its barrel entry; and a sheet section in `MonthlyReportExportButton.tsx`. Note the top-level `src/components/MonthlyActivityReport.tsx` is a dead duplicate — follow the import path from `src/app/reports/monthly/page.tsx`.
