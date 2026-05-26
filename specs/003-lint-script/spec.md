# 003 — Lint Script (Canonical Spec)

**Phase:** 3 of 4 — Lint Script
**Status:** Locked (canonical_spec stage of rough-project-flow)
**Source of truth:** This spec supersedes ad-hoc decisions. Implementation MUST conform.
**Upstream:** `.planning/phases/03-lint-script/03-CONTEXT.md`, `.planning/phases/03-lint-script/03-CHALLENGE-NOTES.md`
**Downstream:** `specs/003-lint-script/plan.md` (implementation_plan stage), `tasks.md` (revision_loop stage).

---

## Goal

Ship a single-file Node.js lint script (`bin/lint.mjs`, zero runtime dependencies, invoked via `npm run validate`) that mechanically enforces three v1 requirements against the snailb-skills routing-rules repo:

1. **LINT-01** — byte-size budgets: `.claude/CLAUDE.md` ≤ 2,048 bytes; each god-combo skill SKILL.md ≤ 3,072 bytes. Reads file size via `fs.statSync`.
2. **LINT-02** — per-file required anti-pattern presence: each in-scope file MUST textually reference the A-IDs assigned to it in the allowlist below. Missing required ID = hard failure. Extras allowed silently.
3. **LINT-03** — tag-schema validation: every `proj:`/`type:` example string found inside a fenced code block OR on a line starting with `Tags:` / `Example tags:` MUST contain both a `proj:<value>` token and a `type:<value>` token, where `<value>` for `type:` is one of `decision|bug|pattern|api|gotcha|todo`.

A self-test mode (`npm run validate -- --self-test`) runs the linter against four fixture trees under `tests/fixtures/` (one good + one bad-per-rule) and asserts the expected exit code and the expected failing-rule ID appear in the output.

**Success means:** when run against the live `.claude/` tree, the script exits 0 only if all three requirements hold. When run with `--self-test`, the script exits 0 only if every fixture assertion holds. CI invokes `npm run validate` and `npm run validate -- --self-test` — both must pass.

Out of scope (deferred): tokenizer-based BUDG-03 enforcement (Phase 4); `--quiet` / `--json` modes; pre-commit hooks; warn-don't-fail tier for extras.

---

## Acceptance Criteria

### AC-1 — Byte-budget enforcement (LINT-01 → BUDG-01, BUDG-02)
1. Running `npm run validate` against the live repo with all in-scope files at or below their byte budgets exits with code 0 and prints no `✗` lines.
2. If `.claude/CLAUDE.md` exceeds 2,048 bytes by any amount, the script exits with code 1 and prints exactly one violation line of the form `✗ .claude/CLAUDE.md: BUDG-01 (<actual> bytes > 2048). Trim ~<delta> bytes from the core routing block.`
3. If any in-scope SKILL.md exceeds 3,072 bytes, the script exits with code 1 and prints one violation line per offending file, of the form `✗ <relative-path>: BUDG-02 (<actual> bytes > 3072). Trim ~<delta> bytes.`
4. The in-scope SKILL.md allowlist is exactly: `.claude/skills/code-search/SKILL.md`, `.claude/skills/memory-recall/SKILL.md`, `.claude/skills/external-research/SKILL.md`. No other file under `.claude/skills/` is checked for byte budget (specifically, `project-flow/SKILL.md` is excluded).

### AC-2 — Per-file anti-pattern presence (LINT-02)
1. The script ships a hard-coded `REQUIRED_ANTIPATTERNS` map matching this allowlist exactly:
   - `.claude/CLAUDE.md` → `['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10']`
   - `.claude/skills/code-search/SKILL.md` → `['A1','A2','A3','A10']`
   - `.claude/skills/memory-recall/SKILL.md` → `['A4','A7','A8','A9']`
   - `.claude/skills/external-research/SKILL.md` → `['A3','A6','A10']`
2. Detection rule: an A-ID is considered "referenced" when the regex `\bA([1-9]|10)\b` matches anywhere in the file's UTF-8 text (no section restriction).
3. If a file is in the map but missing one or more required A-IDs, the script exits with code 1 and prints one violation per missing ID: `✗ <relative-path>: LINT-02 missing required anti-pattern <Ax>. Add a refusal line referencing <Ax>.`
4. A-IDs referenced in a file beyond its required set (extras) are silently allowed in v1 — no warning, no failure.
5. Files under `.claude/skills/` that are NOT in the allowlist (e.g., `project-flow/SKILL.md`) are silently skipped — no LINT-02 check runs against them.

