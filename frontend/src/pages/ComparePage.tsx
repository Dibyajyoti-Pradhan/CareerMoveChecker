import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { CompanyReport } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RiskBadge } from '../components/report/RiskBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const MAX = 3;

export function ComparePage() {
  const [params, setParams] = useSearchParams();
  const initialNumbers = (params.get('numbers') ?? '').split(',').filter(Boolean);
  const [numbers, setNumbers] = useState<string[]>(initialNumbers);
  const [input, setInput] = useState('');
  const [reports, setReports] = useState<CompanyReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (numbers.length === 0) {
      setReports([]);
      return;
    }
    setLoading(true);
    api.compare(numbers).then((r) => {
      setReports(r);
      setLoading(false);
    });
    setParams(numbers.length ? { numbers: numbers.join(',') } : {});
  }, [numbers]);

  const add = () => {
    const n = input.trim();
    if (!n) return;
    if (numbers.includes(n)) return;
    if (numbers.length >= MAX) return;
    setNumbers([...numbers, n]);
    setInput('');
  };

  const remove = (n: string) => setNumbers(numbers.filter((x) => x !== n));

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Compare companies</h1>
      <p className="mt-2 text-muted">Side-by-side comparison of up to {MAX} companies.</p>

      <Card className="mt-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Enter a company number (e.g. 03977902)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <Button onClick={add} disabled={numbers.length >= MAX}>Add</Button>
        </div>
        {numbers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {numbers.map((n) => (
              <button
                key={n}
                onClick={() => remove(n)}
                className="inline-flex items-center gap-1 rounded-full bg-soft px-3 py-1 text-sm hover:bg-red-50 hover:text-risk-crit"
                title="Remove"
              >
                #{n} ✕
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-8">
        {numbers.length === 0 && (
          <EmptyState
            title="Add a company to start comparing"
            description="Use the 8-character Companies House number. Try 03977902, 13571112, 09349736."
          />
        )}

        {loading && (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: numbers.length || 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {reports.map((r) => (
              <Card key={r.profile.companyNumber}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge tone="gray">#{r.profile.companyNumber}</Badge>
                  <RiskBadge level={r.assessment.riskLevel} />
                </div>
                <h3 className="text-base font-bold leading-snug">
                  <Link to={`/app/company/${r.profile.companyNumber}`} className="hover:text-brand">
                    {r.profile.companyName}
                  </Link>
                </h3>
                <div className="mt-1 text-xs text-muted">
                  {r.profile.companyType} · {r.profile.companyStatus}
                </div>
                <div className="mt-4 text-4xl font-extrabold tracking-tight">{r.assessment.score}<span className="text-base text-muted font-bold">/100</span></div>
                <div className="mt-3 text-sm leading-relaxed">{r.assessment.verdict}</div>
                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Top reasons</div>
                  <ul className="space-y-1 text-sm">
                    {r.assessment.topReasons.slice(0, 3).map((tr, i) => (
                      <li key={i}>· {tr}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
