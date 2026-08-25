# /supply-distributions/new vs design-system/templates/log-distribution/LogDistribution.dc.html

**Template:** `LogDistribution.dc.html` — "Supply distribution intake: inventory-aware line items with stock checks, recipient reach fields, and a live cost summary rail." Two-column: main column (three icon-chip section cards + sticky action footer) + 320px sticky **"Required fields" checklist rail**. Template quirk #5 in the series: the script computes reach fields (`households`/`people`/`units`), a `stats` block, `stockAfter`, and `costPerHousehold`, **none of which the markup renders** — the rendered rail is the checklist only. The markup is authoritative; the reach fields are phantoms and are not added.
**App:** `new/page.tsx` (thin RSC → form; `generateMetadata` kept) → `components/SupplyDistributionForm.tsx` (client: options fetch on mount + per-site supplies refetch with stale-selection clearing; `formData` incl. `notes`; dynamic line items with `unitCost`/`lineTotal` computed from `costPerUnit`; submit-time validation incl. inventory constraint; POST `/api/supply-distributions`; success → reset + scroll-to-top + 2s redirect to `/dashboard`; Cancel → `router.back()`).

**Inventory note:** distributions *deduct* from site inventory — shipped behavior, and the template's subtitle says exactly that. The add-vs-move hold concerns the site-starter flow, not this form. The one held item here stays held: **`recipient_notes` NOT NULL vs the template's optional detail** — the app keeps it required.

## A. Visual differences — same data, different presentation

| Region | Template | App today |
|---|---|---|
| Shell | `--surface-page`, 1220px, two-column with sticky checklist rail | `max-w-4xl mx-auto p-6`, single column (route sits under root layout + ClientAuthGuard) |
| Header | 30px h1 + subtitle ending "Quantities are deducted from site inventory when you submit." | `text-3xl` + shorter subtitle; commented-out Back button block (dev-process artifact — delete) |
| Section cards | Icon chips (30px `--action-selected` square, action-blue icon: Calendar / Package / Users), 17px bold title + 13px muted sub — the EventForm SectionHeader pattern | `CardTitle`/`CardDescription`, Calculator icon |
| Card split | 1: Distribution details (site/date/type/conditionals) · 2: Supply items · 3: Who received (recipient detail) | 1: Details **including both textareas** · 2: Supply items · footer buttons. Moving Recipient/Notes into a third "Who received the supplies" card is presentation of the same fields |
| Required marks | `--danger` asterisks on Site/Date/Type | Plain `*` in label text |
| Distribution type | **Toggle chips** (selected: `--action-selected` bg + action-blue border/text; unselected: white + `--border-default`, hover action-blue) — the SiteForm property-tile pattern with `aria-pressed` | Plain Select. Keep the app's four enum values/labels (template's "Front desk pickup"/"Outreach referral" are prototype copy; Emergency Distribution stays) |
| Site helper | "Drawing from {site} inventory" / "Pick a site to load its inventory" 12.5px muted note | Info Alert "Please select a site first…" inside the items card — same message, template placement |
| Items table | Dense grid with `--surface-chrome` header band (Supply / On hand / Quantity / Unit cost / Line total / ×), rows as grid lines, tabular-nums, X remove button (muted → danger hover), empty-row state | Per-item bordered flex rows with labelled Inputs; disabled `bg-muted` Unit Cost/Line Total inputs; outline Trash2 button |
| On hand | Dedicated column (muted; red when over) | "Available: N" caption under quantity — same data (`availableQuantity`), column placement is cosmetic |
| Quantity | Stepper − / input / + | Bare number input with `max` |
| Cost footer | Items note ("N items · M units") left, "Total distribution cost" 13px label + 28px bold right, above a divider | Right-aligned 2xl bold after a Separator |
| Recipient detail | 300-char counter ("N / 300"), privacy info note (Info icon: no health info, unit numbers not names) | Plain required Textarea, no counter/note. Counter display is cosmetic; adding `maxLength` would change behavior — display-only counter, no clamp |
| Additional Notes | Not in template | App field — kept (stored data) |
| Action bar | Sticky footer: readyNote left ("N required fields left" muted / overage warning in `--danger`), Cancel outline + primary "Log distribution" disabled until checklist complete | Plain right-aligned row; submit `bg-blue-600 hover:bg-blue-700` (raw); disabled on `submitting \|\| !siteId`. Per the EventForm precedent the checklist/readyNote render display-only and **the submit gate stays exactly as-is** |
| Checklist rail | Sticky 320px card: Site and date / Distribution type / At least one supply item / Quantities within stock (+ backdating reason when relevant), `--success` ✓ vs muted pending | None. Render display-only from existing state (all four computable; the backdate row belongs to the backdate feature in B) |
| Alerts/loading | — | Hand-tinted green success Alert; `Loader2` + "Loading form options..." full-page state (keep, tokens only) |
| Raw palette | — | `bg-blue-600/700`, `border-green-200 bg-green-50 text-green-800 text-green-600`, `bg-muted` |

## B. New UI with no data behind it

| Element | Needs | Detail |
|---|---|---|
| Backdate warning + "Reason for backdating" | **DB column** | `dateIsPast` is derivable, but the reason has nowhere to go — no column on supply_distributions. Render the warning line only if desired (cosmetic); the reason input is a schema decision — omit or disabled+TODO |
| "Link to a logged event" (when type = event) | **API field** | The `eventId` column exists (the admin list returns `eventTitle`) but the form never sets it and the options endpoint returns no events. Disabled select + TODO |
| "Repeat last log" | **API field (feature)** | No last-log endpoint. Disabled + TODO |
| Duplicate-lines banner + "Merge them" | **client state** | Detection and merge are pure client logic over existing rows — wireable without any API, but it adds behavior; defer to a wiring pass |
| Quantity steppers | **client state (trivial)** | − / + wrap the existing `updateSupplyItem` setter with qty±1. Same gray zone as the merge banner but smaller; visual-pass call — flag rather than assume |
| Inline over-stock alert per row | **purely cosmetic** | Derivable from `availableQuantity` the form already holds; submit-time blocking already exists. Red on-hand figure + alert line are display of known state |
| Inline low-stock alert ("leaves N on hand") | **purely cosmetic, flagged** | Derivable, but the ≤3 threshold is a template constant with no product decision behind it — confirm or omit |
| Items/units note, site stock note, char counter | **purely cosmetic** | All derivable from existing state |
| Households / people reach fields | — | **Phantoms** — script-only, never rendered in the template markup. Not added |

Chrome (blue AppHeader) is the shared-chrome item, out of scope. Behavior invariants: both fetches and the stale-supply clearing effect, submit-time validation incl. the inventory loop, POST body shape, success reset + scroll + 2s `/dashboard` redirect, `router.back()` cancel, `distributionItems.length === 1` remove-guard, and the required `recipientNotes`.
