# 003 — Lint Script (Task Breakdown)

**Phase:** 3 of 4
**Spec:** `specs/003-lint-script/spec.md` (locked)
**Plan:** `specs/003-lint-script/plan.md` (amended per `.ai/reviews/003-lint-script/gstack-eng-review.md`)
**Stage:** revision_loop → vertical_slicing → execution

Tasks below are ordered by dependency. Each task is atomic (~1 commit), independently verifiable, and references the AC/BPR it serves.

---

## T-001 — Add `package.json` with zero deps
**Type:** scaffold
**Files:** `package.json` (new)
**Effort:** trivial (~5 min)
**Serves:** AC-6.1, BPR-1

Steps:
1. Create `package.json` at repo root with exactly: `name`, `version: "0.3.0"`, `private: true`, `type: "module"`, `description`, `scripts: { "validate": "node bin/lint.mjs" }`, `engines: { "node": ">=18" }`.
2. NO `dependencies` or `devDependencies` keys.

Done when: `cat package.json | grep -E '"(dev)?[Dd]ependencies"'` returns empty.

---

## T-002 — Create `bin/lint.mjs` skeleton with constants
**Type:** scaffold
**Files:** `bin/lint.mjs` (new)
**Effort:** small (~15 min)
**Serves:** AC-2.1, AC-3.3, BPR-4, BPR-5, BPR-8

