import { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'gray' | 'green' | 'amber' | 'red' | 'blue' | 'violet';

const tones: Record<Tone, string> = {
  gray: 'bg-soft text-muted border-line',
  green: 'bg-risk-lowBg text-risk-low border-green-200',
  amber: 'bg-risk-modBg text-risk-mod border-amber-200',
  red: 'bg-risk-critBg text-risk-crit border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
};

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'gray', className, ...rest }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
