import { Link } from 'react-router-dom';
import type { CompanySearchHit } from '../../types';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/format';

const statusTone: Record<string, 'green' | 'amber' | 'red' | 'gray'> = {
  active: 'green',
  dissolved: 'red',
  liquidation: 'red',
  administration: 'red',
  receivership: 'red',
  'voluntary-arrangement': 'amber',
  'converted-closed': 'gray',
};

export function CompanyResultCard({ hit }: { hit: CompanySearchHit }) {
  return (
    <Link
      to={`/app/company/${hit.companyNumber}`}
      className="block rounded-2xl border border-line bg-white p-4 hover:border-brand hover:shadow-card transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-ink truncate">{hit.companyName}</div>
          <div className="mt-0.5 text-xs text-muted">
            #{hit.companyNumber} · {hit.companyType}
          </div>
          <div className="mt-2 text-sm text-muted truncate">{hit.addressSnippet}</div>
        </div>
        <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
          <Badge tone={statusTone[hit.companyStatus] ?? 'gray'}>{hit.companyStatus}</Badge>
          {hit.incorporatedOn && (
            <span className="text-xs text-muted">Incorp. {formatDate(hit.incorporatedOn)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
