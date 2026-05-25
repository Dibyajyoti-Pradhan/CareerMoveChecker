import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { AdminPageHead } from './AdminLayout';
import { cn } from '../../lib/cn';
import { relativeTime } from '../../lib/format';

export function AdminLogs() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<any>(null);
  useEffect(() => { admin.logs(page, 50).then(setData); }, [page]);

  return (
    <>
      <AdminPageHead
        title="CH call logs"
        sub={data ? `${data.totalElements} requests logged · page ${data.page + 1} of ${data.totalPages}` : 'Loading…'}
      />

      {!data && <div className="empty">Loading…</div>}
      {data && (
        <>
          <div className="adm-table">
            <div className="head" style={{ gridTemplateColumns: '90px 1fr 110px 80px 100px 130px' }}>
              <span>Status</span><span>Endpoint</span><span>Company</span><span>Duration</span><span>Success</span><span>When</span>
            </div>
            {data.items.map((l: any) => (
              <div key={l.id} className="row" style={{ gridTemplateColumns: '90px 1fr 110px 80px 100px 130px' }}>
                <span className={cn('mono badge', l.statusCode === 200 ? 'badge-ok' : l.statusCode === 404 ? 'badge-neutral' : 'badge-bad')}>{l.statusCode}</span>
                <span className="mono small">{l.endpoint}</span>
                <span className="mono small muted">{l.companyNumber ?? '—'}</span>
                <span className="mono small">{l.durationMs}ms</span>
                <span>{l.success ? <span className="badge badge-ok">OK</span> : <span className="badge badge-bad">FAIL</span>}</span>
                <span className="mono small muted">{relativeTime(l.createdAt)}</span>
              </div>
            ))}
            {data.items.length === 0 && <div className="empty">No CH calls logged yet.</div>}
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