Steps:
1. ESM module header.
2. Hard-coded constants (top of file):
   - `BUDGETS = { '.claude/CLAUDE.md': 2048 }`
   - `SKILL_BUDGET = 3072`
   - `IN_SCOPE_SKILLS = ['.claude/skills/code-search/SKILL.md', '.claude/skills/memory-recall/SKILL.md', '.claude/skills/external-research/SKILL.md']`
   - `REQUIRED_ANTIPATTERNS = { '.claude/CLAUDE.md': ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10'], '.claude/skills/code-search/SKILL.md': ['A1','A2','A3','A10'], '.claude/skills/memory-recall/SKILL.md': ['A4','A7','A8','A9'], '.claude/skills/external-research/SKILL.md': ['A3','A6','A10'] }`
   - `TYPE_ENUM = new Set(['decision','bug','pattern','api','gotcha','todo'])`
   - `AID_RE = /\bA([1-9]|10)\b/g`
   - `TAGS_LINE_RE = /^\s*(?:example\s+)?tags:/i`
   - `FENCE_RE = /^```/`
   - `MARK = '✗'`
3. Stub `lintTree(rootDir)` returning empty `{violations:[], summary:''}`.
4. Stub `selfTest()`.
5. CLI parsing in main entry: handle `--self-test`, `--root <path>`, unknown flag → exit 2 with usage line.
6. Resolve root via `path.resolve()`, default `process.cwd()`.

Done when: `node bin/lint.mjs --root /tmp` exits 0 silently; `node bin/lint.mjs --bogus` exits 2 with usage line.

---

## T-003 — Implement BUDG-01 / BUDG-02 detection
**Type:** feature
**Files:** `bin/lint.mjs` (edit `lintTree`)
**Effort:** small (~20 min)
**Serves:** AC-1.1, AC-1.2, AC-1.3, AC-1.4

Steps:
1. In `lintTree`, iterate `BUDGETS` keys: `fs.statSync(path.join(root, p))`. If size > budget, push violation: `✗ <p>: BUDG-01 (<size> bytes > <budget>). Trim ~<delta> bytes from the core routing block.`
2. Iterate `IN_SCOPE_SKILLS`: same logic against `SKILL_BUDGET`, emit `BUDG-02` with hint `Trim ~<delta> bytes.`
3. Handle missing files: emit a generic `file not found` violation (don't crash). Use the path as relative; do not leak absolute paths into the output.
4. Buffer all violations into the array (CC-6).
5. Wire main entry to print buffered violations and the trailing summary, then exit 1 if any violations exist.

Done when: `node bin/lint.mjs` against the live repo exits 0 (live files are all within budget per CHALLENGE-NOTES).

---

## T-004 — Build `tests/fixtures/good/` (canonical positive fixture)
**Type:** fixture
**Files:** `tests/fixtures/good/.claude/CLAUDE.md`, `tests/fixtures/good/.claude/skills/code-search/SKILL.md`, `tests/fixtures/good/.claude/skills/memory-recall/SKILL.md` (new — 3 files)
**Effort:** small (~15 min)
**Serves:** AC-5.2, AC-3 positive path

Steps:
1. `CLAUDE.md` (~600 bytes): minimal routing-rule preamble referencing all A1–A10 in a `Refuse:` section.
2. `code-search/SKILL.md` (~400 bytes): contains A1, A2, A3, A10 (in an "Anti-patterns enforced" section).
3. `memory-recall/SKILL.md` (~500 bytes): contains A4, A7, A8, A9 AND a fenced code block containing exactly one valid tag line: \`\`\`\nproj:demo type:decision "fixture example"\n\`\`\` (eng-review Amendment to T-004: this is the LINT-03 positive-path exerciser).
4. Note: `external-research/SKILL.md` is intentionally omitted from `good/` — the linter's missing-file violation must NOT fire for files not in this fixture's allowlist coverage. Cross-check: spec says LINT-02 applies to map entries; if a map-entry file is absent from the lint root, that IS a violation. Reconciliation: include `external-research/SKILL.md` (~300 bytes, references A3, A6, A10) so the fixture is fully clean.

Revised step 4 → step 4 (replace): include all FOUR in-scope files in `good/`, all clean.

Done when: `node bin/lint.mjs --root tests/fixtures/good` exits 0 with no output.

---

## T-005 — Build `tests/fixtures/bad-budget/` (BUDG-01 + BUDG-02)
**Type:** fixture
**Files:** copy of `good/` tree + two oversized files
**Effort:** trivial (~5 min)
**Serves:** AC-5.2, eng-review Amendment #1

Steps:
1. Copy `tests/fixtures/good/` to `tests/fixtures/bad-budget/`.
2. Append filler comment text to `bad-budget/.claude/CLAUDE.md` until size ≥ 2,200 bytes (over 2,048).
3. Append filler text to `bad-budget/.claude/skills/code-search/SKILL.md` until size ≥ 3,200 bytes (over 3,072). Keep all required A-IDs present so LINT-02 doesn't false-trigger.

Done when: `node bin/lint.mjs --root tests/fixtures/bad-budget` exits 1 and stdout contains BOTH `BUDG-01` AND `BUDG-02`.

---

## T-006 — Implement LINT-02 detection
**Type:** feature
**Files:** `bin/lint.mjs`
**Effort:** small (~15 min)
**Serves:** AC-2.1, AC-2.2, AC-2.3, AC-2.4, BPR-8

Steps:
1. For each `(path, requiredIds)` in `REQUIRED_ANTIPATTERNS`: read file as UTF-8.
2. Apply `AID_RE` (global match), collect set of unique matched IDs (the captured group prefixed with `A`).
3. For each required ID not in the matched set: emit `✗ <path>: LINT-02 missing required anti-pattern <Ax>. Add a refusal line referencing <Ax>.`
4. Extras (matched but not required) are silently ignored (AC-2.4).
5. Files under `.claude/skills/` that are NOT keys in the map are silently skipped (AC-2.5).

Done when: live-tree `npm run validate` still exits 0; manually deleting `A8` from `memory-recall/SKILL.md` (then reverting) yields exit 1 with the expected line.

---

## T-007 — Build `tests/fixtures/bad-antipattern-missing/`
**Type:** fixture
**Files:** copy of `good/` minus one A-ID reference
**Effort:** trivial (~3 min)
**Serves:** AC-5.2

Steps:
1. Copy `tests/fixtures/good/` to `tests/fixtures/bad-antipattern-missing/`.
2. Edit `bad-antipattern-missing/.claude/skills/memory-recall/SKILL.md` to remove the `A8` reference (delete the line or replace `A8` with placeholder text that doesn't match `\bA8\b`).

Done when: `node bin/lint.mjs --root tests/fixtures/bad-antipattern-missing` exits 1 and stdout contains `LINT-02`.

---

## T-008 — Implement LINT-03 detection (per-line tag validation)
**Type:** feature
**Files:** `bin/lint.mjs`
**Effort:** medium (~30 min — most complex single task)
**Serves:** AC-3.1, AC-3.2, AC-3.3, AC-3.4, AC-3.5, eng-review Amendment #2

Steps:
1. For each file in `REQUIRED_ANTIPATTERNS` keys, walk lines with a 1-based line counter and a boolean `inFence`.
2. On a line matching `FENCE_RE`: toggle `inFence`; continue (the fence line itself is not validated).
3. For each content line where `inFence === true` OR `TAGS_LINE_RE.test(line)`:
   a. Tokenize: `line.split(/\s+/).filter(Boolean)`.
   b. Strip surrounding punctuation from each token: leading/trailing chars in the set `` ` `` `"` `,` `(` `)`.
   c. Collect tokens whose stripped form contains `proj:` or `type:`.
   d. If zero tokens collected, skip the line.
   e. Else: identify `projTokens` (form `proj:<value>` with non-empty value) and `typeTokens` (form `type:<value>`). Validate each type token's value against `TYPE_ENUM`.
   f. Emit violations:
      - For each malformed `type:<value>` token (value not in enum): `✗ <path>:<lineNo>: LINT-03 malformed tag \`<token>\` (type:<value> not in enum decision|bug|pattern|api|gotcha|todo).`
      - If no valid `proj:<value>` token at all and the line had any `proj:`/`type:` token: `✗ <path>:<lineNo>: LINT-03 malformed tag (missing proj:).`
      - If no valid `type:<value>` token at all and the line had any: `✗ <path>:<lineNo>: LINT-03 malformed tag (missing type:).`
4. Lines outside both allowed contexts are not touched even if they contain literal `proj:` / `type:` substrings (AC-3.5).

