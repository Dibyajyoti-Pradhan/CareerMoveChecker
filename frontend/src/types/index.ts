export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RiskFlagSeverity = 'POSITIVE' | 'INFO' | 'WARNING' | 'CRITICAL';
export type CompanyStatus =
  | 'active'
  | 'dissolved'
  | 'liquidation'
  | 'receivership'
  | 'administration'
  | 'voluntary-arrangement'
  | 'converted-closed';

export interface CompanySearchHit {
  companyNumber: string;
  companyName: string;
  companyStatus: CompanyStatus;
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
  status: 'outstanding' | 'satisfied' | 'part-satisfied';
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
  startedOn: string;
}

export interface CompanyProfile {
  companyNumber: string;
  companyName: string;
  companyStatus: CompanyStatus;
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
  engineType: 'RULE_BASED' | 'AI_ASSISTED' | 'EXTERNAL_PROVIDER';
  modelVersion: string;
  explanationSummary: string;
  confidence: number;
}

export interface CompanyReport {
  profile: CompanyProfile;
  assessment: RiskAssessment;
  officers: Officer[];
  psc: PscEntry[];
  charges: Charge[];
  filings: FilingEntry[];
  insolvency: InsolvencyCase[];
  dataFetchedAt: string;
  computedAt: string;
}

export interface SavedCompany {
  companyNumber: string;
  companyName: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type FeedbackUseCase =
  | 'JOINING_AS_EMPLOYEE'
  | 'FREELANCE_CLIENT_WORK'
  | 'SUPPLIER_CHECK'
  | 'LANDLORD_TENANT_CHECK'
  | 'INVESTMENT_RESEARCH'
  | 'OTHER';

export interface FeedbackInput {
  companyNumber: string;
  rating: number;
  useCase: FeedbackUseCase;
  comment?: string;
}

export interface AdminSummary {
  searchesToday: number;
  searches7d: number;
  searches30d: number;
  reportsViewed7d: number;
  searchToReportConversion: number;
  noResultSearches7d: number;
  apiSuccessRate7d: number;
  avgApiLatencyMs: number;
  errorCount7d: number;
  openAlerts: number;
  riskDistribution: Record<RiskLevel, number>;
  topSearched: { companyName: string; companyNumber: string; count: number }[];
  topViewed: { companyName: string; companyNumber: string; views: number; riskLevel: RiskLevel }[];
  feedbackBreakdown: Record<FeedbackUseCase, number>;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';
export type AlertType =
  | 'API_FAILURE'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'MALFORMED_RESPONSE'
  | 'SCHEMA_DRIFT'
  | 'MISSING_REQUIRED_FIELD'
  | 'STALE_DATA'
  | 'CONTRADICTORY_DATA'
  | 'PARTIAL_DATA'
  | 'CACHE_REFRESH_FAILED';

export interface DownstreamAlert {
  id: string;
  provider: string;
  endpoint: string;
  companyNumber?: string;
  companyName?: string;
  alertType: AlertType;
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
