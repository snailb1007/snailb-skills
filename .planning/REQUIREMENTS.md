# Requirements: snailb-skills

**Defined:** 2026-05-25
**Core Value:** The agent reliably detects mode (F/O/R/M) before every important tool call and routes to the cheapest-correct tool — driven by *cheapest first*, *exact > semantic > lexical*, *local > public*.

## v1 Requirements

### Core Rules (CLAUDE.md)

- [ ] **CORE-01**: The three root principles (cheapest first / exact > semantic > lexical / local > public) are stated verbatim in CLAUDE.md with a one-line rationale each
- [ ] **CORE-02**: Agent emits a mode detection (F/O/R/M) as the first action of each user turn that involves a tool call; if signals are ambiguous it asks the user one disambiguating question and refuses to guess (FR1)
- [ ] **CORE-03**: CLAUDE.md includes a per-mode decision tree (signals → default heavy tools → default light tools) covering all four modes per PRD §5.2
- [ ] **CORE-04**: All 10 anti-patterns (A1–A10) are listed in CLAUDE.md / skills with refusal-style wording the agent quotes when an anti-pattern is triggered (FR3)
- [ ] **CORE-05**: When the active mode changes mid-conversation, the agent announces the transition (e.g., "→ chuyển sang mode M") and clears prior-mode search bias before its next tool call (FR4)
- [ ] **CORE-06**: Override mechanism documented — `--force-tool=<name>` bypasses routing, `--mode=<F|O|R|M>` fixes the mode; overrides are logged for review

### Memory & Tag Taxonomy

- [ ] **MEM-01**: Tag taxonomy documented — mandatory `proj:<repo>` + `type:(decision|bug|pattern|api|gotcha|todo)` and recommended `mode:`, `lib:`, `severity:` — with examples per type
- [ ] **MEM-02**: Every `claude-mem search` issued by the agent carries both `proj:` and a `type:` filter appropriate for the active mode; unfiltered searches are refused (FR2)
- [ ] **MEM-03**: Per-mode search filter strategy codified per PRD §5.3 (F → decision|pattern|gotcha, O → decision|pattern, R → cross-project by lib, M → bug|gotcha)
- [ ] **MEM-04**: Memory hierarchy rule defined — claude-mem owns intent (cross-session, weeks/months), context-mode owns session state (current session); conflict resolution explicit
- [ ] **MEM-05**: `proj:` resolution auto-detects from cwd / git toplevel; documented in memory-recall skill

### Tool-Routing Skills

- [ ] **ROUTE-01**: `code-search/SKILL.md` exists with a decision matrix for semble vs gitnexus vs grep (Vercel) including few-shot examples
- [ ] **ROUTE-02**: `memory-recall/SKILL.md` exists with claude-mem patterns, tag cheatsheet, and per-mode filter examples
- [ ] **ROUTE-03**: `external-research/SKILL.md` exists with context7 vs grep (Vercel) vs brave routing rules and few-shot examples
- [ ] **ROUTE-04**: Each skill file contains at least 3 few-shot examples grounded in PRD scenarios

### Output Discipline

- [ ] **OUT-01**: Tool calls with expected output > 10KB MUST route through context-mode; bypasses documented and justified (FR7)
- [ ] **OUT-02**: When gitnexus / semble index is older than HEAD, agent warns the user and does NOT re-index silently (FR5)
- [ ] **OUT-03**: After 2 consecutive empty / irrelevant searches the agent stops and asks the user; a 3rd reformulated query is forbidden (FR6, anti-pattern A9)

### Token Budget

- [ ] **BUDG-01**: CLAUDE.md core file is ≤ 2KB on disk (NFR1)
- [ ] **BUDG-02**: Each skill file is ≤ 3KB on disk (NFR1)
- [ ] **BUDG-03**: Per-turn overhead ≤ 1500 tokens baseline (CLAUDE.md only); skill files load on-demand (NFR1)

### Lint / Validator

- [ ] **LINT-01**: Lint script validates BUDG-01 / BUDG-02 file-size budgets and exits non-zero on violation
- [ ] **LINT-02**: Lint script verifies all 10 anti-patterns (A1–A10) are present in CLAUDE.md / skills
- [ ] **LINT-03**: Lint script validates tag-schema strings used in examples (mandatory `proj:` + `type:`, type ∈ enum)

### Validation Harness

