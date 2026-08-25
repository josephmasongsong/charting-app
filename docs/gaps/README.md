# Template → route gap analysis

One file per design-system template, comparing `design-system/templates/<name>/<Name>.dc.html`
against the live app route. Generated 2026-08-23 on branch `redesign`; no code was changed.

Every file has the same three sections:

- **A. Visual differences** — same data, different presentation.
- **B. New UI with no data behind it** — each row tagged with what it needs: **DB column**,
  **API field**, **client state**, or **cosmetic** (combinations joined with `+`).
- **C. Notes** — ambiguities, mock-only content, and **app data the template dropped**.

Across the 20 files there are 244 B-table rows: client state 121 mentions, cosmetic 70,
API field 54, DB column 37. Findings come from reading the template HTML/data scripts and the
live source; nothing was checked in a browser.

| Route | Template | File | Biggest visual change | Most notable missing data |
|---|---|---|---|---|
| `/dashboard` | `dashboard` | [dashboard.md](dashboard.md) | Layout flips to a 300px Quick Start column left + design-system feed right with "Load more"; a "Needs Attention" rail is added. The template has **no KPI cards or time filter** despite its own description. | Attention items need per-site last-event dates and a low-stock threshold that no table has; "Log Referral" has no table, route or activity type. Drops the app's 4 metric cards and the admin nav card (the only in-app path to `/admin/*`). |
| `/login` | `sign-in` | [login.md](login.md) | Full-bleed brand-blue page, 480px card, wordmark; the `/` "Welcome" interstitial has no counterpart. | None new; the page never reads `?error=account_deactivated` that `middleware.ts` sets. |
| `/forgot-password` (+ `/reset-password/[token]`) | `reset-password` | [reset-password-[token].md](reset-password-[token].md) | Template covers **only the request step** (`AUDIT.md §5.1` maps it to the token page); success box shown above the form instead of replacing it. | An "expired link" state on load is impossible — `/api/reset-password/[token]` has only POST. |
| `/settings` (subsumes `/profile` stub) | `account-settings` | [settings.md](settings.md) | Blue header variant, teal role pill, Verified/Unverified pill inside the email field, role read-only for everyone. | **No `email_verified` column** or verification flow; template's `staff` role value doesn't exist. |
| `/events` | `events` | [events.md](events.md) | One card per event → single card with teal month/site header bands and date tiles; toolbar with date-range select; "Load 12 more" instead of numbered pages. | Date-range filter (no `event_date` condition in `getEvents`) and search across site/organizer (only `title` today). Delete is a no-op on both sides. |
| `/events/[id]` | `event-detail` | [events-[id].md](events-[id].md) | Seven cards collapse into the Profile pattern: 4 KPI tiles, one profile card, "What Happened", Reported Figures table with totals. | `recordId` "EVT-2026-0184" (ids are uuids), organizer link (no `/users/[id]` route), per-event CSV export. Drops program goal, site address, Co-hosted badge. |
| `/events/new` (+ edit) | `log-event` | [events-new.md](events-new.md) | Six cards → four, sticky required-fields rail and bottom action bar, duration quick-chips, native date input. | None at column level for rendered fields; unbound `time` / `senior` / `partnerType` would each need a column. Three conflicting required-field rule sets; `isAdmin` is never passed on `/events/new`. |
| `/sites/[id]` | `site-detail` | [sites-[id].md](sites-[id].md) | Stat cards + four stacked cards → one profile card with embedded map and a real supply table; two KPIs change meaning. | **Par level** for low-stock (no column), stock requests (no table), `sites.region`, community-room capacity. The promised event feed is built in the script but never rendered. |
| `/admin/sites` | `site-management` | [admin-sites.md](admin-sites.md) | Four-stat row, teal zebra table with name as link, "Assigned Worker" label; **Tenants column dropped**. | Aggregates (total tenants, with-room, senior-only) not returned by `GET /api/admin/sites`. `/sites` links to a nonexistent `/sites/new`. |
| `/admin/sites/new` (+ edit) | `create-site` | [admin-sites-new.md](admin-sites-new.md) | Two-column form with sticky checklist rail, street/city/postal + "Find on map" geocode step, property tiles, live "N will remain" supply math. | No geocoder exists; no `region`, `postal_code` or draft status on `sites`. **Conflict:** template moves supplies *out of* inventory, but `POST /api/admin/sites` *adds* to `supplies.quantity`. |
| `/admin/supplies` | `supplies-management` | [admin-supplies.md](admin-supplies.md) | Created/Updated columns dropped, name becomes the view link, add/edit share one teal modal. | Nothing new. The app's "Total Quantity" (`SUM(site_supplies.quantity)`) and the view modal's "Total Units" (`supplies.quantity`) can disagree. |
| `/admin/supply-distributions` | `distribution-management` | [admin-supply-distributions.md](admin-supply-distributions.md) | Four KPI cards above the table, View navigates to a page, Cost as a column. | Aggregate KPIs need sums no endpoint returns; template omits `emergency_distribution`. |
| `/supply-distributions/[id]` — **no route** | `distribution-detail` | [supply-distributions-[id].md](supply-distributions-[id].md) | Admin dialog → full Profile-pattern page with Edit/Delete. | No PATCH endpoint; no `/users/[id]` route. **Bug:** `[id]/details/route.ts` builds `userName` with the Drizzle column object, so "Distributed By" renders `Firstname [object Object]`. Template drops `recipient_notes` (NOT NULL) and `notes`. |
| `/supply-distributions/new` | `log-distribution` | [supply-distributions-new.md](supply-distributions-new.md) | Two-column layout, sticky checklist, teal line-item grid with steppers and stock alerts, recipient card with counter. | "Recipient reach" fields (households/people) exist only in the script and have no columns; template calls recipient detail optional but `recipient_notes` is NOT NULL. |
| — **no route** | `log-out-of-scope-request` | [log-out-of-scope-request.md](log-out-of-scope-request.md) | Not applicable — a new feature, not a redesign. | Everything: implied `referrals` table (user, site, optional event, date, channel, referred_to), a POST route, page, feed type and report aggregates. |
| `/reports/monthly` | `monthly-reports` | [reports-monthly.md](reports-monthly.md) | Five auto-fit KPIs (adds cost/participant and avg participants; drops Items Distributed), `DataTable`s with totals, share-of-total site bars, new Tenant Referrals card, Month/Quarter/Year period picker. | "640 unique residents" is unbuildable (no participant identity by design); referrals card needs the referrals feature; total-sites denominator not returned. |
| `/admin/program-goals` | `program-goals` | [admin-program-goals.md](admin-program-goals.md) | Pagination removed (all rows), teal header, bare icon actions, teal-header dialogs. | Unfiltered total for "{{ count }} goals" — the API only returns the search-filtered total. |
| `/admin/activity-types` | `activity-types` | [admin-activity-types.md](admin-activity-types.md) | Created/Updated columns dropped; always-visible pager; select uses goal names as values. | Same unfiltered-total gap; template drops the Program Goal line from the delete confirmation. |
| `/admin/users` | `user-management` | [admin-users.md](admin-users.md) | Header-less staff-directory grid under a Users / Pending invitations tab bar, four KPI cards, A–Z jump strip. | **The whole "Pending invitations" tab** — no invitation state exists; `POST /api/admin/invite-user` creates an active user immediately. Drops Region, Status, Created columns and sorting. |
| `/admin/users/[id]` — **no route** | `user-detail` | [admin-users-[id].md](admin-users-[id].md) | Read-first profile page where the app has only an edit dialog. | "Developments" list — `sites.user_id` would back it but no API returns sites by user; development `status` has no column. |

## Cross-cutting findings

These recur in several files and are worth deciding once:

- **Three templates have no route** (`distribution-detail`, `user-detail`, `log-out-of-scope-request`) and two more link to routes that don't exist (`/users/[id]` from event detail and dashboard feed; `/sites/new` from the public site list).
- **Referrals** appear in four templates (dashboard Quick Start and feed, monthly report card, the referral form itself) and have no table, route or activity type.
- **Aggregate KPIs** on every admin list page (users, sites, distributions) need counts that the paginated list endpoints don't return.
- **"Load more" replaces numbered pagination** on the dashboard feed and events list; the APIs are page-based.
- **Vocabulary mismatches** that would break writes if copied literally: role `staff` (DB has `user`), job title "People, Plants and Homes" (DB has `People Plants & Homes`) and "Community Partner" (stored as NULL), status "Deactivated" vs "Inactive".
- **Data-model conflicts** to settle before the visual pass: site starter supplies add to vs. move from inventory; `recipient_notes` required vs optional.
- **Bugs found while comparing** (not template-related): `[object Object]` in distribution "Distributed By"; `/sites/new` link; `isAdmin` not passed on `/events/new`; no `<Toaster />` for the duplicate-event toast; `$` missing from the report's Total Cost formatter.
