# Handoff: Skill Files & Memory Layer

**Date:** 2026-05-26
**Status:** Phase 2 local artifacts complete

## Promoted to project memory

- Phase 2 ships three on-demand SKILL.md files (`code-search`, `memory-recall`, `external-research`) plus the claude-mem tag taxonomy and memory hierarchy rules. The Phase 1 always-loaded core (`.claude/CLAUDE.md`) is unchanged.
- All 3 skill files follow a frozen 4-section shape: Trigger / Routing decision / Few-shots / Anti-patterns enforced.
- A-anti-pattern coverage mapping: `code-search` enforces A1, A2, A3, A10; `memory-recall` enforces A4, A7, A8, A9; `external-research` enforces A3, A6, A10.
- OUT-01 rule (`>10KB → context-mode`) is stated verbatim in both `code-search` and `external-research`.
- Memory hierarchy: claude-mem owns cross-session intent (decisions / patterns / bugs / gotchas, weeks–months); context-mode owns current-session state. On conflict, mem wins for decisions/patterns/gotchas; ctx-mode wins for live session facts (MEM-04).
- Resumption lookup order is a two-rule policy:
  - same-session resume → ctx-mode first, fall back to claude-mem.
  - cross-session resume (no ctx-mode session state) → claude-mem first with `proj:` + `type:(decision|pattern|todo)`; skip ctx-mode.
- `proj:` auto-detects via `git rev-parse --show-toplevel` basename, falling back to cwd basename (MEM-05).
- Mandatory tag taxonomy on every claude-mem write/search: `proj:<repo>` + `type:(decision|bug|pattern|api|gotcha|todo)` (MEM-01). Recommended: `mode:`, `lib:`, `severity:`.
- Per-mode filter strategy (PRD §5.3): F → decision|pattern|gotcha; O → decision|pattern; R → cross-project by `lib:`; M → bug|gotcha.
- Baseline per-turn overhead with only `.claude/CLAUDE.md` loaded is 1715 bytes ≈ 429 tokens (bytes/4 upper bound). Procedure recorded in `.planning/phases/02-skill-files-memory-layer/02-BASELINE.md`. Budget: 1500 tokens (BUDG-03).

## Verification Summary

- Verification status: passed.
- 13 deterministic local checks recorded in `.ai/state/run-state.json`.
- `bin/adp.js` was unavailable, so ADP validation was skipped.

## Next Suggested Action

Proceed to Phase 3 (Lint Script). The Phase 3 lint script should mechanize:
- BUDG-01 (`.claude/CLAUDE.md` ≤ 2048 bytes) and BUDG-02 (each SKILL.md ≤ 3072 bytes).
- BUDG-03 token-baseline cross-check using a named tokenizer.
- LINT-02: all 10 anti-patterns A1–A10 present in `.claude/CLAUDE.md` or skills.

Optional intermediate step: review the Phase 2 diff and commit/open a PR before starting Phase 3.
