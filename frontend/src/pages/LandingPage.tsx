import { Link, useNavigate } from 'react-router-dom';
import { CompanySearchBox } from '../components/company/CompanySearchBox';
import { Card, CardTitle, CardSubtle } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';

const useCases = [
  { title: 'Job candidates', body: 'Quick trust signals on an employer before you accept.' },
  { title: 'Freelancers', body: 'Vet a new client before agreeing to terms or invoicing.' },
  { title: 'Agencies', body: 'Sanity-check prospects before extending credit.' },
  { title: 'Suppliers', body: 'See visible status signals before shipping or extending terms.' },
  { title: 'Landlords', body: 'Check the corporate tenant standing behind the lease.' },
  { title: 'Small businesses', body: 'Look up partners before signing anything.' },
];

const checks = [
  { title: 'Company status', detail: 'Active, dissolved, liquidation, administration — direct from Companies House.' },
  { title: 'Filings on time', detail: 'Overdue accounts or confirmation statements are visible warning signals.' },
  { title: 'Ownership clarity', detail: 'Officers and persons with significant control.' },
  { title: 'Charges & insolvency', detail: 'Outstanding charges and insolvency events on file.' },
];

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-blue-50 to-violet-50" />
        <div className="container-page py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted backdrop-blur">
              UK B2B · Companies House powered
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Know who you're dealing with{' '}
              <span className="text-brand">before</span> you make your next move.
            </h1>
            <p className="mt-5 text-lg md:text-xl text-slate-700 max-w-2xl">
              CareerMoveChecker turns public UK company data into a plain-English trust report before you join, contract, invoice, rent, supply, or partner.
            </p>
            <div className="mt-8 max-w-2xl">
              <CompanySearchBox
                onSubmit={(q) =>
                  navigate(`/app/search?q=${encodeURIComponent(q)}`)
                }
                placeholder="Try: Monzo, Deliveroo, or a company number like 03977902"
              />
            </div>
            <div className="mt-4 text-xs text-muted">
              No sign-up needed to try. Public Companies House data only.
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Who it's for</h2>
        <p className="mt-1 text-muted">Simple decision-support across the situations where you ask the same question.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((u) => (
            <Card key={u.title}>
              <CardTitle>{u.title}</CardTitle>
              <CardSubtle className="mt-2">{u.body}</CardSubtle>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">What we check</h2>
            <p className="mt-2 text-muted">
              Public Companies House data, parsed into clear signals you can act on.
            </p>
            <ul className="mt-6 space-y-3">
              {checks.map((c) => (
                <li key={c.title} className="rounded-2xl border border-line bg-white p-4">
                  <div className="font-bold">{c.title}</div>
                  <div className="text-sm text-muted mt-1">{c.detail}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Alert tone="info" title="What this isn't">
              CareerMoveChecker is a decision-support tool, not a credit report, legal advice, financial advice, AML/KYB verification, employment advice, or a guarantee of solvency, safety, or trustworthiness. We use cautious language because public data is incomplete by nature.
            </Alert>
            <div className="mt-4 rounded-3xl border border-line bg-white p-6">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">Try a few</div>
              <div className="mt-3 grid gap-2">
                <Link className="rounded-xl bg-soft px-3 py-2 hover:bg-blue-50" to="/app/company/03977902">MONZO BANK LIMITED — low risk example</Link>
                <Link className="rounded-xl bg-soft px-3 py-2 hover:bg-blue-50" to="/app/company/13571112">NEWCO STUDIOS LTD — newly incorporated</Link>
                <Link className="rounded-xl bg-soft px-3 py-2 hover:bg-blue-50" to="/app/company/09349736">BULB ENERGY LTD — critical insolvency example</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
