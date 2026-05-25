import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { Icon } from '../../components/Icon';
import { AdminPageHead } from './AdminLayout';
import { cn } from '../../lib/cn';
import { formatNumber, relativeTime } from '../../lib/format';

export function AdminWaitlist() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<any>(null);

  useEffect(() => { admin.waitlist(page, 100).then(setData); }, [page]);

  return (
    <>
      <AdminPageHead
        title="Waitlist"
        sub={data ? `${formatNumber(data.totalElements)} signups total` : 'Loading…'}
        actions={
          <a
            href={admin.waitlistCsvUrl()}
            className="btn btn-secondary btn-sm"
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="download" /> Export CSV
          </a>
        }
      />

      {!data && <div className="empty">Loading…</div>}
      {data && (
        <>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat"><span className="label">Total signups</span><span className="val">{data.totalElements}</span></div>
            <Tier counts={data.byTier} tier="Pro" />
            <Tier counts={data.byTier} tier="Agency" />
            <Persona counts={data.byPersona} />
          </div>

          <div className="adm-table">
            <div className="head" style={{ gridTemplateColumns: '1fr 90px 90px 1fr 120px' }}>
              <span>Email</span><span>Tier</span><span>Persona</span><span>Role / landing</span><span>When</span>
            </div>
            {data.items.map((w: any) => (
              <div key={w.id} className="row" style={{ gridTemplateColumns: '1fr 90px 90px 1fr 120px' }}>
                <span className="mono small"><b>{w.email}</b></span>
                <span><span className={cn('badge', w.tier === 'Pro' ? 'badge-info' : 'badge-violet')}>{w.tier ?? '—'}</span></span>
                <span className="mono small">{w.persona ?? '—'}</span>
                <span className="small muted">
                  {w.role ?? '—'}
                  {w.landingPath && <div className="mono">via {w.landingPath}</div>}
                </span>
                <span className="mono small muted">{relativeTime(w.createdAt)}</span>
              </div>
            ))}
            {data.items.length === 0 && <div className="empty">No signups yet. Once users click "Notify me when Pro launches", they appear here.</div>}
          </div>

          {data.totalPages > 1 && (
            <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Previous</button>
              <span className="mono small muted">Page {page + 1} of {data.totalPages}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= data.totalPages}>Next</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function Tier({ counts, tier }: { counts: any[]; tier: string }) {
  const v = counts?.find((c) => c.tier === tier)?.cnt ?? 0;
  return <div className="stat"><span className="label">{tier} interest</span><span className="val">{v}</span></div>;
}

function Persona({ counts }: { counts: any[] }) {
  const total = (counts ?? []).reduce((a, c) => a + Number(c.cnt), 0);
  return <div className="stat"><span className="label">With persona</span><span className="val">{total}</span></div>;
}
