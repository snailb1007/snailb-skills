# Roadmap: snailb-skills

**Created:** 2026-05-25
**Project mode:** standard (horizontal layers)
**Granularity:** coarse
**Total phases:** 5

This roadmap derives from PRD §8 (Implementation Plan) and maps every v1 requirement from [.planning/REQUIREMENTS.md](REQUIREMENTS.md) to exactly one phase.

---

## Phase Overview

| # | Phase | Goal | Requirements | Plans |
|---|-------|------|--------------|-------|
| 1 | Core Rules & Mode Detection | CLAUDE.md v1 — agent detects mode, knows 3 principles, refuses 10 anti-patterns | 12 | 1–2 |
| 2 | Skill Files & Memory Layer | 3 skill files + tag taxonomy + memory hierarchy + output discipline | 12 | 2–3 |
| 3 | Lint Script | Enforce token budgets, anti-pattern presence, tag schema via runnable validator | 3 | 1 |
| 4 | Validation Harness & v1 Report | 20-case test harness, metrics capture, baseline-vs-v1 comparison, README | 4 | 5 |
| 5 | Setup Guide & Installer Script | Setup Guide (README.md) + Installer Script to configure other projects | 2 | 1 |

---

## Phase 1: Core Rules & Mode Detection

**Goal:** Ship `.claude/CLAUDE.md` v1 (≤ 2KB) that makes the agent emit a mode classification (F/O/R/M) before every tool call, follows the three root principles, and refuses the 10 anti-patterns by quoting their IDs.

**Requirements:** CORE-01, CORE-02, CORE-03, CORE-04, CORE-05, CORE-06, OUT-02, OUT-03, BUDG-01, DOCS-01, DOCS-03, VAL-04

**Success Criteria:**
1. `.claude/CLAUDE.md` exists, is ≤ 2KB, and contains: the 3 root principles (each with one-line rationale), a per-mode signal/tool table covering F/O/R/M, the 10 anti-patterns (A1–A10) phrased as refusals, and override syntax (`--force-tool`, `--mode`).
2. Smoke test of 5 cases (one per mode + one ambiguous) passes — for each case the agent emits the expected mode tag and proposes the expected first tool.
3. The ambiguous test case provokes a clarifying question instead of a tool call.
4. Stale-index warning (FR5) and search-drift stop condition (FR6) are explicit, quotable lines in CLAUDE.md.
5. `.claude/` standard layout exists with placeholder skill directories; every CLAUDE.md rule carries a version tag and a one-line rationale (NFR2/DOCS-03).

**Dependencies:** None. This phase establishes the foundation everything else builds on.

---

## Phase 2: Skill Files & Memory Layer

**Goal:** Ship the three on-demand skill files (`code-search`, `memory-recall`, `external-research`) and the claude-mem tag taxonomy + memory hierarchy. Each skill ≤ 3KB; baseline per-turn overhead stays ≤ 1500 tokens.

**Requirements:** MEM-01, MEM-02, MEM-03, MEM-04, MEM-05, ROUTE-01, ROUTE-02, ROUTE-03, ROUTE-04, OUT-01, BUDG-02, BUDG-03

**Success Criteria:**
1. `.claude/skills/code-search/SKILL.md` exists with a decision matrix (semble vs gitnexus vs grep-Vercel) and ≥ 3 few-shot examples grounded in PRD scenarios; file ≤ 3KB.
2. `.claude/skills/memory-recall/SKILL.md` documents mandatory + recommended tag taxonomy, per-mode filter strategy (PRD §5.3), `proj:` auto-detect-from-cwd rule, and the claude-mem ↔ context-mode conflict-resolution rule; file ≤ 3KB.
3. `.claude/skills/external-research/SKILL.md` covers context7 / grep-Vercel / brave routing with anti-pattern A3 (external docs → don't re-grep internal) called out; file ≤ 3KB.
4. The output-discipline rule (tool calls > 10KB → context-mode) is reflected in the `code-search` and `external-research` skills with explicit bypass-documentation guidance.
5. Baseline per-turn overhead measurement (CLAUDE.md only, skills not loaded) is ≤ 1500 tokens — measured and recorded.

**Dependencies:** Phase 1 (CLAUDE.md must reference the skill names and load-on-demand rule before skills can be authored against it).

---

## Phase 3: Lint Script

**Goal:** Ship a small lint script (Node or Python; runnable via `npm run validate` or similar) that fails CI when token budgets, anti-pattern presence, or tag-schema rules are violated. This makes NFR1 and the tag taxonomy mechanically testable.

**Requirements:** LINT-01, LINT-02, LINT-03

**Success Criteria:**
1. `npm run validate` (or equivalent) exits 0 when CLAUDE.md and all skill files are within their size budgets; exits non-zero with a clear message when over.
2. The script scans CLAUDE.md / skill files for the presence of all 10 anti-pattern IDs (A1–A10) and reports any missing.
3. The script parses every `proj:` / `type:` tag string used in skill-file examples and rejects malformed strings (missing `proj:`, type ∉ enum).
4. Script is documented in README (gets created in Phase 4) and has a self-test covering a known-good and a known-bad fixture.

**Dependencies:** Phase 2 (skills must exist before the validator can be meaningfully tested against them).

---

## Phase 4: Validation Harness & v1 Report

**Goal:** Build the 20-case test harness, capture token / tool-call / drift metrics, and produce a baseline-vs-v1 comparison report measured against PRD §10 targets. Ship `.claude/README.md` so external users can adopt the rules.

**Requirements:** VAL-01, VAL-02, VAL-03, DOCS-02

**Success Criteria:**
1. `tests/cases/` holds 20 case-study fixtures covering all 4 modes plus edges (ambiguous mode, mid-conversation switch, stale-index trap, scattergun trap, cross-project memory bait); each case labels expected mode and expected first tool.
2. Each case is run twice (baseline = CLAUDE.md hidden; v1 = CLAUDE.md active) with metrics captured via `ctx_stats` and a session-log parser: tokens/task, tool calls/task, drift incidents.
3. A `VALIDATION-REPORT.md` summarizes deltas against PRD §10 targets — tokens –30%, tool calls –25%, drift < 1/10, mode mis-classification < 10% — with verdict per target.
4. `.claude/README.md` documents setup, file load order, and override semantics (`--force-tool`, `--mode`) so a new user can adopt the rules without reading the PRD.

**Dependencies:** Phase 3 (lint must pass before validation report is meaningful — a v1 that violates its own NFRs would skew the comparison).

---

## Phase 5: Setup Guide & Installer Script

**Goal:** Provide `README.md` and `bin/install-rules.mjs` to easily install and update the routing rules in other codebases.

**Requirements:** INST-01, INST-02

**Success Criteria:**
1. Root `README.md` exists and details installation, configuration, overrides, and tag taxonomy.
2. `bin/install-rules.mjs` (runnable via `node bin/install-rules.mjs <target-path>` or `npm run install-to <target-path>`) copy-deploys the `.claude/` folder and `bin/lint.mjs` to a specified directory and validates target setup.
3. Smoke test verification that installer runs successfully and linter works in a target project.

**Dependencies:** Phase 4 (Validation of the core rules and linter must be complete to ensure stable code is distributed).

---

## Coverage Check

- v1 requirements total: **33**
- Mapped to phases: **33**
- Unmapped: **0** ✓

All v1 requirements from REQUIREMENTS.md are covered by exactly one phase.

---

*Roadmap created: 2026-05-25*
*Last updated: 2026-05-26 after Phase 5 creation*
