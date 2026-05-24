import type {
  CompanyReport,
  CompanySearchHit,
  DownstreamAlert,
  SavedCompany,
  AdminSummary,
} from '../types';

export const mockHits: CompanySearchHit[] = [
  {
    companyNumber: '03977902',
    companyName: 'MONZO BANK LIMITED',
    companyStatus: 'active',
    companyType: 'Private limited company',
    addressSnippet: 'Broadwalk House, 5 Appold Street, London, EC2A 2AG',
    incorporatedOn: '2000-02-08',
  },
  {
    companyNumber: '07635254',
    companyName: 'DELIVEROO PLC',
    companyStatus: 'active',
    companyType: 'Public limited company',
    addressSnippet: 'The River Building, 1 Cousin Lane, London, EC4R 3TE',
    incorporatedOn: '2011-05-12',
  },
  {
    companyNumber: '09349736',
    companyName: 'BULB ENERGY LTD',
    companyStatus: 'liquidation',
    companyType: 'Private limited company',
    addressSnippet: '155 Bishopsgate, London, EC2M 3YD',
    incorporatedOn: '2014-12-22',
  },
  {
    companyNumber: '13571112',
    companyName: 'NEWCO STUDIOS LTD',
    companyStatus: 'active',
    companyType: 'Private limited company',
    addressSnippet: '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ',
    incorporatedOn: '2025-11-04',
  },
  {
    companyNumber: '04500110',
    companyName: 'CARILLION CONSTRUCTION LIMITED',
    companyStatus: 'liquidation',
    companyType: 'Private limited company',
    addressSnippet: '24 Birch Street, Wolverhampton, WV1 4HY',
    incorporatedOn: '2002-08-12',
  },
  {
    companyNumber: '08123456',
    companyName: 'STEADY SUPPLIES LIMITED',
    companyStatus: 'active',
    companyType: 'Private limited company',
    addressSnippet: '14 Hanover Square, London, W1S 1HP',
    incorporatedOn: '2012-06-15',
  },
  {
    companyNumber: '02050000',
    companyName: 'HERITAGE TRADING CO LIMITED',
    companyStatus: 'active',
    companyType: 'Private limited company',
    addressSnippet: '2 More London Riverside, London, SE1 2AP',
    incorporatedOn: '1986-09-21',
  },
  {
    companyNumber: '11223344',
    companyName: 'CHURNED OUT LTD',
    companyStatus: 'dissolved',
    companyType: 'Private limited company',
    addressSnippet: '5 Old Bailey, London, EC4M 7BA',
    incorporatedOn: '2018-03-04',
  },
];

const today = '2026-05-24';

