# Phase 3: Lint Script — Discussion Log

**Date:** 2026-05-26
**Mode:** discuss (default), single-question turns batched after user reframed gray areas
**Phase boundary:** Lint script that enforces LINT-01 / LINT-02 / LINT-03 against `.claude/CLAUDE.md` and the Phase 2 SKILL.md files, plus a self-test fixture suite.

## Areas Selected by User

The user reframed the initial gray-area menu rather than picking from it. The reframed areas, all selected:

1. Validator strictness (per-file required A-ID map vs global presence)
2. Tag-schema parsing scope (where in markdown to look for tag strings)
3. Token budget enforcement (bytes only vs heuristic vs real tokenizer)
4. Self-test fixture layout & coverage
5. Failure report style (terse vs detailed vs dual-mode)
6. (Added by Claude in follow-up) Language & runtime for the script

## Question-by-Question Record

### Q1 — Validator strictness
**Options:**
- Per-file required-ID map (Recommended)
- Global presence only
- Per-file map + warn-don't-fail extras

**User selection:** Per-file required-ID map (Recommended)
**Captured as:** D-02. Map values (which A-IDs per file) seeded by Claude based on PRD §5.3 and Phase 1/2 carry-forward; planner may refine after reading actual skill content.

### Q2 — Tag-schema parsing scope
**Options:**
- Explicit example markers only — code blocks + `Tags:` / `Example tags:` lines (Recommended)
- Scan all markdown for `proj:` / `type:`
- Code blocks only

**User selection:** Explicit example markers only (Recommended)
**Captured as:** D-03. Includes the `type:` enum lock-in (`decision|bug|pattern|api|gotcha|todo`) carried from MEM-01.

### Q3 — Token budget enforcement
**Options:**
- Bytes only for v1 (Recommended)
- Bytes + heuristic token estimate
- Bytes + exact tokenizer

**User selection:** Bytes only for v1 (Recommended)
**Captured as:** D-04. BUDG-03 explicitly deferred to Phase 4 in the Deferred Ideas section.

### Q4 — Self-test fixtures
**Options:**
- `fixtures/` dir, 1 good + 1 bad-per-rule (Recommended)
- Single bad fixture covering all 3 failure modes
- Inline fixtures inside the test file

**User selection:** `fixtures/` dir, 1 good + 1 bad-per-rule (Recommended)
**Captured as:** D-05. Four fixture subdirs: `good/`, `bad-budget/`, `bad-antipattern-missing/`, `bad-tag-malformed/`. Invoked via `--self-test`.

### Q5 — Failure report style
**Options:**
- Detailed: path + rule + fix hint (Recommended)
- Terse: rule + count only
- Detailed by default, `--quiet` for CI

**User selection:** Detailed: path + rule + fix hint (Recommended)
**Captured as:** D-06. No `--quiet` flag in v1 — kept in Deferred Ideas.

### Q6 — Language for the script
**Options:**
- Node.js, zero deps (Recommended)
- Bash + standard tools
- Python 3, stdlib only

**User selection:** Node.js, zero deps (Recommended)
**Captured as:** D-01. Adds minimal `package.json` (one script, no deps). Script lives at `bin/lint.mjs`.

## Decisions Captured

- D-01: Node.js zero-deps, `bin/lint.mjs` + minimal `package.json`, invoked via `npm run validate`.
- D-02: Per-file required A-ID map (hard-fail on missing required ID; extras silently allowed in v1).
- D-03: Tag-schema validation only inside fenced code blocks OR lines starting with `Tags:` / `Example tags:`. Enum locked.
- D-04: Bytes-only enforcement for v1 (BUDG-01 ≤ 2KB; BUDG-02 ≤ 3KB). BUDG-03 deferred.
- D-05: `tests/fixtures/{good,bad-budget,bad-antipattern-missing,bad-tag-malformed}/` + `--self-test` flag.
- D-06: Detailed per-line failure report; trailing summary; exit 0 / 1.

## Deferred Ideas (preserved, not acted on)

- Tokenizer-based BUDG-03 enforcement → Phase 4 (alongside the validation harness).
- `--quiet` / `--json` output modes → revisit when DOCS-02 is being written.
- Warn-don't-fail tier for extras / unknown A-IDs → only if drift becomes a real problem.
- Pre-commit hook wiring (Husky / lefthook) → CI `npm run validate` is enough for v1.

## Scope Creep Avoided

None observed. All user-reframed gray areas stayed within the LINT-01/02/03 + self-test boundary defined in ROADMAP.md.

## Claude's Discretion

- Seed values for the per-file required-A-ID map in D-02 (planner may refine).
- Failure-line format and `✗` prefix in D-06.
- Choice to fold the language question into a follow-up turn after the user-reframed areas, rather than treating it as a separate area requiring 4 turns.
