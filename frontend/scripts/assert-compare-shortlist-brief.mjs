import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const comparePage = readFileSync(resolve(__dirname, '../src/pages/ComparePage.tsx'), 'utf8');
const packageJson = readFileSync(resolve(__dirname, '../package.json'), 'utf8');

const requiredSnippets = [
  'Shareable shortlist brief',
  'Copy shortlist brief',
  'Why this pick',
  'Risks to clear',
  'Questions to ask next',
  'buildShortlistBrief',
  'shortlistBriefToText',
  'navigator.clipboard?.writeText(shortlistBriefToText(shortlistBrief))',
  'Next action: open the best report and clear the watch list before committing.',
];

for (const snippet of requiredSnippets) {
  if (!comparePage.includes(snippet)) {
    throw new Error(`Compare page must include shortlist decision brief feature: ${snippet}`);
  }
}

if (!/reports\.length\s*>=\s*2/.test(comparePage)) {
  throw new Error('Shortlist brief should appear only after at least two reports are loaded.');
}

if (!packageJson.includes('"test:compare-brief"')) {
  throw new Error('package.json must expose test:compare-brief for regression checks.');
}

console.log('Compare shortlist brief assertions passed.');
