import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full min-h-[96px] px-4 py-3 rounded-xl border border-line bg-white text-ink',
        'placeholder:text-muted',
        'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
        className,
      )}
      {...rest}
    />
  ),
);
Textarea.displayName = 'Textarea';
