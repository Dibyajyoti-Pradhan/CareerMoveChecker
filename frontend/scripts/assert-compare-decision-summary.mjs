import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const comparePage = readFileSync(resolve(__dirname, '../src/pages/ComparePage.tsx'), 'utf8');

const requiredSnippets = [
  'Compare takeaway',
  'Decision summary',
  'Best current pick',
  'Highest score',
  'Watch before you commit',
  'compareTakeaway',
  'riskHeadline',
  '/app/company/${best.profile.companyNumber}',
  '/app/company/${watched.profile.companyNumber}',
];

for (const snippet of requiredSnippets) {
  if (!comparePage.includes(snippet)) {
    throw new Error(`Compare page must include decision summary feature: ${snippet}`);
  }
}

if (!/reports\.length\s*>=\s*2/.test(comparePage)) {
  throw new Error('Decision summary should appear only when at least two companies are loaded.');
}

console.log('Compare decision summary assertions passed.');
