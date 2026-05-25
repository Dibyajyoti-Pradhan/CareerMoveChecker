import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { Icon } from '../../components/Icon';
import { AdminPageHead } from './AdminLayout';
import { cn } from '../../lib/cn';
import { relativeTime } from '../../lib/format';

export function AdminWatchAlerts() {
  const [list, setList] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  const load = () => admin.watchAlerts().then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const trigger = async () => {
    setBusy(true);
    try {
      const r = await admin.triggerWatchPoll();
      setLast(r.ranAt);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminPageHead
        title="Watch-list alerts (admin view)"
        sub={`${list.length} total · ${list.filter((a) => a.unread).length} unread${last ? ` · last poll ${relativeTime(last)}` : ''}`}
        actions={
          <button className="btn btn-primary btn-sm" onClick={trigger} disabled={busy}>
            <Icon name="refresh" /> {busy ? 'Running…' : 'Trigger poll now'}
          </button>
        }
      />

      {list.length === 0 && <div className="empty">No watch-list alerts yet. Trigger the poll if you've saved companies.</div>}

      <div className="adm-table">
        <div className="head" style={{ gridTemplateColumns: '90px 1fr 1fr 100px 90px' }}>
          <span>Severity</span>
          <span>Company</span>
          <span>Title</span>
          <span>Unread</span>
          <span>When</span>
        </div>
        {list.map((a) => (
          <div key={a.id} className="row" style={{ gridTemplateColumns: '90px 1fr 1fr 100px 90px' }}>
            <span className={cn('badge', a.severity === 'BAD' ? 'badge-bad' : a.severity === 'WARN' ? 'badge-warn' : a.severity === 'OK' ? 'badge-ok' : 'badge-info')}>{a.severity}</span>
            <span><b>{a.companyName}</b> <span className="mono muted small">#{a.companyNumber}</span></span>
            <span>{a.title}</span>
            <span>{a.unread ? <span className="badge badge-bad">UNREAD</span> : <span className="small muted">read</span>}</span>
            <span className="mono small muted">{relativeTime(a.occurredAt)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
