# Core Rules & Mode Detection

## Goal

Create the Phase 1 routing core for the god-combo MCP stack: an always-loaded `.claude/CLAUDE.md` that makes the agent classify each tool-using turn as Feature, Onboarding, Research, or Maintenance before its first important tool call, then choose the cheapest correct routing path.

The core must be small enough to stay always loaded, explicit enough to refuse known tool-routing anti-patterns, and clear enough that later skill files can extend it without changing the Phase 1 contract.

## Non-Goals

- Implement the detailed `code-search`, `memory-recall`, or `external-research` skill files; those belong to Phase 2.
- Build the lint script or complete validation harness; those belong to later phases.
- Install, provision, or re-index MCP servers.
- Optimize for non-Claude Code runtimes in v1.
- Cover non-coding workflows outside coding-agent orchestration.

## Acceptance Criteria

1. `.claude/CLAUDE.md` exists and is no larger than 2KB on disk.
2. `.claude/CLAUDE.md` states the three root principles verbatim: cheapest first, exact > semantic > lexical, and local > public, each with a one-line rationale.
3. `.claude/CLAUDE.md` defines Step 0 mode detection for F/O/R/M before the first important tool call in a turn.
4. If a request is truly ambiguous, the agent asks one concrete clarifying question before searching or using a heavy tool.
5. Explicit failure signals such as `bug`, `regression`, `failing test`, `broken command`, `stack trace`, or `does not work` route directly to Maintenance mode.
6. Mid-conversation mode switches are announced before the next tool call and prior-mode search bias is cleared.
7. The mode routing table covers signals, default heavy tools, and default light tools for Feature, Onboarding, Research, and Maintenance.
8. Anti-patterns A1-A10 from `docs/prd.md` are present with refusal-style wording the agent can quote when rejecting a bad route.
9. Override syntax is documented: `--force-tool=<name>` bypasses routing and `--mode=<F|O|R|M>` fixes the mode; overrides must be logged for review.
10. Stale gitnexus/semble index handling is explicit: warn the user and do not re-index silently.
11. Search drift handling is explicit: after two consecutive empty or irrelevant searches, stop and ask the user; do not run a third reformulation.
12. Standard layout exists at `.claude/CLAUDE.md` and `.claude/skills/<name>/SKILL.md` placeholders as needed for later phases.
13. A five-case smoke test is defined and passes: one Feature case, one Onboarding case, one Research case, one Maintenance case, and one ambiguous Feature/Maintenance case.

## Success Criteria

- The always-loaded routing core remains at or below 2KB while preserving every Phase 1 acceptance criterion.
- A reviewer can identify the expected mode and first routing choice for all five smoke cases without reading Phase 2 skill files.
- The ambiguous smoke case produces exactly one clarifying question before any tool call.
- The Maintenance smoke case demonstrates that explicit failure wording overrides prior Feature-mode bias.
- The anti-pattern list gives the agent quotable refusal language for all ten PRD anti-pattern IDs.

## Test Strategy

- Check `.claude/CLAUDE.md` byte size is at or below 2KB.
- Inspect `.claude/CLAUDE.md` for the three root principles, F/O/R/M routing table, override syntax, stale-index warning, search-drift stop rule, and anti-pattern IDs A1-A10.
- Run or simulate the five Phase 1 smoke cases and confirm each produces the expected mode and first routing choice.
- Confirm the ambiguous smoke case asks one clarifying question and does not call a tool first.
- Confirm explicit failure wording routes to Maintenance mode and emits a mode-switch announcement when switching from another mode.

## Behavior-Preservation Rules

- Preserve the repository's documentation-first scope; do not add runtime application code in this phase.
- Keep Phase 2+ content out of the always-loaded core except concise references or placeholders needed for routing.
- Keep all durable decisions traceable to `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/phases/01-core-rules-mode-detection/01-CONTEXT.md`, `.planning/phases/01-core-rules-mode-detection/01-CHALLENGE-NOTES.md`, or `docs/prd.md`.
- Do not silently introduce new MCP tools, memory tag dimensions, telemetry backends, or cross-platform guarantees in Phase 1.

## User Scenarios

### Feature Mode

A maintainer asks for a change in a known code area. The agent emits Feature mode, checks relevant local/project context before public search, and avoids scattergun search.

### Onboarding Mode

A maintainer asks what an unfamiliar repo does. The agent emits Onboarding mode and favors structural/local understanding without starting from long-term memory for a first-time repo.

### Research Mode

A maintainer asks whether to use a library or approach. The agent emits Research mode and favors current external documentation and public examples, using local code only when a prototype or repo constraint is relevant.

### Maintenance Mode

A maintainer reports a bug, regression, failing test, broken command, or stack trace. The agent emits Maintenance mode, checks relevant bug/gotcha memory and structural code context, and does not continue with Feature-mode search bias.

### Ambiguous Feature/Maintenance

A maintainer asks to "fix the auth flow" without enough context to know whether this is a new feature or a regression. The agent asks one clarifying question before using tools.

## Functional Requirements

- FR-001: The routing core must classify each tool-using turn as F, O, R, or M before the first important tool call.
- FR-002: The routing core must ask one clarifying question when mode signals are ambiguous and no reasonable default exists.
- FR-003: The routing core must directly classify explicit failure signals as Maintenance mode.
- FR-004: The routing core must announce mode switches and clear prior-mode search bias before the next tool call.
- FR-005: The routing core must encode the three root principles and the per-mode routing matrix from the PRD.
- FR-006: The routing core must include refusal wording for anti-patterns A1-A10.
- FR-007: The routing core must document override syntax and override logging expectations.
- FR-008: The routing core must warn on stale gitnexus/semble indexes and avoid silent re-indexing.
- FR-009: The routing core must stop after two failed searches and ask the user.
- FR-010: The routing core must stay within the Phase 1 load budget.

## Assumptions

- The exact mode-switch phrase may be ASCII-only if needed for consistency, but it must be a single compact phrase used consistently.
- Placeholder skill directories are acceptable in Phase 1 if detailed skill content remains deferred to Phase 2.
- Smoke tests can be implemented as documented cases or lightweight scripted checks, as long as they deterministically validate the Phase 1 behavior.
