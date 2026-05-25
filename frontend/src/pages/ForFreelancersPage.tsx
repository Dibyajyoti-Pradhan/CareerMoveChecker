import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaProvider } from '../lib/persona';
import { WaitlistCTA } from '../components/WaitlistCTA';

export function ForFreelancersPage() {
  return (
    <PersonaProvider force="freelancer">
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
    { ic: 'mail', h: 'New client signing an SOW', p: 'Before committing weeks of work, check the client is solid enough to actually pay.', ex: '"They want net-60. Is that safe?"' },
    { ic: 'flag', h: 'A payment is late', p: "Re-check whether the client's filings or status changed since you took them on.", ex: '"It\'s been 45 days. Has something changed?"' },
    { ic: 'building', h: 'Big retainer offered', p: 'Verify the entity before committing to weeks of capacity.', ex: '"They want a 6-month retainer. Better not be a shell."' },
    { ic: 'users', h: 'Referred via a friend', p: "Friends don't do due diligence. You should.", ex: '"My buddy says they pay. Mate, do they?"' },
    { ic: 'search', h: 'A client suddenly goes quiet', p: 'Check before you keep working on their behalf.', ex: '"No reply for two weeks. Are they still trading?"' },
    { ic: 'star', h: 'Year-end client review', p: 'Quick health-check on every client before re-signing for the new year.', ex: '"Which clients should I drop in 2027?"' },
  ] as const;

  const questions = [
    { q: 'Are they still in business?', z: 'direct' },
    { q: 'Have they gone bust before?', z: 'direct' },
    { q: 'Will you actually get paid?', z: 'deduced' },
    { q: 'Are they broke right now?', z: 'deduced' },
    { q: 'Has the person running it killed companies before?', z: 'deduced' },
    { q: 'Is this a real company or a scam?', z: 'direct' },
    { q: 'Are they keeping up with their paperwork?', z: 'direct' },
    { q: 'Does someone else have a claim on their stuff?', z: 'direct' },
    { q: 'Is the team falling apart?', z: 'deduced' },
    { q: 'Who do you chase if they ghost you?', z: 'direct' },
    { q: 'Can they even afford you?', z: 'deduced' },
    { q: 'Who exactly are you billing?', z: 'direct' },
  ] as const;

  const perks = [
    { ic: 'star', h: 'Saved client list', p: 'Every client you invoice, kept with notes. Re-check before each new SOW.' },
    { ic: 'compare', h: 'Compare side by side', p: 'Pick between two prospects? Compare up to 3 reports.' },
    { ic: 'refresh', h: 'Refresh anytime', p: "Force re-fetch when a payment goes quiet or filings might've changed." },
    { ic: 'copy', h: 'Invoice block copy', p: 'One-click copy of the exact legal entity, registered address, and company number.' },
    { ic: 'print', h: 'Print-friendly PDF', p: 'Paste a one-page report into a proposal or pitch.' },
    { ic: 'list', h: 'Quick search history', p: 'Pick up where you left off — no re-typing.' },
  ] as const;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="persona-tag"><span className="dot" />02 · Freelancer · Pro — £19/mo</span>
          <h1>Check the client <em>before</em> you send the invoice.</h1>
          <p className="sub">Before you commit a week of work, see whether the client is going to pay you, ghost you, or go under mid-project. Unlimited checks, saved client list, compare on demand.</p>
          <form className="search-row" onSubmit={submit}>
            <div className="input-prefix">
              <span className="pf"><Icon name="search" /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Client name or 8-digit number" />
            </div>
            <button className="btn btn-primary btn-lg" type="submit">Check this client</button>
          </form>
          <div className="hero-meta">
            <div className="item"><Icon name="check" size={14} /> Unlimited checks on Pro</div>
            <div className="item"><Icon name="check" size={14} /> Saved client list with notes</div>
            <div className="item"><Icon name="check" size={14} /> Invoice block copy-paste</div>
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">01 / Moments to use it</div><h2 className="s-title">When freelancers check.</h2></div>
            <p className="s-lead">Six real moments. Two minutes of due diligence saves weeks of chasing.</p>
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
            <div><div className="s-eyebrow">02 / What Pro adds</div><h2 className="s-title">Built for invoicing reality.</h2></div>
            <p className="s-lead">Six concrete add-ons over Free, each saving you a recurring 2-minute task.</p>
          </div>
          <div className="perks">
            {perks.map((p) => (
              <div key={p.h} className="perk">
                <div className="ic"><Icon name={p.ic as any} /></div>
                <div>
                  <h4>{p.h}</h4>
                  <p>{p.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">03 / What we answer</div><h2 className="s-title">Ranked for payment risk.</h2></div>
            <p className="s-lead">Highest-weight questions first. Direct (fact) or Deduced (signals).</p>
          </div>
          <div className="q-list">
            {questions.map((q, i) => (
              <div key={q.q} className={'q-row' + (i === 2 ? ' hero' : '')}>
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
          <div className="tier-card">
            <div className="left">
              <h3>Pro · £19 / month</h3>
              <p>Unlimited checks, saved client list, compare, print. Cancel anytime.</p>
              <div className="pills">
                <span>Unlimited checks</span>
                <span>Saved clients with notes</span>
                <span>Compare 3</span>
                <span>Invoice copy block</span>
                <span>Refresh on demand</span>
              </div>
            </div>
            <div className="right">
              <WaitlistCTA tier="Pro" ctaId="for-freelancers.tier" variant="primary" size="lg">Notify me when Pro launches</WaitlistCTA>
              <Link className="btn btn-secondary btn-lg" to="/app/search">Try a free check first</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="quote-band">
        <div className="wrap">
          <h2>"They were already in <em>administration</em> when they signed my SOW."</h2>
          <div className="quote-card">
            <div className="qtag">Why we built this</div>
            <blockquote>I shipped four weeks of work. Invoice ignored. Turns out they'd been in administration for three months. Companies House had it on day one — I just didn't check. Cost me £18k.</blockquote>
            <div className="by">
              <div className="av">FR</div>
              <div className="meta"><b>F. R.</b>Freelance product designer, London</div>
            </div>
          </div>
        </div>
      </section>

      <section className="s tight">
        <div className="wrap final-cta">
          <h2>Two minutes now.<br />One unpaid invoice avoided.</h2>
          <p>Check the client before you commit to the work.</p>
          <Link className="btn btn-primary btn-lg" to="/app/search">Check this client <Icon name="arrow-right" /></Link>
        </div>
      </section>
    </>
  );
}
