export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RiskFlagSeverity = 'POSITIVE' | 'INFO' | 'WARNING' | 'CRITICAL';
export type Persona = 'candidate' | 'freelancer' | 'agency';

export interface CompanySearchHit {
  companyNumber: string;
  companyName: string;
  companyStatus: string;
  companyType: string;
  addressSnippet: string;
  incorporatedOn?: string;
}

export interface Address {
  line1?: string;
  line2?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export interface Officer {
  name: string;
  role: string;
  appointedOn?: string;
  resignedOn?: string;
  nationality?: string;
  occupation?: string;
}

export interface PscEntry {
  name: string;
  kind: string;
  natureOfControl: string[];
  notifiedOn?: string;
  ceasedOn?: string;
}

export interface Charge {
  id: string;
  status: string;
  createdOn: string;
  deliveredOn?: string;
  description: string;
  personsEntitled?: string[];
}

export interface FilingEntry {
  id: string;
  date: string;
  type: string;
  description: string;
  category: string;
}

export interface InsolvencyCase {
  caseNumber: string;
  type: string;
  status: string;
  startedOn?: string;
}

export interface CompanyProfile {
  companyNumber: string;
  companyName: string;
  companyStatus: string;
  companyType: string;
  incorporatedOn?: string;
  sicCodes?: string[];
  registeredOffice?: Address;
  accountsOverdue?: boolean;
  confirmationStatementOverdue?: boolean;
  nextAccountsDue?: string;
  lastAccountsMadeUpTo?: string;
}

export interface RiskFlag {
  id: string;
  severity: RiskFlagSeverity;
  title: string;
  explanation: string;
  evidence: string;
  recommendedAction: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  detail: string;
}

export interface RiskAssessment {
  score: number;
  riskLevel: RiskLevel;
  verdict: string;
  topReasons: string[];
  flags: RiskFlag[];
  recommendedActions: RecommendedAction[];
  engineType: string;
  modelVersion: string;
  explanationSummary: string;
  confidence: number;
}

export interface DisqualificationMatch {
  name: string;
  reason?: string;
  disqualifiedFrom?: string;
  disqualifiedUntil?: string;
}

export interface DisqualificationCheck {
  status: 'CLEAR' | 'MATCH' | 'ERROR';
  matches: DisqualificationMatch[];
}

export interface CompanyReport {
  profile: CompanyProfile;
  assessment: RiskAssessment;
  officers: Officer[];
  psc: PscEntry[];
  charges: Charge[];
  filings: FilingEntry[];
  insolvency: InsolvencyCase[];
  disqualificationCheck?: DisqualificationCheck;
  dataFetchedAt: string;
  computedAt: string;
}

export interface FeedAlertDto {
  id: number;
  companyNumber: string;
  companyName: string;
  severity: 'bad' | 'warn' | 'ok' | 'info';
  alertType: string;
  title: string;
  description: string;
  meansByPersona: { candidate: string; freelancer: string; agency: string };
  unread: boolean;
  when: string;
}

export interface FeedResponse {
  groups: { day: string; items: FeedAlertDto[] }[];
  unread: number;
  totalCount: number;
}

export interface SavedCompany {
  companyNumber: string;
  companyName: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';

export interface DownstreamAlert {
  id: string;
  provider: string;
  endpoint: string;
  companyNumber?: string;
  companyName?: string;
  alertType: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  evidence: Record<string, unknown>;
  firstSeenAt: string;
  lastSeenAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  suppressedUntil?: string;
}

export interface BulkRow {
  index: number;
  input: string;
  matched: boolean;
  companyNumber?: string;
  companyName?: string;
  companyStatus?: string;
  riskLevel?: RiskLevel;
  score?: number;
  confidence?: number;
  bucket?: 'safe' | 'watch' | 'avoid' | 'unmatched';
}

export interface BulkResult {
  uploadId: string;
  uploadedAt: string;
  totalRows: number;
  matched: number;
  unmatched: number;
  rows: BulkRow[];
}