export const mockReports: Record<string, CompanyReport> = {
  '03977902': {
    profile: {
      companyNumber: '03977902',
      companyName: 'MONZO BANK LIMITED',
      companyStatus: 'active',
      companyType: 'Private limited company',
      incorporatedOn: '2000-02-08',
      sicCodes: ['64191'],
      registeredOffice: {
        line1: 'Broadwalk House',
        line2: '5 Appold Street',
        locality: 'London',
        postalCode: 'EC2A 2AG',
        country: 'United Kingdom',
      },
      accountsOverdue: false,
      confirmationStatementOverdue: false,
      nextAccountsDue: '2026-12-31',
      lastAccountsMadeUpTo: '2025-02-28',
    },
    assessment: {
      score: 92,
      riskLevel: 'LOW',
      verdict:
        'Active, well-established company with consistent filings and visible ownership. No insolvency or strike-off signals detected.',
      topReasons: [
        'Active for over 25 years',
        'Accounts and confirmation statement filed on time',
        'No insolvency or strike-off filings visible',
      ],
      flags: [
        {
          id: 'longevity',
          severity: 'POSITIVE',
          title: 'Long trading history',
          explanation:
            'Incorporated over 25 years ago. Longer trading history is a visible positive signal — not a guarantee of safety.',
          evidence: 'Incorporated 2000-02-08',
          recommendedAction: 'None required.',
        },
        {
          id: 'filings_current',
          severity: 'POSITIVE',
          title: 'Filings up to date',
          explanation:
            'Accounts and confirmation statement appear current at Companies House.',
          evidence: 'Last accounts made up to 2025-02-28',
          recommendedAction: 'None required.',
        },
      ],
      recommendedActions: [
        {
          id: 'verify_role',
          title: 'Verify the specific entity you are dealing with',
          detail:
            'Large groups have multiple entities. Confirm the company number on your contract matches what you expect.',
        },
      ],
      engineType: 'RULE_BASED',
      modelVersion: 'rules-v1',
      explanationSummary:
        'Strong public-data signals across longevity, filings, and ownership transparency.',
      confidence: 0.86,
    },
    officers: [
      { name: 'Anil Kamath', role: 'Director', appointedOn: '2021-06-01', nationality: 'British', occupation: 'Banker' },
      { name: 'TS Anil', role: 'Director', appointedOn: '2020-09-14', nationality: 'British', occupation: 'CEO' },
      { name: 'Gary Hoffman', role: 'Director', appointedOn: '2018-12-11', nationality: 'British', occupation: 'Chair' },
    ],
    psc: [
      {
        name: 'Monzo Bank Holding Group Limited',
        kind: 'corporate-entity-person-with-significant-control',
        natureOfControl: ['ownership-of-shares-75-to-100-percent'],
        notifiedOn: '2021-07-01',
      },
    ],
    charges: [
      {
        id: 'ch-1',
        status: 'outstanding',
        createdOn: '2022-04-12',
        description: 'Fixed and floating charge over assets',
        personsEntitled: ['HSBC UK Bank plc'],
      },
    ],
    filings: [
      { id: 'f1', date: '2025-09-04', type: 'AA', description: 'Full accounts made up to 28 February 2025', category: 'accounts' },
      { id: 'f2', date: '2025-03-12', type: 'CS01', description: 'Confirmation statement', category: 'confirmation-statement' },
      { id: 'f3', date: '2024-12-10', type: 'AP01', description: 'Appointment of director', category: 'officers' },
    ],
    insolvency: [],
    dataFetchedAt: today,
    computedAt: today,
  },
  '13571112': {
    profile: {
      companyNumber: '13571112',
      companyName: 'NEWCO STUDIOS LTD',
      companyStatus: 'active',
      companyType: 'Private limited company',
      incorporatedOn: '2025-11-04',
      sicCodes: ['74909'],
      registeredOffice: {
        line1: '71-75 Shelton Street',
        locality: 'Covent Garden, London',
        postalCode: 'WC2H 9JQ',
        country: 'United Kingdom',
      },
      accountsOverdue: false,
      confirmationStatementOverdue: false,
    },
    assessment: {
      score: 62,
      riskLevel: 'MODERATE',
      verdict:
        'Newly incorporated company. Not necessarily negative, but limited public-data history available — additional checks recommended before extending credit or signing.',
      topReasons: [
        'Incorporated less than 6 months ago',
        'No filed accounts yet',
        'Single officer visible — verify governance arrangements',
      ],
      flags: [
        {
          id: 'recently_incorporated',
          severity: 'WARNING',
          title: 'Recently incorporated',
          explanation:
            'Company has been registered for under 6 months. Not necessarily negative — many legitimate businesses are new — but there is little public trading history to draw on.',
          evidence: 'Incorporated 2025-11-04',
          recommendedAction:
            'Ask for trade references, recent invoices or proof of work where relevant.',
        },
        {
          id: 'governance_thin',
          severity: 'INFO',
          title: 'Limited governance visibility',
          explanation:
            'Only one officer is currently visible. For a small company this is normal, but worth confirming.',
          evidence: '1 active officer',
          recommendedAction: 'Ask who else is involved operationally.',
        },
      ],
      recommendedActions: [
        {
          id: 'request_references',
          title: 'Request trade references',
          detail:
            'For new entities, references from prior employers/clients/suppliers carry more weight than registry data.',
        },
        {
          id: 'staged_engagement',
          title: 'Consider a staged engagement',
          detail:
            'Smaller initial contract value or milestone payments reduce exposure while you build trust.',
        },
      ],
      engineType: 'RULE_BASED',
      modelVersion: 'rules-v1',
      explanationSummary:
        'Newly formed entity with limited filing history. Standard caution for early-stage companies.',
      confidence: 0.62,
    },
    officers: [
      { name: 'Sara Patel', role: 'Director', appointedOn: '2025-11-04', nationality: 'British', occupation: 'Director' },
    ],
    psc: [
      {
        name: 'Sara Patel',
        kind: 'individual-person-with-significant-control',
        natureOfControl: ['ownership-of-shares-75-to-100-percent'],
        notifiedOn: '2025-11-04',
      },
    ],
    charges: [],
    filings: [
      { id: 'f1', date: '2025-11-04', type: 'IN01', description: 'Incorporation', category: 'incorporation' },
    ],
    insolvency: [],
    dataFetchedAt: today,
    computedAt: today,
  },
  '09349736': {
    profile: {
      companyNumber: '09349736',
      companyName: 'BULB ENERGY LTD',
      companyStatus: 'liquidation',
      companyType: 'Private limited company',
      incorporatedOn: '2014-12-22',
      sicCodes: ['35140'],
      registeredOffice: {
        line1: '155 Bishopsgate',
        locality: 'London',
        postalCode: 'EC2M 3YD',
        country: 'United Kingdom',
      },
      accountsOverdue: true,
      confirmationStatementOverdue: true,
    },
    assessment: {
      score: 8,
      riskLevel: 'CRITICAL',
      verdict:
        'Company is in liquidation according to Companies House. Verify before proceeding with any new commitment. This is not a fraud determination — it is a public-data status.',
      topReasons: [
        'Company status: liquidation',
        'Insolvency records present',
        'Accounts and confirmation statement overdue',
      ],
      flags: [
        {
          id: 'liquidation',
          severity: 'CRITICAL',
          title: 'In liquidation',
          explanation:
            'Companies House lists this company in liquidation. New commitments to a company in this state carry serious visible risk.',
          evidence: 'Status: liquidation',
          recommendedAction:
            'Do not extend new credit or accept new engagements without legal/insolvency advice.',
        },
        {
          id: 'insolvency_records',
          severity: 'CRITICAL',
          title: 'Insolvency records on file',
          explanation:
            'One or more insolvency events are recorded against this company.',
          evidence: '1 insolvency case visible',
          recommendedAction:
            'Read filed insolvency documents before proceeding.',
        },
        {
          id: 'accounts_overdue',
          severity: 'WARNING',
          title: 'Accounts overdue',
          explanation:
            'Annual accounts are past the filing deadline. Overdue accounts often correlate with operational difficulty.',
          evidence: 'Accounts overdue flag set',
          recommendedAction: 'Treat any operational claims with extra scrutiny.',
        },
      ],
      recommendedActions: [
        {
          id: 'stop',
          title: 'Pause new commitments',
          detail:
            'Avoid signing, supplying, invoicing, or joining until the situation is verified with the appointed officeholder.',
        },
        {
          id: 'legal',
          title: 'Seek professional advice',
          detail: 'For exposure already taken, get insolvency or legal advice.',
        },
      ],
      engineType: 'RULE_BASED',
      modelVersion: 'rules-v1',
      explanationSummary:
        'Critical insolvency-related public-data signals across status, filings, and insolvency records.',
      confidence: 0.94,
    },
    officers: [
      { name: 'Hayden Wood', role: 'Director', appointedOn: '2014-12-22', resignedOn: '2021-11-22' },
    ],
    psc: [],
    charges: [
      { id: 'ch-1', status: 'outstanding', createdOn: '2019-06-04', description: 'Debenture' },
      { id: 'ch-2', status: 'outstanding', createdOn: '2020-11-19', description: 'Fixed charge' },
    ],
    filings: [
      { id: 'f1', date: '2021-11-24', type: 'LIQ01', description: 'Notice of administration', category: 'insolvency' },
      { id: 'f2', date: '2021-11-22', type: 'TM01', description: 'Termination of appointment of director', category: 'officers' },
    ],
    insolvency: [
      { caseNumber: 'INS-001', type: 'Administration', status: 'in-progress', startedOn: '2021-11-24' },
    ],
    dataFetchedAt: today,
    computedAt: today,
  },
};

