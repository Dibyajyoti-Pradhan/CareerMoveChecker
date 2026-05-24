import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ invalid, className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full h-11 px-4 rounded-xl border bg-white text-ink',
        'placeholder:text-muted',
        'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
        invalid ? 'border-risk-crit' : 'border-line',
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = 'Input';
