# Component inventory: design system vs repo

Generated 2026-08-23 on branch `redesign`. Read-only comparison; no code changed.
Companion to `AUDIT.md` (which components are live) and `TOKEN_MAP.md` (values).

**Scope.** `design-system/components/**/*.jsx` (32 exported components in 7
groups) against `src/components/ui/*.tsx` (24 shadcn primitives). Where a
design-system component's only counterpart is an *app-level* component
(`src/components/*`, `src/app/**/components/*`), that is noted too, since the
task is "what does the design system cover".

**How to read "structural" vs "visual".**

- **Structural** — the two would not be interchangeable by swapping class names:
  different prop contract (names, shapes, events), different DOM (native element
  vs Radix primitive, single component vs compound `X`/`XTitle`/`XContent`), or
  behaviour one side has and the other lacks (portal, focus trap, keyboard).
- **Visual** — same element, same props in practice; only the styling values
  differ (border, radius, size, colour).

One difference applies to every pair and is not repeated per row: design-system
components use **inline `style` objects** driven by `var(--token)`, implement
hover with React state, accept no `className`, and have no `cn()` merge; shadcn
primitives use **Tailwind classes + `cn()`**, `data-slot` attributes, `cva`
variants, and (for interactive ones) Radix primitives. So even "visual only" pairs
need a re-implementation rather than a class swap — but the *call sites* would not
change.

Name matching is exact (case-insensitive, ignoring the `.jsx`/`.tsx` suffix).
Near-name matches ("same job, different name") are annotated inside B and C
rather than forced into A.

---

## A. Same name, both exist

Seven names collide with a shadcn primitive; one (`ActivityFeed`) collides with an
app-level component.

