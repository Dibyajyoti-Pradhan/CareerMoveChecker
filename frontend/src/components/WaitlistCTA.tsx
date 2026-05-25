import { ReactNode, useState } from 'react';
import { WaitlistModal } from './WaitlistModal';
import { cn } from '../lib/cn';

interface Props {
  tier: 'Pro' | 'Agency';
  ctaId: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
  block?: boolean;
}

export function WaitlistCTA({ tier, ctaId, variant = 'primary', size = 'md', className, children, block }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={cn('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', size === 'lg' && 'btn-lg', className)}
        style={block ? { width: '100%' } : undefined}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <WaitlistModal open={open} onClose={() => setOpen(false)} tier={tier} ctaId={ctaId} />
    </>
  );
}
