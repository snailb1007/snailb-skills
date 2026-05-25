# Phase 2: Skill Files & Memory Layer — Discussion Log

**Date:** 2026-05-25
**Mode:** discuss (default), minimum-questioning per user preference carried from Phase 1

## Gray Areas Presented

1. Skill file structure — common 4-section layout vs skill-specific shapes
2. Few-shot grounding — PRD verbatim vs synthesized vs mix
3. Tag taxonomy depth — mandatory-only vs include recommended with examples
4. **Mem vs ctx-mode conflict resolution** ← selected

## Selected Area: Mem vs ctx-mode conflict resolution

### Q1: How should the claude-mem vs context-mode conflict-resolution rule work?
- Options: source-of-truth split (rec.) / recency-based / always claude-mem / ask on conflict
- **Selected:** Source-of-truth split — claude-mem = cross-session intent, context-mode = current session state; mem wins for decisions/patterns, ctx-mode wins for live session facts.

### Q2: Lookup order when user says "continue where we left off"?
- Options: ctx-mode first then mem (rec.) / mem first then ctx-mode / parallel
- **Selected:** ctx-mode first, mem second. Justified by `cheapest first` principle and consistency with anti-pattern A4 (memory-first on resumption signal — ctx-mode is the cheaper memory layer).

### Q3: Continue or proceed to write CONTEXT.md?
- **Selected:** Proceed to CONTEXT.md. Delegate skill structure, few-shot sourcing, and tag taxonomy depth to downstream agents with conservative-defaults guidance.

## Deferred Ideas
- Automated per-turn overhead measurement (Phase 3 lint).
- Cross-platform skill format portability (v2).

## Claude's Discretion (delegated by user)
- Skill file 4-section common layout (Trigger / Routing / Few-shots / Anti-patterns) — proposed but not locked.
- Few-shot examples grounded in PRD §5.3 + mode matrix, light synthesis allowed.
- Tag taxonomy: rigorous on mandatory (proj+type), one example each for recommended (mode/lib/severity).

## Scope Creep
None — discussion stayed within Phase 2 boundary.
