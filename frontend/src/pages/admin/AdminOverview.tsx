import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '../../api/admin';
import { Icon } from '../../components/Icon';
import { formatNumber, formatPct } from '../../lib/format';
import { AdminPageHead, RangePick } from './AdminLayout';
import { cn } from '../../lib/cn';

export function AdminOverview() {
  const [range, setRange] = useState('7d');
  const [s, setS] = useState<any>(null);
  const [searchesDay, setSearchesDay] = useState<{ day: string; cnt: number }[]>([]);

  useEffect(() => { admin.summary(range).then(setS); }, [range]);
  useEffect(() => { admin.searchesByDay(14).then(setSearchesDay); }, []);

  return (
    <>
      <AdminPageHead
        title="Overview"
        sub={s ? `${formatNumber(s.searchesInRange ?? 0)} searches · ${formatNumber(s.totalSavedCompanies ?? 0)} saved · ${formatNumber(s.totalCachedReports ?? 0)} cached reports` : 'Loading…'}
        actions={<RangePick value={range} onChange={setRange} />}
      />

      {!s && <div className="empty">Loading…</div>}
      {s && (
        <>
          {(s.openDownstreamAlerts > 0 || s.openWatchAlerts > 0) && (
            <div className={cn('status-banner', s.openDownstreamAlerts > 0 ? 'warn' : 'ok')}>
              <Icon name={s.openDownstreamAlerts > 0 ? 'warn' : 'info'} />
              <span>
                <b>{s.openDownstreamAlerts}</b> open CH data-quality alerts · <b>{s.openWatchAlerts}</b> unread watch-list alerts.
              </span>
              <div className="row" style={{ marginLeft: 'auto' }}>
                <Link to="/admin/alerts" className="btn btn-secondary btn-sm">Open queue</Link>
              </div>
            </div>
          )}

          <h4 className="label" style={{ margin: '20px 0 8px' }}>North-star metrics</h4>
          <div className="kpis">
            <Kpi label="Searches today" v={s.searchesToday} />
            <Kpi label={`Searches (${range})`} v={s.searchesInRange} />
            <Kpi label="Reports viewed" v={s.reportsViewedInRange} />
            <Kpi label="Search → report" v={formatPct(s.searchToReportConversion)} tone="ok" />
            <Kpi label="No-result rate" v={s.searchesInRange ? formatPct(s.noResultSearches / s.searchesInRange) : '0%'} />
          </div>

          <h4 className="label" style={{ margin: '20px 0 8px' }}>API & health</h4>
          <div className="kpis">
            <Kpi label="API success rate" v={formatPct(s.apiSuccessRate)} tone={s.apiSuccessRate >= 0.98 ? 'ok' : 'bad'} />
            <Kpi label="Avg latency" v={`${s.avgApiLatencyMs} ms`} />
            <Kpi label="API errors" v={s.errorCount} tone={s.errorCount > 50 ? 'bad' : 'ok'} />
            <Kpi label="Open CH alerts" v={s.openDownstreamAlerts} tone={s.openDownstreamAlerts > 0 ? 'warn' : 'ok'} />
            <Kpi label="Unread watch alerts" v={s.openWatchAlerts} tone={s.openWatchAlerts > 0 ? 'warn' : 'ok'} />
          </div>

          <h4 className="label" style={{ margin: '20px 0 8px' }}>Risk distribution (30d)</h4>
          <div className="adm-card">
            {(['LOW','MODERATE','HIGH','CRITICAL'] as const).map((lvl) => {
              const v = s.riskDistribution?.[lvl] ?? 0;
              const total = (['LOW','MODERATE','HIGH','CRITICAL'] as const).reduce((a, k) => a + (s.riskDistribution?.[k] ?? 0), 0) || 1;
              const pct = Math.round((v / total) * 100);
              return (
                <div key={lvl} style={{ marginBottom: 10 }}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className={cn('badge', lvl === 'LOW' ? 'badge-ok' : lvl === 'CRITICAL' ? 'badge-bad' : 'badge-warn')}>{lvl}</span>
                    <span className="small muted">{formatNumber(v)} · {pct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--soft)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: lvl === 'LOW' ? 'var(--ok)' : lvl === 'CRITICAL' ? 'var(--bad)' : 'var(--warn)' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <h4 className="label" style={{ margin: '20px 0 8px' }}>Searches by day (14d)</h4>
          <div className="adm-card">
            <SparkChart data={searchesDay} />
          </div>

          <div className="two-col">
            <div className="adm-card">
              <h3>Top searched companies</h3>
              {(s.topSearched ?? []).slice(0, 8).map((t: any) => (
                <div key={t.number} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--hair)' }}>
                  <Link to={`/app/company/${t.number}`}>{t.name ?? t.number}</Link>
                  <span className="mono small">{t.cnt}</span>
                </div>
              ))}
              {(!s.topSearched || s.topSearched.length === 0) && <div className="empty">No searches yet.</div>}
            </div>
            <div className="adm-card">
              <h3>Top viewed reports</h3>
              {(s.topViewed ?? []).slice(0, 8).map((t: any) => (
                <div key={t.number} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--hair)' }}>
                  <Link to={`/app/company/${t.number}`}>{t.name ?? t.number}</Link>
                  <span className="mono small">{t.views}</span>
                </div>
              ))}
              {(!s.topViewed || s.topViewed.length === 0) && <div className="empty">No views yet.</div>}
            </div>
          </div>

          <div className="adm-card">
            <h3>Top no-result queries</h3>
            {(s.topNoResultQueries ?? []).slice(0, 8).map((t: any) => (
              <div key={t.query} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--hair)' }}>
                <span>"{t.query}"</span>
                <span className="mono small">{t.cnt}</span>
              </div>
            ))}
            {(!s.topNoResultQueries || s.topNoResultQueries.length === 0) && <div className="empty">No empty searches — searches always hit.</div>}
          </div>
        </>
      )}
    </>
  );
}

function Kpi({ label, v, tone }: { label: string; v: any; tone?: 'ok' | 'warn' | 'bad' }) {
  return (
    <div className="kpi">
      <span className="label">{label}</span>
      <div className="val" style={{ color: tone === 'ok' ? 'var(--ok)' : tone === 'warn' ? 'var(--warn)' : tone === 'bad' ? 'var(--bad)' : undefined }}>{v}</div>
    </div>
  );
}

function SparkChart({ data }: { data: { day: string; cnt: number }[] }) {
  if (data.length === 0) return <div className="empty">No data yet.</div>;
  const max = Math.max(...data.map((d) => Number(d.cnt)), 1);
  return (
    <div>
      <div className="spark">
        {data.map((d, i) => (
          <i key={d.day} className={i === data.length - 1 ? 'today' : ''} style={{ height: `${(Number(d.cnt) / max) * 100}%` }} title={`${d.day}: ${d.cnt}`} />
        ))}
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
        <span className="mono small muted">{data[0]?.day}</span>
        <span className="mono small muted">peak {max} · today {data.at(-1)?.cnt ?? 0}</span>
        <span className="mono small muted">{data.at(-1)?.day}</span>
      </div>
    </div>
  );
}
