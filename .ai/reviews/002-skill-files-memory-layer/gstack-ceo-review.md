# GStack CEO Review

**Feature:** Skill Files & Memory Layer
**Date:** 2026-05-25
**Mode:** HOLD SCOPE
**Verdict:** Clear to proceed with cautions

## Product Read

Phase 2 is the load-bearing phase for the project's core value proposition. Phase 1 made the agent *aware* of mode and principles; Phase 2 is what gives the agent *concrete tool choices* in F/O/R/M, and it is the phase the lint script (Phase 3) and validation harness (Phase 4) actually validate against. If these three skill files are wrong or vague, no amount of downstream tooling rescues the project.

The plan is correctly scoped to ship the three SKILL.md files plus the memory rules — no more, no less. Resist the temptation to start mechanizing measurement here; that is Phase 3's job.

## What Must Stay Sharp

- **3KB per skill is a product constraint, not a style preference.** If `memory-recall` blows the budget to carry MEM-01..MEM-05, the agent will not load it on demand and the routing breaks silently. Use the per-mode filter table, not paragraphs.
- **The two-rule resumption lookup order is the highest-risk decision in the phase.** Compressing it incorrectly will make the agent run a wasted ctx-mode query on every cross-session resume, which is the common case. Keep it in a single named block; both stores' ownership and the same-/cross-session branch must survive compression.
- **Anti-pattern enforcement is the agent's refusal mechanism.** Each skill's anti-pattern block must give the agent quotable lines. Without quotable lines, the refusal becomes improvisation, which is what A2 (scattergun) actually looks like in practice.
- **Few-shots are the teaching mechanism.** PRD §5.3 is the floor for grounding, not a stylistic suggestion. Each few-shot should be traceable to a PRD row or anti-pattern ID.

## Scope Challenge

Do not expand Phase 2 to include automated overhead measurement (BUDG-03 mechanization), cross-platform skill format (v2), or new tag dimensions beyond MEM-01. The plan defers these correctly.

## Required Plan Tightening

- Lock the 4-section common shape (Trigger / Routing / Few-shots / Anti-patterns) across all 3 skills before authoring any one of them. Writing one skill's shape and then retrofitting the other two is how inconsistency leaks in.
- Record the BUDG-03 baseline procedure (tokenizer + version) in `02-BASELINE.md`. A number without a reproducible procedure cannot survive Phase 4 audit.
- Make MEM-04 + the two-rule lookup order a single block named `Memory hierarchy` in `memory-recall/SKILL.md`, not two adjacent subsections — splitting them is how the agent applies half the rule.

## Decision

Proceed. No upstream revision required. The plan correctly inherits Phase 1 anti-pattern IDs by reference rather than restating, and correctly defers mechanization to Phase 3.
