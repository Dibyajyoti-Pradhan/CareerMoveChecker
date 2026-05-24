import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { AdminSummary, RiskLevel } from '../types';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { AdminMetricCard } from '../components/admin/AdminMetricCard';
import { ApiHealthPanel } from '../components/admin/ApiHealthPanel';
import { formatNumber, formatPercent } from '../lib/format';

const riskTone: Record<RiskLevel, 'green' | 'amber' | 'red' | 'gray'> = {
  LOW: 'green',
  MODERATE: 'amber',
  HIGH: 'amber',
  CRITICAL: 'red',
};

export function AdminPage() {
  const [s, setS] = useState<AdminSummary | null>(null);

  useEffect(() => {
    api.adminSummary().then(setS);
  }, []);

  if (!s) {
    return (
      <div className="container-page py-10 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const totalRisk = (Object.values(s.riskDistribution) as number[]).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Admin</h1>
          <p className="mt-2 text-muted">Usage, API health, and downstream data quality.</p>
        </div>
        <Link
          to="/admin/alerts"
          className="inline-flex items-center gap-2 rounded-xl bg-risk-critBg text-risk-crit border border-red-200 px-4 h-10 font-semibold hover:bg-red-100"
        >
          <span className="h-2 w-2 rounded-full bg-risk-crit" /> {s.openAlerts} open alerts
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard label="Searches today" value={formatNumber(s.searchesToday)} />
        <AdminMetricCard label="Searches (7d)" value={formatNumber(s.searches7d)} />
        <AdminMetricCard label="Reports viewed (7d)" value={formatNumber(s.reportsViewed7d)} />
        <AdminMetricCard label="Search → report rate" value={formatPercent(s.searchToReportConversion)} tone="good" />
        <AdminMetricCard label="No-result searches (7d)" value={formatNumber(s.noResultSearches7d)} />
        <AdminMetricCard label="API success (7d)" value={formatPercent(s.apiSuccessRate7d)} tone={s.apiSuccessRate7d >= 0.98 ? 'good' : 'bad'} />
        <AdminMetricCard label="Avg API latency" value={`${s.avgApiLatencyMs} ms`} />
        <AdminMetricCard label="API errors (7d)" value={formatNumber(s.errorCount7d)} tone={s.errorCount7d > 50 ? 'bad' : 'default'} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-base font-bold mb-4">Risk distribution (last 30d)</h2>
          <div className="space-y-3">
            {(Object.keys(s.riskDistribution) as RiskLevel[]).map((level) => {
              const v = s.riskDistribution[level];
              const pct = Math.round((v / totalRisk) * 100);
              return (
                <div key={level}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <Badge tone={riskTone[level]}>{level}</Badge>
                    <span className="text-muted">{formatNumber(v)} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-soft overflow-hidden">
                    <div
                      className={`h-full ${
                        level === 'LOW' ? 'bg-risk-low' :
                        level === 'CRITICAL' ? 'bg-risk-crit' :
                        'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <ApiHealthPanel
          successRate={s.apiSuccessRate7d}
          avgLatencyMs={s.avgApiLatencyMs}
          errorCount={s.errorCount7d}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-bold mb-3">Top searched companies</h2>
          <ul className="space-y-2">
            {s.topSearched.map((t) => (
              <li key={t.companyNumber} className="flex items-center justify-between gap-2">
                <Link className="font-semibold hover:text-brand truncate" to={`/app/company/${t.companyNumber}`}>
                  {t.companyName}
                </Link>
                <span className="text-sm text-muted">{t.count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-base font-bold mb-3">Top viewed reports</h2>
          <ul className="space-y-2">
            {s.topViewed.map((t) => (
              <li key={t.companyNumber} className="flex items-center justify-between gap-2">
                <Link className="font-semibold hover:text-brand truncate" to={`/app/company/${t.companyNumber}`}>
                  {t.companyName}
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={riskTone[t.riskLevel]}>{t.riskLevel}</Badge>
                  <span className="text-sm text-muted">{t.views}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <h2 className="text-base font-bold mb-3">Feedback by use case (7d)</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(s.feedbackBreakdown).map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-soft p-3">
                <div className="text-xs uppercase tracking-wide font-bold text-muted">{k.replaceAll('_', ' ')}</div>
                <div className="mt-1 text-xl font-extrabold">{formatNumber(v as number)}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
