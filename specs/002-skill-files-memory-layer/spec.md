# Skill Files & Memory Layer

## Goal

Deliver three on-demand SKILL.md files — `code-search`, `memory-recall`, `external-research` — plus the claude-mem tag taxonomy and the memory hierarchy / conflict-resolution rules. Together they extend the Phase 1 always-loaded routing core with the deeper, load-on-demand guidance the agent needs to route every search and memory call to the cheapest correct tool.

Each skill must be small enough to load on demand without breaking the per-turn token budget, must encode quotable anti-pattern refusals, and must be grounded in real PRD scenarios so the agent learns by example.

## Non-Goals

- Build the lint script that mechanically enforces budgets and anti-pattern coverage; that belongs to Phase 3.
- Build the full validation harness (smoke suites, regression metrics); that belongs to Phase 4.
- Modify the Phase 1 always-loaded `.claude/CLAUDE.md` core except minor cross-link adjustments.
- Add new MCP servers or memory tag dimensions beyond those defined in PRD §5.3 and MEM-01.
- Optimize skill format for non-Claude Code runtimes (Cursor / OpenCode / Windsurf — deferred to v2).

## Acceptance Criteria

1. `.claude/skills/code-search/SKILL.md` exists and is ≤ 3KB on disk.
2. `.claude/skills/memory-recall/SKILL.md` exists and is ≤ 3KB on disk.
3. `.claude/skills/external-research/SKILL.md` exists and is ≤ 3KB on disk.
4. `code-search/SKILL.md` contains a decision matrix routing between semble, gitnexus, and grep (Vercel) with at least 3 few-shot examples grounded in PRD scenarios (ROUTE-01, ROUTE-04).
5. `memory-recall/SKILL.md` documents the mandatory tag taxonomy `proj:<repo>` + `type:(decision|bug|pattern|api|gotcha|todo)` with at least one example per `type`, plus recommended `mode:`, `lib:`, `severity:` with one example each (MEM-01).
6. `memory-recall/SKILL.md` codifies the per-mode search filter strategy verbatim per PRD §5.3: F → `decision|pattern|gotcha`, O → `decision|pattern`, R → cross-project by `lib`, M → `bug|gotcha` (MEM-03).
7. `memory-recall/SKILL.md` states the `proj:` auto-detect-from-cwd / git toplevel rule with refusal wording for unfiltered searches (MEM-02, MEM-05, anti-pattern A8).
8. `memory-recall/SKILL.md` encodes the memory hierarchy and conflict-resolution rule (MEM-04): claude-mem owns cross-session intent (decisions, patterns, gotchas, weeks/months); context-mode owns current-session state; on conflict, mem wins for decisions/patterns/gotchas, ctx-mode wins for live session facts.
9. `memory-recall/SKILL.md` encodes the two-rule lookup order on resumption signals ("continue", "as before", etc.): same-session resume → context-mode first then claude-mem; cross-session resume → claude-mem first (filtered by `proj:` + `type:`), skip context-mode.
10. `external-research/SKILL.md` contains a decision matrix routing between context7, grep (Vercel), and brave with at least 3 few-shot examples grounded in PRD scenarios (ROUTE-03, ROUTE-04).
11. `external-research/SKILL.md` explicitly calls out anti-pattern A3 ("after external API docs, do not re-grep internal code for the same API unless repo usage is the question") with refusal wording.
12. The OUT-01 output-discipline rule (tool calls > 10KB → context-mode) is reflected in `code-search/SKILL.md` and `external-research/SKILL.md` with explicit bypass-documentation guidance.
13. Each of the 3 SKILL.md files explicitly enumerates which A-anti-patterns it enforces, by ID, with refusal-style wording quotable inline.
14. The 3 skill files share a consistent 4-section shape so the agent learns one structure: `Trigger / When to load` → `Routing decision` → `Few-shot examples` → `Anti-patterns enforced`.
15. The baseline per-turn token overhead is measured with only `.claude/CLAUDE.md` loaded (skills not loaded) and recorded in the phase artifacts; the measurement is ≤ 1500 tokens (BUDG-03).
16. None of the 3 skill files duplicate the Phase 1 always-loaded content; they reference Phase 1 anti-pattern IDs by tag rather than restating them.

## Success Criteria

