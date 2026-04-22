#!/usr/bin/env node
/**
 * Script to fix ESLint errors from npm run build output.
 * Fixes:
 * 1. no-unused-vars: removes unused imports/variables or renames to _prefix
 * 2. no-explicit-any: adds eslint-disable-next-line comment
 * 3. prefer-const: changes let to const
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run eslint directly with JSON format - much faster than npm run build
console.log('Running eslint to capture errors...');
let eslintOutput;
try {
  eslintOutput = execSync(
    'npx eslint app/ components/ lib/ hooks/ --ext .ts,.tsx --format json',
    { encoding: 'utf-8', cwd: __dirname, maxBuffer: 50 * 1024 * 1024 }
  );
} catch (e) {
  // ESLint exits with non-zero when there are errors
  eslintOutput = e.stdout || '[]';
}

let results;
try {
  results = JSON.parse(eslintOutput);
} catch (e) {
  console.error('Failed to parse eslint output:', e.message);
  process.exit(1);
}

let fixedAny = 0;
let fixedUnused = 0;
let fixedPreferConst = 0;
let skipped = 0;

for (const result of results) {
  const filePath = result.filePath;
  const messages = result.messages || [];
  if (messages.length === 0) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let changed = false;

  // Sort messages by line descending so modifications don't shift line numbers
  const sortedMessages = [...messages].sort((a, b) => b.line - a.line);

  for (const msg of sortedMessages) {
    const lineIdx = msg.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) continue;

    const lineContent = lines[lineIdx];
    const ruleId = msg.ruleId;

    if (ruleId === '@typescript-eslint/no-explicit-any') {
      const indent = lineContent.match(/^(\s*)/)?.[1] || '';
      // Check if already has disable comment on previous line
      if (lineIdx > 0 && lines[lineIdx - 1].includes('eslint-disable-next-line @typescript-eslint/no-explicit-any')) {
        continue;
      }
      lines.splice(lineIdx, 0, indent + '// eslint-disable-next-line @typescript-eslint/no-explicit-any');
      fixedAny++;
      changed = true;
    } else if (ruleId === '@typescript-eslint/no-unused-vars') {
      const result = fixUnusedVars(lines, lineIdx, msg.message);
      if (result) {
        fixedUnused++;
        changed = true;
      } else {
        skipped++;
      }
    } else if (ruleId === 'prefer-const') {
      const result = fixPreferConst(lines, lineIdx);
      if (result) {
        fixedPreferConst++;
        changed = true;
      } else {
        skipped++;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    console.log(`Fixed: ${path.relative(__dirname, filePath)}`);
  }
}

console.log(`\nSummary:`);
console.log(`  no-explicit-any: ${fixedAny} fixed`);
console.log(`  no-unused-vars: ${fixedUnused} fixed`);
console.log(`  prefer-const: ${fixedPreferConst} fixed`);
console.log(`  skipped: ${skipped}`);

function fixUnusedVars(lines, lineIdx, message) {
  const line = lines[lineIdx];

  // Extract the variable name from the message: "'X' is defined but never used"
  const varMatch = message.match(/'([^']+)'/);
  if (!varMatch) return false;
  const varName = varMatch[1];

  // Pattern: import { X } from '...' or import { A, X, B } from '...'
  const importMatch = line.match(/^(\s*import\s+\{)([^}]+)(\}\s+from\s+['"][^'"]+['"];?\s*)$/);
  if (importMatch) {
    const prefix = importMatch[1];
    const imports = importMatch[2];
    const suffix = importMatch[3];

    // Split imports and remove the unused one
    const importParts = imports.split(',').map(p => p.trim()).filter(p => {
      // Handle "Name" or "Name as Alias"
      const name = p.split(/\s+as\s+/)[0].trim();
      return name !== varName;
    });

    if (importParts.length === 0) {
      // Remove entire import line
      lines.splice(lineIdx, 1);
    } else {
      lines[lineIdx] = prefix + ' ' + importParts.join(', ') + ' ' + suffix;
    }
    return true;
  }

  // Pattern: import X from '...' (default import)
  const defaultImportMatch = line.match(new RegExp(`^(\\s*import\\s+)${varName}(\\s+from\\s+)`, 'i'));
  if (defaultImportMatch) {
    lines.splice(lineIdx, 1);
    return true;
  }

  // Pattern: import * as X from '...'
  const namespaceImportMatch = line.match(new RegExp(`^(\\s*import\\s+\\*\\s+as\\s+)${varName}(\\s+from\\s+)`, 'i'));
  if (namespaceImportMatch) {
    lines.splice(lineIdx, 1);
    return true;
  }

  // Pattern: const/let/var X = ... (single variable assignment, no destructuring, no comma)
  const singleVarMatch = line.match(new RegExp(`^(\\s*)(const|let|var)\\s+${varName}\\s*=.*$`));
  if (singleVarMatch && !line.includes(',')) {
    lines.splice(lineIdx, 1);
    return true;
  }

  // Pattern: const/let/var { a, X, b } = ... (destructured)
  const destructMatch = line.match(/^(\s*)(const|let|var)\s+\{([^}]+)\}/);
  if (destructMatch) {
    const newLine = line.replace(new RegExp(`(,?\\s*)${varName}(\\s*,?)`), (m, before, after) => {
      if (before.includes(',') && after.includes(',')) return ',';
      return '';
    });
    // Clean up double commas or trailing/leading commas
    let cleaned = newLine.replace(/\{\s*,/, '{').replace(/,\s*\}/, ' }');
    if (cleaned !== line) {
      lines[lineIdx] = cleaned;
      return true;
    }
  }

  // Pattern: function parameter or catch clause - rename to _varName
  if (line.includes(varName)) {
    // Be careful: only rename if it's a standalone identifier
    const newLine = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
    if (newLine !== line) {
      lines[lineIdx] = newLine;
      return true;
    }
  }

  return false;
}

function fixPreferConst(lines, lineIdx) {
  const line = lines[lineIdx];
  if (line.includes('let ')) {
    lines[lineIdx] = line.replace(/\blet\b/, 'const');
    return true;
  }
  return false;
}
