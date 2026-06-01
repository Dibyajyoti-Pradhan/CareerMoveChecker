import { ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { admin } from '../../api/admin';
import { cn } from '../../lib/cn';

const NAV: { to: string; label: string; icon: any; ix: string }[] = [
  { to: '/admin', label: 'Overview', icon: 'home', ix: '01' },
  { to: '/admin/visitors', label: 'Visitors', icon: 'users', ix: '02' },
  { to: '/admin/funnel', label: 'Demand funnel', icon: 'star', ix: '03' },
  { to: '/admin/waitlist', label: 'Waitlist', icon: 'mail', ix: '04' },
  { to: '/admin/api-health', label: 'API health', icon: 'alert', ix: '05' },
  { to: '/admin/data-freshness', label: 'Data freshness', icon: 'refresh', ix: '06' },
  { to: '/admin/alerts', label: 'CH data-quality', icon: 'warn', ix: '07' },
  { to: '/admin/watch-alerts', label: 'Watch-list alerts', icon: 'bell', ix: '08' },
  { to: '/admin/activity', label: 'Activity & feedback', icon: 'star', ix: '09' },
  { to: '/admin/companies', label: 'Companies', icon: 'building', ix: '10' },
  { to: '/admin/logs', label: 'CH call logs', icon: 'list', ix: '11' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings', ix: '12' },
  { to: '/admin/kill-switches', label: 'Kill switches', icon: 'x', ix: '13' },
  { to: '/admin/audit', label: 'Audit log', icon: 'lock', ix: '14' },
];

export function AdminLayout() {
  const [authed, setAuthed] = useState(admin.hasPassword());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add('canvas');
    return () => document.body.classList.remove('canvas');
  }, []);

  if (!authed) return <AdminGate onUnlock={() => setAuthed(true)} />;

  const signOut = () => {
    admin.clearPassword();
    navigate('/admin');
    setAuthed(false);
  };

  return (
    <>
      <AdminNav onSignOut={signOut} />
      <div className="wrap">
        <div className="admin-shell">
          <aside className="rail-nav admin-rail">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/admin'} className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="ix">{n.ix}</span>
                <Icon name={n.icon} />
                {n.label}
              </NavLink>
            ))}
          </aside>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    admin.setPassword(pwd);
    try {
      await admin.summary('7d');
      onUnlock();
    } catch {
      setError(true);
    }
  };
  return (
    <div className="wrap" style={{ paddingTop: 80, maxWidth: 440 }}>
      <div className="panel-card">
        <h3>Admin access</h3>
        <p className="sub">Enter the admin password to access ops dashboard.</p>
        <form onSubmit={submit}>
          <div className="field">
            <input className={cn('input', error && 'input-error')} type="password" placeholder="Admin password" value={pwd} onChange={(e) => { setPwd(e.target.value); setError(false); }} autoFocus />
            {error && <span className="small" style={{ color: 'var(--bad)' }}>Wrong password.</span>}
          </div>
          <button className="submit-btn">Unlock</button>
        </form>
      </div>
    </div>
  );
}

function AdminNav({ onSignOut }: { onSignOut: () => void }) {
  return (
    <header className="nav ops no-print">
      <div className="wrap nav-inner">
        <Link className="logo" to="/admin">
          <span className="mk">CM</span>
          <span>CareerMove</span>
          <span className="tag">ops</span>
        </Link>
        <div className="live-pill mono">{new Date().toISOString().slice(11, 19)} UTC</div>
        <div className="row">
          <Link to="/" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,.8)' }}>Back to app</Link>
          <button className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,.8)' }} onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    </header>
  );
}

export function AdminPageHead({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-head" style={{ border: 0, padding: '14px 0 18px' }}>
      <div>
        <h1 style={{ fontSize: 24 }}>{title}</h1>
        {sub && <p className="sub" style={{ margin: 0 }}>{sub}</p>}
      </div>
      {actions && <div className="head-actions">{actions}</div>}
    </div>
  );
}

export function RangePick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = ['1h', '24h', '7d', '30d', '90d'];
  return (
    <div className="tabs-pill" style={{ background: 'var(--soft)' }}>
      {opts.map((r) => (
        <button key={r} className={cn('tab', value === r && 'active')} onClick={() => onChange(r)}>{r}</button>
      ))}
    </div>
  );
}
