# Design-token map

Generated 2026-08-23 on branch `redesign`. Companion to `AUDIT.md` §4.

Maps every hard-coded colour, spacing value, radius, shadow and font size found in
`src/` to the BC Housing tokens now living in `src/styles/tokens/`, and lists what
has no token. Tailwind utility → pixel values are Tailwind v4 defaults as compiled
in this app (spacing = 4px × step; shadcn overrides `--radius-*` from
`--radius: 0.625rem`). Usage counts are grep counts over `src/**/*.tsx`.

Match quality: **exact** = same value; **near** = visually the same role and within
a shade; **semantic** = same *purpose* but a different colour (the redesign
intends the change); **none** = no token covers it.

---

## 0. What was wired in, and what it did

- Copied `design-system/styles.css` → `src/styles/styles.css` and
  `design-system/tokens/{colors,spacing,typography}.css` →
  `src/styles/tokens/`. The three token files are byte-identical to the source
  (`cmp` verified). No values changed anywhere.
- `styles.css` imported the tokens as `@import "tokens/colors.css"` — a bare
  specifier. Browsers resolve that relative to the stylesheet; Next's bundler
  resolves it as a package (`node_modules/tokens`) and the tokens silently failed
  to load (`next build` logged the resolution error, emitted CSS contained zero
  `--bch-*` variables). The three paths in `src/styles/styles.css` were changed
  to `./tokens/…`. That is the only edit to a copied file.
- `src/app/globals.css` now has `@import "../styles/styles.css";` after the
  `tailwindcss` and `tw-animate-css` imports (CSS requires `@import` before any
  other rule).
- Verified by starting the dev server and fetching the compiled stylesheet for
  `/login`: 59 `--bch-*` declarations present.

### Side effects visible in the compiled CSS (not visually verified — no browser automation in this repo)

The token files declare plain `:root {}` rules, which are **unlayered**.
Tailwind's own theme variables sit in `@layer theme`, and shadcn's base styles in
`@layer base`. Unlayered rules beat layered ones regardless of order, so:

| Token declaration | Collides with | Effect now live |
|---|---|---|
| `--text-xs: 11.5px` | Tailwind `--text-xs: .75rem` (12px) | every `text-xs` (107 uses) renders 11.5px |
| `--text-sm: 13px` | Tailwind `--text-sm: .875rem` (14px) | every `text-sm` (272 uses) renders 13px |
| `--text-base: 16px` | Tailwind `1rem` | no change |
| `--text-lg: 19px` | Tailwind `1.125rem` (18px) | `text-lg` (13 uses) renders 19px |
| `--text-xl: 21px` | Tailwind `1.25rem` (20px) | `text-xl` renders 21px |
| `--text-2xl: 24px` | Tailwind `1.5rem` | no change |
| `--text-3xl: 34px` | Tailwind `1.875rem` (30px) | `text-3xl` (20 uses, most `<h1>`s) renders 34px |
| `body { font-family: var(--font-sans) }` + `--font-sans: ui-sans-serif, system-ui, …` | Geist loaded via `next/font` and shadcn's `--font-sans: var(--font-geist-sans)` | body text switches from Geist to the system UI stack (preflight still sets `html` to Geist, but the unlayered `body` rule overrides it for all content) |
| `body { color: var(--bch-ink) }` | shadcn `@layer base body { color: var(--foreground) }` | body text colour is `#212529` instead of `oklch(0.145 0 0)` (≈ `#252525`; imperceptible) |
| `--chart-1..5` | shadcn's `--chart-1..5` in the same `globals.css` | **shadowed** — shadcn's block is declared later in the file and is also unlayered, so it wins. The DS chart palette is not in effect. |
| `--radius-*`, `--space-*`, `--shadow-*`, `--weight-*`, `--leading-body` | nothing | available only as `var(--…)` / Tailwind v4 `p-(--space-4)` syntax; they do not generate utilities because they are not in `@theme` |

If the font-size and body-font changes are *not* wanted yet, the smallest
reversible fix is to wrap the import in a layer (e.g. `@layer tokens { @import … }`
is not valid CSS, but `@import "../styles/styles.css" layer(base);` is) — that
would make Tailwind's unlayered utilities win again. Not done, per "don't modify
the values" and to keep the change to what was asked.

