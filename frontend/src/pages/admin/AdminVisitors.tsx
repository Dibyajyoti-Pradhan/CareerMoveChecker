import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { AdminPageHead, RangePick } from './AdminLayout';
import { formatNumber, formatPct } from '../../lib/format';
import { cn } from '../../lib/cn';

export function AdminVisitors() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<any>(null);

  useEffect(() => { admin.visitors(range).then(setData).catch(() => setData(null)); }, [range]);

  return (
    <>
      <AdminPageHead
        title="Visitors"
        sub={data ? `${formatNumber(data.uniquesInRange)} unique browsers in last ${range} · ${formatNumber(data.viewsInRange)} page views` : 'Loading…'}
        actions={<RangePick value={range} onChange={setRange} />}
      />

      {!data && <div className="empty">Loading…</div>}
      {data && (
        <>
          <h4 className="label" style={{ margin: '8px 0 8px' }}>Unique browsers (cmc.sid)</h4>
          <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <Kpi label="Today" v={data.uniquesToday} />
            <Kpi label="Last 7 days" v={data.uniques7d} />
            <Kpi label="Last 30 days" v={data.uniques30d} />
            <Kpi label={`In range (${range})`} v={data.uniquesInRange} tone="ok" />
          </div>

          <h4 className="label" style={{ margin: '20px 0 8px' }}>Engagement</h4>
          <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <Kpi label="Total page views" v={formatNumber(data.viewsInRange)} />
            <Kpi label="New visitors" v={formatNumber(data.newVisitorsInRange)} tone="ok" />
            <Kpi label="Returning" v={formatNumber(data.returningInRange)} />
            <Kpi label="Avg pages / session" v={data.avgPagesPerSession} />
          </div>

          {data.uniquesInRange > 0 && (
            <div className="adm-card">
              <h3>New vs returning</h3>
              <div style={{ height: 32, background: 'var(--soft)', borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
                <div
                  style={{ width: `${(data.newVisitorsInRange / data.uniquesInRange) * 100}%`, background: 'var(--ok)' }}
                  title={`New: ${data.newVisitorsInRange}`}
                />
                <div
                  style={{ width: `${(data.returningInRange / data.uniquesInRange) * 100}%`, background: 'var(--brand)' }}
                  title={`Returning: ${data.returningInRange}`}
                />
              </div>
              <div className="row" style={{ marginTop: 12, gap: 18, fontSize: 12 }}>
                <span><i style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--ok)', borderRadius: 2, marginRight: 6 }} />
                  New {formatNumber(data.newVisitorsInRange)} ({formatPct(data.newVisitorsInRange / data.uniquesInRange)})
                </span>
                <span><i style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--brand)', borderRadius: 2, marginRight: 6 }} />
                  Returning {formatNumber(data.returningInRange)} ({formatPct(data.returningInRange / data.uniquesInRange)})
                </span>
              </div>
            </div>
          )}

          <div className="adm-card">
            <h3>Daily unique visitors</h3>
            <DailyChart data={data.byDay ?? []} />
          </div>

          <div className="two-col">
            <div className="adm-card">
              <h3>Top pages by uniques</h3>
              {(data.topPaths ?? []).map((p: any) => (
                <div key={p.path} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--hair)' }}>
                  <span className="mono small">{p.path}</span>
                  <span className="mono small">{formatNumber(p.uniques)} uniques · {formatNumber(p.cnt)} views</span>
                </div>
              ))}
              {(data.topPaths ?? []).length === 0 && <div className="empty">No page views yet.</div>}
            </div>
            <div className="adm-card">
              <h3>Top referrers</h3>
              {(data.topReferrers ?? []).map((r: any) => (
                <div key={r.referrer} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--hair)' }}>
                  <span className="small" style={{ wordBreak: 'break-all', maxWidth: '70%' }}>{shorten(r.referrer)}</span>
                  <span className="mono small">{r.cnt}</span>
                </div>
              ))}
              {(data.topReferrers ?? []).length === 0 && <div className="empty">No external referrers yet (everyone arrived direct).</div>}
            </div>
          </div>

          <div className="adm-card">
            <h3>Uniques by persona</h3>
            {(data.uniquesByPersona ?? []).length === 0 && <div className="empty">No persona data captured yet.</div>}
            {(data.uniquesByPersona ?? []).map((p: any) => {
              const total = (data.uniquesByPersona ?? []).reduce((a: number, b: any) => a + Number(b.uniques), 0) || 1;
              const pct = Math.round((p.uniques / total) * 100);
              return (
                <div key={p.persona ?? 'unknown'} style={{ marginBottom: 10 }}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="mono small">{p.persona ?? 'unknown'}</span>
                    <span className="mono small">{formatNumber(p.uniques)} · {pct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--soft)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand)' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="adm-card">
            <h3>How "unique" is counted</h3>
            <p className="sub" style={{ margin: 0 }}>
              We count <code className="mono">cmc.sid</code> = a random id stored in browser localStorage.
              Same human on phone + laptop = 2 uniques. Cleared cookies = new unique.
              No IP stored. Bots without JS aren't counted.
            </p>
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

function DailyChart({ data }: { data: { day: string; views: number; sessions: number }[] }) {
  if (data.length === 0) return <div className="empty">No data yet.</div>;
  const max = Math.max(...data.map((d) => Number(d.sessions)), 1);
  return (
    <div>
      <div className="spark" style={{ height: 100 }}>
        {data.map((d, i) => (
          <i
            key={d.day}
            className={i === data.length - 1 ? 'today' : ''}
            style={{ height: `${(Number(d.sessions) / max) * 100}%` }}
            title={`${d.day}: ${d.sessions} uniques, ${d.views} views`}
          />
        ))}
      </div>
      <div className="row muted" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 11.5 }}>
        <span className="mono">{data[0]?.day}</span>
        <span className="mono">peak {max} uniques · today {data.at(-1)?.sessions ?? 0}</span>
        <span className="mono">{data.at(-1)?.day}</span>
      </div>
    </div>
  );
}

function shorten(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname === '/' ? '' : u.pathname);
  } catch {
    return url.length > 60 ? url.slice(0, 60) + '…' : url;
  }
}
