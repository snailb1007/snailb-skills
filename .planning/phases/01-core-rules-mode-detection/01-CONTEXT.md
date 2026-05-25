# Phase 1: Core Rules & Mode Detection - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the always-loaded `.claude/CLAUDE.md` routing core for the god-combo MCP stack. It must fit within the Phase 1 budget, classify every tool-using turn as Feature, Onboarding, Research, or Maintenance, encode the three root routing principles, document override syntax, and make the top anti-pattern refusals quotable.

This phase does not implement the on-demand skill files, lint script, full validation harness, or README beyond any placeholder layout needed for Phase 1.

</domain>

<decisions>
## Implementation Decisions

### Mode Boundary Behavior
- **D-01:** If a request has true Feature/Maintenance ambiguity, the agent must ask one concrete clarifying question before any search or heavy tool call. Do not guess.
- **D-02:** Explicit failure signals switch to Maintenance mode without extra questioning. These include bug, regression, failing test, broken command, stack trace, "does not work", or equivalent wording.
- **D-03:** A mid-conversation mode switch must be announced before the next tool call using the project convention, for example `-> chuyen sang mode M`, then prior-mode search bias is cleared.
- **D-04:** The ambiguity question should name the two likely modes and the practical routing consequence, so the user can answer quickly.

### the agent's Discretion
The user approved recommended defaults and asked for minimum questioning. Downstream agents should choose conservative defaults that preserve Phase 1 requirements and only stop for user input when ambiguity would materially change the generated `.claude/CLAUDE.md`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Phase Scope
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, dependencies, and phase boundaries.
- `.planning/REQUIREMENTS.md` — Requirement IDs mapped to Phase 1, especially CORE-01 through CORE-06, OUT-02, OUT-03, BUDG-01, DOCS-01, DOCS-03, and VAL-04.
- `.planning/PROJECT.md` — Core value, active scope, constraints, and key decisions.
- `docs/prd.md` — Original product rationale, 8-MCP stack definition, mode matrix, anti-pattern list A1-A10, and success metrics.

### Feature Packet
- `specs/001-core-rules-mode-detection/spec.md` — Current canonical feature spec scaffold.
- `specs/001-core-rules-mode-detection/plan.md` — Current implementation plan scaffold.
- `specs/001-core-rules-mode-detection/tasks.md` — Current task scaffold.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Root `CLAUDE.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, and `docs/prd.md` already contain the source language for the routing principles, mode matrix, anti-patterns, and constraints.
- The active feature packet under `specs/001-core-rules-mode-detection/` is scaffold-level and should be refined before execution.

### Established Patterns
- This repository is documentation-first. Phase 1 should produce concise markdown rules and lightweight placeholder layout rather than application code.
- The project treats token budgets as acceptance criteria. The `.claude/CLAUDE.md` core must be written for load-time economy, not exhaustive explanation.

### Integration Points
- `.claude/CLAUDE.md` is the primary Phase 1 artifact.
- `.claude/skills/<name>/SKILL.md` directories may be placeholders in Phase 1, but detailed skill content belongs to Phase 2.
- Phase 1 smoke tests should exercise the generated `.claude/CLAUDE.md` rules before promoting it as v1.

</code_context>

<specifics>
## Specific Ideas

The mode-boundary rule should optimize for low user friction while preserving FR1: ask only on real ambiguity, but switch directly when the user provides explicit Maintenance signals.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Core Rules & Mode Detection*
*Context gathered: 2026-05-25*
