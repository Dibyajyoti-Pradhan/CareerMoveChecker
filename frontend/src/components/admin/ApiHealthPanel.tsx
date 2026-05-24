import { formatPercent } from '../../lib/format';

interface Props {
  successRate: number;
  avgLatencyMs: number;
  errorCount: number;
}

export function ApiHealthPanel({ successRate, avgLatencyMs, errorCount }: Props) {
  const pct = Math.round(successRate * 100);
  const barColor = pct >= 99 ? 'bg-risk-low' : pct >= 95 ? 'bg-amber-500' : 'bg-risk-crit';
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold">Companies House API health (7d)</div>
        <div className="text-xs text-muted">{errorCount} errors</div>
      </div>
      <div className="mb-1 flex items-end justify-between">
        <div className="text-2xl font-extrabold">{formatPercent(successRate)}</div>
        <div className="text-xs text-muted">avg {avgLatencyMs} ms</div>
      </div>
      <div className="h-2 w-full rounded-full bg-soft overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