Also observed: `next build` fails type-checking on `src/components/ui/chart.tsx`
(dead file, recharts type mismatch). Verified pre-existing by stashing this
change and running `tsc --noEmit` — 8 errors either way. Production builds were
already broken before this task.

---

## 1. Colours

### 1.1 Tailwind palette classes in `src/**/*.tsx`

343 occurrences across 55 files. Grouped by role; count is total uses of all
listed classes.

**Destructive / error (red)**

| Class(es) | Uses | Tailwind value | Token | Match |
|---|---|---|---|---|
| `text-red-600` | 45 | `#dc2626` | `--danger` (= `--bch-red-700` `#ba0f17`) | near |
| `border-red-500` (invalid inputs) | 31 | `#ef4444` | `--bch-red-600` `#e70000` | near |
| `text-red-500` (asterisks, messages) | 24 | `#ef4444` | `--bch-red-600` | near |
| `bg-red-50` | 11 | `#fef2f2` | `--bch-red-50` `#faf0f1` | near |
| `border-red-200` | 10 | `#fecaca` | `--bch-red-100` `#ffe3e5` | near (one shade lighter) |
| `text-red-800`, `text-red-900` | 9 | `#991b1b`, `#7f1d1d` | `--bch-red-700` | nearest; no darker red token |
| `text-red-700`, `hover:text-red-700` | 7 | `#b91c1c` | `--bch-red-700` `#ba0f17` | near-exact |
| `bg-red-100` | 3 | `#fee2e2` | `--danger-surface` (= `--bch-red-100`) | near |

**Success (green)** — the DS has a success *foreground* only; no surface/border/dark-text.

| Class(es) | Uses | Tailwind value | Token | Match |
|---|---|---|---|---|
| `text-green-600` | 28 | `#16a34a` | `--success` (= `--bch-green-600` `#28a745`) | near |
| `bg-green-50` | 15 | `#f0fdf4` | — | **none** (no success surface) |
| `border-green-200`, `border-green-300` | 15 | `#bbf7d0` | — | **none** |
| `text-green-800`, `-900`, `-700` | 16 | `#166534`… | — | **none** (nearest `--bch-green-600`, much lighter) |
| `text-green-500`, `bg-green-600` | 3 | `#22c55e`, `#16a34a` | `--bch-green-500` `#16a660`, `--success` | near |

**Action / info (blue)** — DS rule: blue is *only* for interactive elements.

| Class(es) | Uses | Tailwind value | Token | Match |
|---|---|---|---|---|
| `text-blue-600` (stat accents, links) | 12 | `#2563eb` | `--action-primary` (= `--bch-blue-600` `#0073ce`) | semantic |
| `bg-blue-600`, `bg-blue-700` (submit button, badges) | 5 | `#2563eb` | `--action-primary`, `--action-primary-hover` | semantic |
| `bg-blue-50` (info boxes) | 4 | `#eff6ff` | `--action-selected` (= `--bch-blue-50` `#e2f6ff`) | near, but DS meaning is "selected", not "info" |
| `border-blue-200`, `bg-blue-100` | 7 | `#bfdbfe`, `#dbeafe` | `--bch-blue-100` `#bdd2ed` | near, but DS meaning is "disabled" |
| `text-blue-700` | 3 | `#1d4ed8` | `--action-primary-hover` `#005ea8` | near |
| `text-blue-500`, `bg-blue-500`, `from-blue-500`, `border-blue-500` | 7 | `#3b82f6` | — | **none** (between `--bch-sky-400` and `--bch-blue-600`) |
| `text-blue-400`, `bg-blue-400` | 2 | `#60a5fa` | `--bch-sky-400` `#60bdff` | near |
| `text-blue-800`, `text-blue-900`, `border-blue-300` | 4 | | — | **none** |

**Warning (yellow / orange / amber)**

