# /events/[id] vs `event-detail`

**Template:** `design-system/templates/event-detail/EventDetail.dc.html` — the "Profile pattern" (shared with site-detail and distribution-detail): action buttons top-right (outline "Duplicate", primary "Edit event"), `h1` title, a four-tile KPI row (teal left bar, uppercase label, 30px teal value, muted note), **one** profile card (72px teal `Calendar` tile · `ProfileField`s Date / Site link / Activity Type · Community Partner / Youth Focused / "Logged By" avatar block), a "What Happened" description card, and a "Reported Figures" `DataTable` (Measure / Reported / Detail, six rows, totals footer) with an "Export CSV" link.
**App:** `/events/[id]` → `src/app/events/[id]/page.tsx` (server component: `getEvent()` Drizzle query over `events ⋈ users ⋈ sites ⋈ activity_types ⋈ program_goals ⋈ community_partners`; `redirect('/login')`; `notFound()`; `isAdmin`; `generateMetadata`) → `src/app/events/components/DuplicateEventDialog.tsx` (confirm → `POST /api/events/[id]/duplicate` → `router.push('/events/{newId}/edit?duplicated=true')`, `sonner` toasts that never render). `not-found.tsx` is already on `EmptyState` (`52fc860`).
**Data sources:** the single query above; every value the template shows is already selected or computed on the page (`totalParticipants`, `totalTime`, `costPerParticipant`).

Behaviour to keep: the session redirect, `notFound()`, the `isAdmin`-gated Edit link to `/admin/events/[id]/edit`, `DuplicateEventDialog` and its redirect, `formatDate`'s `en-US` long format, every computed figure and its precision (`toFixed(1)` percentages, `toFixed(2)` currency), and `generateMetadata`.

**What the template keeps, drops, reorders, or merges.** Page order — App: title + subtitle with actions at right → badge row → 4 stat cards → 2/1 grid of 7 cards. Template: actions (right-aligned, above the title) → title → 4 KPI tiles → profile card → What Happened → Reported Figures. No badge row, no two-column grid.

| App element | Template outcome | Where it lands |
|---|---|---|
| Stat card 1 — Total Participants | **Kept** | KPI tile 1 "Participants"; new note "N new · M returning". |
| Stat card 2 — Event Duration (`300m`) | **Kept, reformatted** | KPI tile 2 "Event time" as `5h 00m`; note "On site". |
| Stat card 3 — Total Cost (`$0`, `toFixed(0)`) | **Kept, reordered** | KPI tile 4 "Total cost" with cents; note "No expenses recorded" / "Supplies and materials". |
| Stat card 4 — Cost/Participant | **Dropped from the KPI row, merged** | Reported Figures row "Cost per participant" (Detail "Total cost ÷ participants"). |
| *(new)* Admin time | **Added to the KPI row** | KPI tile 3 from `event.adminDuration` (the app shows it only inside Time Allocation); note "Setup, cleanup, reporting". |
| Badge row — activity type, program goal, Youth-Focused, Co-hosted | **Dropped as a row** | Activity type → profile field; Youth → profile field "Yes"/"No"; program goal → **dropped entirely**; Co-hosted → **dropped** (implied by the partner field). |
| Card 1 — Event Information (Date, Description) | **Split** | Date → profile field; Description → its own "What Happened" card. |
| Card 2 — Participation Breakdown (3 tiles + 2 progress bars) | **Merged** | Reported Figures rows "New participants" / "Returning participants" with the same `%` in the Detail column; tiles and bars gone. |
| Card 3 — Time Allocation (3 tiles + Event:Admin ratio) | **Merged** | Rows "Event duration" / "Admin time"; footer "Xh MMm staff time" carries `totalTime`; the **ratio badge is dropped**. |
| Card 4 — Location (Site, Address) | **Merged** | Profile field "Site" as a link to `/sites/[siteId]`; **Address is dropped**. |
| Card 5 — Organizer (gradient avatar, name, email) | **Merged, reordered** | "Logged By" block at the bottom of the profile card's right column: `AvatarTile` 44px, name as a link, email. |
| Card 6 — Community Partner (conditional badge) | **Merged** | Profile field "Community Partner", always present (empty state undefined in the template). |
| Card 7 — Financial Summary (Total Cost, Cost per Participant) | **Merged** | Reported Figures rows "Total cost" / "Cost per participant"; footer repeats the total. |
| Subtitle "Event details and information" | **Dropped** | — |
| Edit / Duplicate buttons | **Kept, reordered** | Duplicate (outline) then Edit (primary), above the title; the app's order is Edit then Duplicate, both outline `size="sm"`. |
| *(new)* "Export CSV" link, Reported Figures table chrome | **Added** | See B. |

