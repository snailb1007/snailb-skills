# Phase 4: Validation Harness & v1 Report - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the validation harness and the final v1 report for the god-combo routing rules. It builds a test suite of 20 case studies covering all 4 modes plus edge cases, captures performance metrics (token usage, tool calls, search drift, misclassification rates), and produces a comparative report (`VALIDATION-REPORT.md`) against the PRD §10 targets. Additionally, it ships the public-facing `.claude/README.md` document for external setup and usage.

This phase does NOT add support for platforms other than Claude Code in v1 (Cursor/OpenCode/Windsurf compatibility remains deferred to v2 per PRD §3.2).

</domain>

<decisions>
## Implementation Decisions

### Harness Form Factor & Execution
- **D-01 (Harness Form Factor):** The validation harness lives as a Node.js script at `bin/validate-harness.mjs` and is run via `npm run test:validate` (or equivalent). It operates in two modes:
  - **Playback Mode (Default):** Evaluates the 20 case studies deterministically using pre-recorded/mocked session logs located under `tests/cases/fixtures/`. This avoids Anthropic API costs, runs instantly, and works without credentials.
  - **Live Mode (`--live`):** Runs the prompts against the live Anthropic API (using the `@anthropic-ai/sdk`) to execute the real routing rules, capture live `ctx_stats`, record new session transcripts, and update the playback fixtures.
- **D-02 (Baseline vs. V1 Comparison):** The harness evaluates each test case under two conditions:
  - **Baseline:** System prompt without the `CLAUDE.md` routing rules and skill files.
  - **v1:** System prompt with the `CLAUDE.md` routing rules active.
  In Playback Mode, these two states are pre-recorded. In Live Mode, the harness runs them sequentially to measure performance improvements.

### Case Study Structure
- **D-03 (Fixture Format):** Case studies live in `tests/cases/` as Markdown files with YAML frontmatter (e.g., `tests/cases/01-ambiguous-mode.md`).
  - **Frontmatter Fields:**
    - `id`: Unique test ID (e.g., `TC-01`)
    - `name`: Human-readable name
    - `mode`: Expected mode (F/O/R/M)
    - `expected_first_tool`: Expected initial tool call
    - `description`: Explaining the scenario (e.g., cross-project memory bait, stale-index trap)
  - **File Body:** Contains the initial user prompt and subsequent conversation sequence.

### Metrics Collection & Report Generation
- **D-04 (Metrics Extraction):** The harness parses session logs (transcripts) to extract:
  - **Tokens per task:** Calculated using character count approximations or a lightweight tokenizer.
  - **Tool calls per task:** Extracted by counting tool execution blocks.
  - **Search drift incidents:** Detected when the agent performs 3+ consecutive searches or calls multiple search tools (semble + gitnexus + grep) for the same task.
  - **Mode classification accuracy:** Checked by verifying if the agent outputted the correct mode tag.
- **D-05 (Report Generator):** The harness aggregates the results of all 20 cases and automatically writes the markdown file `VALIDATION-REPORT.md` comparing the baseline vs. v1 performance against the PRD targets:
  - Token consumption: -30% target
  - Tool calls: -25% target
  - Search drift: < 1 in 10 tasks target
  - Mode misclassification: < 10% target

### Public Documentation
- **D-06 (README Structure):** Author `.claude/README.md` to document:
  - Installation and setup of the routing rules.
  - File loading order and rules structure.
  - Usage of override flags (`--force-tool`, `--mode`).
  - Clear examples of how the mode-classification and tag-taxonomy work.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Phase Scope
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, and dependencies.
- `.planning/REQUIREMENTS.md` — Requirements VAL-01, VAL-02, VAL-03, and DOCS-02.
- `.planning/PROJECT.md` — Core routing principles and constraints.
- `docs/prd.md` — Section 10 success metrics and Section 5 mode specifications.

### Existing Code & Context
- `.claude/CLAUDE.md` — Core routing rules.
- `.claude/skills/code-search/SKILL.md`, `.claude/skills/memory-recall/SKILL.md`, `.claude/skills/external-research/SKILL.md` — Core routing skills.
- `bin/lint.mjs` — Phase 3 linter for syntax and schema verification.
- `.planning/phases/03-lint-script/03-CONTEXT.md` — Phase 3 decisions and constraints.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bin/lint.mjs` — Node.js script using built-ins (`fs`, `path`, `process`). The validation harness should follow the same zero-dependency Node.js pattern.
- `package.json` — Add the validation script under `"scripts": { "test:validate": "node bin/validate-harness.mjs" }`.

### Integration Points
- `bin/validate-harness.mjs` — The runner script.
- `tests/cases/` — The directory containing the 20 case study Markdown files.
- `tests/cases/fixtures/` — The directory storing the playback session transcripts.
- `VALIDATION-REPORT.md` — The auto-generated performance comparison report.
- `.claude/README.md` — Setup and override guide.

</code_context>

<specifics>
## Specific Ideas

- The playback logs can be JSONL format representing the sequence of events (user message, agent thought, tool call, tool response, agent final output) to allow the harness to parse tool calls and token counts deterministically.
- Let the harness fail with a non-zero exit code if the current v1 implementation misses the expected mode/tool targets in playback mode, helping integrate this validation step into a future CI pipeline.

</specifics>

<deferred>
## Deferred Ideas

- **Platform validation beyond Claude Code:** Cursor, OpenCode, and Windsurf compatibility remains deferred to v2.
- **Continuous Integration (CI) Actions integration:** Setting up GitHub Actions to automatically run the validation harness on push remains deferred.

</deferred>