### AC-3 — Tag-schema validation (LINT-03 → MEM-01)
1. Candidate tag strings are extracted ONLY from these two contexts:
   - Inside fenced code blocks (delimited by ```` ``` ````; opening-fence language tag is language-agnostic — `bash`, `json`, etc. are all scanned).
   - On lines whose first non-whitespace content matches case-insensitively `Tags:` or `Example tags:`.
2. A line in either allowed context is the unit of validation. The parser tokenizes the line by whitespace, strips trailing/leading punctuation (`` ` `` `"` `,` `(` `)`) from each token, and collects ALL tokens whose stripped form contains `proj:` or `type:`. (A line outside the two allowed contexts is ignored entirely, even if it contains `proj:` / `type:` substrings.)
3. The collected tokens for a single line MUST contain at least one `proj:<non-empty-value>` token AND at least one `type:<value>` token where `<value>` ∈ `{decision, bug, pattern, api, gotcha, todo}`. If the line has at least one `proj:`/`type:` token but either component is missing — or any `type:<value>` token has `<value>` outside the enum — the line is a LINT-03 violation. One violation line is emitted per offending token (citing the offending token's reason).
4. Violation output: `✗ <relative-path>:<line>: LINT-03 malformed tag \`<offending-token>\` (<reason>).` where `<reason>` is one of `missing proj:`, `missing type:`, `type:<x> not in enum decision|bug|pattern|api|gotcha|todo`.
5. Prose mentions of `proj:` or `type:` outside the two contexts above are NEVER treated as candidate tag strings.

### AC-4 — Output and exit code (D-06)
1. Each violation prints exactly one line beginning with `✗ ` (U+2717 followed by space).
2. After all checks complete, if there are no violations: stdout is empty, exit code 0.
3. If there is at least one violation: a trailing summary line of the form `FAIL: <N> violation(s) across <M> file(s).` is printed after all `✗` lines, and exit code is 1.
4. Script writes UTF-8 to stdout (Node default).
5. No flags other than `--self-test` and `--root <path>` are recognized in v1. Unknown flags cause a usage-error exit code 2 and a one-line `Usage: npm run validate [-- --self-test] [-- --root <path>]` message.

### AC-5 — Configurable root and self-test (D-05)
1. The linter resolves all in-scope paths relative to a root directory. Default root = `process.cwd()`. The `--root <path>` flag overrides it.
2. `tests/fixtures/` contains exactly four subdirectories at v1:
   - `good/` — mimics the real `.claude/` layout; all four in-scope files present, all under byte budgets, all required A-IDs present, and AT LEAST ONE fenced code block containing a valid tag string (e.g., `proj:demo type:decision`). Linting it must exit 0.
   - `bad-budget/` — one in-scope file is over its byte budget by at least 1 byte. Linting it must exit 1 with at least one violation line containing `BUDG-0`.
   - `bad-antipattern-missing/` — one in-scope file is missing at least one of its required A-IDs. Linting it must exit 1 with at least one violation line containing `LINT-02`.
   - `bad-tag-malformed/` — one fenced-code-block tag string has a `type:` value outside the enum OR is missing the `proj:` token. Linting it must exit 1 with at least one violation line containing `LINT-03`.
3. `npm run validate -- --self-test` runs the linter against each fixture by setting `--root` to the fixture path and asserts: (a) the exit code matches the expected value above, and (b) the expected rule substring (`BUDG-0`, `LINT-02`, `LINT-03`) appears in stdout for the bad fixtures.
4. If every assertion holds, self-test exits 0 and prints `SELF-TEST PASS (4/4 fixtures).`. If any fails, self-test exits 1 and prints which fixture(s) failed which assertion.

### AC-6 — CI integration surface (LINT-01..03 acceptance)
1. A `package.json` is added at the repo root with `"type": "module"`, `"private": true`, `"scripts": { "validate": "node bin/lint.mjs" }`, and NO `dependencies` or `devDependencies` keys.
2. `bin/lint.mjs` runs under Node.js ≥ 18 using only built-in modules (`node:fs`, `node:path`, `node:process`, `node:url`, `node:child_process`).
3. `npm run validate` against the current live repo (state of HEAD when Phase 3 ships) exits 0.
4. `npm run validate -- --self-test` against the current repo exits 0.

---

## Test Strategy

### T1 — Self-test fixture suite (primary, mechanized)
The four fixture trees under `tests/fixtures/` ARE the test suite. `--self-test` is the test runner. Coverage map:

| Fixture | Expected exit | Asserted output substring | Rule(s) exercised |
|---|---|---|---|
| `good/` | 0 | (none — stdout empty) | LINT-01, LINT-02, LINT-03 positive paths; AC-4 silent-pass |
| `bad-budget/` | 1 | `BUDG-0` | AC-1 (LINT-01); AC-4 violation format |
| `bad-antipattern-missing/` | 1 | `LINT-02` | AC-2 (LINT-02); AC-4 |
| `bad-tag-malformed/` | 1 | `LINT-03` | AC-3 (LINT-03); AC-4 |

The `good/` fixture MUST include at least one fenced code block with a valid `proj:foo type:decision` string so that LINT-03's positive path is exercised, not trivially skipped.

### T2 — Live-tree smoke (manual, CI-gated)
`npm run validate` against the actual repo at HEAD. This is the production assertion: AC-6.3. Run in CI on every push and on every PR.

### T3 — Regression probe for near-limit files
`memory-recall/SKILL.md` is 3,023/3,072 bytes (49 bytes headroom at Phase 3 start). Add a CI test that runs `npm run validate` and FAILS LOUDLY — not as a separate signal, just as the natural BUDG-02 trip — if the file ever crosses 3,072. No extra tooling; the lint script itself is the regression probe.

### T4 — Manual stress (one-off, pre-ship)
Before merging Phase 3, manually break each in-scope file in turn (delete an A-ID, oversize a file, malform a tag) and run `npm run validate` — confirm the script reports exactly the expected violation and exits 1. Then revert. This is dogfooding; results are not stored as fixtures.

### What we explicitly DON'T test in v1
- Tokenizer-based per-turn overhead (deferred — Phase 4 validation harness).
- Behavior under non-UTF-8 input (assumed all files are UTF-8; not a real risk in a markdown-only tree).
- Performance / large-file behavior (the entire in-scope tree is < 20KB).
- Cross-platform line-ending normalization (CRLF vs LF) — `\bA([1-9]|10)\b` and the fenced-code-block scan are line-ending-agnostic.

---

## Behavior-Preservation Rules

These are the invariants the implementation MUST preserve as the script evolves in future phases. Violating any of them is a breaking change requiring a new ADR.

### BPR-1 — Zero runtime dependencies
`package.json` MUST NOT acquire any entry in `dependencies` or `devDependencies` during Phase 3. Adding tokenization (e.g., tiktoken, `@anthropic-ai/tokenizer`) is explicitly forbidden in v1 — it's deferred to Phase 4 where the validation harness already justifies the dependency. If a future phase adds a dep, the rationale MUST be recorded in an ADR.

### BPR-2 — Exit code contract
Exit 0 = clean; exit 1 = at least one violation; exit 2 = usage error (unknown flag). No other exit codes. CI consumers (and humans reading logs) rely on this trichotomy. Adding new exit codes is a breaking change.

### BPR-3 — Violation line format is grep-able
Every violation line begins with `✗ ` (U+2717 + space), followed by a relative path, optional `:<line>`, `: `, the rule ID (`BUDG-01`, `BUDG-02`, `LINT-02`, `LINT-03`), and a human-readable detail. This format is the contract for downstream agents (and humans piping to `grep '^✗'`) to parse violations. Do not reformat lines or change the `✗` glyph without an ADR.

### BPR-4 — Allowlist is hard-coded in the script
The `REQUIRED_ANTIPATTERNS` map and the BUDG-02 in-scope SKILL.md list MUST be hard-coded constants at the top of `bin/lint.mjs`. They are NOT read from a config file or env var. Rationale: the script is the source of truth for what the v1 routing-rules contract IS. Externalizing it would defeat A8/A10-style "no scattergun config drift". Updating the allowlist requires editing the script, which forces conscious deliberation in the PR.

### BPR-5 — `type:` enum is locked
The `type:` enum `{decision, bug, pattern, api, gotcha, todo}` MUST match MEM-01 exactly. Adding a new type requires updating both MEM-01 in REQUIREMENTS.md AND the linter's enum constant — in the same commit. Removing or renaming a type requires an ADR plus a migration plan for existing claude-mem entries.

### BPR-6 — In-scope path allowlist is exhaustive for v1
Only the four files listed in AC-2.1 are subject to LINT-02. Only `.claude/CLAUDE.md` plus the three god-combo skills are subject to BUDG-01/BUDG-02. Adding a new file to the scope (e.g., a fourth god-combo skill) requires updating the script in the same PR that adds the file. Adding a non-god-combo skill (e.g., a new workflow skill like `project-flow`) MUST NOT add the file to LINT-02 or BUDG-02 — workflow skills have a different cost model.

### BPR-7 — Self-test is part of the v1 contract
`--self-test` MUST remain functional and MUST cover at minimum one good fixture + one bad fixture per rule (BUDG, LINT-02, LINT-03). Phase 4 may add more fixtures; it MUST NOT remove the four named here without an ADR.

### BPR-8 — Detection rules are case-sensitive for IDs, case-insensitive for `Tags:` marker
- A-ID regex `\bA([1-9]|10)\b` is case-sensitive: lowercase `a1` does NOT count as a reference. This is intentional — A-IDs are always uppercase in the canonical text.
- `Tags:` / `Example tags:` line marker is case-insensitive: `tags:`, `TAGS:`, `Example Tags:` all qualify. This is to be lenient on author capitalization.
- Tag tokens `proj:` and `type:` are case-sensitive: `Proj:`, `TYPE:` do NOT count. This forces canonical formatting in examples.
