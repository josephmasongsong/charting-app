# /sites/[id] vs design-system/templates/site-detail/SiteDetail.dc.html

**Template:** `SiteDetail.dc.html` — "Read-only site record: KPIs, a profile card (location-marker avatar, key fields, assigned worker), and an event feed below." **Caveat:** the description and the script's `renderVals()` both mention/compute `recentEvents`, but the markup renders no event feed — the template's actual sections are KPIs → profile card → supply inventory table. The feed was evidently cut; treat the markup as authoritative.
**App:** `src/app/sites/[id]/page.tsx` (server: `getSite` — sites ⟕ users ⟕ community_partners; `getSiteSupplies` — site_supplies ⋈ supplies with `quantity * costPerUnit`, ordered by name; `getSiteEventsCount` — all-time `count(*)`; `redirect('/login')`, `notFound()`, `isAdmin`, `generateMetadata`), plus client buttons `EditButton` (→ `/admin/sites/[id]/edit`), `GoogleMapsButton` (`window.open` maps URL from lat/lng), shared `BackButton` (`router.back()`).

## Card-by-card: keeps / drops / reorders

| App section | Template verdict |
|---|---|
| Stat card: Total Tenants | **Kept** as KPI "Total tenants" (note line "Occupied units as of …"). |
| Stat card: Events Held | **Kept** as KPI "Events held", but scoped "Last 12 months" (app counts all-time). |
| Stat card: Senior Only (Yes/No) | **Dropped as a KPI** — demoted to profile field "Tenancy Type" ("Single seniors only" wording, not Yes/No). |
| Stat card: Community Room (Yes/No) | **Dropped as a KPI** — demoted to profile field "Community Room". |
| — | **New KPI: "Avg attendance"** with "% of tenants per event" note. |
| — | **New KPI: "Inventory value"** with "N units on hand" note (app already computes both totals, but shows them inside the Supply card). |
| Assigned Staff card | **Merged** into the right column of the single profile card: `AvatarTile` initials (44px), worker name as a link (template targets a user-detail page), job title below. App shows gradient-circle initials + name + **email**; template shows **title**, no email. |
| Community Partner card | **Dropped entirely** — no partner appears anywhere in the template. |
| Supply Inventory card | **Kept, transformed**: from totals-tiles + first-5 row list + "View All" button to a full dense table (teal header: Item / On hand / Unit cost / Value; per-row "Par level N · Counted date" subline; "N low" warning pill when qty < par; `#AEDBD3` totals row), plus an outline "Request stock" button in the card header and a conditional low-stock warning banner (`--warning-surface`). No 5-row cap, no "View All". |
| Location card | **Dropped as a card** — address becomes a `ProfileField`, and the map becomes a 220×220 Google Maps **embed iframe** in the profile card's first column with the site name beneath. `GoogleMapsButton` has no template counterpart. |
| Header buttons | Template: outline "Log an event" + primary "Edit site", both unconditional. App: `BackButton` + `EditButton`, both **inside the `isAdmin` block** (non-admins currently get no back button — pre-existing quirk). Template has no back button. |

**Order** (template top→bottom): header → 4 KPIs → profile card (map | fields | worker) → supply inventory. App order: header → 4 stats → 2-col grid (Staff, Partner, Supply | Location). Net: Staff/Location/booleans collapse into one profile card; Supply moves last and goes full-width.

## A. Visual differences — same data, different presentation

