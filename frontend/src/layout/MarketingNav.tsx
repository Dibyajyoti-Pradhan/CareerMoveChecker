import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function MarketingNav() {
  return (
    <header className="nav no-print">
      <div className="wrap nav-inner">
        <Link className="logo" to="/">
          <span className="mk">CM</span>
          <span>CareerMove</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/methodology">Methodology</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
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
