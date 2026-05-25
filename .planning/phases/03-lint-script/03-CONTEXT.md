# Phase 3: Lint Script - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers a single-shot lint script that fails CI when (a) `.claude/CLAUDE.md` core > 2KB or any `.claude/skills/*/SKILL.md` > 3KB, (b) any A1–A10 anti-pattern is missing from its required host file, or (c) any `proj:` / `type:` tag string in an explicit example marker is malformed. The script ships with a `--self-test` flag and a `tests/fixtures/` tree (one good fixture + one bad-per-rule fixture).

This phase does NOT implement the 20-case validation harness (Phase 4), the per-turn token-overhead measurement (BUDG-03 remains a manual figure in `02-BASELINE.md` until Phase 4), nor public-facing README docs (Phase 4 DOCS-02).

</domain>

<decisions>
## Implementation Decisions

### Script Form Factor
- **D-01 (Language & runtime):** Node.js, zero runtime dependencies. Script lives at `bin/lint.mjs` and is invoked via `npm run validate`. A minimal `package.json` is added with the single `validate` script and no `dependencies`/`devDependencies`. Only Node's built-in `fs`, `path`, `process`, and `child_process` modules may be used. Rationale: matches the success-criteria phrasing in ROADMAP.md (`npm run validate`), avoids a Python toolchain assumption in a repo that has none, and is cleaner for tag-string regex parsing than bash.

### Rule Scope and Strictness
- **D-02 (Anti-pattern detection — per-file required-ID map):** The script ships an explicit allowlist of god-combo skill files and the A-IDs each must contain. The map is the source of truth — a missing required ID is a hard failure; extras are allowed silently in v1. Files NOT in the allowlist (e.g. `project-flow/SKILL.md`) are skipped entirely. Map verified against actual Phase 2 file contents:
  - `.claude/CLAUDE.md` → A1, A2, A3, A4, A5, A6, A7, A8, A9, A10 (master refusal table)
  - `.claude/skills/code-search/SKILL.md` → A1, A2, A3, A10
  - `.claude/skills/memory-recall/SKILL.md` → A4, A7, A8, A9
  - `.claude/skills/external-research/SKILL.md` → A3, A6, A10
  - Any `.claude/skills/*/SKILL.md` path not listed above is silently skipped.