export const mockSaved: SavedCompany[] = [
  {
    companyNumber: '03977902',
    companyName: 'MONZO BANK LIMITED',
    note: 'Potential employer — interviewing Q2',
    createdAt: '2026-05-10',
    updatedAt: '2026-05-20',
  },
  {
    companyNumber: '13571112',
    companyName: 'NEWCO STUDIOS LTD',
    note: 'Freelance client, asked for 30-day net terms',
    createdAt: '2026-05-18',
    updatedAt: '2026-05-22',
  },
];

export const mockAdminSummary: AdminSummary = {
  searchesToday: 142,
  searches7d: 980,
  searches30d: 4120,
  reportsViewed7d: 612,
  searchToReportConversion: 0.62,
  noResultSearches7d: 41,
  apiSuccessRate7d: 0.987,
  avgApiLatencyMs: 312,
  errorCount7d: 18,
  openAlerts: 3,
  riskDistribution: { LOW: 410, MODERATE: 120, HIGH: 55, CRITICAL: 27 },
  topSearched: [
    { companyName: 'MONZO BANK LIMITED', companyNumber: '03977902', count: 38 },
    { companyName: 'DELIVEROO PLC', companyNumber: '07635254', count: 27 },
    { companyName: 'STEADY SUPPLIES LIMITED', companyNumber: '08123456', count: 19 },
  ],
  topViewed: [
    { companyName: 'MONZO BANK LIMITED', companyNumber: '03977902', views: 56, riskLevel: 'LOW' },
    { companyName: 'BULB ENERGY LTD', companyNumber: '09349736', views: 41, riskLevel: 'CRITICAL' },
    { companyName: 'NEWCO STUDIOS LTD', companyNumber: '13571112', views: 22, riskLevel: 'MODERATE' },
  ],
  feedbackBreakdown: {
    JOINING_AS_EMPLOYEE: 168,
    FREELANCE_CLIENT_WORK: 121,
    SUPPLIER_CHECK: 64,
    LANDLORD_TENANT_CHECK: 22,
    INVESTMENT_RESEARCH: 18,
    OTHER: 11,
  },
};

