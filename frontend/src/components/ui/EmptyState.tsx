import { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white px-6 py-12 text-center">
      {icon && <div className="mx-auto mb-3 text-3xl">{icon}</div>}
      <h3 className="text-base font-bold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
