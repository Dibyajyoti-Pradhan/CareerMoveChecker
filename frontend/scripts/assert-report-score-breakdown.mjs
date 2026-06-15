import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/pages/CompanyReportPage.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/pages.css', import.meta.url), 'utf8');

const requiredPageSnippets = [
  'buildScoreDrivers(report)',
  'className="score-breakdown"',
  'What pushed the score down',
  'What helped the score',
  'Plain-English score read',
  'scoreDrivers.downsides',
  'scoreDrivers.upsides',
];

const requiredCssSnippets = [
  '.score-breakdown',
  '.score-breakdown-grid',
  '.score-driver.down',
  '.score-driver.up',
];

const missing = [
  ...requiredPageSnippets.filter((snippet) => !page.includes(snippet)).map((snippet) => `CompanyReportPage.tsx missing ${snippet}`),
  ...requiredCssSnippets.filter((snippet) => !css.includes(snippet)).map((snippet) => `pages.css missing ${snippet}`),
];

if (missing.length > 0) {
  console.error('Report score-breakdown assertions failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Report score-breakdown assertions passed.');
