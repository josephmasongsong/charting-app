# BC Housing Design System

A design system for **BC Housing**, the provincial housing authority for British Columbia — funding, developing, and managing subsidized and community housing, and regulating landlord/tenant and homeowner-protection programs across the province.

This system was reverse-engineered from screenshots of BC Housing's internal **.NET / Bootstrap** line-of-business applications (Feedback Forms, PartnerHub, Branch Planning, Staff Directory, and Power BI dashboards), then translated into a React + CSS-custom-property implementation.

## Sources

- `uploads/bc-housing-design-system.jsx` — a React showcase app recreating the sampled screens and components, with inline design notes and a corrected color palette (v2: PartnerHub chrome corrected from a backdrop-dimmed sample).
- `uploads/bch-shadcn-implementation-guide.md` — a parallel Next.js + shadcn/ui + Tailwind implementation guide: token mapping, component recipes (cva variants), and a design-QA checklist.
- No Figma file, GitHub repo, or live codebase was attached — everything below is derived from these two files only.

## Products represented

One primary product surface is represented, **PartnerHub** — the internal extranet BC Housing's non-profit/co-op housing partners use for Operational Review workflows (questionnaires, declarations, site visits, appeals) — plus the adjacent **public Feedback Forms** flow that shares its chrome and form components. Staff Directory, a Branch Planning stepper, and Power BI-style reporting dashboards appear as sub-surfaces within the same visual system.

## Content fundamentals

- **Voice:** plain, procedural, government-service tone — instructional rather than persuasive ("Pick the option that best describes...", "Please download the appeal letter template..."). No marketing language, no humor, no emoji.
- **Person:** mostly third-person/imperative for instructions ("Please assign a board member..."); first-person occasionally in system messages ("Our team does not review tenancy or property maintenance complaints").
- **Required fields:** always phrased as direct field labels ending in a colon ("Legal First Name:", "2. Type of work"), often numbered when part of a long form.
- **Errors/warnings:** specific and directive, naming the exact missing field or deadline ("You have until 12:00AM, July 1, 2023 to complete your submission and sign the declaration").
- **Casing:** sentence case for body copy and buttons ("View my Operational Review"); ALL CAPS reserved for compact status labels (STATUS: IN PROGRESS) and KPI card labels.
- **No emoji anywhere** in the source material.

## Visual foundations

- **Color logic — teal is identity, blue is action.** Teal (`#006265` and family) is chrome: headers, footers, modal title bars, table headers, KPI cards, sidebar. Blue (`#0073CE`) is the only color used for anything interactive — buttons, links, tabs, selection. This is the single most important rule in the system; see `guidelines/colors-*.card.html`.
- **Status color is fixed and singular:** green = complete, gold = in-progress/current, gray = not-started, red = urgent/destructive. A color never carries two meanings on one screen.
- **Type:** the native system UI stack — no webfont ships with the system (see Fonts). No display/serif face anywhere; body and headings share one sans stack, differentiated only by size/weight.
- **Spacing:** 4px base scale (4/8/12/16/24/32/48/64). Panels and cards pad at 24px; page gutters 24px; 48px between major dashboard sections.
- **Radii:** inputs 2px (near-square, deliberately distinct from buttons), avatar tiles 3px, buttons/tabs 4px, cards/modals 6px. Radii scale up with surface size/importance.
- **Backgrounds:** flat fills only — no photography, no illustration, no gradients except the two small decorative exceptions noted below and a subtle profile-photo-placeholder gradient. No textures or patterns.
- **Shadows:** one soft card-lift shadow (`0 2px 6px rgba(0,0,0,.12)`) for KPI/quick-start cards, one deeper shadow for modals (`0 8px 24px rgba(0,48,50,.22)`). No inner shadows.
- **Borders:** 1px hairlines in gray-300 (`#DEE2E6`) separate cards and table cells; a heavier 4–5px left-accent border marks destructive alerts and stat-card tone. No capsule/pill borders except status badges.
- **Animation:** minimal — a single `background .15s` transition on buttons/toggles. No page transitions, no bounce/spring easing, no motion as a design feature.
- **Hover/press states:** hover darkens (primary blue → `#005EA8`, teal → `#003032`); no lightening, no scale/shrink on press. Disabled state swaps to a flat pale tint (`#BDD2ED`) rather than lowering opacity.
- **Transparency/blur:** used exactly once — the modal backdrop (`rgba(0,48,50,.45)`), no blur. No frosted-glass or translucent surfaces elsewhere.
- **Cards:** white fill, 1px gray-300 border, 6px radius, no default shadow (shadow is reserved for the teal KPI/quick-start variants specifically, not cards generally).
- **Data density:** dense, tabular, government-software density — grid layouts, small type (13–15px body), zebra striping on every list/table.
- **One decorative exception to the flat-fill rule:** a linear-gradient placeholder tile used where a staff photo is missing.

