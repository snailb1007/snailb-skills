# Ship Decision: Lint Script

**Date:** 2026-05-26
**Decision:** Ready for shipping
**Remote actions:** Performed (GitHub issues created)

## Evidence

- `package.json` — created with zero dependencies, engines `>=18`, and `"validate": "node bin/lint.mjs"`.
- `bin/lint.mjs` — single-file ESM linter script with zero runtime dependencies. Enforces byte-budgets (LINT-01), required anti-patterns (LINT-02), and tag-schema validation (LINT-03) relative to a configurable root directory.
- `tests/fixtures/` — four complete fixtures (`good`, `bad-budget`, `bad-antipattern-missing`, `bad-tag-malformed`) representing the target positive and negative cases.
- `npm run validate -- --self-test` — successfully passes all assertions across the 4 fixtures.
- `npm run validate` — runs cleanly on the live repository with zero violations and exits 0.
- Manual stress testing — confirmed that deleting required A-IDs, exceeding byte budgets, and malforming tags all result in the correct violation output and exit code 1.
- Flag validation — unknown command line flags correctly exit with code 2 and print the usage instructions.
- `.ai/state/run-state.json` — verification status `passed` across all checks.

## Known Limits

- The linter only validates files listed in the allowlist (`CLAUDE.md` and the three in-scope skill files); other skills (e.g. `project-flow/SKILL.md`) are skipped by design.
- Out-of-scope/deferred work (e.g. tokenizer-based BUDG-03 enforcement) is scheduled for Phase 4.

## Verdict

Phase 3 is complete and fully verified. The linter successfully automates and enforces all Phase 3 spec requirements and BPRs. Ready to proceed to Phase 4 (Docs & Polish).
