# CLAUDE.md

Operational guide for agents working in this repo. **Derived** from
`SECOND_BRAIN.md` (canonical) — where a directive here restates a Second Brain
fact, edit the Second Brain first, then re-derive this. Kept lean on purpose:
this file is read at the start of every session and pays for its own tokens.

## What this is

Tenant Engagement Event & Supply Tracking app for BC Housing's TEW team. Replaces
two shared spreadsheets used by ~5 workers across ~50 sites. Mobile-first (iPads in
the field). No tenant PII stored.

## Stack

<!-- CONFIRM the Next.js major version against package.json. App Router confirmed. -->

- Next.js (App Router — confirmed) + TypeScript, deployed on Vercel.
- **Neon Postgres — NOT Supabase.** The IMT PMO intake doc lists Supabase; that was
  the design-time plan, not what shipped. The repo runs Neon. Do not write, suggest,
  or assume Supabase-specific code or config.

## Read this before editing anything

This repo was built by iteratively copy-pasting LLM prompts into files, not via
agentic editing. Consequence:

- Duplicate component files exist in different folders.
- Dead components sit on disk, unimported.
- The same problem may be solved differently in different places.

**Grep results include dead files.** A confident edit to a dead file produces a fix
with zero effect on the running app.

## How to find the live component for a route

Do this before editing, every time:

1. Start at the route file: `src/app/**/page.tsx`.
2. Follow imports inward. **The import path is the source of truth** for what's live.
3. React DevTools is a _secondary_ check only — and only on the dev server
   (`localhost:3000`). Vercel production builds minify component names to single
   letters (`s > m > l > ...`), so DevTools is useless against the deployed URL.

## UI library

Components use **shadcn/ui** (which wraps Radix primitives), installed copy-in under
the UI components directory (shadcn default: `@/components/ui/`).

When tracing a component tree, **treat anything imported from `@/components/ui/*` as a
primitive wrapper and skip past it** to reach the app-level component that owns the
logic. The discriminator is the import-path prefix, not the component's rendered name
— which means this stays correct as shadcn components are added or removed, with no
list to maintain.

<!-- CONFIRM the exact alias/path in tsconfig.json "paths" (or components.json) — the
     shadcn default is @/components/ui/, but verify it matches this repo. -->

## Verification / browser automation

There is **no** Playwright, Puppeteer, or Cypress in this repo yet. UI behavior —
React state, dropdown behavior, click handling, form submission — **cannot be
agent-verified**. Any UI fix requires manual verification by the human. Say so
explicitly; never let a UI change ride out under a TypeScript pass. See
`.claude/rules/verification.md`.

## Where things live

- `SECOND_BRAIN.md` — canonical knowledge, gotchas, principles.
- `DEFERRED.md` — consciously-deferred tasks, each with its why-punted.
- `.claude/rules/` — behavioral rules for agents.
