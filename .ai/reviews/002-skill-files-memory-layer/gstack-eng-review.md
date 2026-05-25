# GStack Engineering Manager Review

**Feature:** Skill Files & Memory Layer
**Date:** 2026-05-25
**Verdict:** Clear to proceed with implementation checks

## Architecture Review

The proposed artifact layout fits the documentation-first repository:

- `.claude/skills/code-search/SKILL.md`, `.claude/skills/memory-recall/SKILL.md`, `.claude/skills/external-research/SKILL.md` — three on-demand skills following Phase 1's directory pattern.
- `.planning/phases/02-skill-files-memory-layer/02-BASELINE.md` — recorded per-turn overhead measurement procedure and result.
- No changes to `.claude/CLAUDE.md` beyond minor cross-link adjustments; Phase 1's always-loaded core stays intact.

The common 4-section skill shape (Trigger / Routing / Few-shots / Anti-patterns) is the right contract for downstream tooling: Phase 3's lint script can parse the structure deterministically, and Phase 4's validation harness can simulate routing decisions per few-shot.

## Risk Review

- **Budget risk (high, memory-recall):** `memory-recall` carries MEM-01..MEM-05 within 3KB. Plan correctly calls out using a per-mode filter table; implementation must measure bytes early and often. Refusal wording for A4/A7/A8 must be terse.
- **Compression risk (MEM-04 + lookup order):** The two-rule resumption policy is easy to lose under compression. Implementation must keep both stores' ownership *and* the same-/cross-session branch in a single named block. Failure mode: agent applies "ctx-mode first" universally, wasting lookups on cross-session resumes.
- **Anti-pattern dilution risk:** Skill files referencing A-IDs by tag depend on Phase 1's `.claude/CLAUDE.md` carrying the canonical refusal text. If Phase 1's text drifts, skill refusals lose their anchor. Mitigation: each skill must spell out which A-IDs it enforces; lint script in Phase 3 will cross-check.
- **Few-shot drift risk:** Few-shots can slowly drift away from PRD scenarios as the agent edits them. Each few-shot should carry a one-line comment naming the PRD §5.3 row or A-ID it grounds.
- **Baseline measurement risk:** "≤ 1500 tokens" is meaningless without a named tokenizer. `02-BASELINE.md` must record tokenizer + version.

## Verification Requirements

- `wc -c .claude/skills/code-search/SKILL.md .claude/skills/memory-recall/SKILL.md .claude/skills/external-research/SKILL.md` — each ≤ 3072 bytes.
- `memory-recall/SKILL.md` must contain literal substrings: `proj:`, `type:`, all six type values (`decision`, `bug`, `pattern`, `api`, `gotcha`, `todo`), and `git rev-parse --show-toplevel`.
- `memory-recall/SKILL.md` must contain a per-mode filter table with rows for F / O / R / M matching PRD §5.3.
- `memory-recall/SKILL.md` must contain a named block carrying both MEM-04 conflict resolution and the two-rule resumption lookup order; "same-session" and "cross-session" must both appear.
- `code-search/SKILL.md` and `external-research/SKILL.md` must each contain the OUT-01 > 10KB → context-mode rule.
- Each skill must contain an A-anti-pattern enumeration block with at least one quotable refusal line per A-ID enforced.
- `02-BASELINE.md` must name the tokenizer and version used, the procedure to reproduce, and a number ≤ 1500.
- No few-shot may be runnable code without a comment naming the PRD §5.3 row or A-ID it grounds.

## Decision

Proceed. No blocking engineering gaps found. The plan's risks are real but identified and mitigated.
