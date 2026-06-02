import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { WaitlistCTA } from '../components/WaitlistCTA';
import { useSeo } from '../lib/seo';

export function PricingPage() {
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

        <div className="legal" style={{ marginTop: 48, borderTop: '1px solid var(--hair)', paddingTop: 24 }}>
          <p><strong>What CareerMove is not:</strong> a credit report, legal advice, or a guarantee of solvency. We turn Companies House public records into plain English. You decide.</p>
          <p style={{ textAlign: 'right' }}>Prices shown exclude VAT. Subject to change before launch.</p>
        </div>
      </div>
    </section>
  );
}
