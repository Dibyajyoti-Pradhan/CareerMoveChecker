import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const plans = [
  {
    name: 'Free',
    price: '£0',
    suffix: 'forever',
    blurb: 'Try the product on a few companies.',
    features: [
      '5 checks / month',
      'Basic risk score',
      'Plain-English verdict',
      'Print-friendly report',
    ],
    cta: 'Try free',
    href: '/app/search',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '£19',
    suffix: 'per month',
    blurb: 'For freelancers, contractors, and individuals.',
    features: [
      'Unlimited checks',
      'Saved companies',
      'Compare up to 3 companies',
      'Printable reports',
      'Priority Companies House refresh',
    ],
    cta: 'Choose Pro',
    href: '/app/search',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '£79',
    suffix: 'per month',
    blurb: 'For recruiters, agencies, and small teams.',
    features: [
      'Everything in Pro',
      'Team workspace (coming soon)',
      'Bulk checks (coming soon)',
      'Monitoring & alerts (coming soon)',
    ],
    cta: 'Choose Agency',
    href: '/app/search',
    highlight: false,
  },
];

export function PricingPage() {
  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <Badge tone="blue">Pricing</Badge>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Simple, honest pricing.</h1>
        <p className="mt-3 text-lg text-muted">
          Free to try. Pay only when you check companies often enough that it matters.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.name} className={p.highlight ? 'ring-2 ring-brand border-brand' : ''}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">{p.name}</h3>
              {p.highlight && <Badge tone="violet">Most popular</Badge>}
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>
              <span className="text-sm text-muted">/ {p.suffix}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{p.blurb}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-risk-low">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to={p.href}
              className={`mt-6 inline-flex w-full items-center justify-center h-11 rounded-xl font-semibold ${p.highlight ? 'bg-brand text-white hover:bg-brand-dark' : 'border border-line bg-white hover:bg-soft'}`}
            >
              {p.cta}
            </Link>
          </Card>
        ))}
      </div>
      <p className="mt-10 text-xs text-muted max-w-3xl">
        Payments not enabled in v1. Pricing shown is illustrative. Final pricing will be set when billing launches.
      </p>
    </div>
  );
}
