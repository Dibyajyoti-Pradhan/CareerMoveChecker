import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bulkPage = readFileSync(resolve(__dirname, '../src/pages/BulkCheckPage.tsx'), 'utf8');

const requiredSnippets = [
  'pasteInput',
  'processManualList',
  'Paste company numbers or names',
  'Run pasted list',
  'manual-list',
  'MAX_BULK_ROWS',
  'Extracted',
];

for (const snippet of requiredSnippets) {
  if (!bulkPage.includes(snippet)) {
    throw new Error(`Bulk page must support paste/manual bulk entry: ${snippet}`);
  }
}

if (!/const parseBulkInput = \(text: string\)/.test(bulkPage)) {
  throw new Error('Bulk page must share parsing between CSV upload and pasted/manual entry.');
}

if (!/Paste company numbers or names[\s\S]*textarea/.test(bulkPage)) {
  throw new Error('Bulk paste entry must expose a labelled textarea for no-file activation.');
}

console.log('Bulk paste entry assertions passed.');
