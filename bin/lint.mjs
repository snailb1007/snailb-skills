#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// --- Header Constants ---
const BUDGETS = { '.claude/CLAUDE.md': 2048 };
const SKILL_BUDGET = 3072;
const IN_SCOPE_SKILLS = [
  '.claude/skills/code-search/SKILL.md',
  '.claude/skills/memory-recall/SKILL.md',
  '.claude/skills/external-research/SKILL.md'
];

const REQUIRED_ANTIPATTERNS = {
  '.claude/CLAUDE.md': ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10'],
  '.claude/skills/code-search/SKILL.md': ['A1','A2','A3','A10'],
  '.claude/skills/memory-recall/SKILL.md': ['A4','A7','A8','A9'],
  '.claude/skills/external-research/SKILL.md': ['A3','A6','A10']
};

const TYPE_ENUM = new Set(['decision', 'bug', 'pattern', 'api', 'gotcha', 'todo']);
const AID_RE = /\bA([1-9]|10)\b/g;
const TAGS_LINE_RE = /^\s*(?:example\s+)?tags:/i;
const FENCE_RE = /^```/;
const MARK = '✗';

// --- Helper Functions ---
function getRelativePath(absolutePath, rootDir) {
  return path.relative(rootDir, absolutePath);
}

// --- Core Lint Function ---
export function lintTree(rootDir) {
  const violations = [];
  const filesChecked = new Set();

  // 1. Byte-budget enforcement (LINT-01 -> BUDG-01, BUDG-02)
  // CLAUDE.md check (BUDG-01)
  const claudePath = '.claude/CLAUDE.md';
  const fullClaudePath = path.join(rootDir, claudePath);
  if (!fs.existsSync(fullClaudePath)) {
    violations.push({
      relPath: claudePath,
      rule: 'LINT-01',
      detail: 'file not found'
    });
  } else {
    filesChecked.add(claudePath);
    const size = fs.statSync(fullClaudePath).size;
    if (size > BUDGETS[claudePath]) {
      const delta = size - BUDGETS[claudePath];
      violations.push({
        relPath: claudePath,
        rule: 'BUDG-01',
        detail: `(${size} bytes > 2048)`,
        hint: `Trim ~${delta} bytes from the core routing block.`
      });
    }
  }

  // SKILL.md checks (BUDG-02)
  for (const skillPath of IN_SCOPE_SKILLS) {
    const fullSkillPath = path.join(rootDir, skillPath);
    if (!fs.existsSync(fullSkillPath)) {
      violations.push({
        relPath: skillPath,
        rule: 'LINT-01',
        detail: 'file not found'
      });
    } else {
      filesChecked.add(skillPath);
      const size = fs.statSync(fullSkillPath).size;
      if (size > SKILL_BUDGET) {
        const delta = size - SKILL_BUDGET;
        violations.push({
          relPath: skillPath,
          rule: 'BUDG-02',
          detail: `(${size} bytes > 3072)`,
          hint: `Trim ~${delta} bytes.`
        });
      }
    }
  }

  // 2. Per-file required anti-pattern presence (LINT-02)
  for (const [relPath, requiredIds] of Object.entries(REQUIRED_ANTIPATTERNS)) {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) {
      // Already reported as missing in budget check
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = new Set();
    let match;
    // Reset regex lastIndex
    AID_RE.lastIndex = 0;
    while ((match = AID_RE.exec(content)) !== null) {
      matches.add(match[0]);
    }

    for (const reqId of requiredIds) {
      if (!matches.has(reqId)) {
        violations.push({
          relPath,
          rule: 'LINT-02',
          detail: `missing required anti-pattern ${reqId}`,
          hint: `Add a refusal line referencing ${reqId}.`
        });
      }
    }
  }

  // 3. Tag-schema validation (LINT-03)
  for (const relPath of Object.keys(REQUIRED_ANTIPATTERNS)) {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split(/\r?\n/);
    let inFence = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNo = i + 1;

      if (FENCE_RE.test(line)) {
        inFence = !inFence;
        continue;
      }

      if (inFence || TAGS_LINE_RE.test(line)) {
        const tokens = line.split(/\s+/).filter(Boolean);
        const candidateTokens = [];
        
        for (const token of tokens) {
          // Strip leading and trailing ` " , ( )
          const stripped = token.replace(/^[`"(),]+|[`"(),]+$/g, '');
          if (stripped.includes('proj:') || stripped.includes('type:')) {
            candidateTokens.push({ original: token, stripped });
          }
        }

        if (candidateTokens.length === 0) {
          continue;
        }

        // Validate collected tokens on this line
        let hasProj = false;
        let hasType = false;
        let hasInvalidType = false;

        for (const { original, stripped } of candidateTokens) {
          if (stripped.startsWith('proj:')) {
            const val = stripped.substring(5);
            if (val.length > 0) {
              hasProj = true;
            }
          } else if (stripped.startsWith('type:')) {
            const val = stripped.substring(5);
            if (TYPE_ENUM.has(val)) {
              hasType = true;
            } else {
              hasInvalidType = true;
              violations.push({
                relPath,
                lineNo,
                rule: 'LINT-03',
                detail: `malformed tag \`${original}\` (type:${val} not in enum decision|bug|pattern|api|gotcha|todo)`
              });
            }
          }
        }

        if (!hasProj) {
          violations.push({
            relPath,
            lineNo,
            rule: 'LINT-03',
            detail: 'malformed tag (missing proj:)'
          });
        }

        if (!hasType && !hasInvalidType) {
          violations.push({
            relPath,
            lineNo,
            rule: 'LINT-03',
            detail: 'malformed tag (missing type:)'
          });
        }
      }
    }
  }

  // Generate formatting and summary
  const formattedViolations = violations.map(v => {
    const lineStr = v.lineNo ? `:${v.lineNo}` : '';
    const hintStr = v.hint ? ` ${v.hint}` : '';
    return `${MARK} ${v.relPath}${lineStr}: ${v.rule} ${v.detail}.${hintStr}`;
  });

  const uniqueFiles = new Set(violations.map(v => v.relPath));
  const summary = formattedViolations.length > 0
    ? `FAIL: ${formattedViolations.length} violation(s) across ${uniqueFiles.size} file(s).`
    : '';

  return { violations: formattedViolations, summary };
}

