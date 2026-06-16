import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const searchPage = readFileSync(resolve(__dirname, '../src/pages/SearchPage.tsx'), 'utf8');
const packageJson = readFileSync(resolve(__dirname, '../package.json'), 'utf8');

const requiredSnippets = [
  'Save selected to watchlist',
  'handleSaveSelectedToWatchlist',
  'api.saveCompany({ companyNumber: hit.companyNumber, companyName: hit.companyName })',
  'Saved ${selectedHits.length} compan',
  'View saved watchlist',
  'Watchlist save failed',
  'onSaveSelected',
];

for (const snippet of requiredSnippets) {
  if (!searchPage.includes(snippet)) {
    throw new Error(`Search page must turn selected results into a saved watchlist workflow: ${snippet}`);
  }
}

if (!/const \[savingSelected, setSavingSelected\] = useState\(false\)/.test(searchPage)) {
  throw new Error('Search page must track selected-result save progress.');
}

if (!/const \[watchlistToast, setWatchlistToast\]/.test(searchPage)) {
  throw new Error('Search page must give users confirmation after saving a shortlist.');
}

if (!packageJson.includes('"test:search-watchlist"')) {
  throw new Error('package.json must expose npm run test:search-watchlist.');
}

console.log('Search watchlist save assertions passed.');
