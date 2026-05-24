import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'info' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  success: 'bg-risk-lowBg border-green-200 text-risk-low',
  warning: 'bg-risk-modBg border-amber-200 text-risk-mod',
  danger: 'bg-risk-critBg border-red-200 text-risk-crit',
};

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: Tone;
  title?: ReactNode;
}

export function Alert({ tone = 'info', title, className, children, ...rest }: Props) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {title && <div className="font-bold mb-1">{title}</div>}
      {children && <div className="leading-relaxed">{children}</div>}
    </div>
  );
}