// --- Self-Test Driver ---
function runSelfTest() {
  const FIXTURES = [
    { dir: 'tests/fixtures/good', expectExit: 0, expectSubstrings: [] },
    { dir: 'tests/fixtures/bad-budget', expectExit: 1, expectSubstrings: ['BUDG-01', 'BUDG-02'] },
    { dir: 'tests/fixtures/bad-antipattern-missing', expectExit: 1, expectSubstrings: ['LINT-02'] },
    { dir: 'tests/fixtures/bad-tag-malformed', expectExit: 1, expectSubstrings: ['LINT-03'] }
  ];

  const __filename = fileURLToPath(import.meta.url);
  const scriptPath = __filename;

  let passed = true;
  const details = [];

  for (const fix of FIXTURES) {
    const fixtureDir = path.resolve(fix.dir);
    if (!fs.existsSync(fixtureDir)) {
      console.error(`SELF-TEST FAIL: fixture not found at ${fix.dir}`);
      process.exit(1);
    }

    const result = spawnSync('node', [scriptPath, '--root', fixtureDir], { encoding: 'utf8' });
    
    if (result.status !== fix.expectExit) {
      passed = false;
      details.push(`${fix.dir}: expected exit ${fix.expectExit}, got ${result.status}`);
      continue;
    }

    let subCheck = true;
    for (const sub of fix.expectSubstrings) {
      if (!result.stdout.includes(sub)) {
        passed = false;
        subCheck = false;
        details.push(`${fix.dir}: output missing expected substring "${sub}"`);
      }
    }

    if (subCheck) {
      console.log(`✓ ${fix.dir} passed.`);
    }
  }

  if (passed) {
    console.log('SELF-TEST PASS (4/4 fixtures).');
    process.exit(0);
  } else {
    console.error('SELF-TEST FAIL:', details.join('; '));
    process.exit(1);
  }
}

// --- Main Entry ---
function main() {
  const args = process.argv.slice(2);
  let selfTest = false;
  let rootDir = process.cwd();

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--self-test') {
      selfTest = true;
    } else if (arg === '--root') {
      if (i + 1 < args.length) {
        rootDir = args[++i];
      } else {
        console.error('Usage: npm run validate [-- --self-test] [-- --root <path>]');
        process.exit(2);
      }
    } else {
      console.error('Usage: npm run validate [-- --self-test] [-- --root <path>]');
      process.exit(2);
    }
  }

  if (selfTest) {
    runSelfTest();
  } else {
    const { violations, summary } = lintTree(rootDir);
    if (violations.length > 0) {
      for (const v of violations) {
        console.log(v);
      }
      console.log(summary);
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// If executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename || path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main();
}