Net: 7 cards + 4 stat cards + a badge row become **4 surfaces** (KPI row, profile card, What Happened, Reported Figures). Three app facts disappear — program goal, site address, event-to-admin ratio — plus the Co-hosted badge; they are app data still fetched by `getEvent()`, so keeping them is a per-item call (program goal and address fit as extra `ProfileField`s; the ratio has no natural home in the table).

## A. Visual differences — same data, different presentation

| Region of page | Template | App today | Notes |
|---|---|---|---|
| Header / footer / container | Teal `AppHeader`; `max-width:1180px; padding:24px 24px 44px` on `--surface-page`. | Global `Navigation` + footer; `min-h-screen bg-background p-6` → `max-w-7xl mx-auto space-y-6`. | Shared chrome; container narrows to 1180 on the grey surface. |
| Actions | Row above the title, right-aligned: outline "Duplicate", primary "Edit event". Shown to every viewer. | Right of the title row: `Link` → `Button variant="outline" size="sm"` "Edit" (admin only, `/admin/events/[id]/edit`), then `DuplicateEventDialog` trigger "Duplicate". | Reorder and restyle with the DS primary/outline treatments; **keep the `isAdmin` gate** (non-admin edit is refused by the edit page and `PATCH /api/events/[id]`). `Link`-wrapping-`Button` → `Button asChild`. |
| Title | `h1` 28px/700 `letter-spacing:-.2px`, `margin-top:16px`. No subtitle. | `text-3xl font-bold tracking-tight` + `text-muted-foreground` subtitle. | Subtitle dropped (copy). |
| KPI tiles | White, `1px --border-default`, **4px `--surface-chrome` left bar**, `--shadow-card`, `14px 18px 16px`; label 11.5px/600 uppercase `.5px` muted; value 30px/700 in `--surface-chrome`; note 12.5px muted. `repeat(4,1fr)`. | `Card` with `text-2xl font-bold` value, `text-xs` label, and a lucide icon in `text-blue-500` / `green-500` / `purple-500` / `orange-500` (four raw palette classes). `grid-cols-2 md:grid-cols-4`. | Closest primitive: `ui/stat-card` grammar is wrong (icon-led); `ui/kpi-card` is the teal tile. This is a third KPI shape — white with teal bar and teal value — build it with `Card` + token classes. Icons go. |
| Profile card | `padding:32px`, grid `120px 1fr 1fr`, `gap:28px`; 72px teal square with white `Calendar` 34px; `ProfileField`s (16px bold label, 14.5px muted value). | Four separate `Card`s (Event Information, Location, Organizer, Community Partner) in a `lg:grid-cols-3` layout with `CardTitle` icons and `text-sm font-medium text-muted-foreground` labels. | `ui/profile-field` exists. Date format already matches (`weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'`). |
| Site field | Link to site detail. | Plain `font-semibold` text. | `siteId` is selected; `Link href="/sites/${event.siteId}"` — see B. |
| Youth Focused | Always shown, "Yes" / "No". | `Badge` only when true. | Template says the negative explicitly — a change in what the page says, but derivable. |
| Community Partner | Always shown with a name. | `Card` only when `hasCoHost && communityPartnerName`, name in an outline `Badge`. | Empty value undefined in the template ("None" / "—" needs choosing); `community_partner_id` is nullable. |
| Logged By | "Logged By" 16px/700; `AvatarTile` 44px square (initials capped at 2, `.slice(0,2)`); name 14.5px/700 link; email 12.5px muted. | 40px circle `bg-gradient-to-br from-blue-500 to-purple-500` (gradient — forbidden by the DS) with uncapped initials; `font-semibold` name; `text-sm` email. | `ui/avatar-tile`. Cap initials at two. Name link has no destination — see B. |
| Description | Own card "What Happened" 17px/700; body 15px `line-height:1.6`, `text-wrap:pretty`. | Under a muted "Description" label inside Event Information, `text-sm leading-relaxed`. | Same `events.description`. |
| Participation | Table rows with `pct()` "28.6% of attendance". | Three `bg-muted` tiles with `text-orange-600` / `text-blue-600` numbers and two bars (`bg-orange-500` / `bg-blue-500` on `bg-gray-200`) — six raw palette classes. | Same numbers and `toFixed(1)`. |
| Time | Rows `5h 00m` / `0h 30m`; footer `hm(event + admin)` "staff time". | Tiles `330m` / `300m` `text-green-600` / `30m` `text-orange-600` + ratio `Badge`. | `hm()` pads minutes to two digits; `src/lib/validations/events.ts` has `minutesToHumanReadable()` ("5 hours 30 minutes") — pick one. Ratio dropped. |
| Financials | Rows "Total cost" (cents) and "Cost per participant" with Detail copy. | Two label/value rows in Financial Summary; KPI shows `toFixed(0)`. | Same `totalCost` / `costPerParticipant`. |
| Reported Figures table | `DataTable` (teal uppercase header, zebra rows, mint totals footer), columns Measure / Reported (numeric, right-aligned) / Detail. | No table. | `ui/data-table` with its `footer` prop is a direct fit. |
| Duplicate | Plain outline button. | Confirm dialog (`DialogTitle` "Duplicate Event", description, Cancel / "Duplicate Event" with `Loader2`). | Keep the dialog; restyle its trigger and, when `/admin` dialogs are converted, its chrome via `ui/modal`'s treatment. |
| Raw palette | — | `text-blue-500 text-green-500 text-purple-500 text-orange-500` (KPI icons), `text-orange-600 text-blue-600 text-green-600` (tiles), `bg-orange-500 bg-blue-500 bg-gray-200` (bars), `from-blue-500 to-purple-500` (avatar). | All go with the merged cards; nothing needs a new token. |

