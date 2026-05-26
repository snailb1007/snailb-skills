# Tasks: Core Rules & Mode Detection

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Summary

Total tasks: 19

- Setup: 3
- Foundational: 4
- US1 Feature routing core: 5
- US2 Safety/refusal behavior: 4
- Polish and verification: 3

## User Stories

- **US1:** As a coding agent user, I want the always-loaded core to classify F/O/R/M before tool use so routing starts from the right mode.
- **US2:** As a coding agent user, I want the core to refuse known bad routing patterns so it avoids costly search drift, scattergun calls, and silent stale-index work.

## Phase 1: Setup

- [x] T001 Create `.claude/` directory for the Phase 1 Claude Code rules layout.
- [x] T002 Create `.claude/skills/` placeholder directory for Phase 2 skill files.
- [x] T003 Review source requirements in `.planning/REQUIREMENTS.md`, `.planning/phases/01-core-rules-mode-detection/01-CONTEXT.md`, `.planning/phases/01-core-rules-mode-detection/01-CHALLENGE-NOTES.md`, and `docs/prd.md`.

## Phase 2: Foundational

- [x] T004 Draft `.claude/CLAUDE.md` with the three root principles and one-line rationales.
- [x] T005 Add byte-budget check notes for `.claude/CLAUDE.md` in `specs/001-core-rules-mode-detection/tasks.md` or the smoke-test artifact.
- [x] T006 Decide one exact mode-switch phrase and use it consistently in `.claude/CLAUDE.md`.
- [x] T007 Define the five Phase 1 smoke cases in `specs/001-core-rules-mode-detection/smoke-tests.md`.

## Phase 3: User Story 1 - Mode Detection Core

**Goal:** The core classifies Feature, Onboarding, Research, or Maintenance before the first important tool call.

**Independent Test:** The Feature, Onboarding, Research, Maintenance, and ambiguous smoke cases each produce the expected mode behavior.

- [x] T008 [US1] Add Step 0 mode detection rules to `.claude/CLAUDE.md`.
- [x] T009 [US1] Add compact F/O/R/M signal and routing table to `.claude/CLAUDE.md`.
- [x] T010 [US1] Add ambiguous-mode rule to `.claude/CLAUDE.md` requiring one clarifying question before tool use.
- [x] T011 [US1] Add explicit Maintenance failure-signal routing to `.claude/CLAUDE.md`.
- [x] T012 [US1] Add mode-switch announcement and search-bias reset rule to `.claude/CLAUDE.md`.

## Phase 4: User Story 2 - Routing Refusals And Overrides

**Goal:** The core refuses known bad routing patterns and documents deliberate user overrides.

**Independent Test:** The stale-index, search-drift, override, and anti-pattern checks can be verified by inspecting `.claude/CLAUDE.md` and the smoke-test artifact.

- [x] T013 [US2] Add refusal-style anti-pattern lines A1-A10 to `.claude/CLAUDE.md`.
- [x] T014 [US2] Add stale gitnexus/semble index warning rule to `.claude/CLAUDE.md`.
- [x] T015 [US2] Add two-failed-search stop rule to `.claude/CLAUDE.md`.
- [x] T016 [US2] Add override syntax and override logging expectation to `.claude/CLAUDE.md`.

## Final Phase: Polish And Cross-Cutting Verification

- [x] T017 Run `wc -c .claude/CLAUDE.md` and confirm the file is no larger than 2048 bytes.
- [x] T018 Run the five cases in `specs/001-core-rules-mode-detection/smoke-tests.md` and record the result in that file.
- [x] T019 Re-check `specs/001-core-rules-mode-detection/checklists/requirements.md` after implementation and update any notes if validation changes.

## Dependencies

- T001-T003 must complete before writing `.claude/CLAUDE.md`.
- T004-T007 must complete before user-story implementation tasks.
- US1 tasks T008-T012 should complete before US2 tasks T013-T016 because refusal rules depend on the mode-routing baseline.
- T017-T019 are final verification tasks.

## Parallel Opportunities

- T001 and T002 can run in parallel.
- T007 can run in parallel with T008-T016 after T004 establishes the core rule language.
- T013-T016 can be drafted in parallel if each task owns a distinct section of `.claude/CLAUDE.md`, but final byte-budget cleanup must happen serially.

## MVP Scope

Complete T001-T012 and T017 to validate the mode-detection core first. Then add refusals and overrides through T013-T016.

## Vertical Issue Slices

### Issue 1: Establish Phase 1 Rules Layout

**Tasks:** T001, T002, T003
**Outcome:** The repository has the `.claude/` layout and the implementer has reviewed the canonical Phase 1 inputs.
**Independent validation:** `.claude/` exists and source requirements have been checked against the plan.

### Issue 2: Ship Minimal Mode Detection Core

**Tasks:** T004, T006, T008, T009, T010, T011, T012, T017
**Outcome:** `.claude/CLAUDE.md` classifies F/O/R/M, handles Feature/Maintenance ambiguity, announces mode switches, and remains within 2KB.
**Independent validation:** Byte count passes and the F/O/R/M plus ambiguity smoke cases match expected behavior.

### Issue 3: Add Refusals, Overrides, And Drift Guards

**Tasks:** T013, T014, T015, T016
**Outcome:** `.claude/CLAUDE.md` refuses A1-A10, documents overrides, warns on stale indexes, and stops after two failed searches.
**Independent validation:** Inspection confirms A1-A10, override syntax, stale-index warning, and search-drift stop rule are present.

### Issue 4: Record Phase 1 Smoke Results

**Tasks:** T005, T007, T018, T019
**Outcome:** Smoke cases and checklist results are recorded for handoff to later validation work.
**Independent validation:** `specs/001-core-rules-mode-detection/smoke-tests.md` exists with pass/fail notes, and `checklists/requirements.md` remains complete.
