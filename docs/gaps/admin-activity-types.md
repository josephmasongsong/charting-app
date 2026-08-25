# /admin/activity-types vs design-system/templates/activity-types/ActivityTypes.dc.html

**Template:** `ActivityTypes.dc.html` — "Admin list of activity types with program-goal assignment, search, sort, pagination, and add/edit/delete via modals." Sections: header + Add button → one card (search strip / dense table / footer pager) → form modal (add/edit share one) → delete-confirm modal.
**App:** `src/app/admin/activity-types/page.tsx` (RSC: fetches `getProgramGoals()`, renders client page; defines a skeleton component that is **never used — dead code**) → `AdminActivityTypesPage.tsx` (client: header, Add button, message/error state with 5s auto-clear, `useRef` → `refreshData()` on the table, `CreateActivityTypeDialog`) → `components/activity-types-table.tsx` (client fetch of `/api/admin/activity-types?page&limit&sortBy&sortOrder&search`, submit-only search, server-side sort default `createdAt desc`, First/Prev/±2-window-with-ellipses/Next/Last pager hidden at ≤1 page, edit/delete dialogs) → create/edit/delete dialogs on shadcn `Dialog`, POST/PATCH/DELETE to `/api/admin/activity-types[/:id]`.

## A. Visual differences — same data, different presentation

| Element | Template | App today |
|---|---|---|
| Page wrapper | 30px h1 + 15px muted subtitle ending "· N types"; content directly under admin chrome | `container mx-auto p-4 space-y-6` inside admin layout `p-6 max-w-7xl` — same double padding fixed on /admin/sites (`af2f88d`) |
| Header action | DS primary + `Plus` 16 | shadcn default Button + `Plus` |
| Card header | None — no title inside the card; the count lives in the page subtitle | `CardTitle` "Activity Types (N)" + `Activity` icon + CardDescription |
| Search | Live-on-keystroke, 320px input, inline muted `Search` icon, placeholder "Search by name or program goal...", own strip with bottom border | Submit-only form in CardHeader: Input + separate outline icon-button. **Keep submit-only** (admin pattern per converted SitesTable, where the inline icon is the submit button) |
| Columns | Name (sortable) · Program Goal · Actions — **drops Created and Updated** | Name (sortable) · Program Goal · Created · Updated · Actions |
| Table chrome | Teal header band, gridlines, zebra, hover `--action-selected` — the SitesTable pattern | Plain shadcn table in `rounded-md border` |
| Sort affordance | White header text + `ArrowUpDown` 14, no direction chevron | Ghost button + `ChevronUp`/`ChevronDown`/`ArrowUpDown` (direction feedback — worth keeping; template simply lacks it) |
| Program Goal chip | Neutral pill: `--surface-muted` bg, 999px radius, 12.5px semibold | `Badge variant="secondary"` |
| Row actions | Bare icon links 17px: `PenLine` `--action-primary`, `Trash2` `--danger`, 14px gap, right-aligned | Two identical outline `sm` buttons (`Edit`, `Trash2`) — delete not visually destructive |
| Empty state | Full-width centered "No activity types match \"q\"." 48px padding | In-table colSpan row, two-state copy + "Clear search" link — same grammar as converted SitesTable; keep the two-state copy |
| Pagination | Footer strip: "Showing X to Y of N results" + First/Previous/numbers/Next/Last; **renders every page number**; active page `--surface-chrome`; shown whenever total > 0 | First/Prev/**±2 window with ellipses**/Next/Last; hidden ≤ 1 page (separate "Showing all N results" line); active = shadcn default |
| Form modals | One teal-chrome modal for add and edit: 21px title, seafoam subtitle, X close; Name input (autofocus) + Program Goal select; footer right: Cancel outline + primary submit disabled while name empty | Two shadcn `Dialog`s (`sm:max-w-md`), stock header, submit disabled only while `loading` |
| Delete modal | Teal-chrome "Delete activity type?", centered body naming the record, centered Cancel + danger Delete | shadcn Dialog + **raw red callout** (`bg-red-50 border-red-200 text-red-800`) listing name/goal + `variant="destructive"` button |
| Messages | None in template | Success Alert hand-tinted `border-green-200 bg-green-50 text-green-800` + destructive Alert, ghost × dismiss — converted SitesTable's `successAlertClass`/`alertClass` treatments apply |
| Loading | None (template is client-seeded) | "Loading..." plain text; two skeleton components with raw `bg-gray-200`/`bg-gray-100` (one dead in page.tsx) |

## B. New UI with no data behind it

None. The template introduces nothing the app lacks a source for — every rendered value (name, goal, count, page ranges) is already in the API response. The subtitle count ("· N types") is `pagination.total`, already fetched: **purely cosmetic**. The template instead *drops* data the app shows (Created/Updated columns); keeping or dropping them is a visual decision, not a wiring one.

---

# Canonical admin-CRUD page spec

Proposed shape for the six remaining admin sections (program-goals, supplies, distribution-management, user-management, community-partners, admin/events), extrapolated from the converted `/admin/sites` reference (`SitesTable`, `DeleteSiteDialog`) plus this template. Spec only — no code in this pass.

