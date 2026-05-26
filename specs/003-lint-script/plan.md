# 003 — Lint Script (Implementation Plan)

**Phase:** 3 of 4
**Spec:** `specs/003-lint-script/spec.md` (canonical, locked)
**Status:** Draft (implementation_plan stage). Goes to plan_critique next.

---

## Proposed Changes

### File-by-file diff plan

#### NEW: `package.json` (repo root, ~12 lines)
```json
{
  "name": "snailb-skills",
  "version": "0.3.0",
  "private": true,
  "type": "module",
  "description": "God Combo Tool Routing Rules — Phase 3 lint surface",
  "scripts": {
    "validate": "node bin/lint.mjs"
  },
  "engines": {
    "node": ">=18"
  }
}
```
No `dependencies`, no `devDependencies` (BPR-1). Version `0.3.0` reflects we're shipping Phase 3 of v1.0.

#### NEW: `bin/lint.mjs` (single file, target ~250 LOC including blank lines and inline doc)
Module layout (top-to-bottom):

1. **Header constants** (~30 LOC)
   - `BUDGETS = { '.claude/CLAUDE.md': 2048 }` (BUDG-01) — and `SKILL_BUDGET = 3072` (BUDG-02).
   - `IN_SCOPE_SKILLS = ['.claude/skills/code-search/SKILL.md', '.claude/skills/memory-recall/SKILL.md', '.claude/skills/external-research/SKILL.md']`.
   - `REQUIRED_ANTIPATTERNS = { ... }` per AC-2.1.
   - `TYPE_ENUM = new Set(['decision','bug','pattern','api','gotcha','todo'])` (BPR-5).
   - `AID_RE = /\bA([1-9]|10)\b/g` (BPR-8).
   - `TAGS_LINE_RE = /^\s*(?:example\s+)?tags:/i` (BPR-8 — case-insensitive marker).
   - `FENCE_RE = /^```/` (opening/closing fence; language tag ignored).
   - `MARK = '✗'` (the `✗` glyph).

2. **CLI parsing** (~25 LOC)
   - Parse `process.argv.slice(2)`. Recognize `--self-test` (boolean) and `--root <path>` (value). Anything else → exit 2 with usage line (AC-4.5).
   - Resolve root to absolute path; default `process.cwd()`.

3. **Core lint function `lintTree(rootDir) -> { violations, summary }`** (~80 LOC)
   - For each path in `BUDGETS` keys + `IN_SCOPE_SKILLS`: `fs.statSync(join(root, p))`. If file missing → violation (`LINT-XX file not found`); else if `size > budget` → BUDG-0X violation with delta.
   - For each path in `REQUIRED_ANTIPATTERNS` keys: read file as UTF-8. Find all A-IDs via `AID_RE`. Compare set-of-found vs set-of-required. Emit one LINT-02 violation per missing ID.
   - For each path in `REQUIRED_ANTIPATTERNS` keys: walk lines tracking fenced-block state (toggle on `FENCE_RE`). For each line that is either inside a fenced block OR matches `TAGS_LINE_RE`: tokenize by whitespace, strip surrounding punctuation (`` ` `` `"` `,` `(` `)`) from each token, collect all tokens whose stripped form contains `proj:` or `type:`. If no such tokens, skip the line. Else: confirm at least one `proj:<non-empty>` and at least one `type:<value>` with `<value>` ∈ `TYPE_ENUM` are present in the collected set; emit one LINT-03 violation per offending token (each token cited with its specific reason: `missing proj:`, `missing type:`, or `type:<x> not in enum ...`). Line numbers cited per token (AC-3.4).
   - Return `{ violations: [<lines>], summary: 'FAIL: N violation(s) across M file(s).' }`.

4. **Reporter** (~15 LOC)
   - `formatViolation({relPath, lineNo?, rule, detail, hint?}) -> string` produces the canonical `✗ <path>[:<line>]: <RULE-ID> <detail>. <hint>` line (AC-4.1, BPR-3).

