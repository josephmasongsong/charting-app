# /admin/supplies vs design-system/templates/supplies-management/SuppliesManagement.dc.html

**Template:** `SuppliesManagement.dc.html` — "Admin list of supplies with cost/quantity/value rollups, search, sort, pagination, and view/edit/delete via modals." Header + Add Supply → card (search / dense 5-column table / pager footer) → shared add/edit form modal → **view modal** → delete-confirm modal.
**App:** `src/app/admin/supplies/page.tsx` (`'use client'`, same shape as program-goals: header, Add button, message state, `useRef` refresh, create dialog, raw-gray Suspense skeleton) → `components/supplies-table.tsx` (client fetch `/api/admin/supplies?page&limit&sortBy&sortOrder&search`, **five sortable columns** — name, costPerUnit, quantity, createdAt, updatedAt — submit-only search, full local pager block) → create/edit/delete on shadcn `Dialog` (POST/PATCH/DELETE `/api/admin/supplies[/:id]`) → **`view-supply-dialog.tsx`**: on open, fetches `GET /api/supplies/[id]` (note: the non-admin endpoint) for `supply` + `siteDistribution`, renders info grid, Created section, collapsible per-site list, hand-rolled spinner.

## How the template presents read-only detail — dialog or route?

**A dialog, unambiguously.** The template's view is a modal (580px vs the form modal's 480px, `max-height:88vh`, scrollable body) opened from the **name link in the table row** — the template has no Eye button; view is the name's click action. Structure:

- Teal chrome header: supply name as the 21px title + seafoam subtitle ("View detailed information about this supply and its distribution across sites." — the app's `DialogDescription` copy verbatim).
- Body section 1 — "SUPPLY INFORMATION" (11.5px uppercase muted label) in a bordered `--radius-card` box: 2×2 grid of label/value pairs (13px muted label, 16px bold value): Name / Cost per Unit / Total Units ("N units") / Total Value.
- Body section 2 — collapsible "UNITS AT EACH SITE (N sites)": full-width chevron toggle button; expanded rows (name 15px semibold left; right column: units chip — `--surface-muted`, `--radius-control`, 13.5px bold — with a muted "$X value" line under it); empty row "Not currently assigned to any sites."
- Footer: a single **primary** Close button (not outline).

So the template **implies no route** — it matches the app's existing dialog approach. (Separately, the app also has a `/supplies/[id]` route in AUDIT §5's conversion order; that's the non-admin surface and unaffected here — the admin flow stays in-dialog.)

Template quirk, same species as site-detail's phantom event feed: the script computes `viewCreated`/`viewUpdated` but the markup never renders them — the template drops the Created section the app shows. Keep-displayed-data precedent → keep Created/Updated, folded into the info grid as two more label/value cells rather than the app's separate full-width "Created" box.

## A. Visual differences — same data, different presentation

| Element | Template | App today | Canonical shape says |
|---|---|---|---|
| Page wrapper / header | 30px h1 + subtitle, DS primary "Add Supply" | `container mx-auto p-4 space-y-6`, `text-3xl`, default Button | `space-y-5`, spec header |
| Card header | None | `CardTitle` "Supplies (N)" + Package icon + description | No card title |
| Search | Live, 280px, "Search by name..." | Submit-only + separate icon button | Submit-only, icon-as-submit, `w-[340px]` |
| Columns | Name (sortable, **link → view modal**) / Cost Per Unit (sortable) / Total Quantity (sortable) / Total Value / Actions — **drops Created & Updated** | Name / Cost / Quantity / Value / **Created / Updated** (both sortable) / Actions | Dense teal band; keep Created/Updated as muted sortable columns (precedent). First table to exercise **multi-column sort** — spec §6's ghost-header treatment applies per column |
| Row actions | `PenLine` + `Trash2` only — **no Eye**; view rides the name link | Eye + Edit + Trash, three identical outline buttons | Ghost action-blue edit + destructive delete; **name becomes the view-dialog trigger** (link-styled button, since it opens a dialog, not a href) — Eye button dropped, same affordance-into-name move as /sites and /admin/sites |
| Empty state / pager | Standard; full First/Prev/all-pages/Next/Last footer | Two-state colSpan row; local ~150-line pager block | colSpan two-state row; `ui/pagination-footer` (third consumer; drop the local block) |
| Form modals | One shared add/edit: Name with `--danger` asterisk, Cost Per Unit ($) `inputmode="decimal"`; submit disabled while name empty | Separate create/edit; create disables submit on `loading \|\| !form.name.trim()` (matches template), edit on `loading` only; helper text "Optional - can be updated later"; `type="number" step="0.01" min="0"` | `ui/modal` chrome, keep file split and behaviors; asterisk via `ui/required-label`; keep helper text as muted 12.5px line |
| View modal loading | None (client seed) | Hand-rolled `animate-spin border-2 border-primary` circle + "Loading supply details..." | Tokenized `ui/skeleton` rows in the dialog body (the in-dialog fetch is this section's specialty) |
| View modal sections | Bordered boxes, uppercase labels, units chips | `bg-muted/30` box, `border-muted/40` row dividers, `bg-muted` chips | Template treatment with tokens; keep "Failed to load supply details" error state |
| Delete modal | Centered "Delete supply?" naming the record | shadcn Dialog + raw `red-50/200/800` callout with a second `text-red-600` line ("Cost: $X \| Quantity: N") | `ui/modal` + `--danger-surface` callout; keep both callout lines in `--text-body`/muted |
| Messages / loading / skeleton | — | Hand-tinted green Alert, "Loading..." text, raw-gray pulse skeleton | `successAlertClass`, skeleton rows, tokenized Suspense fallback |

## B. New UI with no data behind it

None. Every value the template renders — info grid, site split rows, unit/value labels, site count — is already served by `/api/admin/supplies` or `/api/supplies/[id]` (`siteDistribution`, `distributedQuantity`, totals). The template again only *drops* data the app shows (Created/Updated column pair; the view modal's Created section).

## What the canonical admin-CRUD shape doesn't cover — proposed additions

1. **§14 View modal** (new): read-only detail on `ui/modal` with `sm:max-w-[580px]` and a scrollable body (`max-h-[70vh] overflow-y-auto`): record name as the modal title; bordered `--radius-card` sections with 11.5px uppercase `--text-muted` section labels; label/value grid cells (13px muted over 16px bold); collapsible list sections with a full-width chevron toggle; count chips in `--surface-muted` + `--radius-control`; footer = single DS **primary** Close. Loading = skeleton rows in the body; keep the error state.
2. **§6 amendment — name as dialog trigger**: the spec's "primary-identity column may link when a detail view exists" extends to dialog-opening triggers: a `Button variant="link"`-styled name (action on click, no href) in `--text-body` with hover `--action-primary` + underline, replacing a separate Eye action.
3. **Multi-column sort** needs no spec change — §6 already styles every sortable head — but this is the first table with five of them; the active-column `font-extrabold` cue matters more here.
4. **In-dialog fetch-on-open** (view modal loads its own data): behavior invariant to keep byte-identical, including the `/api/supplies/[id]` (non-admin path) call — flagged as a fact, not changed.

Nothing else. Sections not covered above follow activity-types/program-goals mechanically.