| Class(es) | Uses | Tailwind value | Token | Match |
|---|---|---|---|---|
| `bg-yellow-50` | 1 | `#fefce8` | `--warning-surface` (= `--bch-yellow-50` `#fcf6de`) | near |
| `text-yellow-700`, `text-yellow-900` | 2 | `#a16207` | `--warning-text` (= `--bch-yellow-800` `#856404`) | near |
| `text-yellow-600`, `border-yellow-200` | 2 | | — | **none** |
| `text-orange-600` | 6 | `#ea580c` | — | **none** (nearest `--bch-gold-600` `#e9a800`, which is the DS "in progress" colour) |
| `text-orange-500`, `bg-orange-500` | 4 | `#f97316` | — | **none** (nearest `--bch-gold-500`) |
| `bg-orange-100` (not-found icon chips) | 3 | `#ffedd5` | — | **none** (nearest `--bch-tan-50` `#fdf8e7`) |
| `text-amber-600` | 1 | `#d97706` | `--bch-gold-600` `#e9a800` | near |

**Neutrals (gray / white / black)**

| Class(es) | Uses | Tailwind value | Token | Match |
|---|---|---|---|---|
| `text-gray-500` | 11 | `#6b7280` | `--bch-gray-500` `#7e7e7e` | near |
| `bg-gray-200` (progress tracks, skeletons) | 11 | `#e5e7eb` | `--bch-gray-200` `#e6e6e6` | exact-ish |
| `bg-gray-100` | 9 | `#f3f4f6` | `--bch-gray-100` `#f5f5f5` / `--surface-page` | near |
| `text-gray-600` | 9 | `#4b5563` | `--text-muted` (= `--bch-gray-700` `#495057`) | near |
| `border-gray-300` | 4 | `#d1d5db` | `--border-default` (= `--bch-gray-300` `#dee2e6`) | near |
| `border-gray-200`, `bg-gray-50` | 2 | | `--bch-gray-200`, `--surface-muted` (= `--bch-gray-50`) | near |
| `border-gray-900` (spinner) | 1 | `#111827` | `--bch-ink` `#212529` | near |
| `text-white`, `bg-white`, `border-white` | 10 | `#fff` | `--bch-white` / `--text-on-chrome` / `--surface-card` | exact |
| `bg-black/50` (dialog overlay) | 1 | | — | **none** as a token (readme specifies `rgba(0,48,50,.45)` but no variable) |

**No token at all** (decorative accents the DS does not have): `purple-50/100/200/500/600/900` (9 uses — `EventForm` time badge, detail-page stat icons, gradient avatars), `pink-600`, `indigo-600`, `cyan-600` (1 each, `ActivityFeed`), `emerald-600` (1; nearest `--bch-green-500`), `teal-600` (1; nearest `--bch-teal-600` `#00866e`, near).

### 1.2 shadcn theme variables in `src/app/globals.css`

These are the app's *current* tokens (neutral oklch). Mapping shows what each
would become under the DS.

| shadcn variable | Current value | DS token | Match |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` white | `--surface-page` `#f5f5f5` | semantic (DS pages are grey, cards white) |
| `--foreground` | `oklch(0.145 0 0)` ≈ `#252525` | `--text-body` (= `--bch-ink` `#212529`) | near-exact |
| `--card`, `--popover` | white | `--surface-card` | exact |
| `--card-foreground`, `--popover-foreground` | `oklch(0.145 0 0)` | `--text-body` | near-exact |
| `--primary` | `oklch(0.205 0 0)` ≈ `#343434` | `--action-primary` `#0073ce` | **semantic** — the single biggest visual change of the redesign |
| `--primary-foreground` | `oklch(0.985 0 0)` | `--text-on-chrome` `#fff` | near-exact |
| `--secondary`, `--muted`, `--accent` | `oklch(0.97 0 0)` ≈ `#f7f7f7` | `--bch-gray-100` `#f5f5f5` or `--surface-muted` `#fafafa` | near |
| `--secondary-foreground`, `--accent-foreground` | `oklch(0.205 0 0)` | `--bch-ink` | near |
| `--muted-foreground` | `oklch(0.556 0 0)` ≈ `#7f7f7f` | `--bch-gray-500` `#7e7e7e` | exact-ish (note DS `--text-muted` is darker, `#495057`) |
| `--destructive` | `oklch(0.577 0.245 27.3)` ≈ `#e7000b` | `--bch-red-600` `#e70000` (or `--danger` `#ba0f17`) | near-exact / semantic |
| `--border` | `oklch(0.922 0 0)` ≈ `#ebebeb` | `--border-default` `#dee2e6` | near |
| `--input` | `oklch(0.922 0 0)` | `--border-input` `#767676` | semantic — DS input borders are far darker |
| `--ring` | `oklch(0.708 0 0)` grey | `--focus-ring` `#2b5ce6` | semantic |
| `--chart-1..5` | orange/teal/navy/yellow/amber oklch | `--chart-1..5` (seafoam, sky, teal-700, teal-light, blue-600) | same names; DS values currently shadowed (see §0) |
| `--sidebar`, `--sidebar-primary`, … (8 vars) | greys | `--surface-sidebar` `#00866e`, `--text-on-chrome` | semantic; nothing in the app renders a sidebar |
| `--radius` | `0.625rem` (10px) | — | **none** — DS maximum radius is 6px (`--radius-card`) |
| `.dark { … }` (31 vars) | | — | **none** — DS has no dark mode; the block is unreachable anyway (`AUDIT.md` §4.1) |

