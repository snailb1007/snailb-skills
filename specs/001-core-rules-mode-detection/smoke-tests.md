# Phase 1 Smoke Tests

**Date:** 2026-05-25
**Artifact:** `.claude/CLAUDE.md`

## Results

| Case | Prompt Signal | Expected | Result |
|------|---------------|----------|--------|
| Feature | "Add logging to `src/auth/session.ts`" | `Mode: F`; local repo routing before public search | PASS |
| Onboarding | "What is this repo's architecture?" | `Mode: O`; gitnexus/filesystem first, memory deferred | PASS |
| Research | "Should we use Prisma or Drizzle?" | `Mode: R`; context7/public research first | PASS |
| Maintenance | "The test is failing with this stack trace" | `Mode: M`; bug/gotcha memory and structural code context | PASS |
| Ambiguous F/M | "Fix the auth flow" | Ask one clarifying question before tool use | PASS |

## Checks

- PASS: `.claude/CLAUDE.md` includes the three root principles.
- PASS: `.claude/CLAUDE.md` includes F/O/R/M mode detection.
- PASS: `.claude/CLAUDE.md` includes A1-A10 refusal IDs.
- PASS: `.claude/CLAUDE.md` includes override syntax.
- PASS: `.claude/CLAUDE.md` includes stale-index and search-drift guards.
- PASS: Ambiguous mode behavior asks before tool use.
