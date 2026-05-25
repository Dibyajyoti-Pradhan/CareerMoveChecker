import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { AdminPageHead } from './AdminLayout';
import { cn } from '../../lib/cn';
import { Icon } from '../../components/Icon';
import { relativeTime } from '../../lib/format';

export function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const load = () => admin.settings().then((r) => {
    setSettings(r);
    setDrafts(Object.fromEntries(r.map((s) => [s.key, s.value])));
  });
  useEffect(() => { load(); }, []);

  const save = async (key: string) => {
    setErrorKey(null);
    try {
      await admin.updateSetting(key, drafts[key]);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
      await load();
    } catch {
      setErrorKey(key);
    }
  };

  return (
    <>
      <AdminPageHead title="Settings" sub={`${settings.length} configurable values · changes audit-logged`} />

      <div className="adm-card">
        {settings.map((s) => (
          <div key={s.key} className="setting-row">
            <div>
              <h5>{s.key}</h5>
              <div className="desc">{s.description}</div>
            </div>
            <input
              className={cn('input', errorKey === s.key && 'input-error')}
              value={drafts[s.key] ?? ''}
              onChange={(e) => setDrafts({ ...drafts, [s.key]: e.target.value })}
            />
            <div className="row">
              {savedKey === s.key && <span className="small" style={{ color: 'var(--ok)' }}><Icon name="check" size={12} /> saved</span>}
              {errorKey === s.key && <span className="small" style={{ color: 'var(--bad)' }}>invalid</span>}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => save(s.key)}
                disabled={drafts[s.key] === s.value}
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <h3>Audit trail</h3>
        <p className="sub">Last update per setting.</p>
        {settings.filter((s) => s.updatedBy).length === 0 && <div className="empty">No edits yet.</div>}
        {settings.filter((s) => s.updatedBy).map((s) => (
          <div key={s.key} className="row" style={{ justifyContent: 'space-between', padding: '8px 0', borderTop: '1px dashed var(--hair)' }}>
            <span className="mono small">{s.key}</span>
            <span className="muted small">by {s.updatedBy} · {relativeTime(s.updatedAt)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
