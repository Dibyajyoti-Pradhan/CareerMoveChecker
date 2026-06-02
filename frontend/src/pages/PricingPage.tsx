import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { WaitlistCTA } from '../components/WaitlistCTA';
import { useSeo } from '../lib/seo';

export function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (idx: number) => setOpenFaq((cur) => (cur === idx ? null : idx));

  const FAQS = [
    {
      q: "Is CareerMove a credit check?",
      a: "No. CareerMove reads public Companies House records — the same ones any company search on the government website would show. We don't access credit files, bank data, or any private information. Think of it as a plain-English read of the public register.",
    },
    {
      q: "How current is the data?",
      a: "We pull data directly from the Companies House API at the moment you run a report. Most filings appear on Companies House within 24–48 hours of being submitted. We show you the timestamp on every report so you always know how fresh it is.",
    },
    {
      q: "Can I check a company before a contract?",
      a: "Yes — that's the primary use case. We designed CareerMove for professionals who want a quick, honest read before they sign a contract, place a candidate, or raise an invoice. The report takes under 60 seconds.",
    },
    {
      q: "What does the Agency plan include that Pro doesn't?",
      a: "Agency adds disqualified officer cross-checking (via the Companies House disqualification register), bulk checks up to 500 companies, team seats for up to 5 users, and beta API access. Pro is ideal for sole practitioners; Agency is built for teams.",
    },
  ];

  useSeo({
    title: 'Pricing — CareerMove',
    description: 'Free for individuals. Pro and Agency tiers launching soon with bulk checks, alerts, and team features.',
    canonical: 'https://careermove.uk/pricing',
  });

  return (
    <section className="s tight">
      <div className="wrap">
        <p style={{ fontSize: 12, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand)', marginBottom: 8 }}>Pricing</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.15, marginBottom: 16 }}>Simple, honest pricing</h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 560, lineHeight: 1.6, marginBottom: 0 }}>
          Free for individuals checking one company at a time. Paid tiers unlock bulk checks, alerts, and team features — both launching soon.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 0', color: 'var(--muted)', fontSize: 13.5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'var(--ok-bg)', color: 'var(--ok)', flexShrink: 0 }} aria-hidden="true">
            <Icon name="check" size={12} />
          </span>
          Trusted by{' '}<strong style={{ color: 'var(--ink)', fontWeight: 600 }}>2,400+ professionals</strong>{' '}checking companies before they sign.
        </div>

        <div className="pricing" style={{ marginTop: 48 }}>
          {/* Free */}
          <div className="plan">
            <div className="name">Free</div>
            <div className="price">£0 <span>/ month</span></div>
            <p className="for">For individuals who need to check a company <b>before signing, placing, or invoicing</b>.</p>
            <ul>
              <li><Icon name="check" size={14} /> Company trust report</li>
              <li><Icon name="check" size={14} /> Risk flags &amp; plain-English verdict</li>
              <li><Icon name="check" size={14} /> Officers, PSC &amp; charges</li>
              <li><Icon name="check" size={14} /> Filing history</li>
              <li><Icon name="check" size={14} /> Save up to 10 companies</li>
              <li><Icon name="check" size={14} /> Compare up to 3 companies</li>
            </ul>
            <div className="cta">
              <Link to="/app/search" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Start checking — it's free <Icon name="arrow-right" />
              </Link>
            </div>
          </div>

          {/* Pro */}
          <div className="plan featured">
            <div className="name">Pro</div>
            <div className="price">£19 <span>/ month</span></div>
            <p className="for">For <b>freelancers and contractors</b> who check companies regularly and want early warnings.</p>
            <ul>
              <li><Icon name="check" size={14} /> Everything in Free</li>
              <li><Icon name="check" size={14} /> Bulk check — up to 50 companies</li>
              <li><Icon name="check" size={14} /> Change alerts — get notified when status changes</li>
              <li><Icon name="check" size={14} /> Save unlimited companies</li>
              <li><Icon name="check" size={14} /> CSV export</li>
              <li><Icon name="check" size={14} /> Priority data refresh</li>
            </ul>
            <div className="cta">
              <WaitlistCTA tier="Pro" ctaId="pricing-pro">Join Pro waitlist</WaitlistCTA>
            </div>
          </div>

          {/* Agency */}
          <div className="plan">
            <div className="name">Agency</div>
            <div className="price">£79 <span>/ month</span></div>
            <p className="for">For <b>staffing agencies and finance teams</b> running ongoing client due diligence at scale.</p>
            <ul>
              <li><Icon name="check" size={14} /> Everything in Pro</li>
              <li><Icon name="check" size={14} /> Bulk check — up to 500 companies</li>
              <li><Icon name="check" size={14} /> Disqualified officer cross-check</li>
              <li><Icon name="check" size={14} /> Team seats (up to 5)</li>
              <li><Icon name="check" size={14} /> API access (beta)</li>
              <li><Icon name="check" size={14} /> Dedicated onboarding call</li>
            </ul>
            <div className="cta">
              <WaitlistCTA tier="Agency" ctaId="pricing-agency">Join Agency waitlist</WaitlistCTA>
            </div>
          </div>
        </div>

        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: 24 }}>
            Frequently asked questions
          </h2>
          <div style={{ border: '1px solid var(--hair)', borderRadius: 16, overflow: 'hidden', background: '#fff' }} role="list">
            {FAQS.map((item, idx) => (
              <div key={idx} role="listitem" style={{ borderBottom: idx < FAQS.length - 1 ? '1px solid var(--hair)' : 'none' }}>
                <button
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-panel-${idx}`}
                  id={`faq-btn-${idx}`}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '20px 24px', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', font: '500 15px/1.4 var(--sans)', color: 'var(--ink)' }}
                >
                  <span>{item.q}</span>
                  <span aria-hidden="true" style={{ flexShrink: 0, transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--muted)', fontSize: 20, lineHeight: 1, display: 'inline-block' }}>+</span>
                </button>
                <div id={`faq-panel-${idx}`} role="region" aria-labelledby={`faq-btn-${idx}`} hidden={openFaq !== idx} style={{ padding: '0 24px 20px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65 }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="legal" style={{ marginTop: 48, borderTop: '1px solid var(--hair)', paddingTop: 24 }}>
          <p><strong>What CareerMove is not:</strong> a credit report, legal advice, or a guarantee of solvency. We turn Companies House public records into plain English. You decide.</p>
          <p style={{ textAlign: 'right' }}>Prices shown exclude VAT. Subject to change before launch.</p>
        </div>
      </div>
    </section>
  );
}
