import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaSwitch, usePersona } from '../lib/persona';

const TRY_CHIPS = ['Monzo Bank Limited', 'Deliveroo Plc', 'Greggs Plc', '09446231'];

export function HomePage() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const { persona } = usePersona();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/app/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <PersonaSwitch />
          <h1 data-pf="candidate">Will this company still be <em>here</em> next year?</h1>
          <h1 data-pf="freelancer">Will you actually <em>get paid?</em></h1>
          <h1 data-pf="agency">Will you get your <em>fee</em> — and will your candidate survive?</h1>

          <p className="sub" data-pf="candidate">Before you quit your current job and sign here, get a plain-English read on whether this company is real, stable, and likely to still be paying you in 12 months.</p>
          <p className="sub" data-pf="freelancer">Before you commit a week of work and send an invoice, check whether this client is going to pay you, ghost you, or go under mid-project.</p>
          <p className="sub" data-pf="agency">Before you send a candidate to interview, see whether the client is solid enough to pay your fee — and whether your candidate is walking into a sinking ship.</p>

          <form className="search-row" onSubmit={submit}>
            <div className="input-prefix">
              <span className="pf"><Icon name="search" /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Company name or 8-digit number — e.g. Acme Ltd or 09446231" />
            </div>
            <button className="btn btn-primary btn-lg" type="submit">Run check</button>
          </form>

          <div className="hero-meta">
            <div className="item" data-pf="candidate"><Icon name="check" size={14} /> 5 free checks per month — no sign-up</div>
            <div className="item" data-pf="freelancer"><Icon name="check" size={14} /> Unlimited checks on Pro — £19/mo</div>
            <div className="item" data-pf="agency"><Icon name="check" size={14} /> Bulk lookup & monitoring on Agency</div>
            <div className="item"><Icon name="check" size={14} /> UK Companies House data, updated daily</div>
            <div className="item"><Icon name="check" size={14} /> Plain English. Printable. No jargon.</div>
          </div>

          <div className="suggested">
            <span className="lbl">Try</span>
            {TRY_CHIPS.map((c) => (
              <button key={c} className="chip" type="button" onClick={() => setQ(c)}>{c}</button>
            ))}
          </div>

          <AnswerCardPreview persona={persona} />
        </div>
      </section>

      <Personas />
      <Zones />
      <HowItWorks />
      <PricingPreview />
      <FinalCta />
    </>
  );
}

