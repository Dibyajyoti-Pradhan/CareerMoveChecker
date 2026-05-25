import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { formatNumber } from '../../lib/format';
import { AdminPageHead } from './AdminLayout';

export function AdminDataFreshness() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { admin.dataFreshness().then(setData); }, []);

  if (!data) return <><AdminPageHead title="Data freshness" /><div className="empty">Loading…</div></>;

  const total = data.totalCachedReports || 1;
  const fresh = data.fresh6h + data.fresh24h;
  const pctFresh = Math.round((fresh / total) * 100);

  return (
    <>
      <AdminPageHead
        title="Data freshness"
        sub={`${formatNumber(data.totalCachedReports)} cached reports · ${pctFresh}% within 24h`}
      />

      <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <Stat label="Fresh (<6h)" v={data.fresh6h} tone="ok" />
        <Stat label="Fresh (6-24h)" v={data.fresh24h} tone="ok" />
        <Stat label="Aging (1-7d)" v={data.fresh7d} tone="warn" />
        <Stat label="Stale (>7d)" v={data.stale} tone="bad" />
      </div>

      <div className="adm-card" style={{ marginTop: 18 }}>
        <h3>Freshness distribution</h3>
        <div style={{ height: 32, background: 'var(--soft)', borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${(data.fresh6h / total) * 100}%`, background: 'var(--ok)' }} title={`< 6h: ${data.fresh6h}`} />
          <div style={{ width: `${(data.fresh24h / total) * 100}%`, background: '#3da55f' }} title={`6-24h: ${data.fresh24h}`} />
          <div style={{ width: `${(data.fresh7d / total) * 100}%`, background: 'var(--warn)' }} title={`1-7d: ${data.fresh7d}`} />
          <div style={{ width: `${(data.stale / total) * 100}%`, background: 'var(--bad)' }} title={`> 7d: ${data.stale}`} />
        </div>
        <div className="row" style={{ marginTop: 12, gap: 16, fontSize: 12 }}>
          <span><i style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--ok)', borderRadius: 2, marginRight: 6 }} />&lt;6h</span>
          <span><i style={{ display: 'inline-block', width: 10, height: 10, background: '#3da55f', borderRadius: 2, marginRight: 6 }} />6-24h</span>
          <span><i style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--warn)', borderRadius: 2, marginRight: 6 }} />1-7d</span>
          <span><i style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--bad)', borderRadius: 2, marginRight: 6 }} />&gt;7d</span>
        </div>
      </div>

      <div className="adm-card">
        <h3>What this means</h3>
        <p className="sub">Cache TTLs are configured in Settings. Reports beyond the configured TTL will refresh on next user visit, or you can force-refresh from the Companies page.</p>
      </div>
    </>
  );
}

function Stat({ label, v, tone }: { label: string; v: number; tone: 'ok' | 'warn' | 'bad' }) {
  return (
    <div className="kpi">
      <span className="label">{label}</span>
      <div className="val" style={{ color: tone === 'ok' ? 'var(--ok)' : tone === 'warn' ? 'var(--warn)' : 'var(--bad)' }}>{formatNumber(v)}</div>
    </div>
  );
}
