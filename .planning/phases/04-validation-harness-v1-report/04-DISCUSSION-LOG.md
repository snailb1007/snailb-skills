# Phase 4: Validation Harness & v1 Report — Discussion Log

**Date:** 2026-05-26
**Mode:** discuss (default), recommended options auto-selected per user request
**Phase boundary:** Validation harness covering 20 case studies for 4 workflow modes + edge cases, performance metrics tracking, a comparative performance report, and public-facing README.md documentation.

## Areas Selected by User
The user requested using the recommended options for all gray areas, only prompting if no recommended option exists or if there is a significant trade-off.

1. **Validation Harness Execution Model:** Hybrid (Playback + Optional Live Run)
2. **Test Case Fixture Format:** Markdown with Frontmatter
3. **Metrics Capture & Reporting:** Log Parser Script generating `VALIDATION-REPORT.md`
4. **Documentation Structure:** README covering setup, loading, and overrides

## Question-by-Question Record

### Q1 — Validation Harness Execution Model
**Options:**
- Hybrid: Playback + Optional Live Run (Recommended)
- Deterministic Simulation/Mocking
- Real Runs Only

**User selection:** Hybrid: Playback + Optional Live Run (Recommended)
**Captured as:** D-01. Harness runs by default in playback mode using pre-recorded logs to save API costs and run instantly, but supports a `--live` flag to execute real API calls and regenerate playback logs.
**Trade-off considered:** Playback mode requires manual regenerations of snapshots when rules change, but this is mitigated by the `--live` command.

### Q2 — Test Case Fixture Format
**Options:**
- Markdown with Frontmatter (Recommended)
- YAML/JSON Files

**User selection:** Markdown with Frontmatter (Recommended)
**Captured as:** D-03. Case studies live in `tests/cases/` as markdown files with metadata stored in YAML frontmatter.

### Q3 — Metrics Capture & Reporting
**Options:**
- Log Parser Script (Recommended)
- Manual Analysis

**User selection:** Log Parser Script (Recommended)
**Captured as:** D-04 and D-05. A Node script parses the logs, estimates token count/tool calls, flags drift/misclassifications, and writes `VALIDATION-REPORT.md`.

### Q4 — Documentation Structure
**Options:**
- Standard README (Recommended)
- Minimal README

**User selection:** Standard README (Recommended)
**Captured as:** D-06. `.claude/README.md` documents setup, loading, overrides, and features.

## Decisions Captured

- D-01: Node.js zero-deps validation harness at `bin/validate-harness.mjs`, supporting default playback mode and live mode via `--live`.
- D-02: Sequential baseline vs. v1 comparisons for each case study.
- D-03: Case studies authored as Markdown files under `tests/cases/` with YAML frontmatter.
- D-04: Metrics extraction (tokens, tool calls, drift, accuracy) from session logs.
- D-05: Automatic generation of `VALIDATION-REPORT.md` from execution results.
- D-06: Comprehensive public `.claude/README.md`.

## Deferred Ideas (preserved, not acted on)

- Platform validation beyond Claude Code (deferred to v2).
- CI actions integration (deferred to v2).

## Scope Creep Avoided
None.

## Claude's Discretion
- Selection of Node.js standard built-ins for `bin/validate-harness.mjs` matching the Phase 3 linter patterns.
- Defining specific metric heuristics for detecting search drift and mode classification.
