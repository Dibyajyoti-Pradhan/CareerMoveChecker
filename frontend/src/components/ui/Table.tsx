import { HTMLAttributes, TableHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-auto rounded-2xl border border-line bg-white">
      <table className={cn('w-full text-sm', className)} {...rest} />
    </div>
  );
}

export function THead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-soft text-left text-xs uppercase tracking-wide text-muted" {...props} />;
}

export function TBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TR({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-t border-line hover:bg-soft/60', className)} {...rest} />;
}

export function TH({ className, ...rest }: HTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('px-4 py-3 font-semibold', className)} {...rest} />;
}

export function TD({ className, ...rest }: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-top', className)} {...rest} />;
}
