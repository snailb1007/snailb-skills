# 005 — Setup Guide & Installer Script (Implementation Plan)

**Phase:** 5 of 5
**Spec:** `specs/005-setup-guide-installer-script/spec.md` (canonical, locked)
**Status:** Draft (implementation_plan stage).

---

## Proposed Changes

### File-by-file diff plan

#### MODIFY: `package.json` (repo root)
Add `"install-to"` script to `package.json`:
```diff
   "scripts": {
-    "validate": "node bin/lint.mjs"
+    "validate": "node bin/lint.mjs",
+    "install-to": "node bin/install-rules.mjs"
   },
```

#### NEW: `bin/install-rules.mjs` (single file, target ~150 LOC)
Zero-dependency installer script using Node.js standard built-ins (`fs`, `path`, `child_process`, `process`).

Module layout (top-to-bottom):
1. **Helper functions:**
   - `copyFileSync(src, dest)`: Helper to copy a single file, ensuring destination directory exists.
   - `copyFolderRecursiveSync(src, dest)`: Helper to recursively copy files and directories. Excludes `.DS_Store` and files matching `settings.local.json`.
   - `ensureDirSync(dir)`: Wrapper around `fs.mkdirSync(dir, { recursive: true })`.
2. **CLI arguments parsing:**
   - Parse `process.argv.slice(2)`. Extract target directory (first non-flag argument) and look for `--skip-package-json`.
   - If target directory is missing, display usage instructions and exit with code 1:
     `Usage: node bin/install-rules.mjs <target-directory-path> [--skip-package-json]`
3. **Validation:**
   - Resolve target directory to an absolute path.
   - Verify target directory exists and is indeed a directory via `fs.statSync`. If not, exit with code 1 and a clear error message.
4. **Backup Process:**
   - Check if `<target-path>/.claude` or `<target-path>/bin/lint.mjs` already exists.
   - If either exists, generate a timestamp `YYYYMMDD-HHMMSS` using the current local time.
   - Create a backup folder `<target-path>/.claude-backup-YYYYMMDD-HHMMSS`.
   - Copy any existing `.claude` folder and `bin/lint.mjs` to this backup directory. Print a message detailing what was backed up.
5. **Copying Files:**
   - Recursively copy `.claude/CLAUDE.md` and `.claude/skills/` to `<target-path>/.claude/`.
   - Copy `bin/lint.mjs` to `<target-path>/bin/lint.mjs` (creating `<target-path>/bin/` if it does not exist).
6. **package.json Integration:**
   - If `--skip-package-json` is NOT set and `<target-path>/package.json` exists:
     - Read and parse `<target-path>/package.json`.
     - If `scripts` block does not exist, initialize it.
     - If `scripts.validate` does not exist:
       - Back up the original `package.json` to `<target-path>/.claude-backup-YYYYMMDD-HHMMSS/package.json` (creating the backup directory if not already created).
       - Add `"validate": "node bin/lint.mjs"` to the scripts.
       - Write the updated JSON back to `<target-path>/package.json` with 2-space indentation.
       - Print a success message.
     - If `scripts.validate` already exists, print a message indicating it was skipped since it already exists.
7. **Post-install Verification:**
   - Run `node bin/lint.mjs` inside `<target-path>` using `child_process.spawnSync`.
   - Pipe the process output directly to stdout/stderr.
   - If the linter runs successfully (exit code 0), print a green success message: `✔ Installation verified successfully!`.
   - If the linter fails (exit code non-zero), print a warning indicating that the installer completed but the target setup has linter violations.

#### NEW: `README.md` (repo root)
Write a clean, professional, and detailed documentation guide. It will explain:
- **God Combo Tool Routing Rules:** Overview of the 8 MCP stack.
- **Rule Layout & Loading:** How `CLAUDE.md` is loaded at session start and how `skills/` load on-demand.
- **Installation:** Using the installer script via `npm run install-to <target-path>` or `node bin/install-rules.mjs <target-path>`.
- **Validation:** Running `npm run validate` inside the target workspace.
- **Memory Tag Taxonomy:** Explanation of `proj:<repo>` and `type:...` tags, per-mode filtering strategy, and examples.
- **Overrides:** Detailed usage of `--force-tool=<name>` and `--mode=<F|O|R|M>` flags.

---

## Verification Plan

### Automated/Manual Smoke Tests
We will perform the following manual/automated tests:
1. **Invalid Arguments Test:** Run `node bin/install-rules.mjs` without arguments, verify it exits 1 with usage.
2. **Missing Target Directory Test:** Run `node bin/install-rules.mjs /nonexistent/path`, verify it exits 1.
3. **Clean Installation Test:**
   - Create a temporary directory `tests/mock-project` with a dummy `package.json` `{ "name": "mock-project", "scripts": {} }`.
   - Run `node bin/install-rules.mjs tests/mock-project`.
   - Verify that:
     - `tests/mock-project/.claude/` exists and matches source.
     - `tests/mock-project/bin/lint.mjs` exists.
     - `tests/mock-project/package.json` scripts contain `"validate": "node bin/lint.mjs"`.
     - The verification step prints linter output (it should fail/succeed depending on files, but since mock-project has no files, it should print standard validation output).
4. **Backup Logic Test:**
   - Modify a file in `tests/mock-project/.claude/CLAUDE.md` or `tests/mock-project/bin/lint.mjs`.
   - Run `node bin/install-rules.mjs tests/mock-project` again.
   - Verify that:
     - A directory `.claude-backup-YYYYMMDD-HHMMSS` is created.
     - The modified files are preserved in the backup folder.
     - The target files are overwritten with the fresh ones from the source.
5. **Bypass Flag Test:**
   - Create a fresh `tests/mock-project` with `package.json`.
   - Run `node bin/install-rules.mjs tests/mock-project --skip-package-json`.
   - Verify that `package.json` remains untouched.
6. **Clean Up:**
   - Delete the temporary `tests/mock-project` folder so it doesn't pollute the git workspace.
