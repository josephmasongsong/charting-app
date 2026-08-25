# /admin/community-partners vs the converted /admin/program-goals (no template)

**Template:** none. Reference = the converted `/admin/program-goals` (`f856222`), which this route mirrors structurally byte-for-byte in its pre-conversion form: `'use client'` page (no RSC wrapper — nothing to preload), `useCallback`-wrapped fetch, four-column table (Name sortable / Created / Updated / Actions), single-field create/edit dialogs, name-only delete callout.
**App:** `page.tsx` (client: header "Community Partners Management", Add Partner button, message state, `useRef` refresh, create dialog, raw-gray Suspense skeleton) → `components/community-partners-table.tsx` (fetch `/api/admin/community-partners?page&limit&sortBy&sortOrder&search` → `data.communityPartners`; submit-only search "Search by name..."; default sort `createdAt desc`; local ~150-line pager block) → create/edit/delete dialogs on shadcn `Dialog` (POST/PATCH/DELETE `/api/admin/community-partners[/:id]`).

## A. What must change to reach the canonical admin-CRUD shape

Every row is the same mechanical delta applied to program-goals — same treatment, different nouns:

| Element | Today | Canonical shape |
|---|---|---|
| Page wrapper | `container mx-auto p-4 space-y-6` (double padding under admin layout) | `space-y-5` |
| Header | `text-3xl`, default Button "Add Partner" | 30px/bold/`-.2px` h1, 15px muted subtitle, DS primary button with `Plus` |
| Suspense skeleton | `bg-gray-200`/`bg-gray-100` pulse | Tokenized `ui/skeleton` card (search bar + header band + 5 rows) |
| Messages | Hand-tinted `border-green-200 bg-green-50 text-green-800` Alert + `CheckCircle`; stock destructive Alert | `successAlertClass`/`alertClass`, ghost × dismiss with danger hover on the error side |
| Card header | `CardTitle` "Community Partners (N)" + `Users` icon + description | None — the card starts at the search strip |
| Search | Form in CardHeader, Input + separate outline icon button | Search strip: `border-b px-5 py-4`, icon-as-submit, `w-[340px]`, `pl-8`, `md:text-sm` |
| Table chrome | Plain shadcn table in `rounded-md border` | Dense teal band (`headCellClass`), full `--bch-gray-200` grid (`bodyCellClass`), zebra + `--action-selected` hover (`bodyRowClass`), `min-w-[720px]`, `overflow-x-auto` |
| Sort head | Ghost button, `font-semibold` | `sortableHead('name', 'Name')` treatment — white uppercase, active `font-extrabold`, chevrons kept |
| Created/Updated cells | Plain | `--text-muted` |
| Row actions | Two identical outline buttons (`Edit`, `Trash2`) | Ghost action-blue `PenLine` + destructive ghost `Trash2` (`rowActionClass`/`destructiveActionClass`), `aria-label`/`title` |
| Empty state | colSpan row, `py-8` | colSpan=4, `py-10`, `--text-muted`, link-style Clear search in `--action-primary` |
| Pagination | Local ~150-line block, hidden ≤1 page | **`ui/pagination-footer`** (7th consumer) — no local copy |
| Loading | "Loading..." text | Skeleton rows (header band + 5) |
| Create/edit dialogs | shadcn `Dialog` `sm:max-w-md`, stock header | `ui/modal` (`sm:max-w-[480px]`), muted description line, `13.5px` bold labels, DS-styled Input, DS outline Cancel + primary submit with progressive verbs |
| Delete dialog | Raw `bg-red-50 border-red-200 text-red-800` callout | `ui/modal` + `--danger-surface` left-bar callout ("Partner to delete: …") + DS danger button (`#98060D` hover) |
| Dev comments | The standard set (`// Create a ref…`, `// Handle …`, etc.) | Deleted |

Behavior invariants to keep byte-identical: fetch URL and `data.communityPartners` response key, `useCallback`/`useEffect([fetchPartners])`, `useImperativeHandle` refresh, submit-only search, `createdAt desc` default, 5s auto-clears, POST/PATCH/DELETE endpoints, `maxLength={255}`/`required`, and the client-only page split (no RSC wrapper needed — same reasoning as program-goals: no reference data to preload).

## Fields or controls this section has that /admin/program-goals does not

**None.** The two routes are structurally identical down to the interface shape (`id`/`name`/`createdAt`/`updatedAt`), the single Name field in both form dialogs, the four columns, and the handler set. The only differences are nouns and copy ("Community partner…", "Partner to delete:", "Add Partner"/"Create Partner"/"Update Partner"/"Delete Partner"), the endpoint, the response key, and the card-header icon (`Users` vs `Target`) — which the canonical shape drops anyway.

## B. New UI with no data behind it

**Empty.** There is no template to introduce anything, and the reference conversion adds no data the API doesn't already return. (As with program-goals, a header count would need the table child's `pagination.total` lifted — omitted there, omitted here.)
