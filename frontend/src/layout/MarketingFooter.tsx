import { Link } from 'react-router-dom';

export function MarketingFooter() {
  return (
    <footer className="site no-print">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <div className="logo">
              <span className="mk">CM</span>
              <span>CareerMoveChecker</span>
            </div>
            <p>A plain-English UK company trust check before you sign, invoice, or place.</p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <Link to="/app/search">Search</Link>
            <Link to="/app/compare">Compare</Link>
            <Link to="/app/saved">Saved</Link>
            <Link to="/app/company/09446231">Example report</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="foot-col">
            <h5>For</h5>
            <Link to="/for-candidates">Job candidates</Link>
            <Link to="/for-freelancers">Freelancers</Link>
            <Link to="/for-agencies">Recruitment agencies</Link>
          </div>
          <div className="foot-col">
            <h5>Learn</h5>
            <Link to="/methodology">Methodology</Link>
            <a href="/#zones">What we can answer</a>
            <a href="/#how">How it works</a>
          </div>
        </div>
        <div className="legal">
          <p>
            <strong>A note on what this is.</strong> CareerMoveChecker is a decision-support tool based on
            Companies House public data. Not a credit report, not legal, financial, employment, or
            AML/KYB advice, and not a guarantee of solvency.
          </p>
          <p style={{ textAlign: 'right' }}>© {new Date().getFullYear()} CareerMoveChecker · Made in the UK</p>
        </div>
      </div>
    </footer>
  );
}

export function DiscFooter() {
  return (
    <footer className="disc no-print">
      <div className="wrap">
        <p>
          <strong>A note on what this is.</strong> CareerMoveChecker is a decision-support tool based on
          Companies House public data. Not a credit report, not legal, financial, employment, or
          AML/KYB advice, and not a guarantee of solvency.
        </p>
        <p style={{ textAlign: 'right' }}>© {new Date().getFullYear()} CareerMoveChecker · Made in the UK</p>
      </div>
    </footer>
  );
}
