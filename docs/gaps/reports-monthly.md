# /reports/monthly vs design-system/templates/monthly-reports/MonthlyReports.dc.html

**Template:** `MonthlyReports.dc.html` — "Period-based KPI summary with region activity breakdowns, supply totals, and site participation." Header (30px + period label, outline Change Period / Export to Excel) → optional no-prior-data banner → auto-fit KPI grid (up to 6) → `1.6fr/1fr` two-column body: region `DataTable` cards | supplies `DataTable` + Most Visited Sites bars + **Tenant Referrals donut/stacked-bar card** → teal `Modal` period picker with Month/Quarter/Year toggle.
**App:** `page.tsx` (RSC: `searchParams` → `generateMonthlyActivityReport`, Suspense + error card; **line 1 is a commented-out import of the dead root-level component — delete**) + `loading.tsx` (Loader2 card) → `src/components/reports/monthly/` (the live module per memory): wrapper + seven sub-components. Data flows entirely from the server action; the module renders its own header (the page adds none).

## A. Visual differences — by sub-component

**MonthlyActivityReport (wrapper).** `h2 text-3xl` → 30px/`-.2px` h1 treatment with the period as the 15px muted subtitle. Grid `lg:grid-cols-3` (2+1) → template `1.6fr/1fr` (cosmetic). Metric grid hard `grid-cols-4` (no responsive collapse) → `repeat(auto-fit,minmax(190px,1fr))`-style responsive grid. Delete the `{/* ADD THIS WRAPPER DIV */}` / `{/* ADD THIS LINE */}` / `{/* CLOSE WRAPPER DIV */}` dev comments and stray `{' '}` artifacts. The No Activities empty card → `ui/empty-state`.

**MetricCard.** shadcn Card with `CardContent pt-0`, title+icon row, 2xl value → template KPI: 11.5px uppercase muted label, 32px circular icon chip (template `rgba(0,98,101,.08)` teal tint on `--surface-chrome` icon — nearest tokens: `--action-selected` bg + `--surface-chrome` icon, or the established `[--stat-icon-bg]` pattern; flag the rgba as a template literal with no exact token), 30px bold value, optional muted sub-line, 12px delta note. Keep the `subMetrics` API and `React.isValidElement` branch.

**ActivityTypeByRegionTable.** Region header row (MapPin + "{region} Region" 16px bold, `border-b`) with muted "N activity types" text replacing the outline Badge. The hand-rolled `<table>` with `bg-muted/50`/`text-primary` → `ui/data-table` treatment (teal band, gridlines, `num` right-alignment; template columns: Activity Type / Events / Participants / Total Cost). The totals row carries the region totals **plus the existing growth chips inline** (template puts deltas in the DataTable footer exactly like this) — since DataTable's `footer` accepts ReactNode per cell, the chips drop in; keep the region-growth lookups byte-identical. Note: app centers Events/Participants; template right-aligns numerics — follow DataTable's `num`.

**SupplyDistributionsSidebar.** Same conversion: card header (Package + "Supplies Distributed") on the template's bordered-header pattern; hand-rolled table → `ui/data-table` (Supply / Distributions / Quantity). Empty state (Truck icon) → `ui/empty-state` inline. Template adds a totals footer row — sums are derivable from props (**purely cosmetic**).

**SitePerformanceCard.** Title "Site Activity This Period" vs template "Most Visited Sites" + "by events" (copy choice; keep app copy per precedent). Bars: `bg-muted` track + **`bg-blue-400` fill (raw)** → template `--bch-gray-200` track / `--surface-chrome` fill at 8px — the same progress treatment established on /events/[id]. Keep top-5 sort and max-scaling (template scales by share-of-total; app scales by max — behavior, keep). Meta line stays "N events · M participants"; the template's "(X%)" share is derivable (**cosmetic**, optional). Empty state → `ui/empty-state`.

**DateRangeDialog.** shadcn Dialog + DialogTrigger → `ui/modal` teal chrome ("Select Report Period"); month/year controls are native `<select>`s (no `ui/select` import exists in the file) → **`ui/select` per the rules**; Range toggle and validation stay; validation error → the destructive treatment; full-width DS primary "Generate Report" with Search icon per template; Loader2 pending state kept. Keep `useTransition`/`router.push` wiring, availableDateRange month-clamping logic, and the open/reset effect byte-identical.

