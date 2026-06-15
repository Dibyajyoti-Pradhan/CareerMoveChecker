import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { extractCompanyNumber } from '../lib/format';
import { useSeo } from '../lib/seo';

const TRY_CHIPS = ['Monzo Bank Limited', 'Deliveroo Plc', 'Greggs Plc', '09446231'];

export function HomePage() {
  useSeo({
    title: 'Should you trust this UK company? — CareerMove',
    description: '60-second plain-English check on any UK company. Free, no sign-up. Built on Companies House public data.',
  });

  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const companyNumber = extractCompanyNumber(q);
    if (companyNumber) {
      navigate(`/app/company/${companyNumber}`);
      return;
    }
    navigate(`/app/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-left">
              <h1>Should you <em>trust</em> this company?</h1>

              <p className="sub">60-second plain-English check on any UK company. Use it before you sign an offer, invoice a client, or place a candidate.</p>

              <form className="search-row" onSubmit={submit}>
                <div className="input-prefix">
                  <span className="pf"><Icon name="search" /></span>
                  <input
                    aria-label="Search by company name, company number, or Companies House URL"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Company name, 8-digit number, or paste a Companies House URL"
                  />
                </div>
                <button className="btn btn-primary btn-lg" type="submit">Run check</button>
              </form>

              <div className="hero-meta">
                <Link className="chip chip-secondary" to="/app/company/09446231">Or see an example →</Link>
              </div>

              <div className="hero-bullets">
                <div className="item"><Icon name="check" size={14} /> <span>Free — no sign-up</span></div>
                <div className="item"><Icon name="check" size={14} /> <span>UK Companies House data, updated daily</span></div>
                <div className="item"><Icon name="check" size={14} /> <span>Plain English. Printable. No jargon.</span></div>
              </div>

              <div className="suggested">
                <span className="lbl">Try</span>
                {TRY_CHIPS.map((c) => (
                  <button key={c} className="chip" type="button" onClick={() => setQ(c)}>{c}</button>
                ))}
              </div>
            </div>

            <div className="hero-right">
              <AnswerCardPreview />
            </div>
          </div>
        </div>
      </section>

      <Zones />
    </>
  );
}

function AnswerCardPreview() {
  return (
    <div className="answer-card">
      <div className="answer-bar">
        <div className="dots"><i /><i /><i /></div>
        <div className="url">careermove.uk/c/<b>09446231</b></div>
        <div className="timing">checked just now</div>
      </div>
      <div className="answer-body">
        <div className="answer-co">
          <div className="crest">MB</div>
          <div>
            <h2>Monzo Bank Limited</h2>
            <div className="row">
              <span className="badge badge-ok"><span className="dot" />Active</span>
              <span className="pip" />
              <span className="mono">#09446231</span>
              <span className="pip" />
              <span>Incorporated Feb 2015</span>
            </div>
          </div>
        </div>

        <div>
          <div className="answer-q">Will this company still be here next year?</div>
          <h3 className="answer-h"><em>Probably yes.</em></h3>
          <p className="answer-verdict">Strong public signals. 11 years of continuous trading, no insolvency on file, accounts and confirmation statement filed on time, and stable leadership.</p>
          <Ticks items={[
            { ok: true, text: 'Active for 11 years — no gaps in status', ev: 'Direct · Companies House status & incorporation date' },
            { ok: true, text: 'No insolvency or strike-off on the record', ev: 'Direct · Insolvency register clean' },
            { ok: true, text: 'Accounts and confirmation statement filed on time', ev: 'Direct · Last filed 14 Mar 2026' },
            { ok: true, text: 'Stable leadership — board steady', ev: 'Direct · No officer churn in last 12 months' },
          ]} />
        </div>

        <div className="answer-cta">
          <span className="save-line"><b>Save for later.</b> Re-check anytime — and get notified if anything changes.</span>
          <Link className="btn btn-secondary btn-sm" to="/app/company/09446231">
            <Icon name="external" />
            See full report
          </Link>
          <Link className="btn btn-primary btn-sm" to="/app/search">Run a free check</Link>
        </div>
      </div>
    </div>
  );
}

function Ticks({ items }: { items: { ok: boolean; text: string; ev: string }[] }) {
  return (
    <div className="ticks">
      {items.map((t, i) => (
        <div key={i} className={'tick ' + (t.ok ? '' : 'warn')}>
          <span className="m"><Icon name={t.ok ? 'check' : 'warn'} size={12} /></span>
          <span>{t.text}<span className="ev">{t.ev}</span></span>
        </div>
      ))}
    </div>
  );
}

function Zones() {
  return (
    <section className="s" id="zones">
      <div className="wrap">
        <div className="s-head">
          <div>
            <div className="s-eyebrow">Honesty by design</div>
            <h2 className="s-title">We tell you which questions we can answer — and which we can't.</h2>
          </div>
          <p className="s-lead">Every answer in the report is colour-coded by where it comes from. Direct facts from Companies House, deductions from combined signals, or honest "we can't answer that" — with a pointer to where you should look instead.</p>
        </div>
        <div className="zones">
          <div className="zone direct">
            <span className="tag">Direct</span>
            <h4>Facts from the public record</h4>
            <p>Things Companies House returns as fields. We show them as-is. No interpretation, no hedging.</p>
            <div className="ex"><b>Active. Incorporated 2015.</b>Accounts filed on time. Three current officers.</div>
          </div>
          <div className="zone deduced">
            <span className="tag">Deduced</span>
            <h4>Signals we combine</h4>
            <p>Things we infer by joining the dots. We always show our working, and never style a deduction as a fact.</p>
            <div className="ex"><b>Filings appear current</b>May indicate operational stability — not a guarantee.</div>
          </div>
          <div className="zone not">
            <span className="tag">Not answerable</span>
            <h4>Where Companies House goes silent</h4>
            <p>Things the public record doesn't cover. We say so honestly, and point you to the right next place to look.</p>
            <div className="ex"><b>"Is it a nice place to work?"</b>We can't answer that — try Glassdoor and team reviews.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
