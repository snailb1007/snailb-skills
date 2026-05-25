# Implementation Plan: Skill Files & Memory Layer

**Date**: 2026-05-25 | **Spec**: [spec.md](./spec.md)

## Context

Phase 2 produces three on-demand SKILL.md files plus the claude-mem tag taxonomy and memory hierarchy rules. The deliverable is documentation and a recorded baseline measurement — no runtime application code.

Primary inputs:

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md` (MEM-01..MEM-05, ROUTE-01..ROUTE-04, OUT-01, BUDG-02, BUDG-03)
- `.planning/phases/02-skill-files-memory-layer/02-CONTEXT.md`
- `.planning/phases/02-skill-files-memory-layer/02-CHALLENGE-NOTES.md`
- `.claude/CLAUDE.md` (Phase 1 routing core — referenced, not modified)
- `docs/prd.md` (especially §5.3 per-mode filter strategy and anti-patterns A1–A10)

## Proposed Changes

1. Establish a common 4-section skill shape used by all 3 SKILL.md files:
   - **Trigger / When to load** — what user signals or modes cause the agent to load this skill.
   - **Routing decision** — compact decision matrix (≤ ~10 rows) picking among the tools this skill governs.
   - **Few-shot examples** — ≥ 3 PRD-grounded examples showing input → decision → tool call shape.
   - **Anti-patterns enforced** — explicit list of A-IDs the skill refuses, with quotable refusal lines.
2. Create `.claude/skills/code-search/SKILL.md`:
   - Decision matrix: known symbol → gitnexus; fuzzy concept → semble; text fallback → grep (Vercel).
   - ≥ 3 few-shots grounded in PRD F-mode scenarios.
   - Encode OUT-01: tool calls > 10KB → context-mode, with bypass-documentation guidance.
   - Enforce anti-patterns A1, A2, A3, A10.
   - Size ≤ 3KB on disk.
3. Create `.claude/skills/memory-recall/SKILL.md`:
   - Mandatory tag taxonomy `proj:<repo>` + `type:(decision|bug|pattern|api|gotcha|todo)` with one example per `type` (MEM-01).
   - Recommended tags `mode:`, `lib:`, `severity:` with one example each.
   - Per-mode filter table verbatim per PRD §5.3 (F → decision|pattern|gotcha; O → decision|pattern; R → cross-project by `lib`; M → bug|gotcha) (MEM-03).
   - `proj:` auto-detect rule: `git rev-parse --show-toplevel` basename, fallback to cwd basename (MEM-05).
   - Refusal wording for unfiltered searches (MEM-02, A8).
   - Memory hierarchy and conflict-resolution rule (MEM-04): claude-mem = cross-session intent; context-mode = current-session state; on conflict mem wins for decisions/patterns/gotchas, ctx-mode wins for live session facts.
   - Two-rule resumption lookup order: same-session → ctx-mode first; cross-session → claude-mem first (skip ctx-mode).
   - Enforce anti-patterns A4, A7, A8, A9.
   - Size ≤ 3KB on disk.
4. Create `.claude/skills/external-research/SKILL.md`:
   - Decision matrix: current API docs → context7; real-world usage examples → grep (Vercel); broad context / non-API research → brave.
   - ≥ 3 few-shots grounded in PRD R-mode scenarios.
   - Encode OUT-01: tool calls > 10KB → context-mode, with bypass-documentation guidance.
   - Explicit A3 enforcement with refusal wording ("after external API docs, do not re-grep internal code for the same API unless repo usage is the question").
   - Enforce anti-patterns A3, A6, A10.
   - Size ≤ 3KB on disk.
5. Record the baseline per-turn token overhead with only `.claude/CLAUDE.md` loaded (skills not loaded) using a documented tokenizer procedure; store the number and procedure in `.planning/phases/02-skill-files-memory-layer/02-BASELINE.md`. Confirm ≤ 1500 tokens (BUDG-03).
6. Do not modify `.claude/CLAUDE.md` content; if any cross-link adjustment is strictly required (e.g., naming a skill by its directory), apply the minimal possible edit and keep the file ≤ 2KB.

## Implementation Notes

- The 3 skills must share visible structure; the agent learns one skill shape once. Use the same section headings in the same order across all 3.
- Each skill should reference Phase 1 anti-pattern IDs by tag (e.g., "violates A2") rather than restating the anti-pattern text — Phase 1's `.claude/CLAUDE.md` is the source of truth for A1–A10.
- `memory-recall` is the densest skill. Expect compact prose; favor a table for the per-mode filter strategy over paragraphs.
- Few-shots should show enough of the tool call shape that the agent can adapt them (e.g., `claude-mem search proj:snailb-skills type:bug "auth flow"`), but they are not runnable test fixtures.
- The OUT-01 rule must be stated in the same words across `code-search` and `external-research` so the agent treats it as a single rule.
- Treat the conflict-resolution rule and two-rule lookup order as a single block in `memory-recall` to avoid the agent applying half of it.

## Verification Plan

1. `wc -c .claude/skills/code-search/SKILL.md .claude/skills/memory-recall/SKILL.md .claude/skills/external-research/SKILL.md` — each ≤ 3072 bytes.
2. Inspect each SKILL.md for the four required section headings in order: Trigger / Routing / Few-shots / Anti-patterns.
3. Inspect each SKILL.md for ≥ 3 few-shot examples.
4. Inspect each SKILL.md for the A-anti-pattern enumeration block with at least one quotable refusal line per A-ID enforced.
5. Inspect `code-search/SKILL.md` and `external-research/SKILL.md` for the OUT-01 > 10KB → context-mode rule.
6. Inspect `memory-recall/SKILL.md` for:
   - mandatory tokens `proj:` and `type:`
   - all six `type:` values present at least once
   - PRD §5.3 per-mode filter table (F / O / R / M rows)
   - `proj:` auto-detect rule mentioning `git rev-parse --show-toplevel`
   - MEM-04 conflict-resolution block
   - two-rule resumption lookup order naming both "same-session" and "cross-session"
7. Reproduce the baseline overhead measurement procedure from `02-BASELINE.md` and confirm result ≤ 1500 tokens.
8. Manually walk one few-shot from each skill end-to-end against the routing matrix and confirm the documented tool choice matches.
9. Run `adp validate-spec` (if available) on the feature packet.
10. Re-run the spec quality checklist in `checklists/requirements.md`.

## Risks

- 3KB per skill is tight, especially for `memory-recall` which carries MEM-01..MEM-05. Mitigation: use a per-mode filter table instead of prose; reference A-IDs by tag; let Phase 1 own anti-pattern text.
- Few-shots can drift away from PRD scenarios. Mitigation: link each few-shot to a specific PRD §5.3 row or anti-pattern ID in a comment line.
- The conflict-resolution + two-rule lookup order can be compressed too aggressively and lose meaning. Mitigation: keep it in a single named block, verify both stores' ownership and the same-/cross-session branch survive the compression.
- Baseline overhead measurement procedure may not be reproducible across tokenizers. Mitigation: name the exact tokenizer and version in `02-BASELINE.md`.

## Generated Artifacts

- `.claude/skills/code-search/SKILL.md`
- `.claude/skills/memory-recall/SKILL.md`
- `.claude/skills/external-research/SKILL.md`
- `.planning/phases/02-skill-files-memory-layer/02-BASELINE.md`
- updated `specs/002-skill-files-memory-layer/tasks.md`
