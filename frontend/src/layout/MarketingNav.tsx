import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function MarketingNav() {
  const { hash, pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <header className="nav no-print">
      <div className="wrap nav-inner">
        <Link className="logo" to="/">
          <span className="mk">CM</span>
          <span>CareerMoveChecker</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <a href={isHome ? '#personas' : '/#personas'} className={hash === '#personas' ? 'active' : ''}>Who it's for</a>
          <a href={isHome ? '#zones' : '/#zones'} className={hash === '#zones' ? 'active' : ''}>What we can answer</a>
          <a href={isHome ? '#how' : '/#how'} className={hash === '#how' ? 'active' : ''}>How it works</a>
          <NavLink to="/methodology" className={({ isActive }) => (isActive ? 'active' : '')}>Methodology</NavLink>
          <NavLink to="/pricing" className={({ isActive }) => (isActive ? 'active' : '')}>Pricing</NavLink>
        </nav>
        <div className="nav-cta">
          <Link className="btn btn-primary btn-sm" to="/app/search">
            Check a company
            <Icon name="arrow-right" />
          </Link>
        </div>
      </div>
    </header>
  );
}
