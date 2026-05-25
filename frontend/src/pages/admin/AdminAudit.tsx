import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { AdminPageHead } from './AdminLayout';
import { relativeTime } from '../../lib/format';

export function AdminAudit() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<any>(null);

  useEffect(() => { admin.audit(page, 50).then(setData); }, [page]);

  return (
    <>
      <AdminPageHead
        title="Audit log"
        sub={data ? `${data.totalElements} admin actions logged · page ${data.page + 1} of ${data.totalPages}` : 'Loading…'}
      />

      {!data && <div className="empty">Loading…</div>}
      {data && (
        <>
          <div className="adm-card" style={{ padding: 0 }}>
            {data.items.map((a: any) => (
              <div key={a.id} className="audit-row">
                <span><span className="act">{a.action}</span></span>
                <div>
                  <div>{a.summary}</div>
                  <div className="who">by {a.actor}{a.targetType && ` · ${a.targetType}=${a.targetId}`}</div>
                </div>
                <span className="when">{relativeTime(a.createdAt)}</span>
              </div>
            ))}
            {data.items.length === 0 && <div className="empty">No admin actions logged yet.</div>}
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