export const mockAlerts: DownstreamAlert[] = [
  {
    id: 'a-101',
    provider: 'companies-house',
    endpoint: '/company/{n}/filing-history',
    companyNumber: '07635254',
    companyName: 'DELIVEROO PLC',
    alertType: 'SCHEMA_DRIFT',
    severity: 'WARNING',
    status: 'OPEN',
    title: 'Unexpected field in filing-history response',
    message:
      'Field `category_v2` appeared in response. Verify parser handles new shape before relying on filings for scoring.',
    evidence: { newField: 'category_v2', sampleSize: 7 },
    firstSeenAt: '2026-05-23T09:14:00Z',
    lastSeenAt: '2026-05-24T07:02:00Z',
  },
  {
    id: 'a-102',
    provider: 'companies-house',
    endpoint: '/company/{n}/insolvency',
    companyNumber: '09349736',
    companyName: 'BULB ENERGY LTD',
    alertType: 'CONTRADICTORY_DATA',
    severity: 'CRITICAL',
    status: 'ACKNOWLEDGED',
    title: 'Profile vs insolvency disagree',
    message:
      'Profile status reported active 2 hours ago but insolvency endpoint now lists administration. Hold scoring until reconciled.',
    evidence: { profileStatus: 'active', insolvencyCount: 1 },
    firstSeenAt: '2026-05-24T05:55:00Z',
    lastSeenAt: '2026-05-24T08:11:00Z',
    acknowledgedAt: '2026-05-24T08:20:00Z',
  },
  {
    id: 'a-103',
    provider: 'companies-house',
    endpoint: '/search/companies',
    alertType: 'RATE_LIMIT',
    severity: 'WARNING',
    status: 'OPEN',
    title: '429 spike — search endpoint',
    message:
      '37 rate-limit responses in last hour. Back-off enabled. Consider raising daily quota window.',
    evidence: { count: 37, windowMinutes: 60 },
    firstSeenAt: '2026-05-24T07:50:00Z',
    lastSeenAt: '2026-05-24T08:42:00Z',
  },
  {
    id: 'a-104',
    provider: 'companies-house',
    endpoint: '/company/{n}',
    companyNumber: '11223344',
    companyName: 'CHURNED OUT LTD',
    alertType: 'STALE_DATA',
    severity: 'INFO',
    status: 'RESOLVED',
    title: 'Stale cache refreshed',
    message: 'Cached profile was >48h. Refresh succeeded on retry.',
    evidence: { ageHours: 51 },
    firstSeenAt: '2026-05-22T14:00:00Z',
    lastSeenAt: '2026-05-22T14:05:00Z',
    resolvedAt: '2026-05-22T14:06:00Z',
  },
];
