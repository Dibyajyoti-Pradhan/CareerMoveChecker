import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { AdminPageHead } from './AdminLayout';
import { cn } from '../../lib/cn';
import { relativeTime } from '../../lib/format';

export function AdminKillSwitches() {
  const [list, setList] = useState<any[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const load = () => admin.killSwitches().then((r) => {
    setList(r);
    setReasons(Object.fromEntries(r.map((k) => [k.key, k.reason || ''])));
  });
  useEffect(() => { load(); }, []);

  const toggle = async (key: string, enabled: boolean) => {
    await admin.updateKillSwitch(key, enabled, reasons[key] || '');
    await load();
  };

  return (
    <>
      <AdminPageHead
        title="Kill switches"
        sub={`${list.filter((k) => k.enabled).length} active · ${list.length} total`}
      />

      {list.some((k) => k.enabled) && (
        <div className="status-banner bad">
          <span>⚠ <b>{list.filter((k) => k.enabled).length}</b> kill switch(es) currently active. Some app features are disabled.</span>
        </div>
      )}

      <div className="adm-card">
        {list.map((k) => (
          <div key={k.key} className="kill-row">
            <div>
              <h5>{k.key}</h5>
              <p>{k.enabled ? `🔴 ACTIVE — ${k.reason || 'no reason given'}` : 'Inactive · feature operational'}</p>
              {k.updatedBy && <p className="small muted">last toggled by {k.updatedBy}, {relativeTime(k.updatedAt)}</p>}
            </div>
            <div className="row">
              <input
                className="input"
                style={{ width: 220 }}
                placeholder="Reason (optional)"
                value={reasons[k.key] ?? ''}
                onChange={(e) => setReasons({ ...reasons, [k.key]: e.target.value })}
              />
              <label className="toggle">
                <input type="checkbox" checked={k.enabled} onChange={(e) => toggle(k.key, e.target.checked)} />
                <span className="slider" />
              </label>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