- **D-03 (Tag-schema parsing scope — explicit example markers only):** The script validates `proj:` / `type:` strings ONLY when they appear (a) inside a fenced code block (\`\`\` … \`\`\`) OR (b) on a line beginning with `Tags:` or `Example tags:` (case-insensitive, leading whitespace allowed). Prose mentions and section headings are ignored. Each candidate tag string MUST contain a `proj:<value>` token AND a `type:<value>` token where `<value>` for `type:` is one of `decision|bug|pattern|api|gotcha|todo` (the canonical enum from MEM-01). Malformed tag string = hard failure. This forces Phase 2 examples to be authored deliberately and avoids false positives from documentation about the schema itself.
- **D-04 (Token budgets — bytes only for v1):** Enforce BUDG-01 (`.claude/CLAUDE.md` ≤ 2048 bytes on disk) and BUDG-02 (god-combo skill files only ≤ 3072 bytes on disk) by reading file size from `fs.statSync`. **Scope of BUDG-02 is the same allowlist as D-02** — `project-flow/SKILL.md` (9,775 bytes) and any non-god-combo skills are excluded. The 3KB budget is an NFR for routing-rule skills that load on relevant turns; workflow/orchestration skills have a different cost model. BUDG-03 (per-turn overhead ≤ 1500 tokens) is NOT mechanized in v1 — it remains a manual figure recorded in `.planning/phases/02-skill-files-memory-layer/02-BASELINE.md` until Phase 4 introduces the validation harness with a real tokenizer. No tokenizer dependency is added in Phase 3.

### Self-Test and Output
- **D-05 (Self-test fixtures — fixtures/ dir, one bad-per-rule):** The script accepts a `--self-test` flag. Fixtures live under `tests/fixtures/`:
  - `tests/fixtures/good/` — a minimal mini-project (CLAUDE.md + at least one SKILL.md + example tag strings) that exits 0 when linted.
  - `tests/fixtures/bad-budget/` — fixture where CLAUDE.md or a SKILL.md exceeds its byte budget. Expected exit code: non-zero, failing rule = BUDG-01 or BUDG-02.
  - `tests/fixtures/bad-antipattern-missing/` — fixture where a required A-ID is absent from its host file. Expected exit code: non-zero, failing rule = LINT-02.
  - `tests/fixtures/bad-tag-malformed/` — fixture where an example tag string is missing `proj:` or has a `type:` value outside the enum. Expected exit code: non-zero, failing rule = LINT-03.
  - `--self-test` runs the linter against each fixture and asserts the expected exit code + the expected failing rule appears in the output. Self-test exit code is 0 only if every assertion holds.
- **D-06 (Failure report style — detailed by default):** Each violation prints one line in the form `✗ <relative-path>: <RULE-ID> <specific-detail>. <fix-hint>`. Examples:
  - `✗ .claude/CLAUDE.md: BUDG-01 (2156 bytes > 2048). Trim ~108 bytes from the core routing block.`
  - `✗ .claude/skills/code-search/SKILL.md: LINT-02 missing required anti-pattern A3. Add a refusal line referencing A3 (no grep after context7 for the same API).`
  - `✗ .claude/skills/memory-recall/SKILL.md:42: LINT-03 malformed tag `type:plan` (not in enum decision|bug|pattern|api|gotcha|todo).`
  - Trailing summary line: `FAIL: <N> violation(s) across <M> file(s).` Exit code is 0 (no violations) or 1 (any violation). No `--quiet` flag in v1 — the verbose form is already optimized for an agent to self-correct in one read.

### Constraints Carried Forward (Locked, Not Re-Discussed)
- A1–A10 IDs and the canonical refusal text live in `.claude/CLAUDE.md` (Phase 1 output). The lint script reads from these files; it does NOT redefine the anti-patterns.
- `type:` enum is `decision|bug|pattern|api|gotcha|todo` (Phase 2, MEM-01). Locked. The lint script hard-codes this enum.
- Token budgets (2KB / 3KB / 1500 tokens) come from NFR1 / BUDG-01..03. Locked. The script enforces the byte budgets; the token budget stays manual.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Phase Scope
- `.planning/ROADMAP.md` — Phase 3 goal, four success criteria, dependency on Phase 2.
- `.planning/REQUIREMENTS.md` — Phase 3 requirements: LINT-01 (byte budgets), LINT-02 (A1–A10 presence), LINT-03 (tag-schema), and the referenced BUDG-01 / BUDG-02 (byte limits the lint enforces).
- `.planning/PROJECT.md` — Core value, output discipline rules, constraints (no new MCP servers, no runtime application code).
- `docs/prd.md` — NFR1 (token budgets), §5.3 (per-mode filter strategy that defines the tag schema), and the canonical A1–A10 refusal table.

### Phase 1 & 2 Carry-Forward
- `.claude/CLAUDE.md` — Phase 1 output. Source of A1–A10 canonical text the linter checks against.
- `.claude/skills/code-search/SKILL.md`, `.claude/skills/memory-recall/SKILL.md`, `.claude/skills/external-research/SKILL.md` — Phase 2 outputs. Subject files for LINT-02 (anti-pattern presence) and LINT-03 (tag-schema in examples).
- `.planning/phases/01-core-rules-mode-detection/01-CONTEXT.md` — Phase 1 decisions (mode detection, A1–A10 author intent).
- `.planning/phases/02-skill-files-memory-layer/02-CONTEXT.md` — Phase 2 decisions (skill file shape, tag taxonomy depth, `type:` enum).
- `.planning/phases/02-skill-files-memory-layer/02-BASELINE.md` — Per-turn token-overhead figure that BUDG-03 references. The lint script does NOT consume this in v1 but the planner should know it exists.

### Feature Packet (to be authored)
- `specs/003-lint-script/spec.md` — canonical_spec stage output.
- `specs/003-lint-script/plan.md` — implementation_plan stage output.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing JavaScript / Node code in the repo. `package.json` does not yet exist. Phase 3 introduces both. Keep both minimal — one `bin/lint.mjs`, one `package.json` with a single `"validate"` script and no dependencies.
- `.claude/CLAUDE.md` and the three Phase 2 SKILL.md files are the linter's primary inputs — they already exist on disk.
- `.planning/phases/02-skill-files-memory-layer/02-BASELINE.md` exists (per Phase 2 ledger) and records the per-turn overhead figure; planner can reference it but the script does not parse it.

### Established Patterns
- Documentation-first repo. The lint script is the FIRST runtime artifact. Treat it like any other documented surface — short, readable, every line earns its bytes.
- Token budgets are acceptance criteria. The lint script itself has no size budget, but should stay well under ~300 LOC for readability.
- Anti-pattern IDs use the form `A<n>` (n = 1..10) consistently across Phase 1 and Phase 2 docs. The linter can rely on a regex like `\bA([1-9]|10)\b` for presence detection.

### Integration Points
- `bin/lint.mjs` — the script itself.
- `package.json` — added at repo root with `"scripts": { "validate": "node bin/lint.mjs" }` and `"type": "module"`.
- `tests/fixtures/{good,bad-budget,bad-antipattern-missing,bad-tag-malformed}/` — self-test inputs.
- `.gitignore` — already exists; check it does not exclude `bin/` or `tests/` (it should not).
- CI wiring beyond `npm run validate` (e.g., GitHub Actions) is deferred to Phase 4 / release prep.

</code_context>

<specifics>
## Specific Ideas

- The per-file required-ID map in D-02 is the lint script's single most opinionated piece of logic. Encode it as a top-of-file `const REQUIRED_ANTIPATTERNS = { 'path/to/file.md': ['A1', 'A2', ...], ... }`. Researcher/planner may refine the actual A-IDs per skill after reading the real Phase 2 skill contents — the map values above are the starting hypothesis.
- The fenced-code-block scan for D-03 should ignore the language tag on the opening fence (e.g., \`\`\`bash, \`\`\`json) — language-agnostic.
- `--self-test` should be the only flag in v1. Default invocation (`npm run validate`) lints the live tree. `npm run validate -- --self-test` runs the fixture suite.
- Failure-line format in D-06 uses a literal `✗` prefix (U+2717). Ensure the script writes UTF-8 (Node default for stdout is fine).

</specifics>

<deferred>
## Deferred Ideas

- **Token-budget mechanization (BUDG-03):** add a real tokenizer (tiktoken or `@anthropic-ai/tokenizer`) and fail when CLAUDE.md core estimate > 1500 tokens. Deferred to Phase 4, where the validation harness already needs tokenization.
- **--quiet / --json output modes:** useful once external CI consumers exist. Not needed for the solo-dev v1 surface. Revisit when DOCS-02 (README, Phase 4) is being written.
- **Warn-don't-fail tier for extras / unknown A-IDs:** D-02 keeps v1 strict (required IDs only). A separate warning tier (e.g., a skill referencing A11 when no such ID exists) can be added if drift becomes a real problem.
- **Pre-commit hook wiring:** Husky / lefthook integration. Deferred — `npm run validate` in CI is sufficient for v1.

</deferred>