| Element | Template | App today |
|---|---|---|
| Shell | `--surface-page`, max-w 1180px, `24px 24px 44px` | `min-h-screen bg-background p-6` → `max-w-7xl space-y-6` |
| Title block | 28px bold, subtitle "Site record and assigned worker." | `text-3xl` + "Site details and information" |
| KPI cards | Left 4px `--surface-chrome` bar, uppercase 11.5px muted label, 30px teal value, 12.5px note — the `ui/kpi-card` pattern already used on /events/[id] | shadcn Card, 24px bold value, label below, right-aligned lucide icon in raw hues `text-blue-500/green-500/purple-500/orange-500` |
| Profile card | Single 3-col card (`220px / 1fr / 1.1fr`, 32px padding): map, `ProfileField` stack (Address / Region / Tenancy Type / Community Room), Assigned Worker block | Three separate Cards (Staff, Partner, Location) with icon CardTitles |
| Worker avatar | `ui/avatar-tile` initials, 44px | `bg-gradient-to-br from-blue-500 to-purple-500` circle (raw palette; the DS placeholder treatment replaced this on /events/[id]) |
| Supply table | Dense teal-header grid, par subline, right-aligned numerics, `#AEDBD3` totals row | Two `bg-muted` totals tiles (`text-green-600` value), bordered row list capped at 5, outline qty Badge, dead "View All N Supplies" button (no handler) |
| Supply empty state | None shown (template assumes stock) | Centered `Package` icon + "No supplies at this site" — keep, style via `ui/empty-state` |
| Location/map | Embedded iframe built from address query | Address text + `GoogleMapsButton` (`window.open` lat/lng) |
| Yes/No fields | Prose values ("Single seniors only", "Yes — capacity 40, bookable") | Bare "Yes"/"No" in stat cards |
| Chrome | Teal `AppHeader` with home/account on the right | Root layout chrome (shared-chrome item, out of scope for a route pass) |

## B. New UI with no data behind it

| Element | Needs | Detail |
|---|---|---|
| "Region" profile field | **DB column** | `sites` has no region column (same gap as SiteForm's disabled Region select, `docs/gaps/admin-sites-new.md`). Render with an em-dash/TODO. |
| Worker job title | **API field** | `users.jobTitle` exists (it's in the session token) but `getSite` doesn't select it; app shows email instead. Query change = wiring, not this pass. |
| Worker name → user detail link | **route** | No user-detail route exists in the app; template links to `user-detail`. Render unlinked. |
| "Log an event" header button | **purely cosmetic** | `/events/new` exists and takes users to the event form. Rendering it as a working link is arguably a behaviour addition — flag at visual-pass time; default is render + TODO, wire to nothing. |
| "Request stock" button | **API endpoint (feature)** | No request-stock flow exists anywhere. Also touches the **inventory-direction hold** (add vs move, `DEFERRED.md` candidate). Disabled + TODO. |
| Par level per supply | **DB column** | `site_supplies` has no par/target column; the "Par level N" subline, the "N low" pill, and the low-stock banner all derive from it. All three render only when par exists — omit or stub until the column decision. |
| Low-stock warning banner | **DB column** (par) | Same dependency; additionally on hold per inventory-direction. Template hardcodes `#f0e2b0` border — nearest token is `--warning-*`; if no border token fits, report at visual-pass time per rules. |
| "Counted <date>" subline | **purely cosmetic** | `lastUpdated` (`site_supplies.updatedAt`) is already selected; "Counted" wording implies a stocktake the app doesn't track — label choice only. |
| KPI: Avg attendance | **API field** | Needs an aggregate over the site's events' attendance in the page query; only `count(*)` is fetched today. |
| KPI: Events held, "Last 12 months" | **API field** | Current count is all-time; the 12-month window is a query change. Cosmetic if the note text is dropped instead. |
| KPI: Inventory value | **purely cosmetic** | `totalSupplyValue`/`totalSupplyItems` are already computed — promotion from the Supply card to a KPI is presentation only. |
| KPI note lines ("Occupied units as of Jul 2026", "% of tenants per event") | **purely cosmetic** | As-of copy has no data source; the % is derivable from `numberOfTenants`. |
| Community Room detail ("capacity 40, bookable") | **DB column** | App has only the boolean; render "Yes"/"No" as the field value. |
| Map embed iframe | **purely cosmetic** | Buildable from existing `latitude`/`longitude` (`maps.google.com/maps?q=<lat>,<lng>&z=15&output=embed`); no key needed for the embed URL the template uses. |

Template also **drops** things the app must keep (behaviour, not visuals): the admin-only guard on Edit, the Back button, the Community Partner data (dropping its display is a visual choice to confirm — the data is fetched and shown today), and the 404/redirect flow. The dead "View All N Supplies" button (no handler) disappears naturally if the table is uncapped.
