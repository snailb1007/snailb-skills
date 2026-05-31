# 005 — Setup Guide & Installer Script (Canonical Spec)

**Phase:** 5 of 5 — Setup Guide & Installer Script
**Status:** Draft (canonical_spec stage of rough-project-flow)
**Source of truth:** This spec supersedes ad-hoc decisions. Implementation MUST conform.
**Upstream:** `.planning/phases/05-setup-guide-installer-script/05-CONTEXT.md`, `.planning/phases/05-setup-guide-installer-script/05-DISCUSSION-LOG.md`
**Downstream:** `specs/005-setup-guide-installer-script/plan.md` (implementation_plan stage), `specs/005-setup-guide-installer-script/tasks.md`.

---

## Goal

Ship the setup guide (root `README.md`) and the installer script (`bin/install-rules.mjs`, zero runtime dependencies) to enable installing, updating, configuring, and verifying the `snailb-skills` routing rules in target workspaces.

---

## Acceptance Criteria

### AC-1 — Setup Guide (README.md) (INST-01)
1. The root `README.md` MUST exist and include the following sections:
   - **Overview:** Introduction to `snailb-skills` routing rules and the "God Combo" 8-MCP orchestration.
   - **Installation & Updates:** Detailed instructions for running the installer script via `node bin/install-rules.mjs <target-path>` or `npm run install-to <target-path>`.
   - **Override Mechanisms:** Documenting how to use `--force-tool=<name>` and `--mode=<F|O|R|M>` flags to bypass or fix routing.
   - **Tag Taxonomy Schema:** Detailed documentation of the mandatory `proj:<repo>` and `type:(decision|bug|pattern|api|gotcha|todo)` tags, and recommended tags (`mode:`, `lib:`, `severity:`).
   - **Linter Integration:** Explaining how the validator script (`bin/lint.mjs`) is run via `npm run validate` to enforce token budgets and tag taxonomy.

### AC-2 — Target Validation & Backup Logic (INST-02)
1. The installer script MUST validate that a target workspace path is provided as the first positional argument. If missing, it exits with code 1 and prints usage instructions.
2. The installer script MUST validate that the target workspace exists and is a directory. If not, it exits with code 1 and prints an error.
3. If pre-existing files/directories matching the installer's output (specifically `<target-path>/.claude` or `<target-path>/bin/lint.mjs`) are found in the target workspace, the script MUST automatically back them up.
4. Backups MUST be stored in a single unified directory named `.claude-backup-YYYYMMDD-HHMMSS` (where `YYYYMMDD-HHMMSS` is the current local timestamp) inside the target workspace root to prevent cluttering.

### AC-3 — Copy & Deployment Logic (INST-02)
1. The installer script MUST recursively copy `.claude/CLAUDE.md` and `.claude/skills/` folder to `<target-path>/.claude/`. It should not copy local-only settings like `settings.local.json`.
2. The installer script MUST copy `bin/lint.mjs` to `<target-path>/bin/lint.mjs`. If the target's `bin/` directory does not exist, the installer must create it.

### AC-4 — Target package.json Integration (INST-02)
1. If a `package.json` exists in the target root:
   - Unless bypassed via the `--skip-package-json` flag, the installer MUST parse it and check if `scripts.validate` exists.
   - If `scripts.validate` does NOT exist, the installer MUST add `"validate": "node bin/lint.mjs"` and write the updated `package.json` back to disk.
   - If the script is modified, the original `package.json` MUST be backed up to the backup directory before writing.
2. If `--skip-package-json` is provided, the installer MUST NOT modify `package.json` or create a backup of it.

### AC-5 — Post-Install Verification Flow (INST-02)
1. After successful copy and package.json integration, the installer script MUST run the newly deployed linter inside the target directory using `child_process.spawnSync` or `execSync` running `node bin/lint.mjs`.
2. The stdout/stderr of this validation run MUST be printed directly to the console.
3. The installer MUST report whether the validation succeeded (exit code 0) or failed (exit code non-zero).

### AC-6 — CLI Configuration & Script Invocation
1. An npm script `"install-to": "node bin/install-rules.mjs"` MUST be added to the root `package.json` to make execution ergonomic.
2. The installer script MUST run using only Node.js standard built-ins (`fs`, `path`, `child_process`, `process`) and have zero runtime dependencies.

---

## Test Strategy

### T1 — Smoke Test Verification (Manual/Automated)
Run the installer script against a mock target directory inside the workspace and verify:
1. Target directory validation (fails on missing/invalid path).
2. Clean installation (copies files, adds `package.json` script, runs validation successfully).
3. Backup logic (rerunning installer creates `.claude-backup-[timestamp]` and successfully backs up files).
4. `--skip-package-json` flag (skips package.json modification).

### T2 — Clean Up Mock Installs
Ensure any mock directories created for testing are ignored or cleaned up so they do not pollute the workspace.
