import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { formatNumber, formatPct } from '../../lib/format';
import { AdminPageHead, RangePick } from './AdminLayout';
import { cn } from '../../lib/cn';

export function AdminApiHealth() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState<any>(null);

  useEffect(() => { admin.apiHealth(range).then(setData); }, [range]);

  return (
    <>
      <AdminPageHead
        title="Companies House API health"
        sub={data ? `${formatNumber(data.totalRequests)} requests · ${formatPct(data.successRate)} success · ${data.avgLatencyMs}ms avg` : 'Loading…'}
        actions={<RangePick value={range} onChange={setRange} />}
      />

      {!data && <div className="empty">Loading…</div>}
      {data && (
        <>
          <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <Kpi label="Success rate" v={formatPct(data.successRate)} tone={data.successRate >= 0.99 ? 'ok' : 'bad'} />
            <Kpi label="Avg latency" v={`${data.avgLatencyMs} ms`} />
            <Kpi label="Total requests" v={formatNumber(data.totalRequests)} />
            <Kpi label="Errors" v={formatNumber(data.errors)} tone={data.errors > 0 ? 'bad' : 'ok'} />
          </div>

          <div className="adm-card" style={{ marginTop: 18 }}>
            <h3>Per-endpoint stats</h3>
            <p className="sub">Total requests, success rate, avg + max latency.</p>
            <div className="endpoint-row" style={{ background: 'var(--canvas)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              <span>Endpoint</span>
              <span>Total</span>
              <span>Success</span>
              <span>Avg ms</span>
              <span>Max ms</span>
            </div>
            {data.endpoints.map((e: any) => {
              const pct = e.total === 0 ? 1 : e.successCount / e.total;
              return (
                <div key={e.endpoint} className="endpoint-row">
                  <span className="ep">{e.endpoint}</span>
                  <span className="mono">{formatNumber(e.total)}</span>
                  <span className={cn('pct', pct >= 0.99 ? 'ok' : pct >= 0.9 ? 'warn' : 'bad')}>{formatPct(pct)}</span>
                  <span className="mono">{Math.round(e.avgMs ?? 0)}</span>
                  <span className="mono">{e.maxMs ?? 0}</span>
                </div>
              );
            })}
            {data.endpoints.length === 0 && <div className="empty">No CH calls in this range.</div>}
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
