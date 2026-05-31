# GEMINI.md

## Execution guidelines
- Respect environment constraints.
- Run deterministic validators.

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
