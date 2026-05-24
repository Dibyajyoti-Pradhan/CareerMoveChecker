import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { SavedCompany } from '../types';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../lib/format';

export function DashboardPage() {
  const [items, setItems] = useState<SavedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.listSaved().then((r) => {
      setItems(r);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const remove = async (n: string) => {
    await api.removeSaved(n);
    toast.push('Removed', 'success');
    load();
  };

  const saveNote = async (n: string) => {
    await api.updateSavedNote(n, draft);
    setEditing(null);
    setDraft('');
    toast.push('Note updated', 'success');
    load();
  };

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Saved companies</h1>
          <p className="mt-2 text-muted">Your private shortlist. No account required in this preview.</p>
        </div>
        <Link
          to="/app/search"
          className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark"
        >
          Add a company
        </Link>
      </div>

      <div className="mt-8">
        {loading && (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <EmptyState
            title="Nothing saved yet"
            description="Save companies from a report page to track them here."
            action={<Link to="/app/search" className="text-brand font-semibold">Search a company</Link>}
          />
        )}

        {!loading && items.length > 0 && (
          <div className="grid gap-3">
            {items.map((s) => (
              <Card key={s.companyNumber}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="gray">#{s.companyNumber}</Badge>
                      <Link
                        to={`/app/company/${s.companyNumber}`}
                        className="font-bold hover:text-brand"
                      >
                        {s.companyName}
                      </Link>
                    </div>
                    {editing === s.companyNumber ? (
                      <div className="mt-3 max-w-xl">
                        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} />
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" onClick={() => saveNote(s.companyNumber)}>Save note</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted max-w-2xl">{s.note || <em>No note. Add context for future you.</em>}</p>
                    )}
                    <div className="mt-2 text-xs text-muted">
                      Saved {formatDate(s.createdAt)} · Updated {formatDate(s.updatedAt)}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditing(s.companyNumber);
                        setDraft(s.note ?? '');
                      }}
                    >
                      Edit note
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => remove(s.companyNumber)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
