import type { RiskFlag } from '../../types';
import { Badge } from '../ui/Badge';

const sevTone: Record<RiskFlag['severity'], 'green' | 'blue' | 'amber' | 'red'> = {
  POSITIVE: 'green',
  INFO: 'blue',
  WARNING: 'amber',
  CRITICAL: 'red',
};

export function RiskFlagCard({ flag }: { flag: RiskFlag }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-bold text-ink">{flag.title}</h4>
        <Badge tone={sevTone[flag.severity]}>{flag.severity}</Badge>
      </div>
      <p className="text-sm text-muted leading-relaxed mb-3">{flag.explanation}</p>
      <div className="grid sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-soft p-3">
          <div className="font-bold text-muted uppercase tracking-wide mb-1">Evidence</div>
          <div className="text-ink">{flag.evidence}</div>
        </div>
        <div className="rounded-xl bg-blue-50 p-3">
          <div className="font-bold text-blue-700 uppercase tracking-wide mb-1">Recommended</div>
          <div className="text-blue-900">{flag.recommendedAction}</div>
        </div>
      </div>
    </div>
  );
}