| Name | Design system (`design-system/components/…`) | Repo (`src/components/…`) | Verdict |
|---|---|---|---|
| **Alert** | `feedback/Alert.jsx` — single component. Props `variant` (`validation` \| `destructive` \| `warning` \| `notice` \| `empty`), `title`, `children`. DOM: `div[role=alert]` › optional title row (`Info` icon in a dark circle + 21px bold text) › children. Left 5px red bar on `destructive`. | `ui/alert.tsx` — compound `Alert` + `AlertTitle` + `AlertDescription`. Variants `default` \| `destructive` only. DOM: `div[role=alert]` laid out as a CSS grid that expects an `<svg>` as first child; title/description are separate slots. | **Structural.** Different variant vocabulary (5 vs 2; no `warning`/`notice`/`empty` in shadcn — the app fakes them with `border-green-200 bg-green-50` overrides, see `AUDIT.md` §4.3), different composition (props vs child slots), different title/icon mechanism. Same root element. |
| **Button** | `forms/Button.jsx` — props `variant` (`primary` \| `outline` \| `teal` \| `soft` \| `destructive`), `disabled`, `onClick`, `style`, `type`, `children`. Always `<button>`. Hover colour from a JS map via `useState`. Disabled = flat `--action-primary-disabled` fill, not opacity. No `size`, no `className`, no `asChild`, no icon sizing rule, no focus ring. | `ui/button.tsx` — `variant` (`default` \| `destructive` \| `outline` \| `secondary` \| `ghost` \| `link`) × `size` (`default` \| `sm` \| `lg` \| `icon`), `asChild` → Radix `Slot`, all native button props pass through, `[&_svg]` auto-sizing, focus-visible ring, `disabled:opacity-50`. | **Structural.** Only `outline` and `destructive` exist on both sides; `primary`↔`default`, `teal`/`soft` have no shadcn variant, `secondary`/`ghost`/`link` have no DS variant (the app uses `ghost` 31× and `link` 8×). No `size` axis in the DS — the app uses `size="sm"` 127× and `size="icon"` 9×. `asChild` (used for `Link` wrapping) is absent. DOM is the same `<button>`. |
| **Checkbox** | `forms/Checkbox.jsx` — native `<input type="checkbox">` inside a `<label>` with a `<span>` for the `label` prop; all native input attrs spread (`checked`, `onChange(event)`, `name`…); colour via `accentColor`. | `ui/checkbox.tsx` — Radix `CheckboxPrimitive.Root` (renders `button[role=checkbox]`) + `Indicator` with a lucide `CheckIcon`; controlled via `checked` / `onCheckedChange(boolean \| "indeterminate")`; no label slot. | **Structural.** Native input vs Radix button; `onChange(e)` vs `onCheckedChange(bool)`; DS bundles the label, shadcn expects a sibling `Label`. Form code that reads `e.target.checked` (e.g. `SiteForm`, `InviteUserDialog`) would change. |
| **Input** | `forms/Input.jsx` — native `<input style={inputBaseStyle} {...props}>`. 1px `--border-input` (#767676), 2px radius, 15px text, `7px 10px` padding. No `className`; a passed `style` prop **replaces** the base style object wholesale (spread order). | `ui/input.tsx` — native `<input className={cn(…)}>`. `h-9`, `rounded-md` (8px), `border-input`, `shadow-xs`, `text-base md:text-sm`, focus ring, `aria-invalid` styling. | **Visual only.** Same element, same native props. The one caveat is the `style` override behaviour and the missing `className`/`aria-invalid` hooks — the app's 31 `border-red-500` validation overrides go through `className`, which the DS version ignores. |
| **Select** | `forms/Select.jsx` — native `<select>` (`appearance:none`) wrapped in a `<span>` with an absolutely-positioned lucide `ChevronDown` that flips on focus; children are native `<option>`s; native `value`/`onChange(event)`. | `ui/select.tsx` — Radix compound: `Select` › `SelectTrigger` (button) + `SelectValue` › `SelectContent` (portal, popper positioning, scroll buttons) › `SelectItem`/`SelectGroup`/`SelectLabel`; `value`/`onValueChange(string)`. | **Structural.** Native dropdown vs custom popover; 1 element vs 6-part composition; different event API. The app uses shadcn `Select` in 12 files (filters, dialogs, `SupplyDistributionForm`); `DateRangeDialog` already uses raw `<select>`s and is the closest thing to the DS version. |
| **Textarea** | `forms/Textarea.jsx` — native `<textarea style={{…inputBaseStyle, minHeight: 96, resize: "vertical"}} {...props}>`. | `ui/textarea.tsx` — native `<textarea className={cn(…)}>`, `min-h-16`, `field-sizing-content`, `rounded-md`, focus ring. | **Visual only.** Same caveats as `Input` (no `className`, `style` replaces). |
| **Toggle** | `forms/Toggle.jsx` — an **on/off switch**: `<button role="switch" aria-checked>` with a sliding thumb `<span>`, plus a text label defaulting to "On"/"Off". Props `checked`, `onChange(boolean)`, `label`. 40×20px, grey-500 → `--action-primary`. | `ui/toggle.tsx` — a **pressed-state toggle button** (Radix `TogglePrimitive`, `aria-pressed`): `pressed`/`onPressedChange`, `variant` (`default` \| `outline`) × `size`. Dead in the app (`AUDIT.md` §3.4). | **Structural — and a false match.** Same name, different widget. The DS `Toggle` corresponds to shadcn **`Switch`** (`ui/switch.tsx`, Radix `SwitchPrimitive`, `button[role=switch]`, `checked`/`onCheckedChange`), which the app uses once (`EditUserDialog` account-status). Against `Switch` the difference is visual (size, colours) plus the DS's built-in label. |
| **ActivityFeed** | `data/ActivityFeed.jsx` — presentational. Props `items` (flat) or `groups`, each row `{initials \| icon, actor, action, target, time, tone, type, href}`; `initialCount`/`pageSize` drive a **"Load more"** button; `onLoadMore` callback; rows render an `AvatarTile` or a tone-tinted icon badge, an optional uppercase `TypeChip`, and become `<a>` when `href` is set. | `src/components/ActivityFeed.tsx` (app-level, live on `/dashboard`) — **self-fetching** via `useActivityFeed()` → `/api/activity-feed`; no props. Renders shadcn `Card` › `CardHeader` › list of rows with `Avatar`/`AvatarFallback`, a `Badge variant="outline"`, and a `switch` over 24 `ActivityType` values that builds the sentence and picks one of eleven `text-*-600` colours; **numbered pagination** with `Button`s. | **Structural.** Data ownership (props vs fetch), pagination model (load-more vs page numbers), row model (generic tone/type vs hard-coded activity-type switch), and DOM all differ. The DS version is the shape the app one would need to be refactored *into* (fetch stays in the page/hook; feed becomes presentational). |

---

## B. Design-system only — no same-name component in the repo

24 components. "Closest in repo" says what currently does the job, if anything;
"Covered?" is whether the repo has the *capability* under another name.

### Forms and feedback

| Design-system component | What it is | Closest in repo | Covered? |
|---|---|---|---|
| `feedback/Modal` | Controlled dialog: `open`, `onClose`, `title`, `footer`, `children`, `center`. Fixed overlay `div` (teal-tinted backdrop) › `div[role=dialog][aria-modal]` › **teal title bar** with `X` › body › footer. No portal, no focus trap, no Escape key, backdrop click closes. | `ui/dialog.tsx` (Radix; `open`/`onOpenChange`, portal, focus trap, Escape, `DialogHeader`/`Title`/`Description`/`Footer`, close button) — used by 21 live files. | Yes, by a different name. **Structural** vs `Dialog`: composition and a11y behaviour differ; the DS version would need the Radix behaviours added before replacing the app's 20+ dialogs. |
| `forms/Radio` | Native `<input type="radio">` + label span, same shape as DS `Checkbox`. | none — no `radio-group` installed; the app has no radio inputs. | **No.** |
| `forms/Listbox` | Static single-select list: `options: string[]`, `value`, `onChange(string)`; `div[role=listbox]` › `div[role=option]`, click to select, no keyboard handling. | `ui/command.tsx` (cmdk, used inside `EventForm` comboboxes) or `ui/select.tsx`. | Partially. `Command` is the nearest DOM (`role=listbox`/`option`) but adds search + keyboard nav; **structural** either way. |
| `forms/RequiredLabel` | Native `<label>`; props `required` (red `*` **after** the text), `bold`, `htmlFor`. | `ui/label.tsx` (Radix Label, native `<label>`, `className`). | Yes. Same DOM; DS adds the `required`/`bold` props. Near-visual. The app currently hand-rolls `<span className="text-red-500">*</span>` in `EventForm` (6×) and `SiteForm`. |

### Data display

| Design-system component | What it is | Closest in repo | Covered? |
|---|---|---|---|
| `data/DataTable` | **Data-driven** table: `columns: {key,label,num}[]`, `rows`, optional `footer` row. Renders the whole `<table>`: teal uppercase header cells, 1px cell borders, zebra rows, tinted footer. No sort, pagination, selection or row actions. | `ui/table.tsx` — **composable** styled tags (`Table` with overflow wrapper, `TableHeader`/`Body`/`Footer`/`Row`/`Head`/`Cell`/`Caption`). The 8 admin `*-table.tsx` files compose it and each carry their own sort + pagination code. | Yes, by a different name. **Structural**: props-driven vs composition. The DS has no sort/pagination affordance, which every admin table needs. |
| `data/AvatarTile` | Square initials tile: `initials`, `size` (default 56); 3px radius, `--action-primary` fill, bold text. No image. | `ui/avatar.tsx` (Radix `Avatar` + `AvatarImage` + `AvatarFallback`, circular). Used by `Navigation` and `ActivityFeed`. | Yes. **Structural** (no image slot, single element vs compound) and **visual** (square vs round). The app never passes an image, so in practice only the fallback is used. |
| `data/KpiCard` | Teal tile: big 34px `value`, uppercase 11.5px `label`, `tint` flag for teal-500, `--shadow-card`. | `ui/card.tsx` (generic) + app `reports/monthly/MetricCard.tsx` and the 4 inline stat cards on `/dashboard`, `/events/[id]`, `/sites/[id]`. | Partially. Role overlaps `MetricCard`; **structural** vs `Card` (data props vs slots); `MetricCard` also carries sub-metric rows the DS tile does not. |
| `data/StatCard` | White card with 4px left border in a `tone` (`red` \| `gold` \| `blue` \| `teal`), icon circle, `title`, `sub`. | app dashboard "Quick Start" icon chips and the detail-page stat cards (`text-blue-500` icon accents). | Partially. **Structural** vs `Card`. Its `tone` prop is the DS answer to the app's ad-hoc `text-orange-500`/`purple-500` stat icons. |
| `data/StaffRow` | 6-column grid row for a person: avatar, name/title, dept/branch, email link, phone, action icons; `selected`/`striped`. | `admin/users/components/UsersTable.tsx` rows. | Partially; the app's user list is a table, not a row list. **Structural.** |
| `cards/SegmentedProgress` | Multi-segment bar: `segments: {value, state: complete \| inProgress}[]`, label row with `% complete`, `role=progressbar` with ARIA values. | `ui/progress.tsx` (Radix single `value`, dead in the app); live progress bars are hand-rolled `<div style={{width}}>` in `events/[id]/page.tsx` and `SitePerformanceCard`. | Partially. **Structural** vs `Progress` (multi-segment + states + label). |
| `cards/ProfileField` | Label-over-value pair (`label`, `children`). | Hand-rolled `<p className="text-sm text-muted-foreground">` / value pairs on every detail page and in `SupplyDetailCard`. | No component; pattern exists inline. |
| `cards/DevelopmentItem` | Row: teal icon tile, name link, address · units, status pill (`Operational` teal / else gold). | none (app has no "developments"; nearest is a `SitesListClient` row card). | **No.** |
| `cards/QuickStartCard` | Teal-600 card: `title`, `sub`, either `actions: string[]` (white chips) or `items: {icon, label, sub}[]` (rich rows with icon tile + chevron); icons by lucide name. | Inline "Quick Start" `Card` in `src/app/dashboard/page.tsx` (three `Button`s with coloured icon chips). | Pattern exists inline; no component. |

### Charts

| Design-system component | What it is | Closest in repo | Covered? |
|---|---|---|---|
| `charts/BarChart` | Recharts wrapper: `data`, `xKey`, `series[{key,label,color}]`, `layout` vertical/horizontal, `title`, `height`. | `ui/chart.tsx` (shadcn `ChartContainer` wrapper — **dead**) and two dead root-level Recharts components. The only live "chart" is the CSS bar list in `reports/monthly/SitePerformanceCard.tsx`. | **No live coverage.** `SitePerformanceCard` is a horizontal-bar use case. |
| `charts/DonutChart` | Recharts `PieChart`: `data[{name,value,color}]`, 46/80 ring, legend with value + %. | dead `ProgramGoalsPieChart.tsx`. | **No live coverage.** |
| `charts/LineChart` | Recharts: `series[{key,label,color,dashed}]`, dashed target lines. | dead `MonthlyParticipantGrowthChart.tsx` (not actually a line chart). | **No live coverage.** |

### Navigation and chrome

| Design-system component | What it is | Closest in repo | Covered? |
|---|---|---|---|
| `navigation/WizardTabs` | Presentational `div[role=tablist]` of `parts[{label, state: complete \| active \| upcoming}]`, `onSelect(index)`; no panels; checkmark on complete. | `ui/tabs.tsx` (Radix Tabs with `TabsContent` panels — **dead** in the app). The dead `_EventForm` wizard used `Dialog` + `Progress` for steps. | Partially. **Structural**: state-per-tab from props and no content management vs Radix value-driven tabs + panels. |
| `navigation/WizardPanel` | White panel with 24px title, `children`, optional `footer` row; sits under `WizardTabs` (no top border). | `ui/card.tsx`. | Pattern only. |
| `navigation/Stepper` | Large circular steps (64px) with icon, dashed/solid connectors, `steps[{label, icon, state}]`. | none. | **No.** |
| `navigation/ProcessTimeline` | Small numbered/check circles (30px) with connectors, `steps[{label, state}]`. | none. | **No.** |
| `navigation/Sidebar` + `SideItem` | Teal-600 `<nav aria-label="Main">` of `SideItem` buttons (icon, label, chevron, indent, active), one collapsible group; content is hard-coded PartnerHub items. | none — the app has no sidebar (shadcn `sidebar` not installed; `--sidebar-*` CSS vars exist in `globals.css` unused). | **No.** As shipped it is a fixture, not a reusable nav: the item list is inside the component. |
| `chrome/AppHeader` | 56px bar: `BrandMark` + "BC HOUSING", `variant` (`teal` \| `blue` \| `dark`), `right` slot. | `src/components/Navigation.tsx` (sticky white bar, logo `Image`, Home icon, user `DropdownMenu`). | Partially. `Navigation` has behaviour (session, dropdown, sign-out) the DS header only leaves a `right` slot for. **Structural.** |
| `chrome/AppFooter` | Teal centred footer with © year. | Inline `<footer>` in `src/app/layout.tsx` (muted bar, © + support `mailto:`). | Pattern only. |
| `chrome/BrandMark` | `<img>` of the base64-embedded BC Housing logo; `size`. | `<Image src="/logo.jpg">` in `Navigation.tsx` and `login/page.tsx`. | Pattern only (different asset: `public/logo.jpg` vs embedded PNG). |

---

## C. Repo only — app components the design system does not cover

### C.1 shadcn primitives in `src/components/ui/` with no same-name DS component

| Primitive | Live? | Closest DS component | Gap |
|---|---|---|---|
| `badge` | yes — 21 live importers, 28 total; plus `RoleBadge`/`StatusBadge`/`RegionBadge`/`JobTitleBadge`/`BooleanBadge` built on it | none as a component. Status pills appear only *inside* `DevelopmentItem` and `ActivityFeed`'s `TypeChip`. | **Uncovered.** The DS has a status-colour rule (green/gold/gray/red) but no badge primitive to carry it. |
| `card` | yes — 36 live importers | `KpiCard`, `StatCard`, `QuickStartCard`, `WizardPanel` (all specialised, data-driven). | No generic card; the DS readme specifies the *look* (white, 1px gray-300, 6px, no shadow) but ships no component. |
| `dialog` | yes — 21 live | `Modal` (see B). | Covered structurally-differently. |
| `dropdown-menu` | yes — `Navigation` user menu | none. | **Uncovered.** |
| `popover` | yes — `EventForm` comboboxes | none. | **Uncovered.** |
| `command` | yes — `EventForm` comboboxes (cmdk) | `Listbox` (static, no search). | Partially. |
| `calendar` | yes — `EventForm` date picker (react-day-picker) | none. | **Uncovered.** |
| `label` | yes — 19 live | `RequiredLabel`. | Covered. |
| `table` | yes — 8 admin tables | `DataTable`. | Covered structurally-differently (no sort/pagination in DS). |
| `avatar` | yes — `Navigation`, `ActivityFeed` | `AvatarTile`. | Covered (square, initials-only). |
| `switch` | yes — `EditUserDialog` | `Toggle` (DS). | Covered under a misleading name. |
| `separator` | yes — 2 files | none. | **Uncovered** (trivial). |
| `progress` | dead | `SegmentedProgress`. | — |
| `tabs` | dead | `WizardTabs` (no panels). | — |
| `toggle`, `toggle-group` | dead | none (DS `Toggle` is a switch). | — |
| `skeleton` | dead | none; DS has no loading state. | **Uncovered** — the DS defines no loading/skeleton pattern, while the app has four loading patterns (`AUDIT.md` §4.3). |
| `chart` | dead | `BarChart`/`DonutChart`/`LineChart` (plain Recharts, not `ChartContainer`). | Covered, without the shadcn `ChartConfig`/CSS-variable-per-series mechanism the §4.11 guide describes. |

### C.2 Live app-level components with no DS counterpart

Only live components are listed (dead ones are in `AUDIT.md` §3). "DS building
blocks" names what the DS *does* provide toward it.

| App component | Role | DS building blocks | Gap |
|---|---|---|---|
| `Navigation.tsx` | authenticated top bar with user menu | `AppHeader`, `BrandMark` | no dropdown menu, no session-aware slot |
| `ClientAuthGuard`, `ProtectedRoute`, `AuthProvider` | auth plumbing | — | not a design concern |
| `BackButton.tsx`, `sites/[id]/EditButton.tsx`, `GoogleMapsButton.tsx` | navigation buttons | `Button` (no `outline`+icon size rule) | `Button` lacks `size`/icon handling |
| `EventForm.tsx` (956 lines) | create/edit event with comboboxes, calendar, live totals, colour-coded summary boxes | `Input`, `Textarea`, `Select`, `Checkbox`, `RequiredLabel`, `Alert`, `WizardPanel` | no combobox, no date picker, no summary/callout component; the DS `log-event` **template** covers the page layout but as HTML, not components |
| `events/components/EventsListClient.tsx`, `sites/components/SitesListClient.tsx` | filter card + row cards + numbered pagination | `DataTable`, `StaffRow`, `Input`, `Select` | no filter toolbar, no row-card, no pagination component |
| `events/components/DuplicateEventDialog.tsx` | confirm dialog with async action | `Modal` (`center`) + `Button` | covered by `Modal` once it gains focus-trap/Escape |
| `supplies/[id]/components/SupplyDetailCard.tsx` | detail panel with collapsible section | `ProfileField`, `KpiCard` | no collapsible/disclosure |
| `supply-distributions/components/SupplyDistributionForm.tsx`, `admin/sites/components/SiteForm.tsx` | multi-card forms with repeatable line items | forms primitives, `Alert` | no repeatable-row / line-item component |
| Admin `*-table.tsx` ×8 | search + sortable table + pagination + dialogs | `DataTable`, `Input`, `Modal` | no sort header, no pagination, no toolbar |
| Admin `create-*`/`edit-*`/`delete-*`/`view-*-dialog.tsx` ×17 | CRUD dialogs | `Modal`, forms primitives, `Alert destructive` | covered once `Modal` is Radix-grade |
| `RoleBadge`, `StatusBadge`, `RegionBadge`, `JobTitleBadge`, `BooleanBadge` | value → badge variant maps | — | **no `Badge`** in the DS |
| `reports/monthly/MetricCard.tsx` | KPI with icon + sub-metrics | `KpiCard`, `StatCard` | no sub-metric rows |
| `reports/monthly/DateRangeDialog.tsx` | month/year range picker in a dialog | `Modal`, `Select`, `Checkbox` | covered by primitives; its raw `<select>`s already match the DS `Select` |
| `reports/monthly/GrowthIndicators.tsx` | up/down trend icon + colour helpers | — | no trend-delta component (the `dashboard` template shows deltas but ships none) |
| `reports/monthly/SitePerformanceCard.tsx` | ranked horizontal bars | `BarChart layout="horizontal"` | covered |
| `reports/monthly/ActivityTypeByRegionTable.tsx`, `SupplyDistributionsSidebar.tsx` | hand-rolled `<table>`s with totals row | `DataTable` (`footer` prop is exactly the totals row) | covered |
| `reports/monthly/MonthlyReportExportButton.tsx` | XLSX export | `Button` | covered |
| `ActivityFeed.tsx` | see A | `ActivityFeed`, `AvatarTile` | see A |

### C.3 Things neither side has a component for

Toasts (`sonner` is imported once with no `<Toaster>` mounted), loading/skeleton
states, pagination, sortable table headers, comboboxes with search, date pickers,
collapsible sections, and a generic badge. The DS `templates/` folder shows several
of these as static page HTML (pagination and sort arrows in `site-management`,
`user-management`), but nothing under `components/` implements them.

---

## Summary counts

| | |
|---|---|
| A — exact-name matches | 8 (7 vs `ui/`, 1 vs app-level `ActivityFeed`) |
| A — of which visual-only | 2 (`Input`, `Textarea`) |
| A — of which structural | 6 (`Alert`, `Button`, `Checkbox`, `Select`, `Toggle` [false match], `ActivityFeed`) |
| B — design-system only | 24 (17 have some repo counterpart — a different-name component or an inline pattern; 7 have none: `Radio`, `DevelopmentItem`, `DonutChart`, `LineChart`, `Stepper`, `ProcessTimeline`, `Sidebar`) |
| C.1 — shadcn primitives without a same-name DS component | 17 (12 live, 5 dead; 5 of the live ones — `badge`, `dropdown-menu`, `popover`, `calendar`, `separator` — have no DS equivalent at all) |
| C.2 — live app-level components | 40-ish files grouped into 19 roles above; the DS provides building blocks for most, a full equivalent for 5 (`SitePerformanceCard`, the two report tables, `ExportButton`, `DuplicateEventDialog`) and nothing for the five badge components |