**GrowthIndicators.** `text-green-600`/`text-red-600`/`text-gray-500` → `--success`/`--danger`/`--text-muted` (both icon and text helpers; cost variants keep their inverted good/bad mapping). Keep TrendingUp/Down/Minus icons — the template's ▲/▼ glyphs are equivalent; icons are the app's established affordance.

**MonthlyReportExportButton.** DS outline treatment; keep FileSpreadsheet icon, XLSX workbook construction, filename, `alert()` error path, and `isExporting` label swap unchanged.

**page.tsx / loading.tsx.** Delete the dead commented import; wrappers gain the page shell (`--surface-page`, px padding — currently `max-w-7xl py-6` with no horizontal padding under the root layout); error card's `text-red-600` heading → `--danger`; both Loader2 cards retoken (`text-primary` → `--action-primary` or muted).

## B. New UI with no data behind it

| Element | Needs | Detail |
|---|---|---|
| Tenant Referrals card (donut, categories, channel stacked bar) | **DB/feature** | No referrals data exists anywhere in the schema or report payload. Omit — a stub donut of nothing helps no one; record for DEFERRED.md |
| KPI: Cost per Participant, Avg Participants/Event | **purely cosmetic** | Derivable from `totalCost`/`totalParticipants`/`totalEvents` already in props |
| KPI sub: "N unique residents" | **API field** | No unique-participant count in the payload |
| No-prior-data banner | **purely cosmetic** | Derivable from `availableDateRange.minDate` vs the selected period |
| Site coverage line ("12 of 40 sites visited") | **API field** | Distinct-sites-visited is derivable from `sitePerformance`, but total eligible sites is not in the payload |
| Supplies totals footer, site share-% | **purely cosmetic** | Sums/shares of existing props |
| Quarter/Year period types | **client state** | Both are expressible as month ranges through the existing `startYear/startMonth/endYear/endMonth` params — pure dialog-side mapping, but it changes what the picker submits; defer to a wiring pass |

## The region colour palette — findings and proposal

**Finding.** `src/server/actions/reports.ts` hardcodes `PROGRAM_GOAL_COLORS` — ten Tailwind-500 hexes (`#3b82f6`, `#10b981`, …) — and stamps them onto `programGoals[].color` and `activityTypesParticipation[].color` (the latter offset by 3 to avoid collisions). **No live component renders either field**: their only consumers were the dead root-level `MonthlyActivityReport` charts. Today the palette is dead payload computed on every report. The Excel export never uses colours.

**Proposal.**
1. **Remove colour assignment from the server action.** Presentation does not belong in the data layer; `ProgramGoalSummary`/`ActivityTypeParticipation` lose their `color` fields (or keep them optional during transition). This also deletes the ten hexes and the offset-by-3 trick.
2. **Assign colours client-side at render time, from the DS chart palette**, when charts return to this report: `const CHART_COLORS = [...]; color: CHART_COLORS[i % CHART_COLORS.length]`. The ported `ui/bar-chart`/`ui/donut-chart` already take a CSS colour string per series/datum, so `var(...)` strings drop straight in.
3. **Which tokens — resolve the known shadowing first.** `src/styles/tokens/colors.css` declares the DS series `--chart-1..5` (seafoam, sky-400, teal-700, teal-light, blue-600), but shadcn's `globals.css` `:root` declares its own oklch `--chart-1..5`, and the token-mapping phase established shadcn's win the cascade. Two clean options: **(a)** reference the underlying palette tokens directly — `var(--bch-seafoam)`, `var(--bch-sky-400)`, `var(--bch-teal-700)`, `var(--bch-teal-light)`, `var(--bch-blue-600)` — sidestepping the alias collision entirely (safe today, no CSS changes); **(b)** delete shadcn's unused `--chart-*` oklch block so the DS aliases win (cleaner long-term, but a shared-CSS edit — same bucket as the other shared-chrome holds). Recommend (a) now, (b) as a follow-up decision.
4. **Ten colours → five.** The DS defines a 5-series chart palette. More than five categories should cycle (`i % 5`) — or aggregate the tail into "Other" for donuts, which is a design decision to confirm, not assume. Nothing currently rendered needs more than the template's four.

Behavior invariants for the visual pass: the server action's data shape and queries (palette removal is a wiring/cleanup pass, not visual), `searchParams` handling, Suspense/error paths, XLSX export, DateRangeDialog's transition/validation logic, and all growth computations.
