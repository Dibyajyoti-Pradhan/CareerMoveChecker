import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="no-print border-t border-line bg-white">
      <div className="container-page py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand3 text-white font-extrabold">
              C
            </span>
            <span className="text-base font-extrabold tracking-tight">
              CareerMoveChecker
            </span>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-md">
            CareerMoveChecker uses public data sources, primarily Companies
            House, to support general business and career due diligence. It is
            not a credit report, legal advice, financial advice, AML/KYB
            verification, employment advice, or a guarantee of solvency, safety,
            or trustworthiness. Always verify important decisions with
            appropriate professional checks.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wide text-muted font-bold mb-3">
            Product
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/app/search" className="hover:text-brand">Search</Link></li>
            <li><Link to="/app/compare" className="hover:text-brand">Compare</Link></li>
            <li><Link to="/app/dashboard" className="hover:text-brand">Dashboard</Link></li>
            <li><Link to="/pricing" className="hover:text-brand">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wide text-muted font-bold mb-3">
            Resources
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-brand" href="https://find-and-update.company-information.service.gov.uk/" target="_blank" rel="noreferrer">Companies House</a></li>
            <li><Link to="/admin" className="hover:text-brand">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-page border-t border-line py-5 text-xs text-muted flex items-center justify-between">
        <span>© {new Date().getFullYear()} CareerMoveChecker</span>
        <span>Decision-support tool. Not a credit report.</span>
      </div>
    </footer>
  );
}
