import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function AppNav() {
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
          <NavLink to="/app/saved" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name="star" />
            <span>Saved</span>
          </NavLink>
          <NavLink to="/app/bulk" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name="upload" />
            <span>Bulk check</span>
          </NavLink>
        </nav>
        <div className="nav-cta">
          <Link className="btn btn-ghost btn-sm" to="/" style={{ color: 'var(--muted)' }}>← Back to site</Link>
        </div>
      </div>
    </header>
  );
}
