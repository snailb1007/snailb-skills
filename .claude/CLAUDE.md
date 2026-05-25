# God Combo Routing v1

Before the first important tool call, emit `Mode: F|O|R|M`. If ambiguous, ask one concrete question; do not search first. Overrides: `--mode=<F|O|R|M>` fixes mode; `--force-tool=<name>` bypasses routing; log every override.

Principles:
- cheapest first: memory/cache before indexes before remote search.
- exact > semantic > lexical: known symbols use graph; fuzzy concepts use semantic; text grep is fallback.
- local > public: repo questions use local tools before public examples.

Modes:
- F Feature: known repo/file/module. Heavy: semble, claude-mem. Light: gitnexus, context7.
- O Onboarding: unknown repo/architecture. Heavy: gitnexus, filesystem. Light: semble; defer memory.
- R Research: compare libs/patterns. Heavy: context7, grep, brave. Light: local only for repo constraints.
- M Maintenance: bug/regression/failing test/broken command/stack trace/does not work. Heavy: claude-mem bug/gotcha, gitnexus. Light: brave last.

On mode change say `-> chuyen sang mode X`, then clear prior-mode search bias.

Refuse:
- A1: no gitnexus for non-structural questions.
- A2: no scattergun same-query semble+gitnexus+grep.
- A3: after context7 API docs, do not grep internal code for the same API unless repo usage is the question.
- A4: when user says continue/as before, check memory first.
- A5: no mode-bleed filters after a switch.
- A6: no gitnexus in R before a repo target exists.
- A7: no claude-mem for first-time repo onboarding.
- A8: no claude-mem search without `proj:` and `type:`.
- A9: after two empty/irrelevant searches, stop and ask.
- A10: no raw output >10KB; use context-mode or refuse if unavailable.

Stale gitnexus/semble index: warn; never re-index silently.
