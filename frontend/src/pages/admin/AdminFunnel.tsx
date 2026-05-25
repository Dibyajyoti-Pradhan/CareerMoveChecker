import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { AdminPageHead, RangePick } from './AdminLayout';
import { formatNumber, formatPct } from '../../lib/format';

export function AdminFunnel() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState<any>(null);

  useEffect(() => { admin.funnel(range).then(setData).catch(() => setData(null)); }, [range]);

  return (
    <>
      <AdminPageHead
        title="Demand funnel"
        sub={data ? `${formatNumber(data.totalSessions)} unique sessions in last ${range}` : 'Loading…'}
        actions={<RangePick value={range} onChange={setRange} />}
      />

      {!data && <div className="empty">Loading…</div>}
      {data && (
        <>
          <div className="adm-card">
            <h3>Funnel</h3>
            <p className="sub">Sessions reaching each step. Conversion = % vs previous step.</p>
            {data.steps.map((s: any, i: number) => {
              const prev = i === 0 ? data.totalSessions : data.steps[i - 1].sessions;
              const conv = prev === 0 ? 0 : s.sessions / prev;
              const widthMax = data.steps[0].sessions || 1;
              const widthPct = Math.max(2, Math.round((s.sessions / widthMax) * 100));
              return (
                <div key={s.name} style={{ marginBottom: 12 }}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, fontSize: 13.5 }}>{String(i + 1).padStart(2, '0')} · {s.name}</span>
                    <span className="mono small">
                      <b>{formatNumber(s.sessions)}</b> {i > 0 && <span className="muted" style={{ marginLeft: 8 }}>({formatPct(conv)} from prev)</span>}
                    </span>
                  </div>
                  <div style={{ height: 10, background: 'var(--soft)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{
                      width: `${widthPct}%`,
                      height: '100%',
                      background: i === data.steps.length - 1 ? 'var(--ok)' : 'var(--brand)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="two-col">
            <div className="adm-card">
              <h3>Top paths</h3>
              {(data.topPaths ?? []).map((p: any) => (
                <div key={p.path} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--hair)' }}>
                  <span className="mono small">{p.path}</span>
                  <span className="mono small">{formatNumber(p.cnt)} views · {formatNumber(p.uniques)} uniques</span>
                </div>
              ))}
              {(data.topPaths ?? []).length === 0 && <div className="empty">No page views yet.</div>}
            </div>
            <div className="adm-card">
              <h3>Top referrers</h3>
              {(data.topReferrers ?? []).map((r: any) => (
                <div key={r.referrer} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--hair)' }}>
                  <span className="small" style={{ wordBreak: 'break-all' }}>{r.referrer}</span>
                  <span className="mono small">{r.cnt}</span>
                </div>
              ))}
              {(data.topReferrers ?? []).length === 0 && <div className="empty">No external referrers yet.</div>}
            </div>
          </div>

          <div className="adm-card">
            <h3>Top CTAs clicked</h3>
            {(data.topCtas ?? []).map((c: any) => (
              <div key={c.ctaId} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--hair)' }}>
                <span className="mono small">{c.ctaId}</span>
                <span className="mono small">{c.cnt}</span>
              </div>
            ))}
            {(data.topCtas ?? []).length === 0 && <div className="empty">No CTA clicks yet.</div>}
          </div>
        </>
      )}
    </>
  );
}
