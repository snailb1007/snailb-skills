# Implementation Plan: Core Rules & Mode Detection

**Date**: 2026-05-25 | **Spec**: [spec.md](./spec.md)

## Context

Phase 1 produces the always-loaded routing core for the god-combo MCP stack. The deliverable is documentation and lightweight validation, not runtime application code.

Primary inputs:

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/phases/01-core-rules-mode-detection/01-CONTEXT.md`
- `.planning/phases/01-core-rules-mode-detection/01-CHALLENGE-NOTES.md`
- `docs/prd.md`

## Proposed Changes

1. Create `.claude/CLAUDE.md` as the Phase 1 always-loaded core.
2. Keep `.claude/CLAUDE.md` at or below 2KB on disk.
3. Encode the three root principles verbatim, each with a one-line rationale:
   - cheapest first
   - exact > semantic > lexical
   - local > public
4. Add Step 0 mode detection for F/O/R/M before the first important tool call in each user turn.
5. Add a compact mode routing table covering signals, default heavy tools, and default light tools for:
   - Feature
   - Onboarding
   - Research
   - Maintenance
6. Implement the Phase 1 mode-boundary decision:
   - ask one clarifying question on true ambiguity
   - route explicit failure signals directly to Maintenance
   - announce mode switches and clear prior-mode search bias
7. Add refusal-style anti-pattern lines for A1-A10 from `docs/prd.md`.
8. Document override syntax:
   - `--force-tool=<name>`
   - `--mode=<F|O|R|M>`
9. Add explicit stale-index and search-drift rules.
10. Create placeholder `.claude/skills/` directories for Phase 2 if needed, without adding detailed Phase 2 skill content.
11. Define five Phase 1 smoke cases in a lightweight local test artifact or checklist:
    - Feature
    - Onboarding
    - Research
    - Maintenance
    - ambiguous Feature/Maintenance

## Implementation Notes

- Prefer one compact mode-switch phrase in the final rules to avoid budget waste.
- Use the Unicode phrase from requirements only if byte budget allows; otherwise use a consistent ASCII equivalent.
- Keep detailed examples out of `.claude/CLAUDE.md`; detailed few-shot examples belong to Phase 2 skill files.
- Treat the root `CLAUDE.md` and `docs/prd.md` as source material, not as final load-budget-compliant output.

## Verification Plan

1. Run `wc -c .claude/CLAUDE.md` and confirm the file is at or below 2048 bytes.
2. Inspect `.claude/CLAUDE.md` for:
   - all three root principles
   - F/O/R/M mode detection
   - all anti-pattern IDs A1-A10
   - `--force-tool=<name>`
   - `--mode=<F|O|R|M>`
   - stale-index warning
   - two-search drift stop rule
3. Run the five smoke cases manually or via a small script/checklist and record pass/fail:
   - Feature request routes to Feature mode.
   - New-repo architecture question routes to Onboarding mode.
   - Library or approach comparison routes to Research mode.
   - Bug/regression/failing command routes to Maintenance mode.
   - Ambiguous Feature/Maintenance request asks one clarifying question before tool use.
4. Verify the phase does not add runtime application code or detailed Phase 2 skill behavior.
5. Re-run the spec quality checklist in `checklists/requirements.md`.

## Risks

- The 2KB core budget may force overly terse wording. Mitigation: keep examples and detailed matrices in later skill files.
- Anti-pattern wording may become too vague to quote. Mitigation: keep each A1-A10 line short but refusal-shaped.
- Feature/Maintenance overlap may still be fuzzy. Mitigation: encode explicit failure signals and ask on remaining ambiguity.

## Generated Artifacts

- `.claude/CLAUDE.md`
- optional `.claude/skills/<name>/` placeholders
- Phase 1 smoke-test checklist or equivalent validation notes
