# /sites vs the converted /admin/sites (no template)

**Template:** none. `docs/AUDIT.md` §5.4 maps `/sites` to `site-management` minus admin controls; the reference here is the converted `/admin/sites` (`af2f88d`, `d71869f`), not the `.dc.html`.
**App:** `/sites` → `src/app/sites/page.tsx` (server: `getSites()` Drizzle query over `sites ⋈ users ⋈ community_partners`, URL-param filters, 10/page ordered `createdAt desc`, plus filtered `count(*)`; `getFilterOptions()` = users owning ≥1 site; `redirect('/login')`; `isAdmin` via an `(session as any)` cast) → `src/app/sites/components/SitesListClient.tsx` (client: URL-synced filters, row cards, 7-window pagination).
**Data sources:** the query above; search params `search`, `page`, `isSingleSeniorOnly`, `hasCommunityRoom`, `userId`. No API routes — this list never touches `/api/admin/sites`.

This page is **not yet converted**; the rows below compare it to the converted admin list so the eventual visual pass knows what is shared, what is read-only-specific, and what is broken today.

**Duplication note (facts only, for the §5.6 refactor — no action here).**

- `SitesListClient.tsx` (401 lines) vs the converted `SitesTable.tsx` (591): different data mechanisms (server props + `router.push` URL round-trips vs client `fetch('/api/admin/sites')`), so nothing is literally shared; the overlap is parallel re-implementation. Both render six of the same site fields (`name`, `address`, `numberOfTenants`, `userName`, `hasCommunityPartner`, plus one exclusive each — `communityPartnerName` on the list, the boolean pills on the table), both implement a search control, an empty state with clear-filters, admin-gated row actions, and windowed pagination (47-line block with a 7-page window vs 168-line block with First/Last + current±2). Roughly half of `SitesListClient` has a direct counterpart in `SitesTable`.
- `SitesListClient.tsx` vs `EventsListClient.tsx` (576): same skeleton, near clone — identical `updateURL` shape (6 occurrences each), identical handler pattern (`handle*Change` → `setState` + `setCurrentPage(1)` + `updateURL`), identical `clearFilters`/`activeFiltersCount` predicates, byte-identical pager math (`Math.min(totalPages, 7)` with the same window branches), and (pre-conversion) the same `Card hover:shadow-sm` row-card grid. This is the three-implementations-of-one-list overlap `AUDIT.md` §5.6 already defers.

## A. Visual differences — same data, different presentation

| Region of page | Converted /admin/sites | /sites today | Notes |
|---|---|---|---|
| Purpose / controls | Admin management: dense table, working Delete dialog, Add Site, stat cards. | Read-only staff list: row cards, view-first, admin Edit/Delete appended when `isAdmin`. | The read-only variant keeps `Eye`-style viewing for everyone and has no create/delete capability of its own. |
| Chrome / wrapper | Admin layout (`requireAdmin`, `p-6 max-w-7xl`), page adds only `space-y-5`. | Root layout; component brings its own `min-h-screen bg-background p-6` → `max-w-7xl mx-auto space-y-6`. | Not yet on `--surface-page`; same old double-spacing style the admin page had. |
| Header | "Sites Management" 30px + DS primary "Add Site" → `/admin/sites/new`. | `text-3xl` "Sites" + "Browse all locations"; default `Button` "Create New Site" wrapped in `Link` → **`/sites/new`, a route that does not exist** (`src/app/sites/` holds only `[id]`, `components`, `page.tsx`; creation lives at `/admin/sites/new`, admin-gated). | Broken link today, shown to every user including non-admins. Also `Link`-wrapping-`Button` nesting. |
| Search | Submit-only single control, inline icon as the submit button; API matches name, address, **worker name**, partner name. | Live on keystroke — `handleSearch` fires `router.push` per character (a full server round-trip each keypress); matches name, address, partner name but **not** worker name (`getSites` has three `ilike` targets). | Both the timing and the field set differ from the admin list. |
| Filters | None beyond search (template has none; stats row instead). | Three `Select`s the admin list lacks: Senior-Only (`All Residencies` / `Single Seniors Only` / `Mixed Tenancy`), Community Room, Assigned Staff (owners only, from `getFilterOptions`); `Filter`/`UserCheck` icons in triggers; "Clear (N)" button. | **`/sites`-only capability to keep** — these are the read-only list's substitute for the admin booleans columns. |
| Sort | Name sortable (ghost header button), default `createdAt desc`. | No sort control; fixed `createdAt desc`. | |
| Rows | Dense teal-header grid: name link, address, Tenants badge, Assigned Worker, three `BooleanBadge` pills, ghost icon actions. | One `Card hover:shadow-sm` per site: `Building2` icon + `font-semibold` name (not a link), partner-name `secondary` badge, muted meta line (address truncated at `22ch`, "N tenant(s)", worker). Booleans not shown — a dev comment `{/* Removed badges for isSingleSeniorOnly and hasCommunityRoom as requested */}` remains (rules: delete when this file is touched). | Field sets diverge: the list shows `communityPartnerName` (the admin table drops it); the admin table shows the booleans (the list dropped them, though they remain filterable). |
| Row actions | Name-link navigation; `PenLine` (action-blue ghost) + `Trash2` (destructive ghost) opening `DeleteSiteDialog`. | `Eye` outline button → `/sites/[id]` for everyone; `isAdmin` adds `Edit` (`/admin/sites/[id]/edit`) and a `Trash2` with `text-red-600 hover:text-red-700` and **no `onClick`** — it does nothing (`DeleteSiteDialog` is only wired into `SitesTable`). | Two raw palette classes; the dead button predates the redesign. |
| Empty state | Two-state copy in the table row + "Clear search" link. | Card with `Building2` icon, "No sites found", "Try adjusting your search or filters", "Clear all filters" when filters active. | Same grammar as the pre-conversion events list. |
| Pagination | Always-visible footer, "Showing X to Y of N results", First/Prev/window/Next/Last in DS button treatment. | Centred Prev / ≤7 numbers / Next, hidden at one page; no First/Last, no range label; "Showing N site(s)" line above the list instead. | |
| Loading / messages | "Loading..." + `Loader2`; success/error Alerts with 5s auto-clear. | None — server-rendered; no client fetch, no message channel. | Nothing to carry over; filter changes re-render via navigation. |

## B. New UI with no data behind it

| Element | What it shows | /sites has? | Needs | Detail |
|---|---|---|---|---|
| "Create New Site" target | A create page at `/sites/new`. | Link exists; route does not. | **cosmetic** (retarget) — a `/sites/new` route would be a feature | The working destination is `/admin/sites/new` (admin-only); the button currently 404s for everyone and shows for non-admins who cannot create sites either way. |
| Row Delete (`Trash2`) | Deletes a site. | Rendered for admins, no handler. | **client state** | `DeleteSiteDialog` + `DELETE /api/admin/sites/[id]` exist and are wired only in `SitesTable`; here the button is a no-op. |
| Search across worker name | Parity with the admin list's search. | No — `getSites` matches name/address/partner only. | **API field** | Add the `CONCAT(first_name,' ',last_name)` `ilike` to `getSites` in `page.tsx` (the join is already there). |
| Stat cards (if the read-only page adopts the admin header) | Totals row. | No. | **API field** | Same missing aggregates as `/admin/sites` (`docs/gaps/admin-sites.md` B). |
| Name-sort control | Sortable Name column/label. | No. | **client state + API field** | Would need a `sortBy` search param handled in `getSites`; the admin API's whitelist shows the shape. |

Facts only, per the request — no conversion or refactor is proposed here.
