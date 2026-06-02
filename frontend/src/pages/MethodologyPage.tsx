import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useSeo } from '../lib/seo';
import { ScoreGauge } from '../components/ScoreGauge';
import { cn } from '../lib/cn';

const ANCHORS = [
  { id: 'zones', ix: '01', label: 'Three zones' },
  { id: 'sources', ix: '02', label: 'Data sources' },
  { id: 'verdict', ix: '03', label: 'How a verdict is made' },
  { id: 'confidence', ix: '04', label: 'Confidence levels' },
  { id: 'cant', ix: '05', label: "What we can't answer" },
];

const SOURCES = [
  { ep: '/company/{n}', use: 'Status, type, incorporation, SIC, registered office, accounts overdue flags', zone: 'direct' },
  { ep: '/officers', use: 'Active directors, appointed/resigned dates, nationality', zone: 'direct' },
  { ep: '/officers/{id}/appointments', use: 'Director cross-appointments — "killed companies before" signal', zone: 'deduced' },
  { ep: '/persons-with-significant-control', use: 'Beneficial owners, nature of control, group structure', zone: 'direct' },
  { ep: '/charges', use: 'Secured lending, outstanding charges, lender names', zone: 'direct' },
  { ep: '/insolvency', use: 'Active/historical insolvency cases', zone: 'direct' },
  { ep: '/filing-history', use: 'Every filing — strike-off filings, capital activity, cadence', zone: 'direct' },
  { ep: '/search/disqualified-officers', use: 'Banned directors cross-check (Agency tier)', zone: 'direct' },
  { ep: 'Streaming · /filings', use: 'Live monitoring of new filings for watch-list companies', zone: 'direct' },
];

const RECIPE: { w: string; h: string; p: string; impact: string }[] = [
  { w: '−70', h: 'Status: dissolved', p: 'If Companies House reports the company dissolved, the verdict drops immediately. Engaging with a dissolved entity is high risk.', impact: 'CRITICAL' },
  { w: '−60', h: 'Status: wind-up', p: 'Liquidation, administration, or receivership detected. New commitments carry serious visible risk.', impact: 'CRITICAL' },
  { w: '−50', h: 'Insolvency records on file', p: 'One or more insolvency events recorded. Read the filed documents before proceeding.', impact: 'CRITICAL' },
  { w: '−30', h: 'Strike-off filing', p: 'A strike-off-related filing is visible. Company may be moving toward dissolution.', impact: 'WARNING' },
  { w: '−20', h: 'Accounts overdue', p: 'Annual accounts past the filing deadline. Often correlates with operational strain.', impact: 'WARNING' },
  { w: '−15', h: 'Confirmation statement overdue', p: 'Company has not filed its confirmation statement on time. Verify officers independently.', impact: 'WARNING' },
  { w: '−15', h: 'Under 6 months old', p: 'Very new — limited public-data history. Not necessarily negative.', impact: 'WARNING' },
  { w: '−10', h: 'Under 2 years old', p: 'Limited public-data history. Verify trading activity independently.', impact: 'INFO' },
  { w: '−10', h: 'No active officers', p: 'Companies House shows zero active officers. Requires manual review.', impact: 'WARNING' },
  { w: '−10', h: 'Officer churn', p: 'Multiple resignations in last 24 months may indicate instability.', impact: 'WARNING' },
  { w: '−10', h: 'PSC data missing', p: 'No persons with significant control returned. Ask who controls the company.', impact: 'WARNING' },
  { w: '−5 to −15', h: 'Outstanding charges', p: 'Secured lending against the company. Most active companies have some — worth being aware of in context.', impact: 'INFO' },
  { w: '+10', h: 'Active for 5+ years', p: 'Longer trading history is a visible positive signal — not a guarantee of safety.', impact: 'POSITIVE' },
  { w: '+5', h: 'Filings current', p: 'Accounts and confirmation statement current at Companies House.', impact: 'POSITIVE' },
  { w: '+5', h: 'No insolvency records', p: 'Clean insolvency register and not dissolved or in wind-up.', impact: 'POSITIVE' },
  { w: '+5', h: 'Ownership straightforward', p: 'PSC list returns clear beneficial ownership.', impact: 'POSITIVE' },
];

