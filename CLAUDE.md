# CLAUDE.md

## Build & Test Commands
- Test: `npm test`
- Validation: `npm run validate`

## Project
**snailb-skills — God Combo Tool Routing Rules**

A set of routing rules + skill files (`CLAUDE.md` + `.claude/skills/*/SKILL.md`) that teach an AI coding agent how to orchestrate 8 MCP servers (claude-mem, context-mode, context7, gitnexus, semble, grep/Vercel, brave, filesystem) without scattergun search, mode-bleed, or cross-project memory leaks. The artifact is documentation + a small lint script — no runtime application code. Target user: solo devs and small teams running Claude Code with the full "god combo" MCP stack.

**Core Value:** **The agent reliably detects mode (Feature / Onboarding / Research / Maintenance) before every important tool call, then routes to the cheapest-correct tool — driven by three root principles: *cheapest first*, *exact > semantic > lexical*, *local > public*.** If everything else fails, this routing behavior must hold.

### Constraints
- **Token budget**: CLAUDE.md core ≤ 2KB, each skill file ≤ 3KB, per-turn overhead ≤ 1500 tokens — these are baked into NFR1 and enforced by the lint script
- **Platform**: Claude Code is the only v1 target; skill format should not block future Cursor/OpenCode reuse but compatibility is not validated
- **Tag taxonomy**: every claude-mem entry must carry `proj:` + `type:` (decision|bug|pattern|api|gotcha|todo); search without these filters is a rules violation
- **Output discipline**: tool calls > 10KB → context-mode; no `cat full-file > 500 lines` — semble chunks instead
- **Authoring style**: rules carry inline rationale; anti-patterns are listed explicitly so the agent can quote them when refusing
- **No new MCP servers**: stay strictly in orchestration territory

