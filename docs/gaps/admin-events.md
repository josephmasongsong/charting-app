# /admin/events vs the converted /admin/activity-types (no template)

**Template:** none. Reference = the canonical admin-CRUD shape (`6527671` and successors). `ErrorBoundary.tsx` and `Loading.tsx` in this folder are dead and ignored.
**App:** `page.tsx` (`'use client'`; header "Events Management"; **"Add Event" routes to `/events/new`** — no create dialog; **owns the delete dialog state** (`deleteOpen`/`deletingEvent` + `openDeleteEvent` passed down as `onDelete`); message state; refresh ref; raw-gray skeleton) → `components/events-table.tsx` (fetch `/api/admin/events?page&limit&`**`sortField`**`&sortOrder&search` — note the param is `sortField`, not `sortBy`; Title/Date sortable, default `eventDate desc`; columns Title/Date/Site/Activity Type/Organizer/Actions; Eye → `/events/[id]`, Edit → `/admin/events/[id]/edit`, Trash → `onDelete(event)`; local pager block) → `components/delete-event-dialog.tsx` (raw red callout listing Event/Date/Site/Organizer/Participants (new+returning computed); DELETE `/api/admin/events/[id]`).

## The two structural differences — does the canonical shape accommodate them?

**Both are accommodated without a variant.**

1. **No create dialog.** The spec's header button (§2) is agnostic about its action — `/admin/supply-distributions` already set the precedent (`283c99c`): "Log Distribution" navigates to a full-page form and the section simply has no §10 create/edit modal. Same here: DS primary "Add Event" keeps `router.push('/events/new')`; §10 doesn't apply to creation (the edit flow is also a full page at `/admin/events/[id]/edit`, so this section has *no* form modals at all — only the delete confirm).
2. **Page-owned delete dialog.** Dialog ownership is architecture, not appearance — §13's restructuring ban cuts both ways: the visual pass restyles the dialog where it lives and does not move it into the table for symmetry. The §11 delete treatment (ui/modal, `--danger-surface` callout, DS danger button) applies identically wherever the component is mounted. Worth one clarifying sentence in the spec ("dialog ownership is per-section architecture; restyle in place"), not a documented variant.

One fact worth recording while here: `page.tsx` types the lifted event as `any` (`useState<any>(null)`, `openDeleteEvent(event: any)`) while the table and dialog both declare the full `Event` interface — a pre-existing type smell, not a visual concern.

## Divergence check against the converted /events (a0ec710)

The two lists show the same records but are different surfaces by sanctioned design — the same split as `/sites` (browse list) vs `/admin/sites` (management table). `/events` renders month-band groups (chrome band, DOW/day tile, meta-icon line); `/admin/events` becomes the dense teal table. **Structure differs; vocabulary must not.** Shared treatments to align:

- **Title → `/events/[id]`**: /events links the title; the admin table currently uses a separate Eye button. Converting title to the link and dropping Eye (the established affordance-into-name move) makes both lists navigate identically.
- **Row actions**: same ghost classes — `rowActionClass` action-blue `PenLine`, `destructiveActionClass` `Trash2` — as /events' admin actions. (Pre-existing behavioral fact, not touched: /events edits at `/events/[id]/edit` while this table edits at `/admin/events/[id]/edit` — two different edit routes for the same record.)
- **Date**: keep this table's `formatDate` ("Wed, Jan 1, 2025"); the DOW/day tile is the browse-list's presentation and does not transfer to a dense table cell.
- **Activity type**: /events shows it as a meta-line icon+text; in a table cell the §6 reference-data treatment applies — the neutral `--surface-muted` pill (as program-goal pills) replacing the current outline Badge. Different container, same neutral (non-semantic) rendering — no false color signals in either list.
- /events' Youth badge and Duplicate action have no columns/actions here (the admin table doesn't show `eventIsYouthFocused` or duplicate) — nothing to align; adding either would be inventing UI.

## A. What must change (standard deltas)

| Element | Today | Canonical shape |
|---|---|---|
| Wrapper/header/skeleton | `container mx-auto p-4 space-y-6`, `text-3xl`, default Button, gray pulse | `space-y-5`, 30px header, DS primary "Add Event" (router.push kept), tokenized `ui/skeleton` |
| Messages | Hand-tinted green + destructive Alerts | `successAlertClass`/`alertClass`, ghost × with danger hover |
| Card header | "Events (N)" + Calendar icon + description | None — search strip starts the card |
| Search | CardHeader form, Input + icon button | Icon-as-submit strip, `w-[340px]`, placeholder kept ("Search by title, description, site, or activity type...") |
| Table | Plain shadcn in nested `rounded-md border` + inner overflow div | Dense teal band, `--bch-gray-200` grid, zebra + `--action-selected` hover, `min-w-[1000px]`, single `overflow-x-auto` |
| Sort heads | Title/Date ghost buttons | `sortableHead('title')` / `sortableHead('eventDate')` — white uppercase, `font-extrabold` active, chevrons kept; **`sortField` param name preserved** |
| Title cell | Plain text + Eye action | Link-style button/`Link` to `/events/[id]` (`--text-body`, hover action-blue); Eye dropped |
| Activity Type cell | `Badge variant="outline"` | Neutral `--surface-muted` pill |
| Site/Organizer cells | `text-sm` divs | Plain cell text; Date muted per convention |
| Actions | Three outline buttons (Eye/Edit/Trash) | Ghost `PenLine` (→ `/admin/events/[id]/edit`, router.push kept) + destructive `Trash2` (→ `onDelete`) |
| Empty state | colSpan=6 `py-8` | colSpan=6 `py-10` muted, link-style Clear search |
| Pagination | Local ~150-line block | **`ui/pagination-footer`** (8th consumer) |
| Loading | "Loading..." text | Skeleton rows |
| Delete dialog | shadcn Dialog + raw `red-50/200/800` callout | `ui/modal` + `--danger-surface` left-bar callout keeping all five lines (Event/Date/Site/Organizer/Participants) + DS danger button |
| Dev comments | Standard set | Deleted |

Behavior invariants: `sortField` (not `sortBy`) in the query string, fetch URL and `data.events`, `useCallback`/`useImperativeHandle`/5s auto-clears, both `router.push` targets, the lifted `onDelete` flow and page-owned dialog state, participants sum in the callout, and the dead files untouched.

## B. New UI with no data behind it

**Empty.** No template exists, the reference conversions add nothing the API doesn't return, and the divergence check yields alignment work only — no new fields, columns, or controls.