### 1.3 Literal colours in TypeScript

| Location | Value | Token | Match |
|---|---|---|---|
| `src/server/actions/reports.ts:127` `PROGRAM_GOAL_COLORS[0]` | `#3b82f6` blue | `--chart-5` (= `--bch-blue-600`) or `--chart-2` (sky) | semantic |
| `…[1]` | `#10b981` emerald | `--chart-1` (= `--bch-seafoam` `#41c6a5`) or `--bch-green-500` | near |
| `…[2]` | `#f59e0b` amber | `--bch-gold-500` `#e9b949` | near |
| `…[3]` | `#8b5cf6` purple | — | **none** |
| `…[4]` | `#ef4444` red | `--bch-red-600` | near |
| `…[5]` | `#06b6d4` cyan | `--chart-2` (= `--bch-sky-400`) / `--bch-teal-light` | near |
| `…[6]` | `#f97316` orange | `--bch-gold-600` | loose |
| `…[7]` | `#84cc16` lime | — | **none** |
| `…[8]` | `#ec4899` pink | — | **none** |
| `…[9]` | `#6366f1` indigo | — | **none** |
| (whole array) | 10 series colours | DS defines only `--chart-1..5` | 5 short — more than 5 program goals will need a rule the DS doesn't give |
| `api/admin/invite-user/route.ts:154`, `api/reset-password/route.ts:58` | `#007cff` button | `--action-primary` `#0073ce` | near |
| `invite-user/route.ts:144` | `#f5f5f5` panel | `--bch-gray-100` | **exact** |
| both email routes | `#333` heading | `--bch-ink` `#212529` | near |
| both email routes | `#666` body | `--bch-gray-700` `#495057` / `--bch-gray-500` `#7e7e7e` | between the two |
| `components/ui/chart.tsx:58` | `#ccc`, `#fff` | dead file | — |

Inline `style={{ backgroundColor: data.color }}` in the two dead chart components
carry the `reports.ts` colours above; `style={{ width: … }}` progress bars are
data-driven and token-free by nature.

### 1.4 DS colour tokens nothing in the app uses yet

`--bch-teal-950/700/600/500`, `--bch-seafoam`, `--bch-teal-light` (the **entire
identity colour family** — no teal appears in the app except one `text-teal-600`
in `ActivityFeed`), `--surface-chrome`, `--surface-chrome-dark`,
`--surface-sidebar`, `--text-on-chrome`, `--action-primary-disabled`,
`--focus-ring`, `--border-input`, `--bch-tab-blue`, `--bch-tan-50/700`,
`--bch-gold-400/500`, `--bch-green-500`.

---

## 2. Spacing

Tailwind step × 4px. Counts are padding/margin/gap/space-* uses in app + `ui/`.

| Tailwind step | px | Uses | Token | Match |
|---|---|---|---|---|
| `0` | 0 | 55 | — | n/a |
| `0.5` | 2 | 4 | — | **none** |
| `1` | 4 | 138 | `--space-1` | exact |
| `1.5` | 6 | 19 | — | **none** (nearest `--space-1`/`--space-2`) |
| `2` | 8 | 529 | `--space-2` | exact |
| `2.5` | 10 | 3 | — | **none** |
| `3` | 12 | 106 | `--space-3` | exact |
| `4` | 16 | 269 | `--space-4` | exact |
| `6` | 24 | 144 | `--space-6` | exact |
| `8` | 32 | 32 | `--space-8` | exact |
| `10` | 40 | 3 | — | **none** (DS jumps 32 → 48) |
| `12` | 48 | 11 | `--space-12` | exact |
| (unused) | 64 | 0 | `--space-16` | token with no current use |

