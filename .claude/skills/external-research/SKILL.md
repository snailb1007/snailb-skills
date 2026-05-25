---
name: external-research
description: Route external research across context7, grep (Vercel), and brave. Load on R-mode turns comparing libraries, looking up current APIs, or scanning public usage.
---

# external-research

## Trigger
Load when:
- Mode is R (Research) — comparing libs, looking up current API behavior, scanning public examples.
- The user asks "is X better than Y", "what's the current API for Z", "how do people use W".
Do NOT load for local code questions (use code-search) or first-time repo onboarding (filesystem/gitnexus).

## Routing decision

| Kind of question | Tool | Why |
|---|---|---|
| Current API / docs / version migration | context7 | authoritative, dated, cheaper than guessing |
| Real-world usage examples in public code | grep (Vercel) | semantic-ish cross-repo lexical hits |
| Broad context, non-API research, comparisons | brave | last resort; widest net |

Tie-break: context7 first when an API is named; grep next for usage; brave only when the question is not bounded by an API or lib.

OUT-01: Tool calls expected to return >10KB MUST route through context-mode (`ctx_batch_execute` / `ctx_execute_file`). If context-mode is unavailable, refuse the call and ask the user to narrow it. Document any bypass inline.

## Few-shots

1. "Should we use ky or fetch for retries?" (PRD §5.3 R-mode)
   → context7 for ky retry hooks; context7 for fetch + AbortController; compare. Do not grep internal repo (A3).

2. "How do other projects structure stripe webhook handlers?" (PRD §5.3 R-mode)
   → grep (Vercel) "stripe webhook" across public repos for patterns. Brave only if grep returns no usable hits.

3. "What's the state of the art on rate-limit backoff in 2026?" (R-mode broad; A6)
   → brave. Do not gitnexus — no repo target exists for this question.

## Anti-patterns enforced
- A3: after context7 API docs, do not re-grep internal code for the same API unless repo usage is the question. Refusal: "A3 — external docs answered; internal grep adds no signal."
- A6: no gitnexus in R before a repo target exists. Refusal: "A6 — Research mode is bounded by libs/patterns, not repo structure."
- A10: no raw output >10KB. Refusal: "A10 — route through context-mode or narrow the call."
