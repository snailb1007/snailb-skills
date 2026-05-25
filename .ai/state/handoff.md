# Handoff: Lint Script

**Date:** 2026-05-26
**Status:** Phase 3 linter script and fixtures complete

## Promoted to project memory

- Phase 3 ships the ESM lint script (`bin/lint.mjs`) and adds `npm run validate` to `package.json` with zero runtime dependencies.
- Enforces three validation rules:
  1. **BUDG-01/BUDG-02**: Byte-size budgets (`.claude/CLAUDE.md` ≤ 2,048 bytes; in-scope skill files ≤ 3,072 bytes).
  2. **LINT-02**: Enforces presence of required anti-pattern A-IDs per in-scope file.
  3. **LINT-03**: Enforces tag-schema validation (proj: and type: check) on lines inside fenced code blocks or matching tag markers.
- Integrates a self-test mode (`npm run validate -- --self-test`) that executes linter assertions against four fixture trees (`good`, `bad-budget`, `bad-antipattern-missing`, `bad-tag-malformed`) under `tests/fixtures/`.
- Exit code contracts: Exit 0 on clean pass; Exit 1 on validation violations; Exit 2 on unknown flags.

## Verification Summary

- Verification status: passed.
- All 5 deterministic checks recorded in `.ai/state/run-state.json` passed.
- Manual stress testing verified correct violation formatting and exit codes.

## Next Suggested Action

Proceed to Phase 4 (Docs & Polish) to:
- Implement tokenizer-based BUDG-03 enforcement.
- Author DOCS-02 README section explaining linter design and how to update routing rules.
