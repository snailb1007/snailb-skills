# Phase 2: Skill Files & Memory Layer — Challenge Notes

**Date:** 2026-05-25
**Mode:** grill-with-docs, applying user policy: accept recommended defaults; only stop on irreducible trade-offs.

## Decisions Stress-Tested

### D-01 — Source-of-truth split (mem = intent, ctx-mode = session state)
**Challenge:** Does this contradict any Phase 1 decision or PRD rule?
**Finding:** No conflict. Phase 1 (`.claude/CLAUDE.md`) does not define memory layer semantics; PRD §5.3 and `.planning/PROJECT.md` treat claude-mem as the cross-session memory and context-mode as session-scoped output discipline. The split is consistent.
**Resolution:** Keep D-01 as written.

### D-02 — Lookup order on "continue / as before" signal
**Challenge:** Original wording said "ctx-mode first, then claude-mem" universally. But anti-pattern A4 (`.claude/CLAUDE.md:21`) was written assuming "memory = claude-mem" because context-mode is session-scoped and empty on cross-session resume. Universal "ctx-mode first" wastes a lookup whenever the user resumes in a new session — which is the more common resumption case.
**Finding:** Tension is real but resolvable by conditioning on session state, not by abandoning D-02.
**Resolution:** D-02 rewritten as a **two-rule policy**:
  - Same-session resume → ctx-mode first, fall back to claude-mem.
  - Cross-session resume (no prior session state for this project) → claude-mem first using `proj:` + `type:` filters; skip ctx-mode.
The agent probes ctx-mode session metadata once at turn start to decide which case applies. This preserves both A4 ("memory first") and `cheapest first`. **CONTEXT.md updated inline.**

### D-03 — Encode D-01/D-02 in memory-recall SKILL.md verbatim
**Challenge:** Verbatim risks blowing the 3KB budget for memory-recall, the densest skill.
**Finding:** D-01 and the two-rule D-02 are compressible to ~4–6 lines of prose. Verbatim is achievable within budget; the researcher will confirm during research.
**Resolution:** Keep D-03 with a note that compression is allowed so long as both stores' ownership and the same-/cross-session branch are preserved. (No CONTEXT.md change — researcher/planner has discretion under existing "downstream agent discretion" clause.)

### Delegated areas (skill structure, few-shot grounding, tag depth)
**Challenge:** User delegated these; are any high-risk enough to override?
**Finding:** No. Each has a clear conservative default already in the canonical refs (PRD §5.3 for few-shots, MEM-01 for tag mandatory set). Researcher can pick without user input.
**Resolution:** No change.

## Glossary Sharpening
- **"memory"** in anti-pattern A4 was previously ambiguous. After this challenge, treat A4's "memory" as **both stores collectively**, with the lookup order governed by D-02's two-rule policy. The memory-recall SKILL.md should make this explicit so the agent does not interpret A4 as "always claude-mem first."

## ADR Candidates
None. D-02's two-rule policy is the kind of decision that *could* warrant an ADR (hard to reverse if downstream skills hardcode it, surprising to a future reader, real trade-off chosen), but the canonical home for this rule is the `memory-recall` SKILL.md itself — which downstream agents will read anyway. Promoting it to a separate ADR would duplicate without adding clarity. **Skip ADR.**

## Scope Creep
None introduced.

## Verdict
CONTEXT.md is internally consistent, aligned with Phase 1, and consistent with PRD §5.3 + project-level decisions. Ready for canonical spec.
