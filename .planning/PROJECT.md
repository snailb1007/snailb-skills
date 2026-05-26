# snailb-skills — God Combo Tool Routing Rules

## What This Is

A set of routing rules + skill files (`CLAUDE.md` + `.claude/skills/*/SKILL.md`) that teach an AI coding agent how to orchestrate 8 MCP servers (claude-mem, context-mode, context7, gitnexus, semble, grep/Vercel, brave, filesystem) without scattergun search, mode-bleed, or cross-project memory leaks. The artifact is documentation + a small lint script — no runtime application code. Target user: solo devs and small teams running Claude Code with the full "god combo" MCP stack.

## Core Value

**The agent reliably detects mode (Feature / Onboarding / Research / Maintenance) before every important tool call, then routes to the cheapest-correct tool — driven by three root principles: *cheapest first*, *exact > semantic > lexical*, *local > public*.** If everything else fails, this routing behavior must hold.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] FR1 — Agent emits mode detection (F/O/R/M) before first tool call each turn; asks if ambiguous
- [ ] FR2 — Every `claude-mem search` carries `proj:` + `type:` filters appropriate for the active mode
- [ ] FR3 — 10 enforced anti-patterns (A1–A10); agent refuses, does not just warn
- [ ] FR4 — Mode switch is announced ("→ chuyển sang mode M") and clears prior-mode search bias
- [ ] FR5 — Stale gitnexus/semble indexes warn the user; agent never re-indexes silently
- [ ] FR6 — After 2 consecutive empty/irrelevant searches, agent stops and asks the user
- [ ] FR7 — Tool calls with expected output > 10KB route through context-mode; bypasses must be documented
- [ ] NFR1 — CLAUDE.md core ≤ 2KB; each skill file ≤ 3KB; total overhead per turn ≤ 1500 tokens
- [ ] NFR2 — Every rule has a version + a one-line rationale; MCP stack changes update rules in the same commit
- [ ] NFR4 — Standard file layout (`.claude/CLAUDE.md`, `.claude/skills/<name>/SKILL.md`) + README explaining load/override
- [ ] Tag taxonomy — mandatory (`proj:`, `type:`) + recommended (`mode:`, `lib:`, `severity:`) tag schema documented
- [ ] Mode → tool routing matrix (PRD §5.2) codified in CLAUDE.md / skill files
- [ ] Override mechanism — `--force-tool=<name>` and `--mode=<F|O|R|M>` documented; overrides logged for review
- [ ] Lint script — validates token budgets (NFR1), tag schema, anti-pattern presence; runnable locally
- [ ] Test harness — 20 case studies covering 4 modes + edges; measures tokens/task, tool calls/task, drift incidents
- [ ] Validation report — baseline (no rules) vs v1, with quantitative deltas against PRD §10 targets

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Auto-install / setup of MCP servers — users bring their own stack; we route across what's already there (NG1)
- Building new MCP servers — pure orchestration layer, not new tools (NG2)
- Removing user override capability — judgment stays with the human; rules are guidance, not handcuffs (NG3)
- Optimizing for stacks other than these 8 MCPs — different stacks need their own routing (NG4)
- Non-coding workflows (writing, general research) — only coding-agent orchestration (NG5)
- Cursor / OpenCode / Windsurf compatibility in v1 — Claude Code only for v1; cross-platform deferred (decided 2026-05-25)
- Telemetry hooks beyond what ctx_insight + claude-mem already expose — measure with what exists in v1
- Resolving PRD §12 Q2–Q7 (F↔M overlap, extra tag dimensions, cross-project sharing, format normalization, telemetry storage, onboarding bootstrap) — kept open, revisit in Phase 4

## Context

- **Origin:** This emerged from a real workflow problem — running 8 MCP servers concurrently and watching the agent scattergun-search, mode-bleed, and burn context on the wrong tool. PRD authored 2026-05-25.
- **The 8-MCP stack** (PRD §1.1, §13A): claude-mem (long-term memory), context-mode (output sandbox), context7 (lib docs), gitnexus (Tree-sitter AST graph), semble (semantic chunks), grep/Vercel (1M+ public repos), brave (web search), filesystem (file I/O).
- **Four workflow modes** the agent must distinguish: **F**eature dev (semble + claude-mem), **O**nboarding (gitnexus + filesystem), **R**esearch (context7 + grep + brave), **M**aintenance (claude-mem bug tags + gitnexus).
- **Observed failure modes** (PRD §2.1): tool description overhead, memory layer conflict, mode bleed, search drift, premature indexing, cross-project leak, scattergun search, context-mode bypass.
- **Three root principles** all rules must derive from: cheapest first, exact > semantic > lexical, local > public.
- **Deliverables are markdown + one small lint script.** No build pipeline, no runtime, no deployment. Validation comes from comparing token/tool-call telemetry against a baseline.
- **Prior art:** Same author already produced this CLAUDE.md (will be overwritten by the generated GSD guide), `docs/prd.md` (full PRD), and existing `.agents/` / `.ai/` / `GEMINI.md` scaffolding from earlier exploration.

## Constraints

- **Token budget**: CLAUDE.md core ≤ 2KB, each skill file ≤ 3KB, per-turn overhead ≤ 1500 tokens — these are baked into NFR1 and enforced by the lint script
- **Timeline**: Phase 1 deliverable in ~1 week per PRD §8; full v1 (Phases 1–3) ~3 weeks
- **Platform**: Claude Code is the only v1 target (decided 2026-05-25); skill format should not block future Cursor/OpenCode reuse but compatibility is not validated
- **Tag taxonomy**: every claude-mem entry must carry `proj:` + `type:` (decision|bug|pattern|api|gotcha|todo); search without these filters is a rules violation
- **Output discipline**: tool calls > 10KB → context-mode; no `cat full-file > 500 lines` — semble chunks instead
- **Authoring style**: rules carry inline rationale; anti-patterns are listed explicitly so the agent can quote them when refusing
- **No new MCP servers**: stay strictly in orchestration territory

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `proj:` resolution = auto-detect from cwd / git toplevel | User shouldn't have to declare project per turn; cwd is unambiguous in single-repo session | — Pending |
| Ship a lint script (not markdown-only) | Makes NFR1 (token budget) and tag schema testable; otherwise rules rot silently | — Pending |
| v1 platform = Claude Code only | Cursor/OpenCode compatibility is aspirational; validating one runtime well > four poorly | — Pending |
| Roadmap follows PRD §8 phase shape (Core rules → Skills → Validation → Refinement) | PRD already proposes a defensible decomposition; deviating without cause adds risk | — Pending |
| No parallel research subagents | gsd-project-researcher / gsd-research-synthesizer / gsd-roadmapper not installed; PRD already contains the research findings inline | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-25 after initialization*
