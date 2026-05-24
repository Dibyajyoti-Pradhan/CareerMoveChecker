import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CompanySearchBox } from '../components/company/CompanySearchBox';
import { CompanyResultCard } from '../components/company/CompanyResultCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../api/client';
import type { CompanySearchHit } from '../types';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [hits, setHits] = useState<CompanySearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(Boolean(q));

  useEffect(() => {
    if (!q) {
      setHits([]);
      return;
    }
    setLoading(true);
    setTouched(true);
    let cancelled = false;
    api.searchCompanies(q).then((res) => {
      if (!cancelled) {
        setHits(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Search UK companies</h1>
      <p className="mt-2 text-muted">Name or company number. Data from Companies House.</p>

      <div className="mt-6">
        <CompanySearchBox
          initial={q}
          loading={loading}
          onSubmit={(next) => setParams(next ? { q: next } : {})}
        />
      </div>

      <div className="mt-8">
        {loading && (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        )}

        {!loading && touched && hits.length === 0 && q && (
          <EmptyState
            title="No matches"
            description={`Nothing matched "${q}". Try a different spelling or paste the 8-character company number.`}
          />
        )}

        {!loading && !touched && (
          <EmptyState
            title="Start with a name or company number"
            description="Examples: MONZO BANK LIMITED, DELIVEROO, 03977902"
          />
        )}

        {!loading && hits.length > 0 && (
          <>
            <div className="mb-3 text-sm text-muted">{hits.length} result{hits.length === 1 ? '' : 's'}</div>
            <div className="grid gap-3">
              {hits.map((h) => (
                <CompanyResultCard key={h.companyNumber} hit={h} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
