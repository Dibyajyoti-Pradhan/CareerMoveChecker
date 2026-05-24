import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-11 px-4 pr-10 rounded-xl border border-line bg-white text-ink',
        'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
        'appearance-none bg-no-repeat',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%235b6475' d='M1 1l5 5 5-5'/></svg>\")",
        backgroundPosition: 'right 14px center',
      }}
      {...rest}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
