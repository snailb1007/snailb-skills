# GStack Engineering Manager Review — 003 Lint Script

**Reviewer mode:** Implementation correctness, testability, maintainability, risk
**Subject:** `specs/003-lint-script/spec.md` + `specs/003-lint-script/plan.md`
**Date:** 2026-05-26
**Verdict:** **Approved with TWO amendments** (apply to plan.md before executing)

---

## Overall assessment

Plan structure is solid: file-by-file diff, ordered execution steps, explicit BPRs, verification matrix that maps AC → test. The single-file `bin/lint.mjs` discipline (~250 LOC) is achievable and the order-of-execution (write good fixture first, then degrade per rule) is the correct way to build a linter end-to-end.

Strong points:
- Zero-dep constraint (BPR-1) keeps the surface auditable in one sitting.
- Self-test driver as a `spawnSync` over the same binary (not as a library import) means the test suite exercises the actual CLI surface, not a refactored internal API. This is the right call for a 250-LOC tool.
- BPR-3 (grep-able violation lines) makes the output a stable contract for both humans and agents.

## Amendment #1 (MUST apply) — `bad-budget/` fixture must exercise BUDG-02

**Problem:** The plan says `bad-budget/` oversizes only `.claude/CLAUDE.md` (→ BUDG-01). The self-test substring assertion is `BUDG-0` (matches both BUDG-01 and BUDG-02), so the assertion passes. But the BUDG-02 code path — comparing a SKILL.md's size against 3,072 and emitting a `BUDG-02` line — is **never exercised by any fixture** under the current plan.

A bug in BUDG-02 detection (wrong threshold constant, wrong file iteration, wrong output substring) would slip through `--self-test`. AC-1.3 explicitly requires BUDG-02 violations be reported in the documented format — but the fixture suite doesn't verify it.

**Fix:** In the `bad-budget/` fixture, oversize **both** `.claude/CLAUDE.md` AND ONE in-scope SKILL.md (e.g., pad `code-search/SKILL.md` to ~3,200 bytes). The expected output then contains BOTH `BUDG-01` and `BUDG-02` lines. Tighten the self-test assertion for that fixture to require **both** substrings be present.

Trivial change — adds ~6 lines to the fixture build and one line to the self-test driver's assertion table.

## Amendment #2 (MUST apply) — Pin down the LINT-03 token-grouping rule

**Problem:** Spec AC-3.2 says "Multiple tag strings on a single line are validated independently." The plan describes the implementation as "Group tokens belonging to the same tag string (heuristic: contiguous tokens on the same source line where any token has `proj:`/`type:`)." That word "heuristic" is doing too much work.

Concrete ambiguity: on a `Tags:` line like
```
Tags: proj:a type:decision, proj:b type:notatype
```
is this one tag string (and so the line has a "missing proj:" violation because the parser sees `proj:` twice and gets confused), or two independent tag strings (and only the second is a LINT-03 violation)?

If the script's parser groups by whitespace contiguity, the comma between them keeps them adjacent and they collapse into one group. That's almost certainly wrong.

**Fix (pinned rule):** Reframe LINT-03 as a per-line check inside the two allowed contexts (fenced block content lines OR `Tags:` lines). For each such line:

1. Tokenize the line by whitespace.
2. Collect ALL tokens that contain `proj:` or `type:` substrings (stripping surrounding punctuation like `,` `"` `` ` `` `(` `)` from token boundaries).
3. From the collected tokens, extract:
   - The set of `proj:<value>` tokens (must be ≥1 with non-empty `<value>`).
   - The set of `type:<value>` tokens (must be ≥1 with `<value>` ∈ enum).
4. If the line has any `proj:`/`type:` token at all and EITHER set above is empty (or any `type:` value is out-of-enum) → emit one LINT-03 violation per offending token, citing the line number.

Net effect: a line is treated as ONE tag-string context. Multiple tag pairs on one line all need to be well-formed; if any token is malformed, that token gets a violation. This is unambiguous, easy to implement, and matches the spirit of AC-3.

**Update the spec's AC-3.2 to remove the "validated independently" wording** — it was misleading. Replace with: "A line in either allowed context is the unit of validation. All `proj:`/`type:` tokens on the line are collected; the line passes only if ≥1 valid `proj:` and ≥1 valid `type:` (enum-checked) are present, AND no token-shaped `proj:`/`type:` value violates the rule."

Also update the `bad-tag-malformed/` fixture to use the cleanest possible failure: a single fenced-block line with `proj:demo type:plan "fixture"` (no commas, no second pair). This avoids any ambiguity in what's being tested.

## Other technical concerns (already addressed, noted for the executor)

### CC-1 — Fixture not-found behavior
Plan doesn't specify what `--self-test` does if a fixture directory is missing. **Add to plan:** `--self-test` fails fast with `SELF-TEST FAIL: fixture not found at <path>` and exit 1. One line in the driver.

### CC-2 — `--root` path resolution
Plan says "Resolve root to absolute path; default `process.cwd()`." Confirm via `path.resolve()` — handles relative input correctly. No issue.

### CC-3 — Fenced-block edge cases
Indented code blocks (4-space) are NOT in scope — only triple-backtick fences. Markdown allows nested fences via different fence widths (\`\`\`\`); we don't need to support them. The state machine is a simple boolean toggle per line. Confirm the implementation doesn't try to be cleverer.

### CC-4 — `bin/lint.mjs` shebang
Plan doesn't mention a `#!/usr/bin/env node` shebang. Not required since the script is invoked via `node bin/lint.mjs` (per `package.json` script). Don't add one — keeps the file as pure ESM.

### CC-5 — Cross-platform line endings
Windows clones may have CRLF. `\bA([1-9]|10)\b` is line-ending-agnostic. Fence regex `^```` matches at line start regardless of `\r`. Tag-line marker uses `^\s*`. All fine.

### CC-6 — Trailing summary line emission order
Per AC-4.3: summary line is printed AFTER all `✗` lines. Plan's reporter section implies this is implicit; the implementation must buffer violations or collect them in an array first, then print en bloc. Don't stream to stdout mid-detection — would interleave wrong if a single file emits violations from multiple rules.

### CC-7 — Memory-recall near-budget
The fixture build for `good/` is constrained to mirror the real `.claude/` layout — the real `memory-recall/SKILL.md` is 3,023 bytes. The fixture's `memory-recall/SKILL.md` is much smaller (~500 bytes per plan). No coupling. Independent.

## Test strategy critique

T1 (self-test fixtures) is the primary surface and is well-designed (after Amendment #1). T2 (live-tree smoke) is essentially a single CI step. T4 (manual pre-ship) is fine. T3 (regression probe for near-limit files) is correctly NOT a separate test — the lint script itself plays this role.

What I'd push back on: T4 says "manually break each file, run, revert." This is dogfooding, not a test, and it costs nothing. Keep it; just label it correctly (it's a sanity check, not a test gate).

What I'd add: **a one-time check during PR review that `node bin/lint.mjs --bogus-flag` exits 2 with the usage message** (AC-4.5). The verification plan mentions this as a manual check in V1 — confirm the executor doesn't skip it. Adds 2 lines to a manual checklist.

## What I'd reject

Plan section "V4 — Plan-critique gate" lists three potential critique vectors. The third — "should `bad-*` fixtures be derived from `good/` via a generation script" — is correctly preempted as overkill for v1. Hand-author the four fixtures. Done.

## Final verdict

**APPROVED with two amendments applied to plan.md before execution:**

1. **Amendment #1:** `bad-budget/` fixture must oversize one SKILL.md in addition to CLAUDE.md, so the BUDG-02 code path is exercised. Self-test assertion for that fixture requires both `BUDG-01` and `BUDG-02` substrings.
2. **Amendment #2:** Lock LINT-03 to per-line tag validation (full pinned rule above). Update spec AC-3.2 wording and tighten the `bad-tag-malformed/` fixture to a single unambiguous bad pair.

Plus three small executor-time fixes from the concerns list:
- CC-1 (fixture not-found → fail fast).
- CC-6 (buffer violations, print en bloc).
- Confirm CC-2, CC-3, CC-4, CC-5 during code review.

Once amendments are applied, the plan is ready for `revision_loop` → vertical_slicing → execution.
