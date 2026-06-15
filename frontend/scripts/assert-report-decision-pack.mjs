import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportPage = readFileSync(resolve(__dirname, '../src/pages/CompanyReportPage.tsx'), 'utf8');

const requiredSnippets = [
  'Decision pack',
  'Candidate',
  'Freelancer',
  'Recruiter',
  'Questions to ask before you proceed',
  'Copy question pack',
  'buildDecisionPack',
];

for (const snippet of requiredSnippets) {
  if (!reportPage.includes(snippet)) {
    throw new Error(`Company report must include decision-pack feature copy or logic: ${snippet}`);
  }
}

if (!/useState<Persona>\('candidate'\)/.test(reportPage)) {
  throw new Error('Company report must default the decision pack to the candidate persona.');
}

console.log('Company report decision-pack assertions passed.');
