import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const searchPage = readFileSync(resolve(__dirname, '../src/pages/SearchPage.tsx'), 'utf8');

const requiredSnippets = [
  'Compare shortlist',
  'selectedCompanies',
  'toggleSelectedCompany',
  'Clear shortlist',
  '/app/compare?numbers=',
  'Add to compare shortlist',
];

for (const snippet of requiredSnippets) {
  if (!searchPage.includes(snippet)) {
    throw new Error(`Search page must include shortlist compare feature: ${snippet}`);
  }
}

if (!/useState<Set<string>>\(\(\) => new Set\(\)\)/.test(searchPage)) {
  throw new Error('Search shortlist must keep selected company numbers in state.');
}

console.log('Search shortlist assertions passed.');
