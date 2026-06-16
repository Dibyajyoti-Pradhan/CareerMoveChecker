import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const comparePage = readFileSync(resolve(__dirname, '../src/pages/ComparePage.tsx'), 'utf8');
const packageJson = readFileSync(resolve(__dirname, '../package.json'), 'utf8');

const requiredSnippets = [
  'Paste a shortlist',
  'extractCompareIdentifiers',
  'addIdentifiers',
  'Companies House links, commas, or new lines',
  'Added ${added} compan',
  'const extracted = extractCompareIdentifiers(input);',
  'onPaste={(e) => {',
  "e.clipboardData.getData('text')",
  'freeSlots = MAX - numbers.length',
  'input.includes(\'\\n\') || input.includes(\',\')',
];

for (const snippet of requiredSnippets) {
  if (!comparePage.includes(snippet)) {
    throw new Error(`Compare page must include pasted shortlist compare entry: ${snippet}`);
  }
}

if (!comparePage.includes('\\b[A-Z]{2}\\d{6}\\b') || !comparePage.includes('\\b\\d{8}\\b')) {
  throw new Error('Compare paste extraction must support numeric and prefix-style Companies House numbers.');
}

if (!packageJson.includes('"test:compare-paste"')) {
  throw new Error('package.json must expose test:compare-paste for regression checks.');
}

console.log('Compare pasted shortlist assertions passed.');