**1. Page wrapper.** The route page renders `space-y-5` directly under the admin layout's `p-6 max-w-7xl` — no `container mx-auto p-4`. Keep each section's existing file split (RSC wrapper → client page → table → dialogs); visual passes restyle, never restructure.

**2. Header.** `h1` 30px/bold/tracking `-.2px`; subtitle 15px `--text-muted`, ending "· N \<records\>" when the total is already client-state. Top-right: DS primary button (`--action-primary`, `--radius-control`, hover `--action-primary-hover`) with `Plus` 16 + "Add \<Record\>".

**3. Messages.** Success and error Alerts between header and card, auto-clear 5s, ghost × dismiss. Success: SitesTable's `successAlertClass` (green-50 fallback var + `border-l-[5px] border-l-(--success)` + `rounded-[2px]`); error: the destructive Alert variant. Never raw `green-*`/`red-*`.

**4. Card.** One `--surface-card` card, `--radius-card`, `--border-default`, `overflow-hidden`, containing in order: search strip, table, pager footer.

**5. Search strip.** `border-b border-(--border-default) px-5 py-4`; a single form `w-[340px]` max-w-full; the `Search` icon is the submit button, absolutely positioned left, `--bch-gray-500`; Input `h-9 rounded-(--radius-control) border-(--border-input) pl-8 text-sm md:text-sm`. Submit-only — admin tables do not search per keystroke. Placeholder names the searchable fields.

**6. Table.** `overflow-x-auto`; `min-w` sized per column count. SitesTable constants verbatim:
- head: teal `--surface-chrome` band, `border border-[#0a7276]`, white 12px uppercase bold, `px-3.5 py-2.5`; sortable heads are white ghost buttons with `ArrowUpDown` 14 (keep direction chevrons where the app already shows them).
- body: full `--bch-gray-200` gridlines, `px-3.5 py-[9px]`, `whitespace-nowrap`; zebra `even:bg-(--surface-muted)`; hover `--action-selected`.
- reference-data chips: neutral pill — `--surface-muted` bg, `rounded-full`, 12.5px semibold `--text-body`. Status/boolean chips: `BooleanBadge`-style pills.
- primary-identity column may link (`--text-body`, hover `--action-primary` + underline) when a detail view exists.

**7. Row actions.** Right-aligned ghost icon buttons `size-8 rounded-(--radius-control)`: edit `PenLine` in `--action-primary`, hover `--action-selected`; delete `Trash2` in `--danger`, hover `--danger-surface`. Never two identical outline buttons; delete always reads destructive.

**8. Empty state.** In-table row, `colSpan` = column count, `py-10` centered `--text-muted`, two-state copy: filtered → `No <records> found matching "q".` + link-style "Clear search" that resets and refetches; unfiltered → `No <records> found.`

**9. Pagination.** Footer strip inside the card, **always visible when total > 0** (template + SitesTable): left `Showing X to Y of N results` (13.5px muted; "No results" at zero); right: First / `‹` Previous / page numbers / Next `›` / Last. Buttons: `pagerButtonClass` (h-8, `--radius-control`, `--border-default`, action-blue text, hover `--action-selected`, tokenized disabled state); active page: `pagerActiveClass` (`--action-primary` fill, `--text-on-chrome`). Page numbers use the **current±2 sliding window with ellipses** — deliberate deviation from the template, which renders every page number and would not scale; SitesTable already set this precedent. First/Last hide on `sm:` down.

**10. Create/edit dialogs.** `ui/modal` (teal `--surface-chrome` header, 21px title, subtitle line, white X): one modal component per operation is fine (keep existing create/edit file split), but both wear the same chrome and copy shape — title "Add/Edit \<Record\>", subtitle sentence, form body with `ui/` primitives and the EventForm validation pattern (`aria-invalid`, `--danger` messages) where validation exists, footer right-aligned: Cancel (outline) + primary submit. Submit label swaps to the progressive verb while `loading` ("Creating…"/"Updating…"); everything disabled while `loading`. No raw `<select>`/`<input type="checkbox">`. Dialog ownership is per-section architecture — restyle dialogs in place; do not lift, merge, or centralize them as part of conversion.

**11. Delete dialog.** `ui/modal`, title "Delete \<Record\>", body sentence naming the consequence, record summary in the danger callout — `rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-3.5 text-sm` (DeleteSiteDialog verbatim; replaces raw red-50 boxes) — footer: Cancel outline + DS destructive button (`bg-(--danger)`, hover `#98060D`), label "Deleting…" while in flight.

**12. Loading.** Centered "Loading..." with the DS spinner treatment (`Loader2` animate-spin, `--text-muted`) inside the card in place of the table. Skeleton pulses, where kept as Suspense fallbacks, use `--surface-muted`/`--bch-gray-200` — never raw `gray-*`. Dead skeletons (like the one in this route's `page.tsx`) are deleted when the file is touched.

**13. Behavior invariants.** Fetch shape (`page/limit/sortBy/sortOrder/search`), refresh-after-CRUD wiring (`useRef`/callbacks), 5s auto-clear, submit-only search, sort defaults, and API endpoints all stay byte-identical in visual passes.