So 1,229 of 1,313 spacing uses (94%) sit on the DS scale; the 26 off-scale uses
are `0.5`, `1.5`, `2.5`, `10`.

Widths/heights (`h-4 w-4` icons etc.) are sizing, not spacing; the DS spacing
scale is not meant for them. For reference the steps used that fall *off* the
4/8/12/16/24/32/48/64 ladder: `5` (20px, 156 uses — almost all `h-5 w-5` icons),
`10` (40px, 57 — avatars/buttons), `9` (36px, 11), `20` (80px, 12), `24`
(96px, 9), `7`, `28`, `52`, `56`, `72`, `80`, `96`.

Email templates (`invite-user`, `reset-password` routes): `padding: 12px 24px`
→ `--space-3` / `--space-6` exact; `margin: 20px 0`, `margin-top: 30px` → none.

---

## 3. Radii

The app's radii are shadcn's, derived from `--radius: 0.625rem` (10px):
`rounded-sm` 6px, `rounded-md` 8px, `rounded-lg` 10px, `rounded-xl` 14px; the
bare `rounded` is Tailwind's 4px and `rounded-xs` 2px.

| Utility | px here | Uses | Where | Token | Match |
|---|---|---|---|---|---|
| `rounded-lg` | 10 | 45 | `ui/dialog`, `ui/alert`, `EventForm`, detail pages | — | **none** (DS max is 6px) |
| `rounded` | 4 | 44 | app boxes, `DateRangeDialog` selects | `--radius-control` 4px | exact |
| `rounded-md` | 8 | 42 | `ui/button`, `ui/input`, `ui/textarea`, `ui/badge`, `ui/select`, `ui/popover`, `ui/dropdown-menu` | — | **none** (DS: buttons/tabs 4px `--radius-control`, inputs 2px `--radius-input`) |
| `rounded-full` | ∞ | 27 | avatars, chips, spinners | — | n/a (DS avatar tiles are 3px `--radius-avatar`, i.e. *not* circular) |
| `rounded-sm` | 6 | 6 | `ui/select`, `ui/dropdown-menu` items | `--radius-card` 6px | exact value, wrong role |
| `rounded-xl` | 14 | 3 | `ui/card`, `Navigation` | — | **none** (DS cards/modals are 6px `--radius-card`) |
| `rounded-xs` | 2 | 1 | `ui/dialog` close button | `--radius-input` 2px | exact value, wrong role |
| `rounded-[4px]` | 4 | 1 | `ui/checkbox` | `--radius-control` | exact |
| `rounded-[2px]` | 2 | 2 | `ui/*` | `--radius-input` | exact |
| email `border-radius: 4px` / `8px` | | | | `--radius-control` / none | |

Net: every shadcn primitive is rounder than the DS wants; the mapping is by
*role* (card → 6, control → 4, input → 2, avatar → 3), not by value.

---

## 4. Shadows

Tailwind v4 defaults: `shadow-xs` 0 1px 2px /5%; `shadow-sm` = `shadow` 0 1px 3px
/10% + 0 1px 2px -1px; `shadow-md` 0 4px 6px -1px /10%; `shadow-lg` 0 10px 15px
-3px /10%; `shadow-xl` 0 20px 25px -5px /10%.

| Utility | Uses | Where | Token | Match |
|---|---|---|---|---|
| `shadow-xs` | 11 | `ui/button`, `ui/input`, `ui/textarea`, `ui/select`, `ui/checkbox`, `ui/switch` | — | **none** — DS buttons/inputs are flat |
| `shadow`, `shadow-sm` | 17 | `ui/card`, `ui/badge`, `SupplyDetailCard`, `ui/input` focus | `--shadow-card` 0 2px 6px /12% | near (DS reserves it for KPI/quick-start cards, plain cards have none) |
| `shadow-md` | 6 | `ui/select`, `ui/popover`, `ui/dropdown-menu` | `--shadow-card` | nearest |
| `shadow-lg`, `shadow-xl` | 5 | `ui/dialog`, `ui/dropdown-menu`, `EventForm` | `--shadow-modal` 0 8px 24px rgba(0,48,50,.22) | near |

