import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '../../api/admin';
import { Icon } from '../../components/Icon';
import { AdminPageHead } from './AdminLayout';
import { cn } from '../../lib/cn';
import { formatDate, relativeTime } from '../../lib/format';

export function AdminCompanies() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => admin.companies(page, 50).then(setData);
  useEffect(() => { load(); }, [page]);

  const forceRefresh = async (n: string) => {
    setBusy(n);
    try { await admin.forceRefresh(n); await load(); }
    finally { setBusy(null); }
  };

  return (
    <>
      <AdminPageHead title="Cached company reports" sub={data ? `${data.totalElements} total · page ${data.page + 1} of ${data.totalPages}` : 'Loading…'} />

      {!data && <div className="empty">Loading…</div>}
      {data && (
        <>
          <div className="adm-table">
            <div className="head" style={{ gridTemplateColumns: '120px 1fr 100px 80px 100px 120px 100px' }}>
              <span>Number</span><span>Name</span><span>Status</span><span>Score</span><span>Level</span><span>Fetched</span><span></span>
            </div>
            {data.items.map((c: any) => (
              <div key={c.companyNumber} className="row" style={{ gridTemplateColumns: '120px 1fr 100px 80px 100px 120px 100px' }}>
                <span className="mono">#{c.companyNumber}</span>
                <Link to={`/app/company/${c.companyNumber}`}>{c.companyName}</Link>
                <span><span className={cn('badge', c.companyStatus === 'active' ? 'badge-ok' : 'badge-bad')}>{c.companyStatus}</span></span>
                <span className="mono">{c.score}</span>
                <span><span className={cn('badge', c.riskLevel === 'LOW' ? 'badge-ok' : c.riskLevel === 'CRITICAL' ? 'badge-bad' : 'badge-warn')}>{c.riskLevel}</span></span>
                <span className="mono small muted">{relativeTime(c.dataFetchedAt)}</span>
                <span>
                  <button className="icon-btn" onClick={() => forceRefresh(c.companyNumber)} disabled={busy === c.companyNumber} title="Force refresh from CH">
                    <Icon name="refresh" size={14} />
                  </button>
                  <Link to={`/app/company/${c.companyNumber}`} className="icon-btn"><Icon name="external" size={14} /></Link>
                </span>
              </div>
            ))}
            {data.items.length === 0 && <div className="empty">No cached reports yet.</div>}
          </div>

          <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Previous</button>
            <span className="mono small muted">Page {page + 1} of {data.totalPages}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= data.totalPages}>Next</button>
          </div>
        </>
      )}
    </>
  );
}
