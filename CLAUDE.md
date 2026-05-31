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


## ATLAS Loop

1. **Use the current flow:** Follow the 5-stage ATLAS Loop: align, trace, lay, act, settle.
2. **Read current state:** Use `.ai/state/flow-state.json` as the execution state snapshot.
3. **Use ATLAS skills:** Route stage work through `.claude/skills/atlas-routing`, `.claude/skills/atlas-gates`, `.claude/skills/atlas-settle`, and `.claude/skills/atlas-review`.
4. **Use contracts:** Resolve canonical artifacts through `.claude/skills/contracts`.
5. **Avoid deprecated ledger:** Do not read or create `.ai/state/flow-ledger.json`.
## Subagent & Parallel Execution Guidelines

1. **Detect Independent Tasks:** Before starting execution, review the task list (e.g., `tasks.md`) to identify independent, non-sequential tasks.
2. **Define Specialized Subagents:** For each independent task or sub-project, define a specialized subagent using the `define_subagent` tool.
3. **Spawn in Parallel:** Invoke the defined subagents in parallel using the `invoke_subagent` tool to execute tasks concurrently.
4. **Limit Context Size:** Do not pass large session logs or redundant context files to subagents. Keep their context focused and lightweight.
5. **Coordinate & Wait:** Wait for all parallel subagents to complete before advancing to downstream tasks that depend on their outputs.
## Context Budget and Subagent Orchestration Policy

1. **Estimate Byte Pressure:** Before starting any flow stage, estimate the byte pressure locally to decide the execution path (inline, context pack, or fresh session).
2. **Configure Thresholds:** Set conservative size thresholds (e.g. 50KB inline, 200KB context pack) in `.ai/state/context-policy.json` to prevent context bloat.
3. **Generate Context Packs:** When context packs are required, generate a structured pack containing only essential files and omit all others.
4. **Use Fresh Sessions:** When byte pressure exceeds limits, write a handoff artifact (`.ai/state/context-handoff.json`) and resume from a clean session.
5. **Protect Ledger State:** Parallel subagents must run in isolated workspaces with disjoint write targets and must never modify the central ledger.