- A reviewer can pick any one of the 3 skills, open it cold, and follow the decision matrix to the right tool for at least one example in each skill without reading any other skill or PRD section.
- The `memory-recall` skill gives the agent a single, copy-pasteable filter expression per mode (F / O / R / M) and per resumption case (same-session / cross-session).
- The agent can quote, verbatim, the refusal line for any anti-pattern A1–A10 referenced by these skills.
- Phase 3's lint script can later parse these files mechanically to enforce BUDG-02 (size), MEM-01 (tag tokens present), and anti-pattern coverage — without rewriting them.
- The baseline overhead measurement (Acceptance #15) is reproducible from the recorded procedure in the phase artifacts.

## Test Strategy

- Confirm each of the 3 SKILL.md files exists and is ≤ 3KB on disk (`wc -c`).
- Inspect each skill for the required structural sections, decision matrix, ≥ 3 few-shot examples, and the A-anti-pattern enforcement block.
- Inspect `memory-recall/SKILL.md` for: mandatory tag tokens (`proj:`, `type:`), all six `type:` values, the per-mode filter table verbatim from PRD §5.3, the `proj:` auto-detect rule, the conflict-resolution rule (MEM-04), and the two-rule resumption lookup order.
- Inspect `code-search/SKILL.md` and `external-research/SKILL.md` for the OUT-01 > 10KB → context-mode rule.
- Inspect each skill for the A-anti-pattern enumeration block (IDs + refusal wording).
- Reproduce the baseline overhead measurement procedure recorded in the phase artifacts and confirm result ≤ 1500 tokens.
- Run or simulate one few-shot from each skill end-to-end (which tool the agent picks, in which order) and confirm it matches the documented routing.

## Behavior-Preservation Rules

- Preserve the documentation-first scope; do not add runtime application code in this phase.
- Do not modify the Phase 1 always-loaded `.claude/CLAUDE.md` beyond minor cross-link adjustments needed by the new skills.
- Keep all durable decisions traceable to `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/phases/02-skill-files-memory-layer/02-CONTEXT.md`, `.planning/phases/02-skill-files-memory-layer/02-CHALLENGE-NOTES.md`, or `docs/prd.md`.
- Do not introduce new MCP tools, memory tag dimensions beyond MEM-01, telemetry backends, or cross-platform guarantees in Phase 2.
- Do not redefine "memory": A4's "memory first" rule applies to **both** claude-mem and context-mode collectively; the lookup order is governed by the two-rule policy in `memory-recall/SKILL.md`.

## User Scenarios

### code-search loaded on a Feature-mode call
Maintainer asks "where do we handle stripe webhook retries?" — agent loads `code-search/SKILL.md`, follows the decision matrix (known symbol → gitnexus first; fuzzy concept → semble; text fallback → grep), and routes accordingly without scattergun search (A2).

### memory-recall loaded on a Maintenance-mode call
Maintainer reports "auth flow regression after deploy" — agent loads `memory-recall/SKILL.md`, runs `claude-mem search proj:<auto> type:bug|gotcha` (per PRD §5.3 M-mode filter), and surfaces relevant prior fixes before re-debugging.

### memory-recall on cross-session resume
User in a brand-new session says "continue where we left off on the auth flow" — agent recognizes cross-session resume (no ctx-mode session state for this project), goes directly to claude-mem with `proj:` + `type:(decision|pattern|todo)`, skipping the ctx-mode lookup.

### memory-recall on same-session resume
User mid-session says "as before" — agent checks ctx-mode first (cheap, holds the in-flight thread), falls back to claude-mem only if ctx-mode lacks the answer.

### external-research loaded on a Research-mode call
Maintainer asks "should we use ky or fetch for this?" — agent loads `external-research/SKILL.md`, follows the matrix (current API docs → context7; real-world usage → grep Vercel; broad context → brave), and does NOT re-grep internal code afterwards (A3).

## Functional Requirements

- FR-001: Ship `code-search/SKILL.md` with decision matrix, ≥ 3 few-shots, A-anti-pattern block.
- FR-002: Ship `memory-recall/SKILL.md` with tag taxonomy, per-mode filter table, conflict-resolution rule, two-rule resumption lookup order, `proj:` auto-detect, and A-anti-pattern block.
- FR-003: Ship `external-research/SKILL.md` with decision matrix, ≥ 3 few-shots, A3 enforcement, A-anti-pattern block.
- FR-004: Each skill ≤ 3KB on disk.
- FR-005: Each skill enumerates the A-anti-patterns it enforces by ID with refusal wording.
- FR-006: `code-search` and `external-research` encode the OUT-01 > 10KB → context-mode rule with bypass guidance.
- FR-007: The 3 skills share a consistent 4-section shape (Trigger / Routing / Few-shots / Anti-patterns).
- FR-008: Record the baseline per-turn overhead with `.claude/CLAUDE.md` only and confirm ≤ 1500 tokens (BUDG-03).
- FR-009: All decisions traceable to canonical refs listed in CONTEXT.md.

## Assumptions

- The 4-section shape is the recommended common structure across all 3 skills; researcher/planner may refine but must keep it consistent.
- Few-shot examples may lightly synthesize beyond verbatim PRD scenarios so long as each example is traceable to a PRD principle or anti-pattern.
- The baseline overhead measurement can be recorded as a documented procedure (e.g., loading `.claude/CLAUDE.md` into a known tokenizer) rather than a runtime probe in Phase 2; Phase 3's lint script will automate.
- Project-scope `proj:` value comes from `git rev-parse --show-toplevel` basename, falling back to cwd basename if not a git repo.
