# Conversion rules

These apply to every route conversion. Do not restate them; follow them.

## Gap pass (read-only)

- Compare the named template against the named route's current implementation.
- Write `docs/gaps/<route>.md` with two sections:
  - **A. Visual differences** — same data, different presentation.
  - **B. New UI with no data behind it** — fields, states, or actions the app has
    no source for. For each, state exactly what it would need: DB column, API
    field, client state, or purely cosmetic.
- Write no code. Change no files except the gap doc.

## Visual pass

- Use only tokens from `src/styles/` and components from `src/components/ui/`.
- Never import from `design-system/`. That folder is read-only reference.
- Ignore `ds-base.js`, `support.js`, `_ds_bundle.js` in template folders — those are
  Claude Design preview shims, not app code.
- Keep all existing behavior, data fetching, props, and route guards identical.
- Gap section B items: render markup and styling, wire to nothing. Inputs get
  `disabled`, actions get a no-op handler, each with `// TODO: <route> — not wired`.
- Replace raw palette classes (`text-red-600`, `bg-green-50`, etc.) with tokens.
  If no token fits, stop and report it rather than inventing one.
- Replace hand-rolled equivalents with primitives: raw `<select>` → `ui/select`,
  raw `<input type="checkbox">` → `ui/checkbox`, hand-rolled card chrome → `Card`,
  hand-rolled spinners → the design system's loading treatment.
- Use `cn()` for conditional classes, not template literals or `.join(' ')`.
- Delete dev-process comments you encounter in files you touch.
- The route must work exactly as it does today. No behavior changes.
- One route per commit: `redesign(<route>): visual only`.
