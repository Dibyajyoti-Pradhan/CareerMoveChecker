import type {
  CompanyReport,
  CompanySearchHit,
  DownstreamAlert,
  SavedCompany,
  BulkResult,
} from '../types';

const API_BASE = '';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

function basicAuth(user: string, pass: string): string {
  return 'Basic ' + btoa(`${user}:${pass}`);
}

export const api = {
  health: () => http<{ status: string; time: string }>('/api/health'),

  searchCompanies: (q: string) =>
    http<CompanySearchHit[]>(`/api/companies/search?q=${encodeURIComponent(q)}`),

  getReport: (companyNumber: string) =>
    http<CompanyReport>(`/api/companies/${encodeURIComponent(companyNumber)}/report`).catch(() => null),

  refreshReport: (companyNumber: string) =>
    http<CompanyReport>(`/api/companies/${encodeURIComponent(companyNumber)}/refresh`, { method: 'POST' }),

  compare: (companyNumbers: string[]) =>
    http<CompanyReport[]>('/api/compare', {
      method: 'POST',
      body: JSON.stringify({ companyNumbers }),
    }),

  listSaved: () => http<SavedCompany[]>('/api/saved-companies'),

  saveCompany: (input: { companyNumber: string; companyName: string; note?: string }) =>
    http<SavedCompany>('/api/saved-companies', { method: 'POST', body: JSON.stringify(input) }),

  updateSavedNote: (companyNumber: string, note: string) =>
    http<SavedCompany>(`/api/saved-companies/${encodeURIComponent(companyNumber)}`, {
      method: 'PUT',
      body: JSON.stringify({ note }),
    }),

  removeSaved: (companyNumber: string) =>
    http<void>(`/api/saved-companies/${encodeURIComponent(companyNumber)}`, { method: 'DELETE' }),

  submitFeedback: (input: {
    companyNumber: string;
    rating: number;
    useCase: string;
    comment?: string;
  }) =>
    http<{ ok: boolean }>('/api/feedback', { method: 'POST', body: JSON.stringify(input) }),

  bulkCheck: (numbers: string[]) =>
    http<BulkResult>('/api/companies/bulk', {
      method: 'POST',
      body: JSON.stringify({ companyNumbers: numbers }),
    }),

  adminSummary: (adminPassword: string) =>
    fetch('/api/admin/summary', {
      headers: { Authorization: basicAuth('admin', adminPassword) },
    }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),

  adminAlerts: (adminPassword: string): Promise<DownstreamAlert[]> =>
    fetch('/api/admin/alerts', {
      headers: { Authorization: basicAuth('admin', adminPassword) },
    }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),

  adminAlertAction: (adminPassword: string, id: string, action: 'acknowledge' | 'resolve' | 'suppress' | 'retry') =>
    fetch(`/api/admin/alerts/${id}/${action}`, {
      method: 'POST',
      headers: { Authorization: basicAuth('admin', adminPassword) },
    }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),
};
