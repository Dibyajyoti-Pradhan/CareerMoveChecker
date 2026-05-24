import { Link, NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

const navItems = [
  { to: '/app/search', label: 'Search' },
  { to: '/app/dashboard', label: 'Saved' },
  { to: '/app/compare', label: 'Compare' },
  { to: '/pricing', label: 'Pricing' },
];

export function Header() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand3 text-white font-extrabold shadow-card">
            C
          </span>
          <span className="text-base font-extrabold tracking-tight">
            Career<span className="text-brand">Move</span>Checker
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 rounded-xl text-sm font-semibold',
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-muted hover:text-ink hover:bg-soft',
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/app/search"
            className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark"
          >
            Check a company
          </Link>
        </div>
      </div>
    </header>
  );
}