---

## 5. Typography

### 5.1 Font sizes (`text-*` utilities)

| Utility | Tailwind px | Uses | Token | Token px | Match |
|---|---|---|---|---|---|
| `text-xs` | 12 | 107 | `--text-xs` | 11.5 | near — **now live at 11.5px** (§0) |
| `text-sm` | 14 | 272 | `--text-sm` | 13 | near — **now live at 13px** |
| `text-base` | 16 | 26 | `--text-base` | 16 | exact |
| `text-lg` | 18 | 13 | `--text-lg` | 19 | near — **now live at 19px** |
| `text-xl` | 20 | 0 in app | `--text-xl` | 21 | — |
| `text-2xl` | 24 | 31 | `--text-2xl` | 24 | exact |
| `text-3xl` | 30 | 20 | `--text-3xl` | 34 | near — **now live at 34px** |
| `text-4xl` | 36 | 1 (`unauthorized`) | — | | **none** |
| `text-[0.8rem]` | 12.8 | 1 (`ui/calendar`) | `--text-xs` | 11.5 | nearest |
| email `font-size: 14px` | 14 | 4 | `--text-sm` | 13 | near |
| (unused) | | | `--text-body-size` 15, `--text-md` 17 | | tokens with no utility and no current use |

### 5.2 Font family

| Current | Token | Match |
|---|---|---|
| Geist Sans via `next/font/google` (`--font-geist-sans`, `layout.tsx`) | `--font-sans` system stack | **semantic** — DS ships no webfont; now live on `body` (§0) |
| Geist Mono (`--font-geist-mono`) | — | **none**; nothing in the app uses `font-mono` |
| email `font-family: Arial, sans-serif` | `--font-sans` (contains Arial) | near |

### 5.3 Weights, leading, tracking

| Utility | Uses | Token | Match |
|---|---|---|---|
| `font-normal` 400 | 16 | `--weight-normal` | exact |
| `font-medium` 500 | 158 | `--weight-medium` | exact |
| `font-semibold` 600 | 60 | `--weight-semibold` | exact |
| `font-bold` 700 | 53 | `--weight-bold` | exact |
| `leading-none` (1), `leading-tight` (1.25), `leading-relaxed` (1.625) | 7 | — | **none** (only `--leading-body` 1.5 exists, which equals the current default) |
| `tracking-tight`, `tracking-wide`, `tracking-widest` | 13 | — | **none** |

---

## 6. Summary — what has no token equivalent

Colour:
- Success **surface/border/dark text** (`bg-green-50` ×15, `border-green-200` ×14, `text-green-800` ×12, …) — 46 uses. The DS has `--success` foreground only.
- `blue-500` accents (7), `blue-800/900`, `blue-300` — the DS blue family is 50/100/600/700 only.
- All **orange** (13 uses: stat icons, not-found chips, participation bars), `yellow-600`, `yellow-200`.
- All **purple** (9), `pink`, `indigo`, `cyan`, `lime` — including 4 of the 10 `PROGRAM_GOAL_COLORS` and the `from-blue-500 to-purple-500` avatar gradient (DS forbids gradients).
- `--radius` 10px and every shadcn radius above 6px (`rounded-md` ×42, `rounded-lg` ×45, `rounded-xl` ×3).
- `shadow-xs` on controls (DS controls are flat); `bg-black/50` overlay.
- The `.dark` palette (DS has no dark mode).

Spacing: steps `0.5`, `1.5`, `2.5`, `10` (26 uses); email margins 20/30px.

Type: `text-4xl`, Geist Mono, all `leading-*` except 1.5, all `tracking-*`.

Conversely, DS tokens with **no current consumer**: the whole teal family and
chrome/sidebar surfaces, `--action-primary-disabled`, `--focus-ring`,
`--border-input`, `--radius-input`, `--radius-avatar`, `--space-16`,
`--text-md`, `--text-body-size`, `--bch-tan-*`, `--bch-gold-400`.
