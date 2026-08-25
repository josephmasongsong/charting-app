# /admin/supply-distributions vs distribution-management + distribution-detail templates

**Templates:** `DistributionManagement.dc.html` — "Filterable, sortable log of supply distributions across sites and events, with cost totals and record-level actions" (header + Log Distribution → optional 4-tile stats row → card with filter strip / dense table / pager → delete modal). `DistributionDetail.dc.html` — "Read-only supply distribution record in the Profile pattern" (full page: header with Edit/Delete, created/updated line, profile card, Distributed Items DataTable).
**App:** `page.tsx` (`'use client'`, standard shape; Log Distribution routes to `/supply-distributions/new` — the live create path; `create-distribution-dialog.tsx` is dead and ignored) → `distributions-table.tsx` (client fetch `/api/admin/supply-distributions?page&limit&sortBy&sortOrder[&siteId&distributionType&userId]`, plus `/options` for the site list; **Select filters, no text search**; four sortable columns with header icons; local pager block) → `view-distribution-dialog.tsx` (fetches `/api/admin/supply-distributions/[id]/details` on open; info grid, Recipients/Notes boxes, collapsible items grid with totals, timestamps, spinner) → `delete-distribution-dialog.tsx` (red warning Alert, gray summary grid incl. Recipients/Notes, DELETE that restores inventory).

## Does the template keep Select filters? Yes.

The management template's filter strip is **two `<select>`s** (Type: All types / Door To Door / Event Distribution / Community Room Pickup; Site: All sites + options), a conditional **"Clear filters" text link** (underlined action-blue, not a button), and a right-aligned muted count ("N distributions"). No text search exists anywhere in the template. Differences from the app: the strip lives at the top of the card (where other sections put search) rather than in the card header next to a title; the count moves into the strip; the app's option list also has **Emergency Distribution** (a real data value — keep it); the app also holds a `userFilter` state with no control bound to it (fact, not touched).

## Do the two templates overlap, or describe different surfaces?

**They describe the same surface — the distribution record's read-only detail — in two presentations of the DC prototype's making.** The management template has **no view modal at all**: its per-row Eye action navigates to `../distribution-detail/DistributionDetail.dc.html`, a full page. So `DistributionDetail` is not a second, overlapping view; it is *the* detail content, which AUDIT §5.2 maps onto `view-distribution-dialog`. Per the standing decision (route promotion is step-10), the visual pass renders the detail template's content **inside the dialog** using the §14 view-modal treatment:

- Profile-pattern fields → label/value cells: Distribution Date (long form), Site, Type (chip), Total Items breakdown, Distributed By (gradient avatar tile + name; the template's role line needs `users.jobTitle` — same API-field gap as /sites/[id]).
- "Distributed Items (N)" → `ui/data-table` — the template's columns (Supply item / Quantity / Unit cost / Line total, `num` right-aligned) and its footer ("Total distribution value") match the app's item data **exactly**, including the tinted totals band.
- Page-only elements that do not move into the dialog: the header Edit/Delete buttons (no edit flow exists anywhere — see B; delete already lives on the table row), the AppHeader chrome, and the created/updated header line (the app's timestamp footer row carries the same data — keep it).
- Template description/markup mismatch (third of its kind): the description promises "recipients/notes in one card" but the markup renders neither. The app displays `recipientNotes` (NOT NULL) and optional `notes` — **kept**, as `--surface-muted` note boxes.

## A. Visual differences — same data, different presentation

| Element | Template | App today | Notes |
|---|---|---|---|
| Wrapper/header | 30px h1 "Supply Distributions", subtitle, DS primary "Log Distribution" | Double-padded wrapper, `text-3xl`, default Button (router.push kept) | Standard conversion |
| Stats row | 4 tiles with **3px colored top borders** (`--surface-chrome` / `--action-primary` / `--bch-seafoam` / `--bch-gold-500`), 11.5px uppercase label, 28px value | None | New tile variant (top-border, not the kpi left-bar). Values are B items except the count |
| Filter strip | In-card strip: 2 selects + text-link Clear + right count | CardHeader: 2 selects (`w-48`) + outline Clear button | Keep select behavior byte-identical (incl. Emergency option); strip placement + link-style Clear + count are visual |
| Card header | None | Title "Supply Distributions (N)" + Truck icon + description | Dropped per canonical shape |
| Columns | Date / Site / Type / Distributed By / **Cost (right, tabular-nums)** / Actions — no header icons | Date / Site / Type / By / Actions — Calendar/MapPin/User icons in heads; **no Cost column** | `totalCost` is already in every row — adding the Cost column is cosmetic. Header icons dropped per template |
| Type chips | Distinct treatments: Door To Door = solid `--surface-chrome`/white; Event = `--action-selected` + `--action-primary` + `--bch-blue-100` border; Pickup = tan (`#fdf2d9`/`#f0e2b0` hexes — check `--bch-tan-50`; the detail template uses `var(--bch-tan-50)` for the same chip, so prefer the token; `#f0e2b0` recurs across templates as a DS constant) | shadcn Badge variants default/secondary/outline/destructive | Emergency Distribution has no template chip — propose `--danger-surface`/`--danger` in the same shape, to confirm at visual-pass time |
| Sort | 5 sortable incl. Cost; active head `font-weight:800`, hover `--surface-chrome-dark` | 4 sortable, chevrons | `sortableHead` helper from supplies; Cost sort would be an API field question if the API rejects `totalCost` — check before wiring; the column itself is display-only |
| Empty state | Single-state "No distributions match your filters." | Two-state + Clear filters link | Keep two-state |
| Pager | Full footer, all page numbers, `‹ ›` labels | Local ~150-line block, hidden ≤1 page | `ui/pagination-footer` (5th consumer) |
| Delete modal | 520px teal header **with `TriangleAlert` icon**; `--danger-surface` warning box; summary grid (`150px/1fr`) in a `--surface-muted` box: Date/Site/Type/Total Cost/By; "Items Distributed:" bordered box | shadcn Dialog; red-tinted Alert (`red-50/200/800`); `gray-50/200/600` summary grid incl. Event row + Recipients/Notes white boxes | Keep the app's Event/Recipients/Notes rows (displayed data the template drops); items line is a B item |
| View dialog | (whole `DistributionDetail` page — see above) | 4xl shadcn Dialog, icon-decorated info rows, `bg-muted/30` boxes, hand-rolled 12-col items grid with `bg-white`/`bg-muted` zebra, spinner | §14 treatment + `ui/data-table` for items; skeleton loading |
| Messages/loading/skeleton | — | Hand-tinted green Alert; "Loading..."; raw-gray pulse | Standard treatments |

## B. New UI with no data behind it

| Element | Needs | Detail |
|---|---|---|
| Stat tile: Total value distributed | **API field** | Sum of `totalCost` over all (unfiltered) distributions — not in the list response. Render stubbed ("—") |
| Stat tile: Total items distributed | **API field** | Sum of item quantities — needs an aggregate over distribution items |
| Stat tile: Avg. cost per distribution | **API field** | Derivable from the two above server-side |
| Stat tile: Total distributions | **purely cosmetic** | `pagination.total`, already fetched |
| Cost column | **purely cosmetic** | `totalCost` is in every list row today |
| "Items Distributed" in delete modal | **client state** | The comma list requires the `/details` fetch the view dialog does; the delete dialog receives only the list row. Omit or stub with TODO |
| Edit action (detail template header) | **feature** | No edit flow exists for distributions anywhere in the app (dead create dialog aside). Render nothing — a disabled Edit inside a view dialog invites confusion; note for DEFERRED.md |
| Export CSV link | **feature** | No export endpoint. Disabled + TODO if rendered |
| Distributed-by role line | **API field** | `users.jobTitle` not in the details response (same gap as /sites/[id] worker title) |
| Site → /sites/[id] link in view dialog | **purely cosmetic**, flagged | Route exists; linking from inside the admin dialog is a small behavior addition — default is unlinked text, decide at visual pass |
| User-detail link | **route** | No user-detail route; render unlinked |

## What the canonical admin-CRUD shape doesn't cover — flags

1. **Filter-strip variant (§5 amendment)**: the search strip slot can instead hold Select filters — same strip chrome (`border-b px-5 py-4`), DS select triggers, a text-link "Clear filters" (action-blue, underlined), and a right-aligned 13.5px muted record count fed by `pagination.total`.
2. **Stats row above the card (§15)**: top-border stat tiles (3px colored top border, 11.5px uppercase muted label, 28px bold value) — distinct from the kpi left-bar tile; accent tokens `--surface-chrome`, `--action-primary`, `--bch-seafoam`, `--bch-gold-500`. Gated on data availability (three of four need aggregates here).
3. **Typed chip vocabulary**: per-value chip treatments for enum columns (solid chrome / action-selected / tan, + a danger proposal for values the template misses) — beyond the neutral pill and BooleanBadge.
4. **Rich delete modal (§11 amendment)**: consequence warning box (`--danger-surface`, TriangleAlert, bold "Warning:"), record-summary grid (`150px/1fr`, muted labels) in a `--surface-muted` box, and an icon in the modal title. Fits this section's inventory-restore consequence; other sections keep the simple callout.
5. **§14 view modal + DataTable**: line-item tables inside the view modal use `ui/data-table` with its tinted totals footer.

Behavior invariants to keep: both fetches and the `/details` fetch-on-open, filter/sort/pager state plumbing (filters rebuilt per call), `userFilter` passthrough, dead create dialog untouched, delete's inventory-restore copy. The inventory-direction hold does not block this section — deletion-restores-inventory is existing shipped behavior, not new wiring.
