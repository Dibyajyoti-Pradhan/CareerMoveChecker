import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/pages/BulkCheckPage.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/pages.css', import.meta.url), 'utf8');
const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

const requiredPageSnippets = [
  'type BulkDecisionBrief =',
  'const bulkDecisionBrief = result ? buildBulkDecisionBrief(result.rows) : null;',
  'aria-label="Bulk decision briefing"',
  'Bulk decision briefing',
  'Top risk to clear',
  'Best next action',
  'Compare priority set',
  'Copy decision brief',
  'bulkDecisionBriefToText',
  '/app/compare?numbers=${bulkDecisionBrief.compareNumbers.join(',
];

const requiredCssSnippets = [
  '.bulk-decision-brief',
  '.bulk-decision-brief .brief-panel',
  '.bulk-decision-brief .brief-actions',
];

const requiredPackageSnippets = [
  '"test:bulk-brief": "node scripts/assert-bulk-decision-brief.mjs"',
];

const missing = [
  ...requiredPageSnippets.filter((snippet) => !page.includes(snippet)).map((snippet) => `BulkCheckPage.tsx missing ${snippet}`),
  ...requiredCssSnippets.filter((snippet) => !css.includes(snippet)).map((snippet) => `pages.css missing ${snippet}`),
  ...requiredPackageSnippets.filter((snippet) => !pkg.includes(snippet)).map((snippet) => `package.json missing ${snippet}`),
];

if (missing.length > 0) {
  console.error('Bulk decision brief assertions failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Bulk decision brief assertions passed.');
