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

console.log('Homepage accessibility assertions passed.');