## B. New UI with no data behind it

| Element (template label/binding) | What it shows | App has? | Needs | Detail |
|---|---|---|---|---|
| Site field link | Navigates to `/sites/[id]`. | Name only. | **client state** | `getEvent()` selects `siteId`; `/sites/[id]` exists. Real link, not a stub. |
| "Logged By" name link (`../user-detail/…`) | Navigates to the organizer's profile. | Name only. | **client state** | `userId` is selected but **there is no `/users/[id]` or `/admin/users/[id]` route** (`docs/gaps/admin-users-[id].md`). Render as text (or a no-op with `// TODO: /events/[id] — not wired`) until the route exists. |
| KPI notes "N new · M returning", "On site", "Setup, cleanup, reporting", "Supplies and materials" / "No expenses recorded" | Captions under each value. | Values exist; strings do not. | **client state** (first) / **cosmetic** (rest) | The cost caption switches on `totalCost > 0`. |
| `Xh MMm` duration formatting | Hours-and-minutes. | Raw minutes + "m". | **client state** | Formatting only. |
| Reported Figures rows + `figureFooter` | Six measures with Detail copy; totals "7 participants — 5h 30m staff time · $0.00". | All six values and `totalTime` exist as cards/tiles. | **client state** | Pure recomposition. |
| "Export CSV" link | Downloads the figures table. | No per-event export exists (only the monthly report's XLSX). | **client state** | Buildable from the six rows client-side; needs a small client child because the page is a server component. Render as a no-op with `// TODO: /events/[id] — not wired`. |
| "Edit event" visible to every viewer | Edit action for non-admins. | Admin only. | **cosmetic** — product decision | Server rejects non-admin edits; keep the gate. |
| `recordId` "EVT-2026-0184" | Human-readable record number. | No — `events.id` is a uuid. | **DB column** | Defined in the script but **not bound in the markup**; treat as not required. |
| Header avatar chip | Current user. | Global `Navigation`. | **cosmetic** | Shared chrome. |

Mock-only: "Resource Centre Drop-In", "Steeves Manor", "Office hours" (lower-case, unlike stored names), "Kitsilano Neighbourhood House", the email, and all figures; the sample's `cost = 0` is why "No expenses recorded" shows. `createdAt` / `updatedAt` are selected by `getEvent()` and shown by neither side. Duplicate's side effects (`title + " (Copy)"`, today's date, current user as owner) are unchanged by the template.
