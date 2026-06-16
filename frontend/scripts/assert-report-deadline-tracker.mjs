import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/pages/CompanyReportPage.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/pages.css', import.meta.url), 'utf8');

const requiredPageSnippets = [
  'buildDeadlineTracker(report, canonicalUrl)',
  'className="deadline-tracker"',
  'Filing deadline tracker',
  'Copy filing reminder',
  'deadlineTracker.accounts.label',
  'deadlineTracker.confirmation.label',
  'deadlineTracker.nextAction',
  'deadlineReminderToText(deadlineTracker)',
];

const requiredCssSnippets = [
  '.deadline-tracker',
  '.deadline-tracker-grid',
  '.deadline-signal.bad',
  '.deadline-signal.warn',
  '.deadline-signal.ok',
];

const missing = [
  ...requiredPageSnippets.filter((snippet) => !page.includes(snippet)).map((snippet) => `CompanyReportPage.tsx missing ${snippet}`),
  ...requiredCssSnippets.filter((snippet) => !css.includes(snippet)).map((snippet) => `pages.css missing ${snippet}`),
];

if (missing.length > 0) {
  console.error('Report deadline-tracker assertions failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Report deadline-tracker assertions passed.');
