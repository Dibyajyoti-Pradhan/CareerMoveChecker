import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { Icon } from '../../components/Icon';
import { AdminPageHead } from './AdminLayout';
import { cn } from '../../lib/cn';
import { relativeTime } from '../../lib/format';

export function AdminAlertsQueue() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED'>('all');

  const load = () => admin.downstreamAlerts().then(setAlerts).catch(() => setAlerts([]));
  useEffect(() => { load(); }, []);

  const act = async (id: number, action: 'acknowledge' | 'resolve' | 'suppress' | 'retry') => {
    await admin.alertAction(id, action);
    load();
  };

  const filtered = alerts.filter((a) => filter === 'all' || a.status === filter);

  return (
    <>
      <AdminPageHead
        title="CH data-quality alerts"
        sub={`${alerts.length} total · ${alerts.filter((a) => a.status === 'OPEN').length} open`}
        actions={
          <div className="tabs-pill" style={{ background: 'var(--soft)' }}>
            {(['all', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED'] as const).map((f) => (
              <button key={f} className={cn('tab', filter === f && 'active')} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        }
      />

      {filtered.length === 0 && <div className="empty">No alerts match.</div>}

      {filtered.map((a) => (
        <div key={a.id} className={cn('ax', a.status === 'OPEN' && 'open', a.status === 'ACKNOWLEDGED' && 'ack', a.status === 'RESOLVED' && 'res')}>
          <div className="head-row">
            <span className={cn('badge', a.severity === 'CRITICAL' ? 'badge-bad' : a.severity === 'WARNING' ? 'badge-warn' : 'badge-info')}>{a.severity}</span>
            <span className="badge badge-neutral">{a.status}</span>
            <span className="badge badge-outline">{a.alertType}</span>
            <h4>{a.title}</h4>
            <div className="row" style={{ marginLeft: 'auto', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => act(a.id, 'acknowledge')} disabled={a.status === 'RESOLVED'}>Ack</button>
              <button className="btn btn-ghost btn-sm" onClick={() => act(a.id, 'suppress')} disabled={a.status === 'RESOLVED'}>Suppress</button>
              <button className="btn btn-ghost btn-sm" onClick={() => act(a.id, 'retry')}>Retry</button>
              <button className="btn btn-secondary btn-sm" onClick={() => act(a.id, 'resolve')} disabled={a.status === 'RESOLVED'}>Resolve</button>
            </div>
          </div>
          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--ink-2)' }}>{a.message}</p>
          {(a.companyNumber || a.companyName) && (
            <p style={{ margin: '0 0 6px', fontSize: 12.5 }} className="muted">
              {a.companyName ?? ''} {a.companyNumber ? `(#${a.companyNumber})` : ''}
            </p>
          )}
          <div className="ev">{typeof a.evidence === 'string' ? a.evidence : JSON.stringify(a.evidence)}</div>
          <div className="meta">{a.endpoint} · last seen {relativeTime(a.lastSeenAt)}</div>
        </div>
      ))}
    </>
  );
}
