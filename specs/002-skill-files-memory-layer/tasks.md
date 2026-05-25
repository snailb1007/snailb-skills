# Tasks: Skill Files & Memory Layer

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Reviews absorbed**: [.ai/reviews/002-skill-files-memory-layer/gstack-ceo-review.md](../../.ai/reviews/002-skill-files-memory-layer/gstack-ceo-review.md), [.ai/reviews/002-skill-files-memory-layer/gstack-eng-review.md](../../.ai/reviews/002-skill-files-memory-layer/gstack-eng-review.md)

## Summary

Total tasks: 22

- Setup: 3
- Foundational: 4
- US1 Code-search routing: 4
- US2 Memory-recall + hierarchy: 6
- US3 External-research routing: 3
- Polish and verification: 2

## User Stories

- **US1:** As a coding agent user, I want a `code-search` skill that routes between semble, gitnexus, and grep so that the agent picks the cheapest correct local-search tool every time.
- **US2:** As a coding agent user, I want a `memory-recall` skill that encodes the tag taxonomy, per-mode filter strategy, `proj:` auto-detect, conflict-resolution rule, and two-rule resumption lookup order so that the agent uses cross-session memory correctly and refuses unfiltered searches.
- **US3:** As a coding agent user, I want an `external-research` skill that routes between context7, grep (Vercel), and brave so that the agent prefers current external docs over stale internal grepping (A3).

## Review Findings Absorbed

From CEO review:
- Lock the 4-section common shape before authoring any one skill (CEO §"Required Plan Tightening").
- Record BUDG-03 baseline tokenizer + version in `02-BASELINE.md`.
- Make MEM-04 + two-rule lookup order a single named block (`Memory hierarchy`) in `memory-recall/SKILL.md`.

From Eng review:
- Each skill must contain explicit substring markers (proj:, type:, all six type values, `git rev-parse --show-toplevel`, F/O/R/M filter rows, "same-session" + "cross-session", > 10KB → context-mode, A-IDs).
- Each few-shot must carry a one-line PRD §5.3 row or A-ID grounding comment.
- `02-BASELINE.md` must name tokenizer + version and a reproducible procedure.

## Phase 1: Setup

- [ ] T001 Verify `.claude/skills/` directory exists from Phase 1; create if missing.
- [ ] T002 Create directories `.claude/skills/code-search/`, `.claude/skills/memory-recall/`, `.claude/skills/external-research/`.
- [ ] T003 Review canonical refs in `.planning/REQUIREMENTS.md`, `.planning/phases/02-skill-files-memory-layer/02-CONTEXT.md`, `.planning/phases/02-skill-files-memory-layer/02-CHALLENGE-NOTES.md`, and `docs/prd.md` (especially §5.3 and A1–A10).

## Phase 2: Foundational

- [ ] T004 Lock the common 4-section skill shape (Trigger / Routing / Few-shots / Anti-patterns) as a frozen template in a working note before authoring any one skill.
- [ ] T005 Lock the mapping of which A-anti-patterns each skill enforces: `code-search` → A1, A2, A3, A10; `memory-recall` → A4, A7, A8, A9; `external-research` → A3, A6, A10.
- [ ] T006 Decide the exact wording of the OUT-01 > 10KB → context-mode rule once; reuse verbatim across `code-search` and `external-research`.
- [ ] T007 Decide the exact wording of MEM-04 conflict resolution + the two-rule resumption lookup order; treat as one named block `Memory hierarchy`.

## Phase 3: User Story 1 — Code-search Skill

**Goal:** The agent loads `code-search/SKILL.md` on Feature-mode searches and picks the cheapest-correct tool deterministically.

**Independent Test:** The skill file ≤ 3KB; contains 4 sections in order; contains ≥ 3 few-shots each with a PRD §5.3 / A-ID grounding comment; contains the OUT-01 rule verbatim from T006; enumerates A1, A2, A3, A10 with refusal lines.

- [ ] T008 [US1] Author `.claude/skills/code-search/SKILL.md` Trigger section.
- [ ] T009 [US1] Author the routing decision matrix: known symbol → gitnexus; fuzzy concept → semble; text fallback → grep (Vercel).
- [ ] T010 [US1] Author ≥ 3 few-shots, each with a one-line PRD-grounding comment.
- [ ] T011 [US1] Author the anti-pattern block (A1, A2, A3, A10) with quotable refusal lines + the OUT-01 rule from T006.

## Phase 4: User Story 2 — Memory-recall Skill + Hierarchy

**Goal:** The agent uses claude-mem correctly per mode, auto-detects `proj:`, refuses unfiltered searches, and applies the right lookup order on resumption signals.

**Independent Test:** The skill file ≤ 3KB; contains 4 sections in order; contains the mandatory tag taxonomy with one example per `type`; contains the per-mode filter table verbatim from PRD §5.3 with F/O/R/M rows; contains the `Memory hierarchy` block from T007 with both "same-session" and "cross-session" present; enumerates A4, A7, A8, A9 with refusal lines.

