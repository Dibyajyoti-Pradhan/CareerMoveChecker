import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaSwitch, usePersona } from '../lib/persona';
import { cn } from '../lib/cn';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    period: '/ month',
    for_: 'For job candidates running a check before signing the offer.',
    features: ['5 checks per month', 'Save up to 3 companies', 'Plain-English verdict & flags', 'Mobile-first single-page report'],
    cta: 'Try free — no sign-up',
    ctaTo: '/app/search',
    variant: 'secondary' as const,
    recommendedFor: 'candidate',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '£19',
    period: '/ month',
    for_: 'For freelancers checking every new client.',
    features: ['Unlimited checks', 'Saved client list with notes', 'Compare up to 3', 'Refresh on demand', 'Invoice block copy', 'Print-friendly PDF'],
    cta: 'Start Pro',
    ctaTo: '/sign-in',
    variant: 'primary' as const,
    recommendedFor: 'freelancer',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '£79',
    period: '/ month',
    for_: 'For recruitment teams placing candidates.',
    features: ['Everything in Pro', 'Disqualified-officer cross-check', 'Bulk CSV (50 rows)', 'Monitoring & alerts', 'Team workspace', 'Branded PDF export'],
    cta: 'Talk to us',
    ctaTo: '/sign-in',
    variant: 'secondary' as const,
    recommendedFor: 'agency',
  },
];

const MATRIX_SECTIONS = [
  {
    label: 'Core checks',
    rows: [
      { label: 'Reports per month', desc: '', vals: ['5', 'Unlimited', 'Unlimited'] },
      { label: 'Saved companies', desc: '', vals: ['3', 'Unlimited', 'Unlimited'] },
      { label: 'Plain-English verdict & flags', vals: [true, true, true] },
      { label: 'Direct / Deduced / Not-answerable tags', vals: [true, true, true] },
      { label: 'Mobile-first report', vals: [true, true, true] },
    ],
  },
  {
    label: 'Your workflow',
    rows: [
      { label: 'Saved client list with notes', vals: [false, true, true] },
      { label: 'Compare 3 side by side', vals: [false, true, true] },
      { label: 'Refresh on demand', vals: [false, true, true] },
      { label: 'Print / PDF export', vals: ['Basic', 'Pro PDF', 'Branded'] },
      { label: 'Invoice block copy', vals: [false, true, true] },
    ],
  },
  {
    label: 'Agency essentials',
    rows: [
      { label: 'Disqualified-officer cross-check', vals: [false, false, true] },
      { label: 'Bulk CSV (50 rows)', vals: [false, false, true] },
      { label: 'Monitoring & change alerts', vals: [false, false, true] },
      { label: 'Team workspace', vals: [false, false, '3+ seats'] },
      { label: 'API access (optional add-on)', vals: [false, false, true] },
    ],
  },
];

