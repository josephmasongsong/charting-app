# Second Brain

External long-term memory for the TEW app: knowledge, gotchas, and principles
learned while working on the repo. This file is **canonical** — where a fact also
appears elsewhere (e.g. as a stripped directive in `CLAUDE.md`), that copy is
_derived_ from this one. Edit here first, then re-derive.

Deferred work (tasks) lives in `DEFERRED.md`, not here — this file holds things
you _know_, not things you still _owe_.

---

## Principles

### Cheap external evidence before reading code

- **Type:** Principle
- **Date:** 2026-07-06
- **Origin:** Six turns of devtools/URL/component-tree work in Session 2 narrowed the date picker bug to one file with a specific hypothesis before any source code was read.
- **What:** URL contents, console errors, network payloads, DOM property values, component trees, error messages — all of this fits in any context window for free and dramatically narrows what source files matter.
- **Why it matters:** Context is the bottleneck. Source code is expensive to read; external evidence is free. An agent given "the date picker is broken, fix it" reads four files. An agent given the file path, the exact symptom, and the diagnosis reads one and lands the fix.
- **What to do:** Before any agentic task involving a bug, gather: reproduction steps, URL/console/network observations, which component is live (via React DevTools on the dev server), and the exact file path. Hand this to the agent as context. Don't let it discover what you already know.

### Bisect before debugging

- **Type:** Principle
- **Date:** 2026-07-06
- **Origin:** Month-selection regression appeared after the first agent's fix. A 30-second `git stash` confirmed the fix caused the regression before any speculation about the mechanism.
- **What:** When something nearby breaks after an edit, the first question is "did the edit cause this?" not "let me debug the new symptom." Stash or revert the edit, retest, get a definitive answer.
- **Why it matters:** Without bisecting, hours can be spent debugging a symptom that has a one-line cause. With bisecting, the cause is located in minutes before any investment in the fix. Also useful for prompting: telling an agent "I've bisected and your previous fix caused this" is much more actionable than "there's a new bug somewhere."
- **What to do:** Any time a regression appears after an agent edit, bisect first with `git stash` or `git checkout -- <file>`. Confirm the causal link before investing in the fix. When reporting the regression to an agent, include the bisection result.

### "Verify" is the step agents fudge most

- **Type:** Principle
- **Date:** 2026-07-06
- **Origin:** First agent run on the date picker declared success after running `curl` against a URL with the asserted values (`startYear=2025`) baked into the URL string, then grepping the response for those same values. The check was tautological and couldn't fail.
- **What:** Agents reach for the cheapest available verification tool and stop there, even when that tool can't actually verify the thing being claimed. TypeScript passing and HTTP 200 are necessary conditions for a fix, not sufficient ones.
- **Why it matters:** This is _the_ failure mode for agentic engineering. An agent that lies to itself about verification loses all the value of doing the read → plan → edit loop properly. Undetected fake verifications turn one bug into two.
- **What to do:** Always read the verification commands the agent ran. Ask: could this check have failed if the fix were broken? If no, the verification is theater. Build prompt patterns that require the agent to state what would falsify the fix, and to distinguish what it actually verified from what requires manual handoff.

### The intake doc is not the codebase — verify repo facts before writing persistent context

- **Type:** Principle
- **Date:** 2026-07-06
- **Origin:** Nearly wrote "Supabase" into `CLAUDE.md` based on the IMT PMO intake doc; the repo actually runs Neon Postgres. The assumption surfaced only because the prompt required checking repo facts before generating files.
- **What:** Planning docs (business case, intake) describe intent at design time. The repo describes what shipped. They drift. Any persistent context file — `CLAUDE.md`, `.claude/rules/*`, Second Brain — is force-multiplied: a wrong fact in one doesn't produce one bad output, it produces confidently-wrong outputs across every future session that reads it, until someone notices.
- **What to do:** When writing any persistent context file, source every fact from the repo — `package.json`, env files, actual import statements, real file paths — not from planning prose. Treat planning docs as motivation, not specification. The cost of one extra check is far lower than the cost of one wrong assertion compounding across weeks of agent sessions.

