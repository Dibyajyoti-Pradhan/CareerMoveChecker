// Admin API client — all requests carry Basic auth from sessionStorage.

const KEY = 'cmc.admin';

function authHeader(): Record<string, string> {
  const pwd = sessionStorage.getItem(KEY);
  if (!pwd) return {};
  return { Authorization: 'Basic ' + btoa(`admin:${pwd}`) };
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(init.headers || {}),
    },
  });
  if (res.status === 401) {
    sessionStorage.removeItem(KEY);
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const admin = {
  setPassword: (pwd: string) => sessionStorage.setItem(KEY, pwd),
  clearPassword: () => sessionStorage.removeItem(KEY),
  hasPassword: () => Boolean(sessionStorage.getItem(KEY)),

  summary: (range = '7d') => req<any>(`/api/admin/summary?range=${range}`),
  searchesByDay: (days = 30) => req<{ day: string; cnt: number }[]>(`/api/admin/activity/searches-by-day?days=${days}`),
  viewsByDay: (days = 30) => req<{ day: string; cnt: number }[]>(`/api/admin/activity/views-by-day?days=${days}`),

  apiHealth: (range = '7d') => req<{
    range: string; successRate: number; avgLatencyMs: number; totalRequests: number; errors: number;
    endpoints: { endpoint: string; total: number; successCount: number; avgMs: number; maxMs: number }[];
  }>(`/api/admin/api-health?range=${range}`),

  logs: (page = 0, size = 50) => req<any>(`/api/admin/logs?page=${page}&size=${size}`),

  dataFreshness: () => req<{
    fresh6h: number; fresh24h: number; fresh7d: number; stale: number; totalCachedReports: number;
  }>('/api/admin/data-freshness'),

  companies: (page = 0, size = 50) => req<any>(`/api/admin/companies?page=${page}&size=${size}`),
  saved: () => req<any[]>('/api/admin/saved'),

  downstreamAlerts: () => req<any[]>('/api/admin/alerts'),
  alertAction: (id: number | string, action: 'acknowledge' | 'resolve' | 'suppress' | 'retry') =>
    req<any>(`/api/admin/alerts/${id}/${action}`, { method: 'POST' }),

  watchAlerts: () => req<any[]>('/api/admin/watch-alerts'),
  triggerWatchPoll: () => req<{ ok: boolean; ranAt: string }>('/api/admin/watch-alerts/trigger-poll', { method: 'POST' }),

  forceRefresh: (companyNumber: string) =>
    req<any>(`/api/admin/companies/${encodeURIComponent(companyNumber)}/force-refresh`, { method: 'POST' }),

  settings: () => req<{ key: string; value: string; valueType: string; description: string; updatedAt: string; updatedBy: string }[]>('/api/admin/settings'),
  updateSetting: (key: string, value: string) =>
    req<any>(`/api/admin/settings/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify({ value }) }),

  killSwitches: () => req<{ key: string; enabled: boolean; reason: string; updatedAt: string; updatedBy: string }[]>('/api/admin/kill-switches'),
  updateKillSwitch: (key: string, enabled: boolean, reason: string) =>
    req<any>(`/api/admin/kill-switches/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify({ enabled, reason }) }),

  audit: (page = 0, size = 50) => req<any>(`/api/admin/audit?page=${page}&size=${size}`),

  feedback: (page = 0, size = 50) => req<any[]>(`/api/admin/feedback?page=${page}&size=${size}`),

  funnel: (range = '7d') => req<any>(`/api/admin/funnel?range=${range}`),
  waitlist: (page = 0, size = 100) => req<any>(`/api/admin/waitlist?page=${page}&size=${size}`),
  waitlistCsvUrl: () => '/api/admin/waitlist.csv',
};
