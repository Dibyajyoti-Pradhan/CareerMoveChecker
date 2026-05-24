import type {
  CompanyReport,
  CompanySearchHit,
  DownstreamAlert,
  FeedbackInput,
  SavedCompany,
  AdminSummary,
  RiskLevel,
} from '../types';
import {
  mockAdminSummary,
  mockAlerts,
  mockHits,
  mockReports,
  mockSaved,
} from './mockData';

const USE_MOCK = (import.meta.env?.VITE_USE_MOCK ?? 'true') === 'true';

const DELAY_MS = 220;
const delay = <T>(value: T): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), DELAY_MS));

let saved = [...mockSaved];
let alerts = [...mockAlerts];

const fallbackReport = (hit: CompanySearchHit): CompanyReport => {
  const profile = {
    companyNumber: hit.companyNumber,
    companyName: hit.companyName,
    companyStatus: hit.companyStatus,
    companyType: hit.companyType,
    incorporatedOn: hit.incorporatedOn,
    accountsOverdue: false,
    confirmationStatementOverdue: false,
  };
  const isDissolved = hit.companyStatus === 'dissolved';
  const inWindUp =
    hit.companyStatus === 'liquidation' ||
    hit.companyStatus === 'receivership' ||
    hit.companyStatus === 'administration';
  const score = isDissolved ? 12 : inWindUp ? 18 : 70;
  const level: RiskLevel =
    score >= 80 ? 'LOW' : score >= 60 ? 'MODERATE' : score >= 40 ? 'HIGH' : 'CRITICAL';
  return {
    profile,
    assessment: {
      score,
      riskLevel: level,
      verdict: isDissolved
        ? 'Company is dissolved according to Companies House.'
        : inWindUp
          ? 'Company appears to be in a wind-up process.'
          : 'Active company. Limited rich signals available in this preview.',
      topReasons: [
        `Status: ${hit.companyStatus}`,
        hit.incorporatedOn ? `Incorporated ${hit.incorporatedOn}` : 'Incorporation date unknown',
      ],
      flags: [],
      recommendedActions: [
        {
          id: 'verify',
          title: 'Verify before committing',
          detail: 'Cross-check Companies House directly for the latest status.',
        },
      ],
      engineType: 'RULE_BASED',
      modelVersion: 'rules-v1',
      explanationSummary: 'Preview assessment based on status only.',
      confidence: 0.4,
    },
    officers: [],
    psc: [],
    charges: [],
    filings: [],
    insolvency: [],
    dataFetchedAt: '2026-05-24',
    computedAt: '2026-05-24',
  };
};

export const api = {
  async health() {
    return delay({ status: 'ok' });
  },

  async searchCompanies(q: string): Promise<CompanySearchHit[]> {
    if (!USE_MOCK) {
      const r = await fetch(`/api/companies/search?q=${encodeURIComponent(q)}`);
      return r.json();
    }
    const needle = q.trim().toLowerCase();
    if (!needle) return delay([]);
    const hits = mockHits.filter(
      (h) =>
        h.companyName.toLowerCase().includes(needle) ||
        h.companyNumber.includes(needle),
    );
    return delay(hits);
  },

  async getReport(companyNumber: string): Promise<CompanyReport | null> {
    if (!USE_MOCK) {
      const r = await fetch(`/api/companies/${companyNumber}/report`);
      if (r.status === 404) return null;
      return r.json();
    }
    const r = mockReports[companyNumber];
    if (r) return delay(r);
    const hit = mockHits.find((h) => h.companyNumber === companyNumber);
    if (!hit) return delay(null);
    return delay(fallbackReport(hit));
  },

  async refreshReport(companyNumber: string): Promise<CompanyReport | null> {
    return this.getReport(companyNumber);
  },

  async listSaved(): Promise<SavedCompany[]> {
    return delay([...saved]);
  },

  async saveCompany(input: {
    companyNumber: string;
    companyName: string;
    note?: string;
  }): Promise<SavedCompany> {
    const now = new Date().toISOString().slice(0, 10);
    const existing = saved.find((s) => s.companyNumber === input.companyNumber);
    if (existing) {
      existing.note = input.note ?? existing.note;
      existing.updatedAt = now;
      return delay(existing);
    }
    const item: SavedCompany = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    saved = [item, ...saved];
    return delay(item);
  },

  async updateSavedNote(companyNumber: string, note: string): Promise<SavedCompany | null> {
    const item = saved.find((s) => s.companyNumber === companyNumber);
    if (!item) return delay(null);
    item.note = note;
    item.updatedAt = new Date().toISOString().slice(0, 10);
    return delay(item);
  },

  async removeSaved(companyNumber: string): Promise<{ removed: boolean }> {
    const before = saved.length;
    saved = saved.filter((s) => s.companyNumber !== companyNumber);
    return delay({ removed: saved.length < before });
  },

  async compare(companyNumbers: string[]): Promise<CompanyReport[]> {
    const reports = await Promise.all(
      companyNumbers.map((n) => this.getReport(n)),
    );
    return reports.filter((r): r is CompanyReport => r !== null);
  },

  async submitFeedback(input: FeedbackInput): Promise<{ ok: true }> {
    void input;
    return delay({ ok: true });
  },

  async adminSummary(): Promise<AdminSummary> {
    return delay(mockAdminSummary);
  },

  async listAlerts(): Promise<DownstreamAlert[]> {
    return delay([...alerts]);
  },

  async alertAction(
    id: string,
    action: 'acknowledge' | 'resolve' | 'suppress' | 'retry',
  ): Promise<DownstreamAlert | null> {
    const a = alerts.find((x) => x.id === id);
    if (!a) return delay(null);
    const now = new Date().toISOString();
    if (action === 'acknowledge') {
      a.status = 'ACKNOWLEDGED';
      a.acknowledgedAt = now;
    } else if (action === 'resolve') {
      a.status = 'RESOLVED';
      a.resolvedAt = now;
    } else if (action === 'suppress') {
      a.status = 'SUPPRESSED';
      const until = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
      a.suppressedUntil = until;
    } else if (action === 'retry') {
      a.lastSeenAt = now;
    }
    return delay(a);
  },
};
