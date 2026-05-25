# Phase 1: Core Rules & Mode Detection - Challenge Notes

**Date:** 2026-05-25
**Stage:** Decision challenge
**Result:** Passed with planning cautions

## Documents Checked

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/phases/01-core-rules-mode-detection/01-CONTEXT.md`
- `docs/prd.md`
- `specs/001-core-rules-mode-detection/spec.md`
- `specs/001-core-rules-mode-detection/plan.md`
- `specs/001-core-rules-mode-detection/tasks.md`

## Challenge Findings

### C-01: Ambiguity Policy Matches Phase 1 Requirements

The selected recommendation, "ask when Feature/Maintenance signals are truly ambiguous," aligns with CORE-02 and FR1. Phase 1 must preserve the stronger rule that ambiguity is not guessed.

**Planning constraint:** `.claude/CLAUDE.md` should make the ask-before-search behavior explicit and short enough to fit the 2KB core budget.

### C-02: Direct Maintenance Switch Needs Narrow Signal Wording

Switching directly to Maintenance on explicit failures is compatible with CORE-05 and the PRD's mode switching goal, but only if the signals are concrete. Broad terms like "issue" or "problem" may be ambiguous in product discussions.

**Recommended wording:** Direct-switch terms should include `bug`, `regression`, `failing test`, `broken command`, `stack trace`, and clear phrases like `does not work`. Otherwise ask one clarifying question.

### C-03: Mode Switch Announcement Should Match Project Language

The project examples use the visible mode-switch phrase `-> chuyen sang mode M` in ASCII-friendly form or the Unicode example from requirements. The final rule should choose one exact phrase and keep it consistent.

**Planning constraint:** Prefer one compact phrase in `.claude/CLAUDE.md`; avoid multiple examples that waste budget.

### C-04: Existing Feature Packet Is Scaffold-Level

The active `spec.md`, `plan.md`, and `tasks.md` are still generic scaffolds. That is acceptable for this stage, but canonical spec and implementation planning must replace placeholder acceptance criteria with the concrete Phase 1 artifacts and checks.

**Planning constraint:** The next stages should refine the feature packet instead of treating the scaffold as sufficient implementation guidance.

## Open Questions For Later Stages

- Should the final `.claude/CLAUDE.md` use the Unicode phrase `→ chuyển sang mode M` exactly as shown in requirements, or use ASCII-only `-> chuyen sang mode M` for file portability?
- Which exact five smoke-test cases should be used for VAL-04? Recommended default: one each for F/O/R/M plus one ambiguous Feature/Maintenance request.

## Revision Decision

No revision to `decision_discovery` is required. The context decisions are coherent with the roadmap, PRD, and requirements.