function ScoreCalculator() {
  const [active, setActive] = useState<Set<string>>(new Set());
  const toggle = (h: string) => setActive((prev) => {
    const next = new Set(prev);
    next.has(h) ? next.delete(h) : next.add(h);
    return next;
  });
  const score = Math.max(0, Math.min(100, RECIPE.reduce((acc, r) => {
    if (!active.has(r.h)) return acc;
    const raw = r.w.replace('−', '-').replace('+', '');
    const n = parseInt(raw);
    return acc + (isNaN(n) ? 0 : n);
  }, 75)));
  return (
    <section aria-label="Score calculator" style={{ marginTop: 40, marginBottom: 0 }}>
      <div className="s-head">
        <div>
          <div className="s-eyebrow">Try it</div>
          <h2 className="s-title">Build a scenario.</h2>
        </div>
        <p className="s-lead">Toggle signals to see how the score moves. Starts at 75.</p>
      </div>
      <div className="builder">
        <div className="builder-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {RECIPE.map((r) => (
              <button
                key={r.h}
                aria-pressed={active.has(r.h)}
                onClick={() => toggle(r.h)}
                className={cn('chip', active.has(r.h) ? 'active' : '')}
                style={{ fontSize: 12 }}
              >
                <span style={{ fontFamily: 'var(--mono)', marginRight: 4 }}>{r.w}</span>
                {r.h}
              </button>
            ))}
          </div>
          <ScoreGauge score={score} confidence={0.8} />
        </div>
      </div>
    </section>
  );
}

