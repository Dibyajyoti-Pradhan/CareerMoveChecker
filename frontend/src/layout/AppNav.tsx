import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { api } from '../api/client';

export function AppNav() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/app/search');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  useEffect(() => {
    api.alertsFeed().then((r) => setUnread(r.unread)).catch(() => {});
  }, []);

  return (
    <header className="nav no-print">
      <div className="wrap nav-inner">
        <Link className="logo" to="/">
          <span className="mk">CM</span>
          <span>CareerMove</span>
        </Link>
        <nav className="app-tabs" aria-label="App">
          <NavLink to="/app/search" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name="search" />
            <span>Search</span>
          </NavLink>
          <NavLink to="/app/compare" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name="compare" />
            <span>Compare</span>
          </NavLink>
          <NavLink to="/app/saved" className={({ isActive }) => (isActive ? 'active' : '')} aria-label={unread > 0 ? `Saved — ${unread} unread alert${unread !== 1 ? 's' : ''}` : undefined}>
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Icon name="star" />
              {unread > 0 && (
                <span aria-hidden="true" style={{
                  position: 'absolute', top: -4, right: -6,
                  background: 'var(--bad)', color: '#fff',
                  borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  width: 16, height: 16, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
            <span>Saved</span>
          </NavLink>
          <NavLink to="/app/bulk" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name="upload" />
            <span>Bulk check</span>
          </NavLink>
        </nav>
        <div className="nav-cta" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link className="btn btn-primary btn-sm" to="/pricing" style={{ fontSize: 12 }}>
            Upgrade ↗
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/" style={{ color: 'var(--muted)' }}>← Back to site</Link>
        </div>
      </div>
    </header>
  );
}
