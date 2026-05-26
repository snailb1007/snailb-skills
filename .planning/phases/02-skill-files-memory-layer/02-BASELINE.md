# Phase 2 Baseline — Per-Turn Token Overhead (BUDG-03)

**Date:** 2026-05-25
**Requirement:** BUDG-03 — per-turn overhead ≤ 1500 tokens with only `.claude/CLAUDE.md` loaded (skills load on demand).

## Procedure (reproducible)

1. Measure byte count of the always-loaded core:
   ```
   wc -c .claude/CLAUDE.md
   ```
2. Convert bytes → tokens via the conservative-English approximation `tokens ≈ bytes / 4`. This is the rule used by OpenAI tokenizer documentation for ASCII-heavy English text and is appropriate for the prose-and-markdown content of `.claude/CLAUDE.md`. The approximation overestimates for highly compressed token vocabularies (cl100k_base, o200k_base) and underestimates for character-level vocabularies; for this content it is a safe upper bound.
3. Cross-check (optional, when available) with `tiktoken` cl100k_base (Claude tokenizer family is comparable in density):
   ```python
   import tiktoken
   enc = tiktoken.get_encoding("cl100k_base")
   print(len(enc.encode(open(".claude/CLAUDE.md").read())))
   ```
4. Confirm result ≤ 1500.

## Recorded Measurement (2026-05-25)

```
$ wc -c .claude/CLAUDE.md
1715 .claude/CLAUDE.md
```

- Bytes: **1715**
- Token estimate (bytes / 4): **≈ 429 tokens** (upper bound for English+markdown)
- Tokenizer family used for cross-check: not run in Phase 2; documented procedure above. cl100k_base is expected to land between 380–460 tokens for this content; o200k_base similar.
- Budget: 1500 tokens (BUDG-03).
- **Status:** PASS — measured estimate (~429) is roughly **29 % of budget**, leaving ample headroom for future Phase-1 refinements within the same NFR1 envelope.

## Skill File Sizes (BUDG-02 cross-reference)

```
$ wc -c .claude/skills/code-search/SKILL.md \
       .claude/skills/memory-recall/SKILL.md \
       .claude/skills/external-research/SKILL.md
2299 .claude/skills/code-search/SKILL.md
3023 .claude/skills/memory-recall/SKILL.md
2252 .claude/skills/external-research/SKILL.md
```

All three skill files ≤ 3072 bytes (BUDG-02 = 3KB). Skills load on demand and do NOT contribute to the BUDG-03 baseline.

## Notes

- Phase 3's lint script (`LINT-01`) will automate this byte-budget check and mechanize the token-estimate cross-check. Phase 2 records the procedure and a measurement so the Phase 4 validation harness has a baseline reference point.
- If `.claude/CLAUDE.md` grows toward 2048 bytes (its hard cap from Phase 1), re-run this procedure. The 1500-token budget should hold up to roughly 2000 bytes of ASCII markdown, so Phase 1's 2KB ceiling and Phase 2's 1500-token ceiling are compatible.
