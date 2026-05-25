# Phase 2: Skill Files & Memory Layer - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the three on-demand SKILL.md files (`code-search`, `memory-recall`, `external-research`) plus the claude-mem tag taxonomy and memory hierarchy rules. Each skill file must be ≤ 3KB; baseline per-turn overhead (CLAUDE.md only, skills not loaded) must stay ≤ 1500 tokens.

This phase does NOT implement the lint script (Phase 3) or the validation harness (Phase 4). It also does not modify the always-loaded `.claude/CLAUDE.md` core beyond cross-references the skills need.

</domain>

<decisions>
## Implementation Decisions

### Memory Hierarchy & Conflict Resolution
- **D-01 (Source-of-truth split):** `claude-mem` owns cross-session intent — decisions, locked patterns, recurring bugs, gotchas (lifetime: weeks/months). `context-mode` owns current-session state — in-flight work, ephemeral observations, scratch outputs. On conflict about the same fact: `claude-mem` wins for decisions/patterns/gotchas; `context-mode` wins for live session state.
- **D-02 (Lookup order on resumption signal):** Two-rule policy conditioned on session state.
  - **Same-session resume** (ctx-mode has prior turns from this session): check `context-mode` first, fall back to `claude-mem` only if ctx-mode lacks the answer.
  - **Cross-session resume** (new session — ctx-mode is empty/cold for this thread): check `claude-mem` first using `proj:` + `type:(decision|pattern|todo)` filters; ctx-mode lookup is skipped (would be a no-op).
  - The agent decides which case applies by probing ctx-mode session metadata once at turn start; if there is no prior session state for this project, treat as cross-session. This satisfies anti-pattern A4 ("continue/as before → memory first") and the `cheapest first` principle without wasting a lookup on cold sessions.
- **D-03:** The `memory-recall` SKILL.md must encode D-01 and D-02 verbatim as a "Conflict resolution" subsection so downstream agents can quote it when refusing scattergun lookups.

### Downstream Agent Discretion
The user approved minimum questioning (consistent with Phase 1) and explicitly delegated the following to downstream agents, with the constraint that they choose conservative defaults consistent with the PRD and Phase 1 style:
- **Skill file structure** — pick a common shape across all 3 skills (suggested by PRD: Trigger → Decision matrix/routing → Few-shot examples → Anti-patterns), but final layout is researcher/planner's call.
- **Few-shot example sourcing** — ground in PRD scenarios (PRD §5.3 and the mode matrix); synthesizing minor variations is acceptable so long as each example is traceable to a PRD principle or anti-pattern.
- **Tag taxonomy depth** — document mandatory `proj:` + `type:(decision|bug|pattern|api|gotcha|todo)` rigorously per MEM-01; document recommended `mode:`, `lib:`, `severity:` with at least one example each, but do not over-elaborate.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Phase Scope
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria (5 items), dependencies on Phase 1.
- `.planning/REQUIREMENTS.md` — Phase 2 requirements: MEM-01..MEM-05, ROUTE-01..ROUTE-04, OUT-01, BUDG-02, BUDG-03.
- `.planning/PROJECT.md` — Core value, active scope, constraints, key decisions (including `proj:` = auto-detect from cwd / git toplevel).
- `docs/prd.md` — 8-MCP stack definition, mode matrix, anti-pattern list A1–A10, and especially §5.3 (per-mode filter strategy) which drives the memory-recall skill.

### Phase 1 Carry-Forward
- `.claude/CLAUDE.md` — Phase 1 routing core. Skill files must align with the mode names (F/O/R/M), the three root principles (cheapest first, exact > semantic > lexical, local > public), and the A1–A10 anti-pattern refusals.
- `.planning/phases/01-core-rules-mode-detection/01-CONTEXT.md` — Phase 1 decisions on mode boundary behavior (D-01..D-04).

### Feature Packet
- `specs/002-skill-files-memory-layer/spec.md` — to be authored in canonical_spec stage.
- `specs/002-skill-files-memory-layer/plan.md` — to be authored in implementation_plan stage.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.claude/CLAUDE.md` (Phase 1 output) already defines the mode matrix and anti-patterns A1–A10 — the 3 skills should cross-reference these by tag (e.g., "violates A2") rather than re-stating them.
- `docs/prd.md` §5.3 contains the per-mode filter strategy verbatim — copy/condense into `memory-recall` SKILL.md.
- `.planning/PROJECT.md` documents the `proj:` auto-detect rule — the `memory-recall` skill should encode the same rule.

### Established Patterns
- Documentation-first repo. Phase 2 output is markdown skill files, not application code.
- Token budgets are acceptance criteria (≤ 3KB per skill, ≤ 1500 tokens per-turn baseline). Every paragraph must earn its bytes.
- Phase 1 favored conciseness and quotable anti-pattern refusals — Phase 2 should match that voice.

### Integration Points
- `.claude/skills/code-search/SKILL.md`
- `.claude/skills/memory-recall/SKILL.md`
- `.claude/skills/external-research/SKILL.md`
- `.claude/CLAUDE.md` — Phase 1 reference; minor cross-link adjustments only (do not add content).
- Baseline token-overhead measurement must be recorded (Success Criteria #5); Phase 3 lint script will mechanize it, but Phase 2 must capture the number.

</code_context>

<specifics>
## Specific Ideas

- The 3 skill files should be structurally consistent so the agent learns a single "skill shape" once. Researcher should propose a 4-section template (Trigger / Routing decision / Few-shots / Anti-patterns), aligned with the PRD's framing.
- `memory-recall` is the most semantically dense skill — it must carry MEM-01 through MEM-05 inside the 3KB budget. Expect tight prose.
- Each skill should explicitly call out which A-anti-patterns it enforces (e.g., `code-search` enforces A1, A2, A3; `memory-recall` enforces A4, A7, A8; `external-research` enforces A3, A10).

</specifics>

<deferred>
## Deferred Ideas

- Automated measurement of per-turn overhead (BUDG-03) — Phase 2 will record a manual baseline; Phase 3 lint script will automate.
- Skill format portability to Cursor / OpenCode — v2 concern per project constraint.

</deferred>

---

*Phase: 2-Skill Files & Memory Layer*
*Context gathered: 2026-05-25*
