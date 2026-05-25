# CLAUDE.md

## Build & Test Commands
- Build: `npm run build` (if applicable)
- Test: `npm test`
- Validation: `npm run validate`

<!-- GSD:project-start source:PROJECT.md -->
## Project

**snailb-skills — God Combo Tool Routing Rules**

A set of routing rules + skill files (`CLAUDE.md` + `.claude/skills/*/SKILL.md`) that teach an AI coding agent how to orchestrate 8 MCP servers (claude-mem, context-mode, context7, gitnexus, semble, grep/Vercel, brave, filesystem) without scattergun search, mode-bleed, or cross-project memory leaks. The artifact is documentation + a small lint script — no runtime application code. Target user: solo devs and small teams running Claude Code with the full "god combo" MCP stack.

**Core Value:** **The agent reliably detects mode (Feature / Onboarding / Research / Maintenance) before every important tool call, then routes to the cheapest-correct tool — driven by three root principles: *cheapest first*, *exact > semantic > lexical*, *local > public*.** If everything else fails, this routing behavior must hold.

### Constraints

- **Token budget**: CLAUDE.md core ≤ 2KB, each skill file ≤ 3KB, per-turn overhead ≤ 1500 tokens — these are baked into NFR1 and enforced by the lint script
- **Timeline**: Phase 1 deliverable in ~1 week per PRD §8; full v1 (Phases 1–3) ~3 weeks
- **Platform**: Claude Code is the only v1 target (decided 2026-05-25); skill format should not block future Cursor/OpenCode reuse but compatibility is not validated
- **Tag taxonomy**: every claude-mem entry must carry `proj:` + `type:` (decision|bug|pattern|api|gotcha|todo); search without these filters is a rules violation
- **Output discipline**: tool calls > 10KB → context-mode; no `cat full-file > 500 lines` — semble chunks instead
- **Authoring style**: rules carry inline rationale; anti-patterns are listed explicitly so the agent can quote them when refusing
- **No new MCP servers**: stay strictly in orchestration territory
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| project-flow | Orchestrates multi-stage feature delivery by reading the project's declarative flow definition, tracking progress through a ledger state file, and instructing agents which skill to invoke next. Supports starting, resuming, and inspecting the flow. | `.agents/skills/project-flow/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
