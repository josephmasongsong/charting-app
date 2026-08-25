# /admin/program-goals vs design-system/templates/program-goals/ProgramGoals.dc.html

**Template:** `ProgramGoals.dc.html` — "Admin list of program goals with search, sort, and add/edit/delete handled entirely through modals." Header + Add Goal → one card (search strip / dense 4-column table / centered footer label — **no pager controls**) → shared add/edit form modal → delete-confirm modal.
**App:** `src/app/admin/program-goals/page.tsx` (**itself `'use client'`** — header, Add button, message state, `useRef` refresh, create dialog, Suspense fallback skeleton; no RSC wrapper) → `components/program-goals-table.tsx` (client fetch `/api/admin/program-goals?page&limit&sortBy&sortOrder&search`, `useCallback`-wrapped fetch, submit-only search, default sort `createdAt desc`, full First/Prev/±2/Next/Last pager) → create/edit/delete dialogs on shadcn `Dialog`, POST/PATCH/DELETE `/api/admin/program-goals[/:id]`.

**Near-clone note.** This route is the pre-conversion `activity-types` structure minus the reference-data column: no program-goal select in dialogs, no pill column, no `fetchProgramGoals`, single-field forms. Everything the activity-types visual pass (`6527671`) did applies here almost mechanically.

## A. Visual differences — same data, different presentation

| Element | Template | App today | Canonical shape (6527671) says |
|---|---|---|---|
| Page wrapper | Direct under chrome | `container mx-auto p-4 space-y-6` (double padding) | `space-y-5` |
| Header | 30px h1, subtitle "…for your application · N goals", DS primary "Add Goal" + Plus | `text-3xl`, subtitle without count, default Button | Spec header; count omitted — total lives in the table child (see B) |
| Card header | None — no title in card | `CardTitle` "Program Goals (N)" + `Target` icon + description | No card title |
| Search | Live, 280px, "Search by name..." | Submit-only form, same placeholder | Submit-only, icon-as-submit, `w-[340px]` |
| Columns | Name (sortable) / Created / Updated / Actions — **identical to the app's four** (Created/Updated muted) | Same four, plain shadcn table | Dense teal band; Created/Updated as muted cells — this template confirms keeping them |
| Sort | Name toggle, `ArrowUpDown` only | Direction chevrons | Keep chevrons (spec deviation already documented) |
| Row actions | Bare `PenLine` action-blue / `Trash2` danger icons | Two identical outline buttons | Ghost action-blue edit + destructive delete |
| Empty state | Centered full-width | colSpan row, two-state + Clear search | colSpan=4 two-state row |
| Pagination | **None** — centered 13.5px muted footer label only ("Showing all N results" / "Showing X of N results"); template is client-filtered seed data | Full inline pager (the ~150-line block), hidden ≤1 page | `ui/pagination-footer` — deliberate deviation from this template: the API paginates at 10 and the label alone can't navigate. Left-aligned label per the shared component, not centered |
| Form modals | One shared add/edit modal: teal header, seafoam subtitle, autofocus Name, submit disabled while name empty | Two shadcn Dialogs; submit disabled only while `loading` (HTML `required` guards empty) | `ui/modal` chrome, keep the create/edit file split and the `required` behavior |
| Delete modal | Teal "Delete program goal?", centered body naming the record | shadcn Dialog + raw `red-50/200/800` callout | `ui/modal` + `--danger-surface` callout + DS danger button |
| Messages / loading | None in template | Hand-tinted green Alert, destructive Alert, "Loading..." text, `gray-200/100` pulse skeleton (used as Suspense fallback here — not dead like activity-types') | `successAlertClass`/destructive Alert; tokenized `ui/skeleton` rows |

## B. New UI with no data behind it

None. As with activity-types, the template renders nothing the app lacks a source for. The subtitle count ("· N goals") is `pagination.total`, fetched in the table child — showing it in the page header would need state lifted or a second source: **client state (plumbing)**, out of scope for a visual pass; omit the count as activity-types did.

## Does the template imply a change to the page split?

No. The template is markup-only and says nothing about server/client composition. The split differs from activity-types for a real reason: activity-types preloads `programGoals` reference data in an RSC wrapper; this section has no reference data, so a client `page.tsx` is complete as-is. A visual pass keeps the split unchanged — unifying the two shapes (e.g., adding an RSC wrapper here for symmetry or future metadata) is an architecture change for the step-10 refactor list, not this pass.

## Spec coverage check

Nothing here needs an addition to the canonical admin-CRUD shape. This section is strictly a subset of activity-types (one fewer column, no select in dialogs, single-field forms). Two per-section parameters the spec already anticipates: search placeholder text, and empty/success copy naming the record type. One template conflict resolved in the spec's favour: this template's pager-less footer loses navigation the app's API pagination requires — `ui/pagination-footer` stands.
