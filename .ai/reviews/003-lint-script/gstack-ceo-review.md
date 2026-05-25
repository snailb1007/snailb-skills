# GStack CEO Review — 003 Lint Script

**Reviewer mode:** Product / strategy / scope challenge
**Subject:** `specs/003-lint-script/spec.md` (locked) + `specs/003-lint-script/plan.md` (draft)
**Date:** 2026-05-26
**Verdict:** **Approved with one note** (no revision required)

---

## Is this the highest-leverage thing to ship next?

**Yes.** Phases 1 + 2 locked the routing rules and skill files. Without Phase 3, BUDG-01/02 and the A1–A10 contract are aspirational — any future edit can silently regress them. The lint script is the *first* mechanical enforcement surface in the entire project. Until it exists, the v1 PRD claim "rules are mechanically testable" (NFR1, LINT-01..03) is not yet earned.

Dependency math is also correct: Phase 4 (validation harness, 20-case test) builds on Phase 3's CI gate. Skipping Phase 3 would force Phase 4 to invent the same enforcement primitives as a side effect of its harness — worse separation of concerns.

## Is the scope right for the goal?

**Yes — the spec is well-bounded.** Four AC families, three rules, four fixtures, ~250 LOC. The "Out of scope" list in the Goal section explicitly defers tokenizer-based BUDG-03 to Phase 4, `--quiet`/`--json` to later, and pre-commit hooks indefinitely. Each deferral is justified by a real downstream context that needs the same primitive.

The Behavior-Preservation Rules (BPR-1..BPR-8) are unusually well-thought-out for a 250-LOC script. BPR-1 (zero deps) is the single most important strategic constraint in this phase — it forces the script to be readable end-to-end and prevents the silent dependency drift the PRD warns about. BPR-4 (allowlist hard-coded in script, not config file) is also strategically right: it makes the script the single source of truth for what the v1 routing-rules contract IS, and forces conscious PR-level deliberation when changes happen.

## 10-star product version — what would be different?

Three things a more ambitious version would do, and why I'm NOT pushing for any of them now:

1. **Inline tokenizer for BUDG-03 right now (not Phase 4).** Would make the script the complete enforcement surface. Rejected: violates BPR-1 (zero deps), and Phase 4 already justifies the dep for its validation harness. Doing it twice in one week wastes the cleaner v1 surface.

2. **A `--fix` mode that auto-trims oversized files or appends missing A-IDs.** Sounds great until you realize the script can't know the *right* place to add A8 to a refactored skill — only the human author does. Rejected: out of scope for routing-rule mechanics; an auto-fixer is a content-generation tool, not a lint tool.

3. **Web-rendered HTML report of violations.** Cute, useless for solo-dev / small-team v1 where the user IS the agent and the agent reads stdout. Rejected for v1; revisit if team size > 3.

I'm holding scope. The plan as drafted earns 9 stars; reaching 10 requires Phase 4 + DOCS-02 + a track record of catches.

## One genuine product-level concern (flagged, not blocking)

**The `REQUIRED_ANTIPATTERNS` map in `bin/lint.mjs` duplicates knowledge already in `.claude/CLAUDE.md`.** If a future PR adds A11 to CLAUDE.md, the contributor MUST also update `bin/lint.mjs`'s map — otherwise the new rule is silently unenforced. BPR-4 says this is intentional (forces conscious deliberation), but in practice it's a footgun: the linter could be silently incomplete after a Phase 1 amendment.

**Mitigations to NOT take now:**
- Auto-extracting the A-ID list from CLAUDE.md at runtime → reintroduces parsing complexity the spec specifically avoided.
- Generating the map from a shared `.routing-rules.yaml` file → re-introduces a config file (violates BPR-4).

**Mitigation to take now (cheap):** In Phase 4 (DOCS-02 / README), add a one-paragraph "When the routing rules change" runbook noting that A-ID additions/changes require updating `bin/lint.mjs`'s map IN THE SAME PR. That's a documentation gate, not a script change. Aligns with BPR-4 + keeps Phase 3 surface tiny.

**Recommendation:** Capture this as a TODO for Phase 4 documentation. No spec or plan change in Phase 3.

## Scope creep watch

None observed. The plan and spec stay strictly inside LINT-01/02/03 + the test-strategy minimum. Excellent discipline.

## Sequencing concerns for downstream phases

Phase 4 must add:
1. Tokenizer-based BUDG-03 enforcement (already noted in spec's "Out of scope").
2. The 20-case validation harness (VAL-01..03).
3. `README.md` with usage docs (DOCS-02) — must include the "rules-change runbook" paragraph from the genuine concern above.

These are all already planned. No re-sequencing needed.

## Final verdict

**APPROVED.** No revisions required. The genuine concern (map duplication) is captured as a Phase 4 documentation TODO, not a Phase 3 blocker.

Ship Phase 3 as specified, with the eng-review amendments (see `gstack-eng-review.md`).
