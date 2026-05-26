# Phase 3: Lint Script — Challenge Notes

**Date:** 2026-05-26
**Method:** grill-with-docs — decisions challenged against actual Phase 2 file contents and codebase scan.

## Decisions Confirmed

- **D-01** (Node.js, zero deps) — no conflict found. No existing JS/Python in repo. Confirmed.
- **D-03** (tag-schema parsing: explicit markers only) — confirmed. Existing skill files use inline backtick examples in prose, not fenced blocks or `Tags:` lines. LINT-03 is a no-op on the current live tree, which is correct — future authors who add fenced tag examples get validation automatically.
- **D-05** (fixtures/ dir, one bad-per-rule) — confirmed.
- **D-06** (detailed failure report, exit 0/1) — confirmed.

## Decisions Corrected

### D-02: Required A-ID map was underspecified
The original D-02 map was authored from memory before the Phase 2 files were read. Actual file content differs:

| File | D-02 original | Corrected (from actual content) |
|---|---|---|
| `code-search/SKILL.md` | A1, A2, A3, A10 | A1, A2, A3, A10 ✓ |
| `memory-recall/SKILL.md` | A4, A8 | **A4, A7, A8, A9** |
| `external-research/SKILL.md` | A3, A6 | **A3, A6, A10** |

D-02 updated in CONTEXT.md. Planner must use the corrected map.

### D-04: BUDG-02 scope must be an explicit allowlist
`project-flow/SKILL.md` is 9,775 bytes — 3× over the 3KB limit. It lives at `.claude/skills/project-flow/SKILL.md`, which a naive glob would pick up. Decision: BUDG-02 applies only to the god-combo skills (same allowlist as D-02). Workflow/orchestration skills are excluded. D-04 updated in CONTEXT.md.

Current sizes at time of challenge (all within budget for in-scope files):
- `.claude/CLAUDE.md` — 1,715 bytes (budget 2,048) ✓ 333 bytes headroom
- `code-search/SKILL.md` — 2,299 bytes (budget 3,072) ✓
- `external-research/SKILL.md` — 2,252 bytes (budget 3,072) ✓
- `memory-recall/SKILL.md` — 3,023 bytes (budget 3,072) ✓ only 49 bytes headroom — planner should note this as near-limit

## Planner Notes (Recommendations Applied Without Asking)

### 1. Linter root must be configurable for --self-test
The `--self-test` flag runs the linter against the `tests/fixtures/{good,bad-*}/` trees. Each fixture tree mimics the real `.claude/` layout. The linter must accept a `--root <path>` argument (or equivalent) so `--self-test` can point it at each fixture directory instead of the live repo root. Default root = `process.cwd()` when no `--root` is passed. This is implicit in D-05 but must be explicit in the implementation plan.

### 2. Good fixture must include at least one valid fenced tag string
The `tests/fixtures/good/` fixture should contain a SKILL.md with a fenced code block containing a valid `proj:foo type:decision` string. Without it, LINT-03 is never exercised on the passing path during `--self-test` — the assertion "linter exits 0" holds trivially even if the tag parser is broken. Add one valid tag string to the good fixture.

### 3. A-ID detection: anywhere in file (no section restriction)
The regex `\bA([1-9]|10)\b` matching anywhere in the file is sufficient. All three Phase 2 skill files use a dedicated "Anti-patterns enforced" section with explicit A-ID labels — so any match is semantically meaningful. Section-specific parsing adds complexity for no gain on the current corpus.

### 4. memory-recall is 49 bytes from the budget ceiling
At 3,023/3,072 bytes, `memory-recall/SKILL.md` has minimal headroom. The linter will pass today but a minor edit could tip it over. Planner should add a note in the plan that LINT-01/02 runs as part of CI — contributors will know the file is near-limit.

## No ADRs Created
No decisions met the full three-part ADR threshold (hard to reverse + surprising + genuine trade-off with a named alternative). The allowlist scoping decision (BUDG-02) was the closest candidate, but it's captured sufficiently in D-04 within CONTEXT.md.
