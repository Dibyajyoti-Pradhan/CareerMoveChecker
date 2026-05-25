import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaProvider } from '../lib/persona';
import { WaitlistCTA } from '../components/WaitlistCTA';

export function ForAgenciesPage() {
  return (
    <PersonaProvider force="agency">
      <Content />
    </PersonaProvider>
  );
}

function Content() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/app/search?q=${encodeURIComponent(q.trim())}`);
  };

  const moments = [
    { ic: 'flag', h: 'New client briefs a role', p: 'Check the client before consultants spend time sourcing.', ex: '"They want 3 hires, paying upfront. Real?"' },
    { ic: 'mail', h: 'Payment terms quietly extended', p: 'When net-30 becomes net-60, double-check the entity.', ex: '"They moved us from 30 to 60. Should I worry?"' },
    { ic: 'users', h: 'Candidate asks "is this safe?"', p: 'Send them a one-page summary that builds trust.', ex: '"My candidate just asked the awkward question."' },
    { ic: 'building', h: 'Weekly pipeline hygiene', p: 'Refresh the watch list every Monday before pipeline meeting.', ex: '"Pipeline review in 10 min — quick check on every active client."' },
    { ic: 'star', h: 'Founder reviews exposure', p: 'See agency-wide risk on one screen.', ex: '"What\'s our total fee exposure across all open placements?"' },
    { ic: 'search', h: 'Bulk supplier check', p: 'Upload a CSV of clients — get 50 verdicts in one go.', ex: '"Procurement just sent me 47 potential clients. Now what?"' },
  ] as const;

  const questions = [
    { q: 'Are they open for business?', z: 'direct' },
    { q: 'Is anyone on the board banned from running companies?', z: 'direct' },
    { q: 'Have they gone under before?', z: 'direct' },
    { q: 'Will you get your fee?', z: 'deduced' },
    { q: 'Are you sending your candidate to a dying company?', z: 'deduced' },
    { q: 'Will you look bad for placing someone here?', z: 'deduced' },
    { q: 'Is the leadership holding together?', z: 'deduced' },
    { q: 'Are they growing or shrinking?', z: 'deduced' },
    { q: 'Who really stands behind this company?', z: 'direct' },
    { q: 'Are they already mortgaged to the hilt?', z: 'direct' },
    { q: 'Is the ownership simple or a maze?', z: 'deduced' },
    { q: 'Brand-new shell or real trading business?', z: 'direct' },
    { q: 'Real office or just a mailbox?', z: 'deduced' },
    { q: 'Do they actually do what they say they do?', z: 'direct' },
    { q: 'Who exactly are you contracting with?', z: 'direct' },
  ] as const;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="persona-tag"><span className="dot" />03 · Recruitment agency · From £79/mo</span>
          <h1>Protect every <em>placement</em> and every <em>fee</em>.</h1>
          <p className="sub">Don't place candidates at companies that won't pay your fee — or that won't be here in 6 months. Disqualified-officer cross-check, bulk CSV check, and monitoring built for recruitment teams.</p>
          <form className="search-row" onSubmit={submit}>
            <div className="input-prefix">
              <span className="pf"><Icon name="search" /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Client name or 8-digit number" />
            </div>
            <button className="btn btn-primary btn-lg" type="submit">Check this client</button>
          </form>
          <div className="hero-meta">
            <div className="item"><Icon name="check" size={14} /> Disqualified-officer cross-check</div>
            <div className="item"><Icon name="check" size={14} /> Bulk CSV check — 50 clients</div>
            <div className="item"><Icon name="check" size={14} /> Monitoring & change alerts</div>
            <div className="item"><Icon name="check" size={14} /> Team workspace</div>
          </div>
          <div className="disq-banner" style={{ marginTop: 22, maxWidth: 540 }}>
            <Icon name="shield" />
            No disqualified officers on this board. Safe to place.
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">01 / Moments to use it</div><h2 className="s-title">When agencies check.</h2></div>
            <p className="s-lead">Six real moments — every one of them is "fee at risk" or "reputation at risk".</p>
          </div>
          <div className="moments">
            {moments.map((m) => (
              <div key={m.h} className="moment">
                <div className="ic"><Icon name={m.ic as any} /></div>
                <h3>{m.h}</h3>
                <p>{m.p}</p>
                <div className="ex">{m.ex}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">02 / Agency-only features</div><h2 className="s-title">Four things only agencies get.</h2></div>
            <p className="s-lead">Built into Agency tier. Built for recruitment teams whose cashflow lives or dies on placement fees.</p>
          </div>
          <div className="perks-big">
            <div className="perk-b">
              <h3>Disqualified-officer cross-check</h3>
              <p>Every report scans the UK disqualified-officers register against the board. Green banner if clear, red banner if matched.</p>
              <div className="demo">
                $ cmc check 04500110<br />
                checking board against disqualified register…<br />
                <b className="bad">⚠ MATCH: 2 disqualified officers</b><br />
                · John Smith (banned 2022, term 8y)<br />
                · Sarah Patel (banned 2019, term 6y)
              </div>
            </div>
            <div className="perk-b">
              <h3>Bulk CSV check (50 clients)</h3>
              <p>Upload procurement's spreadsheet. Get 50 plain-English verdicts. Filter by safe / watch / avoid.</p>
              <div className="demo">
                $ cmc bulk clients.csv<br />
                50 rows uploaded, matched 48<br />
                <b className="ok">✓ 38 safe to place</b><br />
                <b className="warn">▲ 7 watch closely</b><br />
                <b className="bad">✕ 3 do not contract</b><br />
                ? 2 unmatched (verify name)
              </div>
            </div>
            <div className="perk-b">
              <h3>Monitoring &amp; change alerts</h3>
              <p>Get notified when a client files insolvency, an officer is appointed/resigned, accounts go overdue, or a new charge is registered.</p>
              <div className="demo">
                <b className="bad">⚠ ACME LTD</b> — insolvency case opened<br />
                <span style={{ color: '#5b6473' }}>3 active placements at risk · £18k in pending fees</span>
              </div>
            </div>
            <div className="perk-b">
              <h3>Team workspace + branded PDF</h3>
              <p>Shared saved-client list across consultants. Branded PDF export with your agency logo to send to clients.</p>
              <div className="demo">
                Team: 8 consultants · 412 saved clients<br />
                <b className="ok">✓</b> Shared notes<br />
                <b className="ok">✓</b> Role-based access<br />
                <b className="ok">✓</b> Branded export
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">03 / What we answer</div><h2 className="s-title">15 questions, ranked for placement risk.</h2></div>
            <p className="s-lead">From "are you sending your candidate to a dying company?" down to "who exactly are you contracting with?"</p>
          </div>
          <div className="q-list">
            {questions.map((q, i) => (
              <div key={q.q} className={'q-row' + (i === 3 || i === 4 ? ' hero' : '')}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="q">{q.q}</span>
                <span className={`zone-tag ${q.z}`}>{q.z}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="roi-card">
            <h3>One avoided bad placement pays for the year.</h3>
            <p className="sub">Quick maths on what's at stake.</p>
            <div className="math">
              <div className="line"><span>Average permanent placement fee (20% of £60k salary)</span><b>£12,000</b></div>
              <div className="line"><span>Lost fee when client goes under post-placement</span><b>-£12,000</b></div>
              <div className="line"><span>Plus reputational hit with the placed candidate</span><b>Unmeasurable</b></div>
              <div className="line"><span>Annual cost of Agency tier</span><b>£948 / year</b></div>
              <div className="line total"><span>Net savings if you avoid one bad placement</span><b>£11,052</b></div>
            </div>
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="tier-card">
            <div className="left">
              <h3>Agency · £79 / month</h3>
              <p>For recruitment teams placing candidates and protecting placement fees.</p>
              <div className="pills">
                <span>Everything in Pro</span>
                <span>Disqualified-officer check</span>
                <span>Bulk CSV (50 rows)</span>
                <span>Monitoring &amp; alerts</span>
                <span>Team workspace</span>
                <span>Branded PDF</span>
              </div>
            </div>
            <div className="right">
              <WaitlistCTA tier="Agency" ctaId="for-agencies.tier" variant="primary" size="lg">Talk to us about Agency</WaitlistCTA>
              <a className="btn btn-secondary btn-lg" href="mailto:hello@careermovechecker.com">Email us</a>
            </div>
          </div>
        </div>
      </section>

      <section className="quote-band">
        <div className="wrap">
          <h2>"We placed five candidates. The client folded. We lost <em>£42,000</em> in fees."</h2>
          <div className="quote-card">
            <div className="qtag">Why we built this</div>
            <blockquote>We'd been billing them for a year. No problems. Then a director was disqualified, two more resigned, accounts went overdue — and three weeks later they were in administration. All visible at Companies House. We weren't looking.</blockquote>
            <div className="by">
              <div className="av">MR</div>
              <div className="meta"><b>M. R.</b>Founder, UK tech recruitment agency</div>
            </div>
          </div>
        </div>
      </section>

      <section className="s tight">
        <div className="wrap final-cta">
          <h2>Two minutes now.<br />One lost placement fee avoided.</h2>
          <p>Check the client before your candidate goes to interview.</p>
          <Link className="btn btn-primary btn-lg" to="/app/search">Check this client <Icon name="arrow-right" /></Link>
        </div>
      </section>
    </>
  );
}
