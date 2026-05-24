import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { AlertSeverity, AlertStatus, AlertType, DownstreamAlert } from '../types';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../lib/format';

const sevTone: Record<AlertSeverity, 'blue' | 'amber' | 'red'> = {
  INFO: 'blue',
  WARNING: 'amber',
  CRITICAL: 'red',
};

const statusTone: Record<AlertStatus, 'amber' | 'blue' | 'green' | 'gray'> = {
  OPEN: 'amber',
  ACKNOWLEDGED: 'blue',
  RESOLVED: 'green',
  SUPPRESSED: 'gray',
};

const ALL_SEV: (AlertSeverity | 'ALL')[] = ['ALL', 'INFO', 'WARNING', 'CRITICAL'];
const ALL_STATUS: (AlertStatus | 'ALL')[] = ['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED'];
const ALL_TYPE: (AlertType | 'ALL')[] = [
  'ALL', 'API_FAILURE', 'RATE_LIMIT', 'TIMEOUT', 'MALFORMED_RESPONSE',
  'SCHEMA_DRIFT', 'MISSING_REQUIRED_FIELD', 'STALE_DATA', 'CONTRADICTORY_DATA',
  'PARTIAL_DATA', 'CACHE_REFRESH_FAILED',
];

export function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<DownstreamAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sev, setSev] = useState<AlertSeverity | 'ALL'>('ALL');
  const [status, setStatus] = useState<AlertStatus | 'ALL'>('ALL');
  const [type, setType] = useState<AlertType | 'ALL'>('ALL');
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.listAlerts().then((r) => {
      setAlerts(r);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return alerts.filter((a) =>
      (sev === 'ALL' || a.severity === sev) &&
      (status === 'ALL' || a.status === status) &&
      (type === 'ALL' || a.alertType === type),
    );
  }, [alerts, sev, status, type]);

  const act = async (id: string, action: 'acknowledge' | 'resolve' | 'suppress' | 'retry') => {
    await api.alertAction(id, action);
    toast.push(`${action} sent`, 'success');
    load();
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Downstream data-quality alerts</h1>
      <p className="mt-2 text-muted max-w-2xl">
        Operational alerts when Companies House or any downstream returns data that cannot be trusted automatically. Admin only.
      </p>

      <Card className="mt-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">Severity</label>
            <Select value={sev} onChange={(e) => setSev(e.target.value as AlertSeverity | 'ALL')} className="w-full">
              {ALL_SEV.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as AlertStatus | 'ALL')} className="w-full">
              {ALL_STATUS.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">Type</label>
            <Select value={type} onChange={(e) => setType(e.target.value as AlertType | 'ALL')} className="w-full">
              {ALL_TYPE.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
        </div>
      </Card>

      <div className="mt-6 space-y-3">
        {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        {!loading && filtered.length === 0 && (
          <EmptyState title="No alerts match" description="Try widening the filters." />
        )}
        {!loading && filtered.map((a) => (
          <Card key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge tone={sevTone[a.severity]}>{a.severity}</Badge>
                  <Badge tone={statusTone[a.status]}>{a.status}</Badge>
                  <Badge tone="gray">{a.alertType.replaceAll('_', ' ')}</Badge>
                  <span className="text-xs text-muted">{a.endpoint}</span>
                </div>
                <h3 className="font-bold text-ink">{a.title}</h3>
                <p className="text-sm text-muted mt-1 max-w-3xl">{a.message}</p>
                {(a.companyNumber || a.companyName) && (
                  <div className="mt-1 text-xs text-muted">
                    {a.companyName ?? ''} {a.companyNumber ? `(#${a.companyNumber})` : ''}
                  </div>
                )}
                <div className="mt-2 text-xs text-muted">
                  First seen {formatDate(a.firstSeenAt)} · Last seen {formatDate(a.lastSeenAt)}
                  {a.acknowledgedAt && ` · Ack ${formatDate(a.acknowledgedAt)}`}
                  {a.resolvedAt && ` · Resolved ${formatDate(a.resolvedAt)}`}
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-ink">Evidence JSON</summary>
                  <pre className="mt-2 rounded-xl bg-slate-900 text-slate-100 p-3 text-xs overflow-auto">
                    {JSON.stringify(a.evidence, null, 2)}
                  </pre>
                </details>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button size="sm" variant="secondary" onClick={() => act(a.id, 'acknowledge')} disabled={a.status === 'RESOLVED'}>Acknowledge</Button>
                <Button size="sm" variant="secondary" onClick={() => act(a.id, 'suppress')} disabled={a.status === 'RESOLVED'}>Suppress 24h</Button>
                <Button size="sm" onClick={() => act(a.id, 'retry')}>Retry fetch</Button>
                <Button size="sm" variant="danger" onClick={() => act(a.id, 'resolve')} disabled={a.status === 'RESOLVED'}>Resolve</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
