import { readFileSync } from 'node:fs';

const saved = readFileSync(new URL('../src/pages/SavedPage.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/pages.css', import.meta.url), 'utf8');

const requiredSavedMarkers = [
  'Paste a watchlist',
  'extractWatchlistCompanyNumbers',
  'handleImportWatchlist',
  'aria-label="Paste companies to save"',
  'Import to watchlist',
  'Companies House URLs, company numbers, or spreadsheet notes',
];

const missingSaved = requiredSavedMarkers.filter((marker) => !saved.includes(marker));
if (missingSaved.length > 0) {
  throw new Error(`Saved paste-import UX is missing markers: ${missingSaved.join(', ')}`);
}

const requiredCssMarkers = [
  '.watchlist-import',
  '.watchlist-import textarea',
  '.watchlist-import .import-example',
];

const missingCss = requiredCssMarkers.filter((marker) => !css.includes(marker));
if (missingCss.length > 0) {
  throw new Error(`Saved paste-import styling is missing: ${missingCss.join(', ')}`);
}

console.log('Saved paste-import assertions passed');
