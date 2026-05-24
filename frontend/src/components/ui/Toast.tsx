import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { cn } from '../../lib/cn';

interface Toast {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
}

interface Ctx {
  push: (message: string, tone?: Toast['tone']) => void;
}

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const c = useContext(ToastCtx);
  if (!c) throw new Error('useToast must be used inside ToastProvider');
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.random();
    setItems((cur) => [...cur, { id, message, tone }]);
    setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'rounded-2xl border px-4 py-3 text-sm font-medium shadow-card',
              t.tone === 'success' && 'bg-risk-lowBg text-risk-low border-green-200',
              t.tone === 'warning' && 'bg-risk-modBg text-risk-mod border-amber-200',
              t.tone === 'danger' && 'bg-risk-critBg text-risk-crit border-red-200',
              t.tone === 'info' && 'bg-white text-ink border-line',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
