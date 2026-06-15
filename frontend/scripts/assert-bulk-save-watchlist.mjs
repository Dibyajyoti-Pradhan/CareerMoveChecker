import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/pages/BulkCheckPage.tsx', import.meta.url), 'utf8');
const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

const requiredPageSnippets = [
  'const saveSelectedToWatchlist = async () =>',
  'api.saveCompany({ companyNumber: row.companyNumber',
  'Save selected to watchlist',
  'Saved ${savedCount} selected compan',
  'const selectedRows = result?.rows.filter((row) => row.companyNumber && selected.has(row.companyNumber)) ?? [];',
  'selectedRows.length === 0 || savingSelected',
  '/app/saved',
];

const requiredPackageSnippets = [
  '"test:bulk-save": "node scripts/assert-bulk-save-watchlist.mjs"',
];

const missing = [
  ...requiredPageSnippets.filter((snippet) => !page.includes(snippet)).map((snippet) => `BulkCheckPage.tsx missing ${snippet}`),
  ...requiredPackageSnippets.filter((snippet) => !pkg.includes(snippet)).map((snippet) => `package.json missing ${snippet}`),
];

if (missing.length > 0) {
  console.error('Bulk save-to-watchlist assertions failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Bulk save-to-watchlist assertions passed.');
