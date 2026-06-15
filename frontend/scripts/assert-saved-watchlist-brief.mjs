import { readFileSync } from 'node:fs';

const saved = readFileSync(new URL('../src/pages/SavedPage.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/pages.css', import.meta.url), 'utf8');

const requiredSavedMarkers = [
  'aria-label="Watchlist briefing"',
  'buildWatchlistBrief',
  'Copy watchlist brief',
  'Top priority',
  'Best next action',
  'watchlistBriefToText',
];

const missingSaved = requiredSavedMarkers.filter((marker) => !saved.includes(marker));
if (missingSaved.length > 0) {
  throw new Error(`Saved page is missing watchlist brief markers: ${missingSaved.join(', ')}`);
}

const requiredCssMarkers = [
  '.watchlist-brief',
  '.watchlist-brief .brief-panel',
  '.watchlist-brief .brief-action',
];

const missingCss = requiredCssMarkers.filter((marker) => !css.includes(marker));
if (missingCss.length > 0) {
  throw new Error(`Watchlist brief styling is missing: ${missingCss.join(', ')}`);
}

console.log('Saved watchlist briefing assertions passed');
