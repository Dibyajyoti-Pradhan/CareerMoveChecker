import { FormEvent, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Props {
  initial?: string;
  onSubmit: (q: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function CompanySearchBox({ initial, onSubmit, loading, placeholder }: Props) {
  const [q, setQ] = useState(initial ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(q.trim());
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 w-full">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder ?? 'Search by company name or company number'}
        aria-label="Search companies"
        className="flex-1"
      />
      <Button type="submit" size="md" loading={loading}>
        Check company
      </Button>
    </form>
  );
}