function AnswerCardPreview({ persona }: { persona: string }) {
  return (
    <div className="answer-card">
      <div className="answer-bar">
        <div className="dots"><i /><i /><i /></div>
        <div className="url">careermovechecker.com/c/<b>09446231</b></div>
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

        <div data-pf="candidate">
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

        <div data-pf="freelancer">
          <div className="answer-q">Will you actually get paid?</div>
          <h3 className="answer-h"><em>Probably yes</em> — strong signals.</h3>
          <p className="answer-verdict">An established trading entity with a clean public record. Worth noting one outstanding lender claim — normal for asset finance, but check before agreeing to net-60.</p>
          <Ticks items={[
            { ok: true, text: 'Active for 11 years — survived three downturns', ev: 'Direct · Continuous trading since Feb 2015' },
            { ok: true, text: "No insolvency on file across the company's lifetime", ev: 'Direct · Insolvency register clean' },
            { ok: true, text: 'Director runs no other failed companies', ev: 'Deduced · Cross-referenced officer appointments' },
            { ok: false, text: 'One outstanding lender claim', ev: 'Direct · Charge registered Apr 2024 · review before extending credit' },
          ]} />
        </div>

        <div data-pf="agency">
          <div className="answer-q">Will you get your fee & will your candidate survive?</div>
          <h3 className="answer-h"><em>Probably yes</em> on both.</h3>
          <p className="answer-verdict">Solid trading entity with a clean officer board. No disqualified-officer flag. One outstanding charge worth a glance, but signals are stable.</p>
          <Ticks items={[
            { ok: true, text: 'No disqualified officers on the current board', ev: 'Direct · Cross-checked disqualified-officer register' },
            { ok: true, text: 'Active for 11 years — no insolvency or rescue history', ev: 'Direct · Status & insolvency register' },
            { ok: true, text: 'Stable leadership — no officer resignations in 12 months', ev: 'Deduced · No officer churn in last 365 days' },
            { ok: true, text: 'Filings up to date — finance team is on it', ev: 'Direct · Accounts on time, confirmation statement current' },
          ]} />
        </div>

        <div className="answer-cta">
          <span className="save-line" data-pf="candidate"><b>Save for later.</b> Come back when the offer letter arrives.</span>
          <span className="save-line" data-pf="freelancer"><b>Save to your client list.</b> Re-check before each new SOW.</span>
          <span className="save-line" data-pf="agency"><b>Add to your watch list.</b> Get alerts if anything changes.</span>
          <Link className="btn btn-secondary btn-sm" to="/app/company/09446231">
            <Icon name="external" />
            See full report
          </Link>
          <a className="btn btn-primary btn-sm" href="#pricing">
            <span data-pf="candidate">Save for later</span>
            <span data-pf="freelancer">Start Pro · £19/mo</span>
            <span data-pf="agency">Talk to us about Agency</span>
          </a>
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

function Personas() {
  const cards = [
    {
      ix: '01 — Job candidate', tier: 'Free', h: 'Considering an offer',
      q: '"Will this company still be here next year?"',
      p: "For when the offer letter has arrived and you're about to hand in your notice. Plain-English read on whether the company is real, stable, and likely to still be paying you in 12 months.",
      ul: [
        'Is the company still alive — and likely to stay that way?',
        'Are the people in charge running for the exits?',
        'Is the founder still on the board?',
        'Are they growing, or quietly shrinking?',
      ],
      link: '/for-candidates', cta: 'Run a free check',
    },
    {
      ix: '02 — Freelancer', tier: 'Pro · £19', h: 'Onboarding a client',
      q: '"Will you actually get paid?"',
      p: 'For independents about to commit a week of work and send an invoice. Check the client before agreeing to net-30 or net-60.',
      ul: [
        'Are they still in business — and have they been bust before?',
        'Has the person running it killed companies before?',
        'Does someone else already have a claim on their stuff?',
        'Who exactly are you billing?',
      ],
      link: '/for-freelancers', cta: 'Try Pro free',
    },
    {
      ix: '03 — Recruitment agency', tier: 'Agency · £79', h: 'Placing a candidate',
      q: '"Will you get your fee — and will your candidate survive?"',
      p: 'For agencies whose cashflow lives or dies on placement fees. Check the client before the candidate goes to interview.',
      ul: [
        'Is anyone on the board banned from running companies?',
        'Are you sending a candidate to a dying company?',
        'Is the leadership holding together?',
        'Who exactly are you contracting with?',
      ],
      link: '/for-agencies', cta: 'Talk to us',
    },
  ];
  return (
    <section className="s" id="personas">
      <div className="wrap">
        <div className="s-head">
          <div>
            <div className="s-eyebrow">01 / Who it's for</div>
            <h2 className="s-title">Three people. Three questions. One report.</h2>
          </div>
          <p className="s-lead">The same Companies House data — phrased for the decision you're actually about to make. Pick the persona that fits and the headline rewrites; the underlying record doesn't change.</p>
        </div>
        <div className="persona-grid">
          {cards.map((c) => (
            <div key={c.ix} className="persona-card">
              <span className="ix">{c.ix}</span>
              <span className="tier">{c.tier}</span>
              <h3>{c.h}</h3>
              <p className="q">{c.q}</p>
              <p>{c.p}</p>
              <ul>{c.ul.map((b, i) => <li key={i}><span className="d" />{b}</li>)}</ul>
              <Link className="open" to={c.link}>{c.cta} <Icon name="arrow-right" size={10} /></Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Zones() {
  return (
    <section className="s" id="zones">
      <div className="wrap">
        <div className="s-head">
          <div>
            <div className="s-eyebrow">02 / Honesty by design</div>
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

function HowItWorks() {
  const steps = [
    { n: 'Step 01', h: 'Type a name or number', p: "UK companies only. If two have similar names, we surface the right entity first so you don't check the wrong one. Scottish (SC) and overseas (OE) numbers welcome." },
    { n: 'Step 02', h: 'We answer your question', p: "One sentence at the top. The three or four reasons behind it. Every claim tagged Direct or Deduced — so you know exactly what kind of evidence you're acting on." },
    { n: 'Step 03', h: 'Decide what to do next', p: "Save the company, print the report, refresh before signing, or look elsewhere. We won't make the decision for you — but you'll know enough to make it well." },
  ];
  return (
    <section className="s" id="how">
      <div className="wrap">
        <div className="s-head">
          <div>
            <div className="s-eyebrow">03 / How it works</div>
            <h2 className="s-title">From question to decision in under a minute.</h2>
          </div>
          <p className="s-lead">No spreadsheets to download. No government websites to navigate. Type a name. Get an answer to your question. Decide what to do.</p>
        </div>
        <div className="steps">
          {steps.map((s) => (
            <div key={s.n} className="step">
              <div className="num">{s.n}</div>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <section className="s" id="pricing">
      <div className="wrap">
        <div className="s-head">
          <div>
            <div className="s-eyebrow">04 / Pricing</div>
            <h2 className="s-title">Free to start. Fair to scale.</h2>
          </div>
          <p className="s-lead">Free for job candidates who check once or twice. Pro for freelancers running weekly checks. Agency for recruitment teams.</p>
        </div>
        <div className="pricing">
          <PlanCard
            name="Free" price="£0" period="/ month"
            for_={<>For <b>job candidates</b> running a check before signing the offer.</>}
            features={['5 checks per month', 'Save up to 3 companies', 'Plain-English verdict & flags', 'Mobile-first single-page report']}
            cta="Try free — no sign-up" ctaTo="/app/search" variant="secondary"
          />
          <PlanCard
            name="Pro" price="£19" period="/ month" featured
            for_={<>For <b>freelancers</b> checking every new client — and re-checking when something feels off.</>}
            features={['Unlimited checks', 'Saved client list with notes', 'Compare up to 3 clients side by side', 'Refresh on demand', 'Invoice block copy']}
            cta="Start Pro" ctaTo="/pricing" variant="primary"
          />
          <PlanCard
            name="Agency" price="£79" period="/ month"
            for_={<>For <b>recruitment teams</b> placing candidates and protecting placement fees.</>}
            features={['Everything in Pro', 'Disqualified-officer cross-check', 'Bulk CSV check (50 clients)', 'Monitoring & change alerts', 'Team workspace & branded PDF']}
            cta="Talk to us" ctaTo="/pricing" variant="secondary"
          />
        </div>
      </div>
    </section>
  );
}

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  for_: React.ReactNode;
  features: string[];
  cta: string;
  ctaTo: string;
  variant: 'primary' | 'secondary';
  featured?: boolean;
  recommended?: boolean;
}

export function PlanCard({ name, price, period, for_, features, cta, ctaTo, variant, featured, recommended }: PlanCardProps) {
  return (
    <div className={'plan' + (featured ? ' featured' : '') + (recommended ? ' recommended' : '')}>
      <div className="name">{name}</div>
      <div className="price">{price}<span> {period}</span></div>
      <div className="for">{for_}</div>
      <ul>
        {features.map((f) => (
          <li key={f}><Icon name="check" size={14} />{f}</li>
        ))}
      </ul>
      <Link className={`btn btn-${variant} cta`} to={ctaTo}>{cta}</Link>
    </div>
  );
}

function FinalCta() {
  return (
    <section className="s tight">
      <div className="wrap final-cta">
        <h2 data-pf="candidate">One check now. <br />One bad employer avoided.</h2>
        <h2 data-pf="freelancer">Two minutes now. <br />One unpaid invoice avoided.</h2>
        <h2 data-pf="agency">Two minutes now. <br />One lost placement fee avoided.</h2>
        <p data-pf="candidate">Run a check on the company you were about to sign with.</p>
        <p data-pf="freelancer">Check the client before you commit to the work.</p>
        <p data-pf="agency">Check the client before your candidate goes to interview.</p>
        <Link className="btn btn-primary btn-lg" to="/app/search">
          Check a company
          <Icon name="arrow-right" />
        </Link>
      </div>
    </section>
  );
}
