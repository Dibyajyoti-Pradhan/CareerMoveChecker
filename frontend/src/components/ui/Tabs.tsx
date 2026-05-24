import { ReactNode, useState } from 'react';
import { cn } from '../../lib/cn';

interface TabSpec {
  id: string;
  label: ReactNode;
  content: ReactNode;
  count?: number;
}

interface Props {
  tabs: TabSpec[];
  initial?: string;
  onChange?: (id: string) => void;
}

export function Tabs({ tabs, initial, onChange }: Props) {
  const [active, setActive] = useState<string>(initial ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div>
      <div className="flex gap-1 overflow-auto border-b border-line">
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActive(t.id);
                onChange?.(t.id);
              }}
              className={cn(
                'px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t.label}
              {typeof t.count === 'number' && (
                <span className={cn('ml-2 text-xs rounded-full px-2 py-0.5', isActive ? 'bg-brand/10 text-brand' : 'bg-soft text-muted')}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-6">{current?.content}</div>
    </div>
  );
}
