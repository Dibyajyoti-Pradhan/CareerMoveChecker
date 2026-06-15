import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const homePage = readFileSync(resolve(__dirname, '../src/pages/HomePage.tsx'), 'utf8');

const searchInputMatch = homePage.match(/<input\s+[^>]*value=\{q\}[^>]*>/s);

if (!searchInputMatch) {
  throw new Error('Could not find the homepage hero search input bound to q.');
}

const searchInput = searchInputMatch[0];

if (!/aria-label="Search by company name, company number, or Companies House URL"/.test(searchInput)) {
  throw new Error('Homepage hero search input must have an explicit accessible aria-label, not only placeholder text.');
}

const requiredDecisionCopy = [
  'Before you sign an offer',
  'Before you invoice a new client',
  'Before you place a candidate',
];

for (const copy of requiredDecisionCopy) {
  if (!homePage.includes(copy)) {
    throw new Error(`Homepage must explain the decision moment: ${copy}`);
  }
}

const requiredExampleReportSignals = [
  'Caution — verify before proceeding.',
  'Some caution warranted. Public data shows mixed or limited signals.',
  'High officer churn in last 24 months',
  'Outstanding charges (2)',
];

for (const copy of requiredExampleReportSignals) {
  if (!homePage.includes(copy)) {
    throw new Error(`Homepage example report must match the live Monzo report signal: ${copy}`);
  }
}

const misleadingExampleClaims = [
  'Probably yes.',
  'no insolvency on file',
  'Stable leadership — board steady',
];

for (const copy of misleadingExampleClaims) {
  if (homePage.includes(copy)) {
    throw new Error(`Homepage example report must not make stale/misleading claim: ${copy}`);
  }
}

console.log('Homepage accessibility, conversion-copy, and example-report honesty assertions passed.');