5. **Self-test driver** (~60 LOC)
   - Hard-coded fixture spec:
     ```js
     const FIXTURES = [
       { dir: 'tests/fixtures/good',                  expectExit: 0, expectSubstring: null    },
       { dir: 'tests/fixtures/bad-budget',            expectExit: 1, expectSubstring: 'BUDG-0' },
       { dir: 'tests/fixtures/bad-antipattern-missing', expectExit: 1, expectSubstring: 'LINT-02' },
       { dir: 'tests/fixtures/bad-tag-malformed',     expectExit: 1, expectSubstring: 'LINT-03' },
     ];
     ```
   - For each fixture: first check the fixture directory exists; if missing, fail-fast with `SELF-TEST FAIL: fixture not found at <path>` and exit 1 (eng-review CC-1). Else: spawn `node bin/lint.mjs --root <fixtureDir>` via `child_process.spawnSync`, capture exit code + stdout. Assert exit matches, and (if `expectSubstring` non-null) substring is present in stdout. For the `bad-budget` fixture, assertion requires BOTH `BUDG-01` AND `BUDG-02` substrings (Amendment #1).
   - Print per-fixture status; final line `SELF-TEST PASS (4/4 fixtures).` or `SELF-TEST FAIL: <details>` (AC-5.4). Exit 0 or 1.

6. **Main entry** (~10 LOC)
   - If `--self-test`: call self-test driver.
   - Else: call `lintTree(root)`. Collect ALL violation lines into an array first (eng-review CC-6 — do NOT stream to stdout mid-detection; output ordering is part of the contract). After all checks complete, print the array en bloc, then the summary line, then exit 1. If the array is empty, exit 0 with no output.

#### NEW: `tests/fixtures/good/` (3 files, all valid)
- `.claude/CLAUDE.md` (~600 bytes, must include all A1–A10 references in a `Refuse:` section).
- `.claude/skills/code-search/SKILL.md` (~400 bytes, references A1, A2, A3, A10).
- `.claude/skills/memory-recall/SKILL.md` (~500 bytes, references A4, A7, A8, A9, AND contains a fenced code block with `proj:demo type:decision "fixture example"` — to exercise LINT-03 positive path per CHALLENGE-NOTES finding #2).

#### NEW: `tests/fixtures/bad-budget/` (copy of `good/` + two oversized files — exercises BOTH BUDG-01 and BUDG-02 per eng-review Amendment #1)
- Same three files as `good/`. Then `.claude/CLAUDE.md` is padded with trailing comment text to reach 2,200 bytes (over 2,048) AND `code-search/SKILL.md` is padded to ~3,200 bytes (over 3,072). Expected: exit 1, stdout contains BOTH `BUDG-01` AND `BUDG-02`. Self-test assertion for this fixture requires both substrings present.

#### NEW: `tests/fixtures/bad-antipattern-missing/` (copy of `good/` minus one A-ID)
- Same three files as `good/`. Then `memory-recall/SKILL.md` has its `A8` reference removed. Expected: exit 1, output contains `LINT-02`.

#### NEW: `tests/fixtures/bad-tag-malformed/` (copy of `good/` + one unambiguously-bad tag)
- Same three files as `good/`. Then `memory-recall/SKILL.md`'s fenced code block contains EXACTLY ONE line: `proj:demo type:plan "fixture"` (— `plan` is not in the enum; no second pair on the line). Expected: exit 1, output contains `LINT-03` citing `type:plan`. Single-pair-per-line keeps the failure unambiguous per eng-review Amendment #2.

### Update: `.gitignore` (verify only, no change expected)
Confirm `bin/` and `tests/` are NOT excluded. If they are, surface in the PR for explicit decision. No proactive edit.

### Update: `.planning/STATE.md` (one-line activity update at end of phase)
Bump `last_activity` and `completed_phases: 3`. Standard GSD plumbing — applied by `gsd-ship` later, not by this task.

### Files NOT touched (negative space)
- `.claude/CLAUDE.md` — Phase 1 output, untouched. The script reads it; it does not modify it.
- `.claude/skills/code-search/SKILL.md`, `memory-recall/SKILL.md`, `external-research/SKILL.md` — Phase 2 outputs, untouched.
- `.claude/skills/project-flow/SKILL.md` — explicitly excluded from scope (BPR-6).
- `.planning/REQUIREMENTS.md` — checking off LINT-01/02/03 is deferred to release_readiness stage.
- `docs/prd.md` — no changes.
- `README.md` — does not yet exist; created in Phase 4 (DOCS-02).

### Order of execution (suggested)
1. Write `bin/lint.mjs` skeleton (constants + main entry + lintTree stub).
2. Build `tests/fixtures/good/` first — confirms the positive-path schema is achievable inside the byte budgets.
3. Implement BUDG-01/BUDG-02 detection, then derive `bad-budget/` from `good/`. Run linter against both manually; confirm expected behavior.
4. Implement LINT-02 detection, derive `bad-antipattern-missing/`. Run; confirm.
5. Implement LINT-03 detection (most complex — fenced-block state machine + tag extraction). Derive `bad-tag-malformed/`. Run; confirm.
6. Add `package.json`. Run `npm run validate` against the LIVE tree — must exit 0 (AC-6.3).
7. Implement `--self-test` driver. Run `npm run validate -- --self-test` — must exit 0 (AC-6.4).
8. Cleanup, comment, and commit.

---

## Verification Plan

### V1 — Acceptance-criteria coverage (mechanical)
Each AC item maps to a concrete check executed in T1 (self-test) or T2 (live-tree run):

| AC | Verified by |
|---|---|
| AC-1 (BUDG) clean path | T2: `npm run validate` exits 0 on live tree |
| AC-1 (BUDG) failure path | T1: `bad-budget` fixture asserts exit 1 + `BUDG-0` in stdout |
| AC-2 (LINT-02) clean path | T2: live-tree run exits 0 |
| AC-2 (LINT-02) failure path | T1: `bad-antipattern-missing` fixture |
| AC-2.5 (skip non-allowlisted) | Manual: drop a stub `.claude/skills/foo/SKILL.md` at 10KB in a test branch; confirm linter exits 0 (no BUDG-02, no LINT-02). Revert. |
| AC-3 (LINT-03) clean path | T1: `good/` fixture's valid fenced tag string + linter exit 0 |
| AC-3 (LINT-03) failure path | T1: `bad-tag-malformed` fixture |
| AC-3.5 (prose mentions ignored) | Implicit in T2 — Phase 2 files have prose `proj:` / `type:` mentions outside fenced blocks; live-tree exit 0 proves these are correctly ignored |
| AC-4 (exit codes, output format) | All T1 fixtures; format assertion is grep `'^✗ '` against stdout |
| AC-4.5 (unknown flag → exit 2) | Manual: `node bin/lint.mjs --bogus` → assert exit 2 + usage line on stderr or stdout |
| AC-5 (--root + --self-test) | T1 self-test driver IS the test |
| AC-6 (CI surface) | `npm run validate` + `npm run validate -- --self-test` both exit 0 on HEAD |

### V2 — Behavior-preservation rules (review-gated)
BPRs are not mechanically tested in v1 — they're contracts the reviewer asserts on the diff:

- **BPR-1** (zero deps): `cat package.json | grep -E '"(dev)?[Dd]ependencies"'` — must be empty.
- **BPR-2** (exit codes): manual matrix — clean=0, violation=1, unknown flag=2. Three runs.
- **BPR-3** (line format): `npm run validate -- --root tests/fixtures/bad-budget | grep -E '^✗ \S+: [A-Z]+-[0-9]+ '` — must match at least one line.
- **BPR-4** (allowlist hard-coded): code review — grep `bin/lint.mjs` for `process.env`, `readFile.*config`, etc.; should find none for allowlist purposes.
- **BPR-5** (type enum locked): code review — confirm `TYPE_ENUM` constant matches MEM-01 verbatim.
- **BPR-6** (in-scope exhaustive): covered by AC-2.5 manual test.
- **BPR-7** (self-test in v1): covered by AC-5.
- **BPR-8** (case sensitivity): add a one-off sanity check in self-test driver — temporarily lowercase one A-ID in a copy of the good fixture, confirm linter flags it; restore.

### V3 — Regression probes (CI, ongoing)
After Phase 3 lands, every PR runs `npm run validate` AND `npm run validate -- --self-test` in CI. Failing either blocks merge. This is also the BUDG-02 regression probe for the near-limit `memory-recall/SKILL.md` (3,023/3,072 bytes — 49 bytes of headroom per CHALLENGE-NOTES).

### V4 — Plan-critique gate (next flow stage)
This plan goes to `plan_critique` (CEO + Engineering review). Likely critique vectors the reviewer should probe:
- Is the LINT-03 fenced-block state machine too clever for a 250-LOC script? (Alternative: drop the fenced-block scan, only support `Tags:` lines. Simpler, but breaks the test surface for example tag strings in code blocks.)
- Is the per-file required-ID map encoding the right unit of contract, or should LINT-02 verify only that all 10 IDs exist *somewhere* in the in-scope tree? (D-02 + CHALLENGE-NOTES already locked this — defend by quoting drift-prevention rationale.)
- Should `bad-*` fixtures be derived from `good/` via a generation script (parameterized degradation) to avoid drift between fixtures and the real schema? (Probably overkill for v1 — four hand-authored fixtures are < 4KB total.)

### What the verification plan deliberately omits
- No unit tests for individual parser functions (`extractTagsFromLine`, `walkFences`). The four self-test fixtures cover the integrated behavior end-to-end; unit tests would be ceremony for ~250 LOC.
- No CI matrix across Node versions. Single Node version per CI run; engines `>=18` declared.
- No mutation testing, no coverage tooling — both would violate BPR-1.