- [ ] T012 [US2] Author `.claude/skills/memory-recall/SKILL.md` Trigger section.
- [ ] T013 [US2] Author the mandatory tag taxonomy: `proj:<repo>` + `type:(decision|bug|pattern|api|gotcha|todo)` with one example per `type` value (MEM-01).
- [ ] T014 [US2] Author the recommended tag block (mode:, lib:, severity:) with one example each.
- [ ] T015 [US2] Author the per-mode filter table (F/O/R/M) verbatim per PRD §5.3 (MEM-03).
- [ ] T016 [US2] Author the `proj:` auto-detect rule (`git rev-parse --show-toplevel` basename, fallback to cwd basename) and refusal wording for unfiltered searches (MEM-02, MEM-05, A8).
- [ ] T017 [US2] Author the `Memory hierarchy` named block carrying MEM-04 + two-rule resumption lookup order from T007 (must contain both "same-session" and "cross-session"); add A4/A7/A9 anti-pattern enumeration with refusal lines.

## Phase 5: User Story 3 — External-research Skill

**Goal:** The agent loads `external-research/SKILL.md` on Research-mode questions and prefers current external docs over re-grepping internal code (A3).

**Independent Test:** The skill file ≤ 3KB; contains 4 sections in order; contains ≥ 3 few-shots each with a PRD-grounding comment; contains the OUT-01 rule verbatim from T006; enumerates A3, A6, A10 with refusal lines (A3 spelled out with explicit "do not re-grep internal code" wording).

- [ ] T018 [US3] Author `.claude/skills/external-research/SKILL.md` Trigger section.
- [ ] T019 [US3] Author the routing matrix (context7 → API docs; grep Vercel → usage examples; brave → broad / non-API research) and ≥ 3 few-shots with grounding comments.
- [ ] T020 [US3] Author the anti-pattern block (A3, A6, A10) with quotable refusal lines + the OUT-01 rule from T006.

## Final Phase: Polish And Cross-Cutting Verification

- [ ] T021 `wc -c` on all three SKILL.md files; confirm each ≤ 3072 bytes. If over, compress the densest section first (memory-recall's filter table → keep as table, not prose).
- [ ] T022 Record the baseline per-turn overhead in `.planning/phases/02-skill-files-memory-layer/02-BASELINE.md`: name the tokenizer + version, the procedure, the measurement with only `.claude/CLAUDE.md` loaded, and confirm ≤ 1500 tokens (BUDG-03).

## Dependencies

- T001–T003 must complete before authoring any skill.
- T004–T007 must complete before T008–T020 (foundational decisions feed every skill).
- T007 must complete before T017 (the Memory hierarchy block depends on the locked wording).
- T006 must complete before T011 and T020 (OUT-01 rule reused verbatim).
- T021 and T022 are final verification.

## Parallel Opportunities

- T001 and T002 can run in parallel.
- US1 (T008–T011), US2 (T012–T017), US3 (T018–T020) can be drafted in parallel after T004–T007 land, but each must respect the locked common shape and locked wordings.
- T022 (baseline measurement) can run in parallel with T021 (size check) — they touch different artifacts.

## MVP Scope

Complete T001–T017 plus T021 to ship the two highest-value skills (code-search + memory-recall) inside budget. T018–T020 (external-research) and T022 (baseline) can land in the same phase but are lower risk to slip.

## Vertical Issue Slices

### Issue 1: Establish Phase 2 Skill Layout and Locked Wordings

**Tasks:** T001, T002, T003, T004, T005, T006, T007
**Outcome:** The skill directories exist, the common 4-section shape is frozen, the A-ID-per-skill mapping is locked, and the OUT-01 + Memory hierarchy wordings are locked.
**Independent validation:** Working note records all four locks; downstream skill authoring can reuse them verbatim.

### Issue 2: Ship Code-search Skill

**Tasks:** T008, T009, T010, T011, T021 (partial)
**Outcome:** `.claude/skills/code-search/SKILL.md` exists, ≤ 3KB, 4-section shape, ≥ 3 grounded few-shots, OUT-01 rule, A1/A2/A3/A10 refusals.
**Independent validation:** `wc -c` ≤ 3072; substring checks pass.

### Issue 3: Ship Memory-recall Skill + Hierarchy

**Tasks:** T012, T013, T014, T015, T016, T017, T021 (partial)
**Outcome:** `.claude/skills/memory-recall/SKILL.md` exists, ≤ 3KB, full tag taxonomy, per-mode filter table, `proj:` auto-detect, `Memory hierarchy` block with two-rule lookup order, A4/A7/A8/A9 refusals.
**Independent validation:** `wc -c` ≤ 3072; substring checks (proj:, type:, all six type values, F/O/R/M rows, same-session, cross-session, git rev-parse --show-toplevel) all present.

### Issue 4: Ship External-research Skill

**Tasks:** T018, T019, T020, T021 (partial)
**Outcome:** `.claude/skills/external-research/SKILL.md` exists, ≤ 3KB, 4-section shape, ≥ 3 grounded few-shots, OUT-01 rule, A3/A6/A10 refusals with A3 spelled out.
**Independent validation:** `wc -c` ≤ 3072; substring checks pass.

### Issue 5: Record Baseline Overhead

**Tasks:** T022
**Outcome:** `02-BASELINE.md` exists, names tokenizer + version, records procedure and number ≤ 1500 tokens.
**Independent validation:** A second reader can rerun the procedure and reproduce the number.
