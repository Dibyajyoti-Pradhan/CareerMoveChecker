import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { api } from '../api/client';
import type { DownstreamAlert } from '../types';
import { formatPct, relativeTime } from '../lib/format';
import { cn } from '../lib/cn';

export function AdminPage() {
  const [pwd, setPwd] = useState(() => sessionStorage.getItem('cmc.admin') || '');
  const [authed, setAuthed] = useState(Boolean(pwd));
  const [error, setError] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<DownstreamAlert[]>([]);
  const [range, setRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    if (!authed) return;
    api.adminSummary(pwd).then((s) => { setSummary(s); setError(false); }).catch(() => { setError(true); setAuthed(false); });
    api.adminAlerts(pwd).then(setAlerts).catch(() => setAlerts([]));
  }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!authed) {
    return (
      <div className="wrap" style={{ paddingTop: 80, maxWidth: 440 }}>
        <div className="panel-card">
          <h3>Admin access</h3>
          <p className="sub">Enter the admin password.</p>
          <form onSubmit={(e) => { e.preventDefault(); sessionStorage.setItem('cmc.admin', pwd); setAuthed(true); }}>
            <div className="field">
              <input className={cn('input', error && 'input-error')} type="password" placeholder="Admin password" value={pwd} onChange={(e) => { setPwd(e.target.value); setError(false); }} autoFocus />
              {error && <span className="small" style={{ color: 'var(--bad)' }}>Wrong password.</span>}
            </div>
            <button className="submit-btn">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="nav ops no-print">
        <div className="wrap nav-inner">
          <Link className="logo" to="/admin"><span className="mk">CM</span><span>CareerMoveChecker</span><span className="tag">ops</span></Link>
          <nav className="app-tabs">
            <a className="active"><Icon name="home" /><span>Overview</span></a>
            <a><Icon name="alert" /><span>API health</span></a>
            <a><Icon name="refresh" /><span>Data freshness</span></a>
            <a><Icon name="bell" /><span>Alerts queue</span></a>
            <a><Icon name="users" /><span>Users</span></a>
            <a><Icon name="list" /><span>Logs</span></a>
          </nav>
          <div className="live-pill mono">{new Date().toISOString().slice(11, 19)} UTC</div>
        </div>
      </header>

      <div className="wrap" style={{ paddingTop: 24 }}>
        <div className="page-head" style={{ border: 0, paddingBottom: 14 }}>
          <div>
            <h1 style={{ fontSize: 26 }}>Ops dashboard</h1>
            <p className="sub">{summary?.openAlerts ?? 0} open data-quality alerts · API success {formatPct(summary?.apiSuccessRate7d ?? 1)}</p>
          </div>
          <div className="head-actions">
            <div className="range-pick" style={{ background: 'var(--soft)' }}>
              {(['1h', '24h', '7d', '30d', '90d'] as const).map((r) => (
                <button key={r} className={cn(range === r && 'active')} style={{ color: range === r ? 'var(--ink)' : 'var(--muted)' }} onClick={() => setRange(r)}>{r}</button>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm"><Icon name="refresh" /> Refresh</button>
          </div>
        </div>

        {summary?.openAlerts > 0 && (
          <div className="status-banner warn">
            <Icon name="warn" />
            <span><b>{summary.openAlerts} open data-quality alerts.</b> Triage below.</span>
          </div>
        )}

        <h4 className="label" style={{ margin: '24px 0 8px' }}>North-star metrics</h4>
        <div className="kpis">
          <Kpi label="Reports run (24h)" val={summary?.searchesToday ?? 0} delta="up" />
          <Kpi label="Search → report" val={formatPct(summary?.searchToReportConversion ?? 0)} delta="up" target="met" targetLabel=">60%" />
          <Kpi label="API success 7d" val={formatPct(summary?.apiSuccessRate7d ?? 1)} delta={summary?.apiSuccessRate7d >= 0.99 ? 'up' : 'down'} target={summary?.apiSuccessRate7d >= 0.99 ? 'met' : 'miss'} targetLabel=">99%" />
          <Kpi label="Avg latency" val={`${summary?.avgApiLatencyMs ?? 0} ms`} delta="flat" />
          <Kpi label="No-result rate" val={formatPct((summary?.noResultSearches7d ?? 0) / Math.max(1, summary?.searches7d ?? 1))} delta="down" />
        </div>

        <h4 className="label" style={{ margin: '24px 0 8px' }}>Business metrics</h4>
        <div className="kpis">
          <Kpi label="Searches 30d" val={summary?.searches30d ?? 0} delta="up" />
          <Kpi label="Reports viewed 7d" val={summary?.reportsViewed7d ?? 0} delta="up" />
          <Kpi label="API errors 7d" val={summary?.errorCount7d ?? 0} delta={(summary?.errorCount7d ?? 0) > 50 ? 'up' : 'flat'} />
          <Kpi label="Open alerts" val={summary?.openAlerts ?? 0} delta="flat" />
          <Kpi label="Risk: critical" val={summary?.riskDistribution?.CRITICAL ?? 0} delta="flat" />
        </div>

        <div className="two-col">
          <div className="panel-card">
            <h3>Companies House endpoint health</h3>
            {[
              { ep: '/search/companies', up: 100, p50: 280 },
              { ep: '/company/{n}', up: 99, p50: 220 },
              { ep: '/company/{n}/officers', up: 100, p50: 240 },
              { ep: '/company/{n}/psc', up: 100, p50: 210 },
              { ep: '/company/{n}/charges', up: 99, p50: 260 },
              { ep: '/company/{n}/filing-history', up: 98, p50: 380 },
              { ep: '/company/{n}/insolvency', up: 100, p50: 180 },
            ].map((e) => (
              <div key={e.ep} className="health-row">
                <span className="ep">{e.ep}</span>
                <span className="uptime-bar">{Array.from({ length: 40 }).map((_, i) => (
                  <i key={i} className={i % 30 === 0 ? 'warn' : ''} />
                ))}</span>
                <span className="mono small">{e.up}%</span>
                <span className="mono small">{e.p50}ms</span>
              </div>
            ))}
          </div>

          <div className="panel-card">
            <h3>Data-quality alerts</h3>
            {alerts.length === 0 && <div className="empty">No alerts. All quiet.</div>}
            {alerts.slice(0, 5).map((a) => (
              <div key={a.id} className={cn('ax', a.status === 'OPEN' && 'open', a.status === 'ACKNOWLEDGED' && 'ack', a.status === 'RESOLVED' && 'res')}>
                <div className="head-row">
                  <span className={cn('badge', a.severity === 'CRITICAL' ? 'badge-bad' : a.severity === 'WARNING' ? 'badge-warn' : 'badge-info')}>{a.severity}</span>
                  <span className="badge badge-neutral">{a.status}</span>
                  <h4>{a.title}</h4>
                  <div className="row" style={{ marginLeft: 'auto' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => api.adminAlertAction(pwd, a.id, 'acknowledge')}>Ack</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => api.adminAlertAction(pwd, a.id, 'resolve')}>Resolve</button>
                  </div>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--muted)' }}>{a.message}</p>
                <div className="ev">{JSON.stringify(a.evidence)}</div>
                <div className="meta">{a.endpoint} · {relativeTime(a.lastSeenAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Kpi({ label, val, delta, target, targetLabel }: { label: string; val: any; delta?: 'up' | 'down' | 'flat'; target?: 'met' | 'miss'; targetLabel?: string }) {
  return (
    <div className="kpi">
      <span className="label">{label}</span>
      <div className="val">{val}</div>
      {delta && <div className={cn('delta', delta)}>{delta === 'up' ? '↑' : delta === 'down' ? '↓' : '→'}</div>}
      {targetLabel && <div className={cn('target-line', target)}>Target {targetLabel}</div>}
    </div>
  );
}