## Iconography

- **Icon system:** [Lucide](https://lucide.dev) outline icons (2px stroke, round caps, 24×24 grid) — the only icon set referenced in the source `.jsx`/`.md`. No icon font, no PNG icon sprites, no emoji, no Unicode glyphs used as icons anywhere in the source.
- **Package note:** components import icons from the real `lucide-react` package (same glyph names as the original inlined set; every usage passes an explicit `size`, so nothing changed visually). `assets/icons.jsx` — the dependency-free SVG shim that stood in for `lucide-react` when the in-browser bundler could not resolve npm packages — is kept only for `_ds_bundle.js` / the preview cards, which have not been regenerated and still reference it.
- **Logo:** the supplied BC Housing mark (roof inside a segmented blue/teal colour wheel) lives at `assets/logo.png` and is rendered by `components/chrome/BrandMark.jsx`, which embeds it as a data URI so it resolves from any page. `AppHeader` uses it in all navigation chrome; sign-in and reset-password templates reference the file directly.

## Fonts

No webfont ships with this system. `--font-sans` is the platform UI stack (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif`), which renders as Segoe UI on the Windows machines the source apps target and the native UI face elsewhere. Weights used: 400 body, 600 emphasis, 700 headings and labels. No display or serif face anywhere.

## Intentional additions

- `assets/icons.jsx` — legacy inlined SVG icon set (see Iconography); components no longer import it.
- `BarChart` / `DonutChart` / `LineChart` — Recharts (`recharts` npm package) wrappers implementing the visual spec in section 4.11 of the shadcn guide (series colors from `--chart-*`, `#E6E6E6` horizontal-only gridlines, no axis lines, value labels at bar ends, dashed action-blue reference lines, 46/80 donut ring with value + percent legend). They keep the same props as the earlier hand-rolled SVG versions (see the `.d.ts` files) and disable Recharts' enter animations to match the system's no-motion rule.

## Index

```
styles.css                 → imports all tokens (do not add rules directly here)
tokens/
  colors.css                brand + semantic color custom properties
  typography.css             font stack, type scale
  spacing.css                 spacing scale, radii, shadows
assets/
  icons.jsx                   inlined Lucide-equivalent icon glyphs (helper, not a component)
components/
  forms/      Button, RequiredLabel, Input, Textarea, Select, Radio, Checkbox, Toggle, Listbox
  feedback/   Alert, Modal
  navigation/ WizardTabs, WizardPanel, Stepper, ProcessTimeline, Sidebar, SideItem
  data/       AvatarTile, StaffRow, KpiCard, DataTable, StatCard, ActivityFeed
  charts/     BarChart, DonutChart, LineChart
  cards/      QuickStartCard, SegmentedProgress, DevelopmentItem, ProfileField
  chrome/     BrandMark, AppHeader, AppFooter
guidelines/   foundation specimen cards (Colors, Type, Spacing)
ui_kits/
  partnerhub/ Dashboard, FeedbackWizard, StaffDirectory, Profile screens + index.html
thumbnail.html              project homepage tile
SKILL.md                     portable skill file for Claude Code / Agent Skills
```

## Components (full list)

Button, RequiredLabel, Input, Textarea, Select, Radio, Checkbox, Toggle, Listbox, Alert, Modal, WizardTabs, WizardPanel, Stepper, ProcessTimeline, Sidebar, SideItem, AvatarTile, StaffRow, KpiCard, DataTable, StatCard, ActivityFeed, BarChart, DonutChart, LineChart, QuickStartCard, SegmentedProgress, DevelopmentItem, ProfileField, BrandMark, AppHeader, AppFooter.