export function PricingPage() {
  const { persona } = usePersona();
  return (
    <>
      <section className="hero" style={{ paddingBottom: 28 }}>
        <div className="wrap">
          <PersonaSwitch />
          <h1 data-pf="candidate">Free for one check. <em>Pay later</em> if you check often.</h1>
          <h1 data-pf="freelancer">Pro is <em>£19</em>. One unpaid invoice avoided pays for the year.</h1>
          <h1 data-pf="agency">One avoided bad placement <em>pays for the year</em>.</h1>
          <p className="sub" data-pf="candidate">For a single offer check, Free is all you need. No card, no sign-up.</p>
          <p className="sub" data-pf="freelancer">Unlimited checks, saved client list, compare, copy-paste invoice block. Cancel anytime.</p>
          <p className="sub" data-pf="agency">Bulk checks, disqualified-officer cross-check, monitoring, team workspace. Talk to us about volume pricing.</p>
        </div>
      </section>

      <section className="s tight">
        <div className="wrap">
          <div className="pricing">
            {PLANS.map((p) => (
              <div key={p.id} className={cn('plan', p.recommendedFor === persona && 'recommended')}>
                <div className="name">{p.name}</div>
                <div className="price">{p.price}<span> {p.period}</span></div>
                <div className="for">{p.for_}</div>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}><Icon name="check" size={14} />{f}</li>
                  ))}
                </ul>
                <Link className={`btn btn-${p.variant} cta`} to={p.ctaTo}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">Compare every feature</div><h2 className="s-title">What's in each plan.</h2></div>
            <p className="s-lead">Honest comparison. We don't hide features behind "Contact Sales".</p>
          </div>
          <Matrix />
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="s-head">
            <div><div className="s-eyebrow">FAQ</div><h2 className="s-title">Common questions.</h2></div>
            <p className="s-lead">Anything else? Email <a style={{ color: 'var(--brand)' }} href="mailto:hello@careermovechecker.com">hello@careermovechecker.com</a>.</p>
          </div>
          <div className="grid-2" style={{ gap: 14 }}>
            <FAQ q="Is this a credit report?" a="No. We're a decision-support tool built on Companies House public data. Not a credit report, not legal/financial advice, not AML/KYB. For credit checks, see Experian, Equifax, or Creditsafe." />
            <FAQ q="Why does CareerMoveChecker know more than Companies House.gov.uk?" a="We don't know more — we combine it differently. CH gives raw data across 8+ endpoints. We join them and phrase the answer for your decision: 'Will you get paid?' instead of 'Status: active'." />
            <FAQ q="Where does the data come from?" a="UK Companies House Public Data API (REST + Streaming). Server-side only — keys never touch your browser. Updated daily." />
            <FAQ q="Can I cancel anytime?" a="Yes. Pro and Agency are monthly. Cancel from your account page. No retention calls." />
            <FAQ q="Do you support overseas companies?" a="UK only in v1. Scottish (SC) and Northern Ireland (NI) numbers welcome." />
            <FAQ q="Is there a team / API plan?" a="Agency tier includes 3 seats. API is an optional add-on — talk to us about volume pricing and SLA." />
          </div>
        </div>
      </section>

      <section className="s tight">
        <div className="wrap final-cta">
          <h2 data-pf="candidate">One check. One bad employer avoided.</h2>
          <h2 data-pf="freelancer">Pro. £19/month. <br />Try free first.</h2>
          <h2 data-pf="agency">Agency tier — built for placement-fee protection.</h2>
          <p>No card needed to try.</p>
          <Link className="btn btn-primary btn-lg" to="/app/search">Run a free check <Icon name="arrow-right" /></Link>
        </div>
      </section>
    </>
  );
}

function Matrix() {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--hair)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '18px 20px', background: 'var(--canvas)', borderBottom: '1px solid var(--hair)' }}>
        <div className="label">Feature</div>
        <div style={{ textAlign: 'center', fontWeight: 600 }}>Free</div>
        <div style={{ textAlign: 'center', fontWeight: 600 }}>Pro</div>
        <div style={{ textAlign: 'center', fontWeight: 600 }}>Agency</div>
      </div>
      {MATRIX_SECTIONS.map((sec) => (
        <div key={sec.label}>
          <div style={{ padding: '14px 20px', background: 'var(--soft)', borderTop: '1px solid var(--hair)', borderBottom: '1px solid var(--hair)' }}>
            <span className="label">{sec.label}</span>
          </div>
          {sec.rows.map((row: any, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid var(--hair)', alignItems: 'center', fontSize: 13.5 }}>
              <div>{row.label}{row.desc && <div className="small muted">{row.desc}</div>}</div>
              {row.vals.map((v: any, j: number) => (
                <div key={j} style={{ textAlign: 'center' }}>
                  {v === true ? <Icon name="check" /> : v === false ? <span className="muted">—</span> : <span style={{ fontSize: 13 }}>{v}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="card">
      <h4 style={{ fontSize: 15, marginBottom: 8 }}>{q}</h4>
      <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>{a}</p>
    </div>
  );
}
