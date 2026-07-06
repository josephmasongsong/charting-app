# Rule: Verification discipline

A fix is not verified because a cheap check passed. Apply this before claiming any
fix is done.

## The test

For every verification step, ask: **could this check have failed if the fix were
broken?** If the answer is no, the check is theater — it proves nothing, regardless
of how green it looks.

Real example (Session 2): an agent "verified" a date-picker fix by running `curl`
against a URL with the asserted value baked into the query string (`?startYear=2025`),
then grepping the response for `2025`. The input _was_ the answer. The check could
not have failed. It verified nothing, and shipped a fix that had introduced a second
bug.

## Necessary is not sufficient

These are necessary conditions, never sufficient ones:

- TypeScript compiles.
- The dev server returns HTTP 200.
- The page renders without a console error.

None of these confirm that the _behavior_ you changed actually works. Do not present
them as proof that the fix works.

## State the falsifier

Before claiming a fix works, state what would show it **broken** — the specific
observable that would differ if the fix had failed. Then show that you checked _that
observable_, not a proxy for it. If you can't name a falsifier, you don't yet
understand what you're verifying.

## Draw the manual-handoff line explicitly

Distinguish, in writing:

- what you **actually verified** (and by what means), from
- what you **could not verify** and are handing off for manual checking.

This repo has no browser automation (see `CLAUDE.md`), so UI behavior — dropdown
state, click handling, form submission, anything downstream of React state — falls
in the second category by default. Name it. Do not let a UI change ride out under a
TypeScript pass.

## Never claim verified when you haven't

If you didn't check it, say you didn't. A false "verified" turns one bug into two:
the original defect, plus the trust lost in every report that follows. Honest
"unverified — needs manual check" is worth more than confident "verified" that
can't be trusted.
