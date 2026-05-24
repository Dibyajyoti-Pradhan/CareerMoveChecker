import { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: 'default' | 'good' | 'bad';
}

export function AdminMetricCard({ label, value, delta, tone = 'default' }: Props) {
  const deltaCls =
    tone === 'good'
      ? 'text-risk-low'
      : tone === 'bad'
        ? 'text-risk-crit'
        : 'text-muted';
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="text-xs uppercase tracking-wide font-bold text-muted">{label}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
      {delta && <div className={`mt-1 text-xs font-semibold ${deltaCls}`}>{delta}</div>}
    </div>
  );
}
