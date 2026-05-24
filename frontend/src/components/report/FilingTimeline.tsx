import type { FilingEntry } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/format';

export function FilingTimeline({ filings }: { filings: FilingEntry[] }) {
  if (filings.length === 0) {
    return <EmptyState title="No filings visible" description="Companies House did not return filing history." />;
  }
  return (
    <ol className="relative ml-3 border-l border-line">
      {filings.map((f) => (
        <li key={f.id} className="pl-4 pb-4">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand ring-4 ring-white" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">{formatDate(f.date)}</span>
            <Badge tone="blue">{f.type}</Badge>
            <Badge tone="gray">{f.category}</Badge>
          </div>
          <div className="mt-1 text-sm">{f.description}</div>
        </li>
      ))}
    </ol>
  );
}
