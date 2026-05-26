# Phase 5: Setup Guide & Installer Script - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the Setup Guide (README.md) and the Installer Script (`bin/install-rules.mjs`) for the `snailb-skills` routing rules. The installer script copy-deploys the `.claude/` configuration directory and the linter script (`bin/lint.mjs`) to a target workspace, checks target directory presence, and verifies that the target setup works. The root `README.md` details how to install, configure, override, and use the tag taxonomy.
</domain>

<decisions>
## Implementation Decisions

### Target Installation Strategy
- **D-01 (Safe Backup + Overwrite):** The installer script at `bin/install-rules.mjs` will automatically back up any pre-existing configuration files (like `.claude/` or `bin/lint.mjs` in the target project) before writing new files.
- **D-02 (Unified Backup Location):** Backups will be copied to a single unified timestamped directory in the target root (e.g. `.claude-backup-20260526-181500/`) to keep the target repository's root clean.

### Target package.json Integration
- **D-03 (Automated package.json update):** The installer will automatically add a `"validate"` script pointing to `node bin/lint.mjs` in the target's `package.json` if it doesn't already exist.
- **D-04 (Bypass Flag):** The installer will provide a `--skip-package-json` command-line flag to bypass modifying the target's `package.json` file.

### Documentation Location & Structure
- **D-05 (Root README.md):** The installer and user guide documentation will reside in the repository root `README.md`, detailing installation, linter configuration, overrides, and the tag taxonomy schema.

### Post-install Verification Flow
- **D-06 (Automatic Verification Run):** After copying the files and integrating with `package.json`, the installer will automatically run the newly copied `bin/lint.mjs` inside the target directory and print the output to verify a successful installation.

### the agent's Discretion
- Selection of the zero-dependency Node.js standard built-ins (`fs`, `path`, `child_process`) for `bin/install-rules.mjs`, matching the pattern established by `bin/lint.mjs`.
- The exact format of the timestamp used in the backup folder name (e.g., `YYYYMMDD-HHMMSS`).
- Console output styling (e.g., color encoding, success/failure markers).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Phase Scope
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria, and dependencies.
- `.planning/REQUIREMENTS.md` — Requirements `INST-01` and `INST-02`.
- `.planning/PROJECT.md` — Core routing principles and constraints.
- `docs/prd.md` — Section 13 (MCP/Skill reference) and Section 8 (Installation plan).

### Existing Code & Context
- `.claude/CLAUDE.md` — Core routing rules.
- `.claude/skills/code-search/SKILL.md`, `.claude/skills/memory-recall/SKILL.md`, `.claude/skills/external-research/SKILL.md` — Core routing skills.
- `bin/lint.mjs` — Zero-dependency linter script to copy and run.
- `.planning/phases/03-lint-script/03-CONTEXT.md` — Phase 3 decisions for linter.
- `.planning/phases/04-validation-harness-v1-report/04-CONTEXT.md` — Phase 4 decisions and harness context.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bin/lint.mjs` — Zero-dependency Node.js script using `fs`, `path`, and `process`. The installer script `bin/install-rules.mjs` will follow this exact pattern (zero external dependencies).
- `package.json` — The installer will parse and update the target's `package.json` to insert the script.

### Integration Points
- `bin/install-rules.mjs` — The new installer script.
- `README.md` — The root setup guide and documentation.

</code_context>

<specifics>
## Specific Ideas
- The installer should validate that the target directory exists and is a valid directory before attempting any operations.
- The installer should support running via `node bin/install-rules.mjs <target-path>` or through an npm script like `npm run install-to <target-path>`.
</specifics>

<deferred>
## Deferred Ideas
- None — discussion stayed within phase scope.
</deferred>

---

*Phase: 5-setup-guide-installer-script*
*Context gathered: 2026-05-26*