export function MethodologyPage() {
  useSeo({
    title: 'Methodology — CareerMove',
    description: 'How we turn Companies House public data into a plain-English verdict. Open scoring. Every signal documented.',
  });

  return (
    <>
      <section className="hero" style={{ paddingBottom: 36 }}>
        <div className="wrap">
          <span className="persona-tag"><span className="dot" />Methodology</span>
          <h1>How we work, <em>in the open</em>.</h1>
          <p className="sub">No mystery algorithm. Every signal, every weight, every data source documented. If you don't trust how we got the answer, you shouldn't trust the answer.</p>
        </div>
      </section>

      <div className="anchor-bar">
        <div className="wrap row">
          {ANCHORS.map((a) => (
            <a key={a.id} href={`#${a.id}`}>{a.label}</a>
          ))}
        </div>
      </div>

      <section className="s tight" id="zones">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">Three zones</div><h2 className="s-title">Every answer is tagged.</h2></div>
            <p className="s-lead">Direct facts, deduced signals, or honest "we can't answer that". The colour-coding is the same across every page.</p>
          </div>
          <div className="grid-3" style={{ gap: 14 }}>
            <div className="zone-cell">
              <span className="zone-tag direct">Direct</span>
              <h3>Facts from the public record</h3>
              <p>Fields Companies House returns as-is. We never style a fact as anything other than fact.</p>
              <ul>
                <li>Status, type, incorporation date</li>
                <li>Registered office address</li>
                <li>Current officers and appointment dates</li>
                <li>Insolvency cases on file</li>
                <li>Outstanding charges</li>
              </ul>
              <div className="src">Source: Companies House Public Data API (REST)</div>
            </div>
            <div className="zone-cell">
              <span className="zone-tag deduced">Deduced</span>
              <h3>Signals we combine</h3>
              <p>Inferences from joining multiple data points. Always shown with the underlying evidence, never as fact.</p>
              <ul>
                <li>"Likely to still be here next year"</li>
                <li>"Likely to pay invoices"</li>
                <li>"Stable leadership"</li>
                <li>"Director track record"</li>
                <li>"Real office vs virtual"</li>
              </ul>
              <div className="src">Source: composite of CH endpoints + rule engine v1</div>
            </div>
            <div className="zone-cell">
              <span className="zone-tag not">Not answerable</span>
              <h3>Where CH goes silent</h3>
              <p>Things the public record doesn't carry. We say so honestly and point to the right tool.</p>
              <ul>
                <li>Salary & headcount</li>
                <li>Workplace culture (→ Glassdoor)</li>
                <li>Layoffs (→ Layoffs.fyi)</li>
                <li>Payment behaviour (→ trade references)</li>
                <li>Funding runway (→ accounts XBRL or news)</li>
              </ul>
              <div className="src">Source: nothing — that's the point</div>
            </div>
          </div>
        </div>
      </section>

      <section className="s" id="sources">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">Data sources</div><h2 className="s-title">Every endpoint we touch.</h2></div>
            <p className="s-lead">Every signal traces back to one of these.</p>
          </div>
          <div className="sources">
            {SOURCES.map((s) => (
              <div key={s.ep} className="src-row">
                <span className="ep">{s.ep}</span>
                <span className="use">{s.use}</span>
                <span className={`zone-tag ${s.zone}`}>{s.zone}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s" id="verdict">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">How a verdict is made</div><h2 className="s-title">One recipe. Same for everyone.</h2></div>
            <p className="s-lead">Score starts at 75. Signals add or subtract. Same engine runs for job candidates, freelancers, and agencies — only the verdict phrasing changes for your decision context. No hidden reweighting.</p>
          </div>
          <div className="builder">
            <div className="builder-body">
              <div className="recipe">
                {RECIPE.map((r) => (
                  <div key={r.h} className="ingredient">
                    <div className="w">{r.w}</div>
                    <div>
                      <h4>{r.h}</h4>
                      <p>{r.p}</p>
                      <div className="impact">{r.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="s" id="calculator">
        <div className="wrap">
          <ScoreCalculator />
        </div>
      </section>

      <section className="s" id="confidence">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">Confidence levels</div><h2 className="s-title">When we're sure — and when we're not.</h2></div>
            <p className="s-lead">Confidence is a function of how much data was available, not how certain we are it's true.</p>
          </div>
          <div className="conf-grid">
            <div className="conf-card high">
              <div className="h"><Icon name="check" /><span className="b">HIGH</span></div>
              <h4>All endpoints returned, &gt;5 years history</h4>
              <p>Profile + officers + PSC + charges + filings + insolvency all responded. Long trading history.</p>
            </div>
            <div className="conf-card mod">
              <div className="h"><Icon name="info" /><span className="b">MODERATE</span></div>
              <h4>Most endpoints returned, &lt;5 years history</h4>
              <p>Some data partial. Younger company. Verdict reliable but signal density is thinner.</p>
            </div>
            <div className="conf-card low">
              <div className="h"><Icon name="warn" /><span className="b">LOW</span></div>
              <h4>Newly incorporated, partial data, or stale cache</h4>
              <p>Less than 6 months old, or one of the CH endpoints unavailable. Treat verdict as preliminary.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="s" id="cant">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">What we can't answer</div><h2 className="s-title">Honest about the silence.</h2></div>
            <p className="s-lead">If CH doesn't have it, we say so. And we point you to where you should look.</p>
          </div>
          <div className="cant-grid">
            {[
              { q: 'Will you be paid what you\'re worth?', site: 'Levels.fyi / Glassdoor', url: 'https://www.glassdoor.co.uk' },
              { q: 'Will you hate working there?', site: 'Glassdoor / Blind', url: 'https://www.glassdoor.co.uk' },
              { q: 'Are layoffs imminent?', site: 'Layoffs.fyi / news', url: 'https://layoffs.fyi' },
              { q: 'Will their money run out?', site: 'Accounts XBRL parse / news', url: 'https://find-and-update.company-information.service.gov.uk' },
              { q: 'Do they actually pay on time?', site: 'Trade references / Trustpilot', url: 'https://uk.trustpilot.com' },
              { q: 'Is the team you\'d work with any good?', site: 'LinkedIn / your network', url: 'https://linkedin.com' },
            ].map((c) => (
              <div key={c.q} className="cant-row">
                <span className="q">{c.q}</span>
                <a href={c.url} target="_blank" rel="noreferrer">Try {c.site} <Icon name="external" size={12} /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s tight">
        <div className="wrap final-cta">
          <h2>Now run a check.</h2>
          <p>Methodology is only useful if you've seen it apply.</p>
          <Link className="btn btn-primary btn-lg" to="/app/search">Check a company <Icon name="arrow-right" /></Link>
        </div>
      </section>
    </>
  );
}
