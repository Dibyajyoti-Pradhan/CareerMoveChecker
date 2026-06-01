import { Link } from 'react-router-dom';

function LegalNote() {
  return (
    <p>
      <strong>What CareerMove is not:</strong> a credit report, legal advice, or a guarantee of solvency.
      We turn Companies House public records into plain English. You decide.
    </p>
  );
}

export function MarketingFooter() {
  return (
    <footer className="site no-print">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <div className="logo">
              <span className="mk">CM</span>
              <span>CareerMove</span>
            </div>
            <p>A plain-English UK company trust check before you sign, invoice, or place.</p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <Link to="/app/search">Search</Link>
            <Link to="/app/compare">Compare</Link>
            <Link to="/app/saved">Saved</Link>
            <Link to="/app/company/09446231">Example report</Link>
            <Link to="/methodology">Methodology</Link>
          </div>
        </div>
        <div className="legal">
          <LegalNote />
          <p style={{ textAlign: 'right' }}>© {new Date().getFullYear()} CareerMove</p>
        </div>
      </div>
    </footer>
  );
}

export function DiscFooter() {
  return (
    <footer className="disc no-print">
      <div className="wrap">
        <LegalNote />
        <p style={{ textAlign: 'right' }}>© {new Date().getFullYear()} CareerMove</p>
      </div>
    </footer>
  );
}
