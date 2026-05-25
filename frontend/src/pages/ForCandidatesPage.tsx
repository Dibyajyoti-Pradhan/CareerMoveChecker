import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaProvider, usePersona } from '../lib/persona';

export function ForCandidatesPage() {
  return (
    <PersonaProvider force="candidate">
      <CandidateContent />
    </PersonaProvider>
  );
}

function CandidateContent() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/app/search?q=${encodeURIComponent(q.trim())}`);
  };

  const moments = [
    { ic: 'mail', h: 'Offer letter just landed', p: 'Before signing or handing in notice, sanity-check the company is real and stable.', ex: '"The offer is great, but I have never heard of them."' },
    { ic: 'search', h: 'Recruiter cold-emailed you', p: "Tells you if the 'recruiter' is real or a shell hiding behind a vague brand name.", ex: '"They asked for my CV in DM. Should I bother?"' },
    { ic: 'building', h: 'Considering leaving current job', p: 'Sense-check the new place vs the one you have before quitting.', ex: '"Better salary, but is it a sinking ship?"' },
    { ic: 'star', h: 'About to relocate for the role', p: 'Re-checking before booking the move — flat deposits cost more than a Pro subscription.', ex: '"I\'m moving cities for this. Better not be a startup that just lost its runway."' },
    { ic: 'users', h: 'Friend asked your opinion', p: "Forward them a one-page report instead of reading Glassdoor for them.", ex: '"They\'ve had three founders leave in 18 months — that\'s a vibe."' },
    { ic: 'flag', h: 'Saw a layoff news headline', p: 'Cross-check what Companies House actually shows.', ex: '"News says cuts. Filings say…?"' },
  ] as const;

  const questions = [
    { q: 'Is this company still alive?', z: 'direct' },
    { q: 'Are they about to disappear?', z: 'direct' },
    { q: 'Will this company still be here next year?', z: 'deduced' },
    { q: 'Is this even a real company?', z: 'direct' },
    { q: 'Are the people in charge running for the exits?', z: 'deduced' },
    { q: 'Is the company on the up?', z: 'deduced' },
    { q: 'Are they being bought or merging?', z: 'deduced' },
    { q: "Who's actually in charge?", z: 'direct' },
    { q: 'Is the founder still here, or did they leave?', z: 'direct' },
    { q: 'How long have they been around?', z: 'direct' },
    { q: 'Small startup or real company?', z: 'deduced' },
    { q: 'What do they actually do?', z: 'direct' },
  ] as const;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="persona-tag"><span className="dot" />01 · Job candidate · Free — no card</span>
          <h1>Know your next employer <em>before</em> you sign.</h1>
          <p className="sub">A plain-English read on whether the company in your offer letter is real, stable, and likely to still be paying you in 12 months. Five free checks every month, no sign-up.</p>
          <form className="search-row" onSubmit={submit}>
            <div className="input-prefix">
              <span className="pf"><Icon name="search" /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Company name or 8-digit number — e.g. 09446231" />
            </div>
            <button className="btn btn-primary btn-lg" type="submit">Check this employer</button>
          </form>
          <div className="hero-meta">
            <div className="item"><Icon name="check" size={14} /> 5 free checks per month</div>
            <div className="item"><Icon name="check" size={14} /> No sign-up to try</div>
            <div className="item"><Icon name="check" size={14} /> Mobile-first single-page report</div>
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="s-head">
            <div>
              <div className="s-eyebrow">01 / Moments to use it</div>
              <h2 className="s-title">When candidates check.</h2>
            </div>
            <p className="s-lead">Six real moments. One quick check. No more "should I be worried?" at 11pm.</p>
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
            <div>
              <div className="s-eyebrow">02 / What we answer</div>
              <h2 className="s-title">Ranked questions — top of mind first.</h2>
            </div>
            <p className="s-lead">Highest-weight questions answered first. Each tagged Direct (fact from CH) or Deduced (signals combined).</p>
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
          <div className="s-head">
            <div>
              <div className="s-eyebrow">03 / Tier</div>
              <h2 className="s-title">Free is enough.</h2>
            </div>
            <p className="s-lead">For a single offer-check moment, you don't need a subscription. Upgrade when you change jobs more often than once a year.</p>
          </div>
          <div className="tier-card">
            <div className="left">
              <h3>Free · £0 / month</h3>
              <p>Everything you need to check the next employer before you sign.</p>
              <div className="pills">
                <span>5 checks / month</span>
                <span>Save up to 3</span>
                <span>Print-friendly</span>
                <span>No card needed</span>
              </div>
            </div>
            <div className="right">
              <Link className="btn btn-primary btn-lg" to="/app/search">Run a free check</Link>
              <Link className="btn btn-secondary btn-lg" to="/pricing">See Pro</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="quote-band">
        <div className="wrap">
          <h2>"They were in <em>administration</em> three weeks after my start date."</h2>
          <div className="quote-card">
            <div className="qtag">Why we built this</div>
            <blockquote>I took the job. Quit my old one. Moved cities. Three weeks in, the company filed for administration. The signals were all there on Companies House — I just didn't know where to look. CareerMoveChecker is what I wish I'd had then.</blockquote>
            <div className="by">
              <div className="av">DP</div>
              <div className="meta"><b>Dibyajyoti P.</b>Founder</div>
            </div>
          </div>
        </div>
      </section>

      <section className="s tight">
        <div className="wrap final-cta">
          <h2>One check now.<br />One bad employer avoided.</h2>
          <p>Run a free check on the company in your offer letter.</p>
          <Link className="btn btn-primary btn-lg" to="/app/search">Check this employer <Icon name="arrow-right" /></Link>
        </div>
      </section>
    </>
  );
}
