import type { RecommendedAction } from '../../types';

export function RecommendedActions({ actions }: { actions: RecommendedAction[] }) {
  if (actions.length === 0) {
    return <p className="text-sm text-muted">No specific actions recommended.</p>;
  }
  return (
    <ol className="space-y-3">
      {actions.map((a, i) => (
        <li key={a.id} className="rounded-2xl border border-line bg-white p-4 flex gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-white font-bold text-sm">
            {i + 1}
          </span>
          <div>
            <div className="font-bold">{a.title}</div>
            <div className="text-sm text-muted mt-0.5">{a.detail}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