Done when: live-tree `npm run validate` still exits 0 (existing Phase 2 files have no fenced tag examples, so LINT-03 is a no-op on the live tree per CHALLENGE-NOTES). The `good/` fixture's fenced tag string passes; the `bad-tag-malformed/` fixture (built in T-009) fails as expected.

---

## T-009 — Build `tests/fixtures/bad-tag-malformed/`
**Type:** fixture
**Files:** copy of `good/` + edited fenced block
**Effort:** trivial (~3 min)
**Serves:** AC-5.2

Steps:
1. Copy `tests/fixtures/good/` to `tests/fixtures/bad-tag-malformed/`.
2. Edit `bad-tag-malformed/.claude/skills/memory-recall/SKILL.md`'s fenced code block to contain exactly one line: `proj:demo type:plan "fixture"`.

Done when: `node bin/lint.mjs --root tests/fixtures/bad-tag-malformed` exits 1 and stdout contains `LINT-03` citing `type:plan`.

---

## T-010 — Implement `--self-test` driver
**Type:** feature
**Files:** `bin/lint.mjs` (replace stub)
**Effort:** small (~15 min)
**Serves:** AC-5.3, AC-5.4, BPR-7, CC-1

Steps:
1. Hard-coded fixture table per plan.md §3 step 5.
2. For each fixture: `fs.existsSync(dir)` check; if missing → fail-fast with `SELF-TEST FAIL: fixture not found at <path>` and `process.exit(1)`.
3. Else: `child_process.spawnSync('node', [scriptPath, '--root', dir], { encoding: 'utf8' })`. Resolve `scriptPath` via `import.meta.url` → file URL → path (avoids hard-coding `bin/lint.mjs`).
4. Assert exit code matches; assert substring(s) present in stdout. For `bad-budget`, require BOTH `BUDG-01` and `BUDG-02`.
5. Per-fixture status line. Final line: `SELF-TEST PASS (4/4 fixtures).` (exit 0) or `SELF-TEST FAIL: <fixture> — <reason>` (exit 1).

Done when: `npm run validate -- --self-test` exits 0 with `SELF-TEST PASS (4/4 fixtures).` on the last line.

---

## T-011 — End-to-end verification & commit
**Type:** verification
**Files:** none (verification only)
**Effort:** trivial (~10 min)
**Serves:** AC-6.3, AC-6.4, V1, V2

Steps:
1. Run `npm run validate` against live HEAD → exit 0.
2. Run `npm run validate -- --self-test` → exit 0.
3. Run `node bin/lint.mjs --bogus` → exit 2 + usage line (AC-4.5, BPR-2).
4. Manual stress per Test Strategy T4: temporarily edit one live file to violate one rule, run `npm run validate`, confirm expected violation line + exit 1, revert.
5. Code review checklist (BPR audit):
   - BPR-1: `cat package.json | grep dependencies` → empty.
   - BPR-3: `npm run validate -- --root tests/fixtures/bad-budget | grep -E '^✗ \S+: [A-Z]+-[0-9]+ '` → ≥1 match.
   - BPR-4: `grep -E 'process\.env|readFile.*config' bin/lint.mjs` → no allowlist-related matches.
   - BPR-5: `grep TYPE_ENUM bin/lint.mjs` shows exactly the 6 MEM-01 values.
   - BPR-8: temporarily lowercase one A-ID in `good/`, confirm linter flags it; restore.

Done when: all five checks pass.

---

## Dependency graph

```
T-001 (package.json)
T-002 (skeleton + constants) ──┐
                                │
T-003 (BUDG detection) ─────────┼─→ T-004 (good fixture) ──┬─→ T-005 (bad-budget)
                                │                          │
T-006 (LINT-02 detection) ──────┤                          ├─→ T-007 (bad-antipattern-missing)
                                │                          │
T-008 (LINT-03 detection) ──────┘                          └─→ T-009 (bad-tag-malformed)
                                                                       │
                                                T-010 (self-test driver)
                                                                       │
                                                T-011 (E2E verification + BPR audit)
```

Parallelizable pairs (vertical slices in next stage): (T-003, T-006, T-008) detection tasks; (T-005, T-007, T-009) fixture tasks. T-002 unblocks all detection; T-004 unblocks all bad fixtures.

## Out-of-scope work flagged for later phases

- TODO Phase 4 (DOCS-02 README): runbook paragraph "When the routing rules change — A-ID additions require updating `bin/lint.mjs`'s map in the same PR." (Per CEO review's product-level concern about REQUIRED_ANTIPATTERNS map duplication.)
- TODO Phase 4: tokenizer-based BUDG-03 enforcement; `--quiet` / `--json` output modes; tighter performance assertions on large repos.

## Critique-failure routing (if revision_loop must re-fire)

Per flow definition `revision_routing`:
- `critique_failed` → `implementation_plan` (re-edit `plan.md` and re-critique)
- `spec_failed` → `canonical_spec` (re-edit `spec.md`)
- `decision_failed` → `decision_discovery` (re-open CONTEXT.md decisions)

Current state: critique passed with amendments applied inline; no revision triggered. Proceeding to `vertical_slicing` next.
