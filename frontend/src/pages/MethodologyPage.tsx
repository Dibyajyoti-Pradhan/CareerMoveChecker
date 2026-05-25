import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import type { Persona } from '../lib/persona';
import { PERSONA_LABEL } from '../lib/persona';

const ANCHORS = [
  { id: 'zones', ix: '01', label: 'Three zones' },
  { id: 'sources', ix: '02', label: 'Data sources' },
  { id: 'verdict', ix: '03', label: 'How a verdict is made' },
  { id: 'confidence', ix: '04', label: 'Confidence levels' },
  { id: 'cant', ix: '05', label: "What we can't answer" },
  { id: 'not', ix: '06', label: 'What this is not' },
  { id: 'changelog', ix: '07', label: 'Changelog' },
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

const RECIPES: Record<Persona, { w: string; h: string; p: string; impact: string }[]> = {
  candidate: [
    { w: '×3', h: 'Status & insolvency', p: 'If status is anything other than active, we say so directly. Insolvency endpoint with cases drops verdict immediately.', impact: 'impact: deal-breaker' },
    { w: '×2', h: 'Filings on time', p: "Overdue accounts and confirmation statements suggest operational strain.", impact: 'impact: weight 20%' },
    { w: '×2', h: 'Trading history', p: "5+ years = stability signal. <6 months = limited public history (not necessarily bad).", impact: 'impact: weight 15%' },
    { w: '×1.5', h: 'Officer churn', p: "3+ director resignations in last 24 months. Cross-reference with named exec changes.", impact: 'impact: weight 10%' },
    { w: '×1', h: 'PSC clarity', p: "Beneficial owners declared and recent. Missing PSC = manual review flag.", impact: 'impact: weight 5%' },
  ],
  freelancer: [
    { w: '×3', h: 'Status & insolvency', p: 'Same as candidate — dissolved/liquidation/admin = critical.', impact: 'impact: deal-breaker' },
    { w: '×2.5', h: 'Director track record', p: 'Cross-reference officers against other companies they run/ran. Pattern of dissolved companies = red flag.', impact: 'impact: weight 25%' },
    { w: '×2', h: 'Filings on time', p: 'Late accounts often precede payment problems.', impact: 'impact: weight 20%' },
    { w: '×1.5', h: 'Charges & leverage', p: 'Recent or many outstanding charges = financially squeezed.', impact: 'impact: weight 15%' },
    { w: '×1', h: 'Trading history', p: 'Newer company = less to lose from non-payment.', impact: 'impact: weight 10%' },
  ],
  agency: [
    { w: '×∞', h: 'Disqualified officers', p: 'Banned director on the current board = automatic red banner, regardless of other signals.', impact: 'impact: instant flag' },
    { w: '×3', h: 'Status & insolvency', p: 'Standard critical-on-detection.', impact: 'impact: deal-breaker' },
    { w: '×2.5', h: 'Filings & growth signals', p: 'Capital allotment, board additions = positive. Overdue = warning.', impact: 'impact: weight 25%' },
    { w: '×2', h: 'Officer churn', p: 'Leadership instability = candidate placement risk.', impact: 'impact: weight 20%' },
    { w: '×1.5', h: 'Charges & address', p: 'Virtual-office pattern + heavy leverage = caution.', impact: 'impact: weight 15%' },
  ],
};

export function MethodologyPage() {
  const [persona, setPersona] = useState<Persona>('candidate');
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
            <a key={a.id} href={`#${a.id}`}><span className="ix">{a.ix}</span>{a.label}</a>
          ))}
        </div>
      </div>

      <section className="s tight" id="zones">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">01 · Three zones</div><h2 className="s-title">Every answer is tagged.</h2></div>
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
            <div><div className="s-eyebrow">02 · Data sources</div><h2 className="s-title">Every endpoint we touch.</h2></div>
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
            <div><div className="s-eyebrow">03 · How a verdict is made</div><h2 className="s-title">Same data, three weightings.</h2></div>
            <p className="s-lead">Pick a persona to see the recipe.</p>
          </div>
          <div className="builder">
            <div className="builder-tabs">
              {(['candidate', 'freelancer', 'agency'] as Persona[]).map((p) => (
                <button key={p} className={'tab' + (persona === p ? ' active' : '')} onClick={() => setPersona(p)}>
                  {PERSONA_LABEL[p]}
                </button>
              ))}
            </div>
            <div className="builder-body">
              <div className="recipe">
                {RECIPES[persona].map((r) => (
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

      <section className="s" id="confidence">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">04 · Confidence levels</div><h2 className="s-title">When we're sure — and when we're not.</h2></div>
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
            <div><div className="s-eyebrow">05 · What we can't answer</div><h2 className="s-title">Honest about the silence.</h2></div>
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

      <section className="s" id="not">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">06 · What this is not</div><h2 className="s-title">Boundaries.</h2></div>
            <p className="s-lead">Six things CareerMoveChecker is not. Read them.</p>
          </div>
          <div className="not-this">
            {[
              { h: 'Not a credit report', p: 'For credit scoring see Experian, Equifax, Creditsafe.' },
              { h: 'Not AML / KYB', p: 'Use a regulated KYB provider for compliance.' },
              { h: 'Not legal advice', p: 'See a solicitor before signing anything material.' },
              { h: 'Not employment advice', p: 'See an employment lawyer or ACAS.' },
              { h: 'Not a solvency guarantee', p: 'Companies can fail between checks. Always re-verify.' },
              { h: 'UK only', p: 'No US, EU, or rest-of-world coverage in v1.' },
            ].map((n) => (
              <div key={n.h} className="nt">
                <div className="ic"><Icon name="x" size={14} /></div>
                <h4>{n.h}</h4>
                <p>{n.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s" id="changelog">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">07 · Changelog</div><h2 className="s-title">When the recipe changes, you see it.</h2></div>
            <p className="s-lead">We log every meaningful change to the scoring engine.</p>
          </div>
          <div className="changelog">
            {[
              { d: '2026-05-24', v: 'rules-v1.1', h: 'Tightened insolvency-category filter', p: 'Filings with category=insolvency no longer auto-flag CRITICAL — they raise an INFO signal pending review.' },
              { d: '2026-05-22', v: 'rules-v1', h: 'Initial rule engine launched', p: 'Base 75 + per-signal additions / deductions. Persona-specific framing layer added on top.' },
            ].map((c) => (
              <div key={c.d} className="cl-row">
                <span className="date">{c.d}</span>
                <span className="v">{c.v}</span>
                <div>
                  <h4>{c.h}</h4>
                  <p>{c.p}</p>
                </div>
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