- [ ] **VAL-01**: Test harness of 20 case studies covering all 4 modes + edge cases (ambiguous mode, mode switch, stale index, scattergun trap)
- [ ] **VAL-02**: Metrics captured per case — tokens/task, tool calls/task, search drift incidents — sourced from `ctx_stats` + session logs
- [ ] **VAL-03**: Validation report compares baseline (no rules) vs v1 against PRD §10 targets (tokens –30%, tool calls –25%, drift < 1/10, mode mis-classification < 10%)
- [ ] **VAL-04**: Phase 1 smoke test — 5 cases (1 per mode + 1 ambiguous) — passes before promoting CLAUDE.md to v1

### Documentation

- [ ] **DOCS-01**: Standard file layout established — `.claude/CLAUDE.md`, `.claude/skills/<name>/SKILL.md`, `.claude/README.md` (NFR4)
- [ ] **DOCS-02**: `.claude/README.md` explains setup, load order, and override docs
- [ ] **DOCS-03**: Every rule in CLAUDE.md / skill files carries a version tag and a one-line rationale (NFR2)

## v2 Requirements

Deferred to a future milestone — tracked but not in current roadmap.

### Cross-Platform

- **XPLAT-01**: Skill files validated to load on Cursor in addition to Claude Code
- **XPLAT-02**: Skill files validated to load on OpenCode in addition to Claude Code
- **XPLAT-03**: Skill files validated to load on Windsurf in addition to Claude Code

### Open Questions (from PRD §12)

- **OQ-02**: Decision rule for Mode F ↔ M overlap (when feature-dev surfaces a bug mid-task)
- **OQ-03**: Extended tag dimensions — should `urgency:` / `confidence:` be added?
- **OQ-04**: Cross-project memory sharing policy — pattern surfacing across projects on the same team
- **OQ-05**: Skill-file format normalization across Claude Code / Cursor / OpenCode
- **OQ-06**: Telemetry storage decision — is `ctx_insight` enough or do we need a custom logger?
- **OQ-07**: Onboarding bootstrap — should `gitnexus wiki` auto-run on a new repo, or always user-triggered?

### Refinement loop

- **REF-01**: Telemetry pipeline from real-usage runs feeding back into rule updates
- **REF-02**: Periodic rule-rot review tied to MCP stack version bumps

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Auto-install / setup of MCP servers | NG1 — users bring their own stack; we orchestrate, not provision |
| Building new MCP servers | NG2 — pure orchestration project, not a tool factory |
| Removing user override capability | NG3 — human judgment stays primary; rules are guidance |
| Optimizing for stacks other than these 8 MCPs | NG4 — different stacks need their own routing rules |
| Non-coding workflows (writing, general research) | NG5 — coding-agent orchestration only |
| Custom telemetry backend in v1 | Use what ctx_insight + claude-mem already expose; revisit in v2 (OQ-06) |
| Cursor / OpenCode / Windsurf compatibility in v1 | Decision 2026-05-25 — validate one runtime well before going wide |
| Auto re-index of gitnexus / semble | FR5 enforces warn-only; silent indexing is failure mode F5 |

## Traceability

Each requirement maps to exactly one phase. Updated as the roadmap evolves.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CORE-01 | Phase 1 | Pending |
| CORE-02 | Phase 1 | Pending |
| CORE-03 | Phase 1 | Pending |
| CORE-04 | Phase 1 | Pending |
| CORE-05 | Phase 1 | Pending |
| CORE-06 | Phase 1 | Pending |
| OUT-02 | Phase 1 | Pending |
| OUT-03 | Phase 1 | Pending |
| BUDG-01 | Phase 1 | Pending |
| DOCS-01 | Phase 1 | Pending |
| DOCS-03 | Phase 1 | Pending |
| VAL-04 | Phase 1 | Pending |
| MEM-01 | Phase 2 | Pending |
| MEM-02 | Phase 2 | Pending |
| MEM-03 | Phase 2 | Pending |
| MEM-04 | Phase 2 | Pending |
| MEM-05 | Phase 2 | Pending |
| ROUTE-01 | Phase 2 | Pending |
| ROUTE-02 | Phase 2 | Pending |
| ROUTE-03 | Phase 2 | Pending |
| ROUTE-04 | Phase 2 | Pending |
| OUT-01 | Phase 2 | Pending |
| BUDG-02 | Phase 2 | Pending |
| BUDG-03 | Phase 2 | Pending |
| LINT-01 | Phase 3 | Pending |
| LINT-02 | Phase 3 | Pending |
| LINT-03 | Phase 3 | Pending |
| VAL-01 | Phase 4 | Pending |
| VAL-02 | Phase 4 | Pending |
| VAL-03 | Phase 4 | Pending |
| DOCS-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-25*
*Last updated: 2026-05-25 after initial definition*