### Rules are written from observed friction, not imagined needs

- **Type:** Principle
- **Date:** 2026-07-06
- **Origin:** Session 2's agenda included writing `CLAUDE.md` and `.claude/rules/` early. Deferring them until after real debugging produced rules with concrete teeth ("the repo has dead code — verify a file is live before editing") instead of generic Next.js boilerplate.
- **What:** The urge to set up `CLAUDE.md`, `.claude/rules/`, and Second Brain scaffolding before doing real work is real, and it's usually wrong. Rules written from imagination are generic and unhelpful. Rules written from actual failures are specific and load-bearing.
- **Why it matters:** Generic rules don't change agent behavior; specific rules do. Writing them prematurely wastes the writing opportunity — you use it on abstractions instead of on the real failure modes you'd otherwise have observed.
- **What to do:** When starting a new project or new session, resist the impulse to build scaffolding first. Do one real task. Watch what breaks. Codify the breakages. Then do the next task with that scaffolding in place. Iterate.

---

## Gotchas

### Dead code exists from copy-paste prompt development

- **Type:** Gotcha
- **Date:** 2026-07-06
- **Origin:** Hunting the date picker bug — found duplicate `MonthlyActivityReport.tsx` files in different folders, and grep hits on `getFullYear()` across three files where only one was live.
- **What:** This codebase was built by iteratively copy-pasting LLM prompts into files, not via agentic editing. Duplicate component files exist in different folders, dead components are still on disk but not imported, and patterns for the same problem may vary across the codebase.
- **Why it matters:** Grep results lie. An agent told "find where X happens" will find multiple locations and may confidently edit a dead one, producing a fix that has no effect on the running app.
- **What to do:** Before assuming a file is live, verify it's reachable from a route. Start at the route file (`src/app/**/page.tsx`), follow imports inward. The import path is the source of truth. React DevTools is a secondary check.
- **Note:** This entry is the canonical source for the live-component directive in `CLAUDE.md`. Edit here first.

### React DevTools shows minified names on production builds

- **Type:** Gotcha
- **Date:** 2026-07-06
- **Origin:** Trying to identify the live picker component on the Vercel URL — the entire component tree showed as single letters (`s > m > l > ...`).
- **What:** Vercel production builds minify component names. React DevTools becomes useless for identifying which file is live. Also: the deployed build may not match local source if you haven't redeployed recently.
- **Why it matters:** Time wasted searching for component names that no longer exist as strings in the shipped JavaScript. Also risks debugging code that has since changed locally.
- **What to do:** For any component-tree work, use `localhost:3000` with the dev server. Never the deployed URL. This should be reflex.
- **Note:** Folds into the same `CLAUDE.md` live-component directive as the entry above. Canonical here.

### Parent components may pass unstable references

- **Type:** Gotcha
- **Date:** 2026-07-06
- **Origin:** Claude Code flagged it during the second-attempt analysis of the month-selection regression. Option 1 made it moot for the immediate bug, but the question stands unverified.
- **What:** If a parent recreates props like `currentParams` or `availableDateRange` as inline object literals on each render, those references are unstable regardless of what the child does internally. The current `DateRangeDialog` fix (gated `useEffect`) doesn't care, but any refactor that reintroduces prop-dependency-based effects will.
- **Why it matters:** A latent fragility. It's a general pattern worth checking for across other parent/child dialog pairs in the codebase, not just in `DateRangeDialog`.
- **What to do:** When you see a child component whose effects depend on object/array props, check how the parent constructs those props. If inline, memoize or lift. Watch for this pattern in other parent/child dialog pairs.
- **Note:** The `DateRangeDialog`-specific version of this check lives on that task in `DEFERRED.md`, where it'll be read at the moment it's needed.
