import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { api } from '../api/client';
import type { CompanyReport, FeedAlertDto, FeedResponse, SavedCompany, RiskLevel } from '../types';
import { crestInitials, formatDate, relativeTime } from '../lib/format';
import { cn } from '../lib/cn';

const FILTERS = ['all', 'safe', 'watch', 'red'] as const;

type Bucket = 'safe' | 'watch' | 'red' | 'unknown';

// Pick the first non-empty persona string from the backend's map.
function universalMeans(a: FeedAlertDto): string {
  return a.meansByPersona.candidate || a.meansByPersona.freelancer || a.meansByPersona.agency || '';
}

const MAX_RECENT_CHANGES = 20;

export function SavedPage() {
  const [items, setItems] = useState<SavedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<Record<string, CompanyReport | null>>({});
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'bad' } | null>(null);

  // Alerts feed state
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);

  const loadFeed = () => {
    setFeedLoading(true);
    api.alertsFeed()
      .then((r) => { setFeed(r); setFeedLoading(false); })
      .catch(() => { setFeed({ groups: [], unread: 0, totalCount: 0 }); setFeedLoading(false); });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    api.listSaved().then(async (r) => {
      setItems(r);
      setLoading(false);
      // Fetch reports for each saved company so we can show real verdicts
      const pairs = await Promise.all(
        r.map(async (s) => [s.companyNumber, await api.getReport(s.companyNumber).catch(() => null)] as const)
      );
      setReports(Object.fromEntries(pairs));
    }).catch(() => setLoading(false));

    loadFeed();
  }, []);

  const markAll = async () => { await api.alertsMarkAllRead(); loadFeed(); };
  const markOne = async (id: number) => { await api.alertsMarkRead(id); loadFeed(); };

  // Flatten all feed items across day-groups, cap at MAX_RECENT_CHANGES
  const recentAlerts = useMemo(() => {
    if (!feed) return [];
    return feed.groups.flatMap((g) => g.items).slice(0, MAX_RECENT_CHANGES);
  }, [feed]);

  const bucketFor = (n: string): Bucket => {
    const r = reports[n];
    if (!r) return 'unknown';
    const lvl: RiskLevel = r.assessment.riskLevel;
    if (lvl === 'LOW') return 'safe';
    if (lvl === 'CRITICAL') return 'red';
    return 'watch';
  };

  const counts = useMemo(() => {
    const c = { safe: 0, watch: 0, red: 0, unknown: 0 };
    items.forEach((s) => { c[bucketFor(s.companyNumber)]++; });
    return c;
  }, [items, reports]);

  const filtered = items.filter((s) => {
    if (search.trim() && !(s.companyName.toLowerCase().includes(search.toLowerCase()) || s.companyNumber.includes(search))) return false;
    if (filter === 'all') return true;
    return bucketFor(s.companyNumber) === filter;
  });

  const remove = async (n: string) => {
    await api.removeSaved(n).catch(() => {});
    setItems((cur) => cur.filter((s) => s.companyNumber !== n));
    setSelected((cur) => { const next = new Set(cur); next.delete(n); return next; });
  };

  const toggle = (n: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  return (
    <div className="wrap">
      {toast && (
        <div
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 90,
            background: toast.tone === 'ok' ? 'var(--ok-bg)' : 'var(--bad-bg)',
            color: toast.tone === 'ok' ? 'var(--ok)' : 'var(--bad)',
            border: `1px solid ${toast.tone === 'ok' ? 'var(--ok)' : 'var(--bad)'}`,
            padding: '10px 18px', borderRadius: 10, fontWeight: 500, fontSize: 14,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {toast.text}
        </div>
      )}
      <div className="page-head">
        <div>
          <h1>Saved companies</h1>
          <p className="sub">Your shortlist. Re-check before each commit.</p>
        </div>
        <div className="head-actions">
          <Link className="btn btn-primary btn-sm" to="/app/search"><Icon name="plus" /> Add a company</Link>
        </div>
      </div>

      {/* Recent changes (alerts feed) */}
      <section aria-label="Recent changes">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent changes</h2>
          </div>
          {feed && feed.unread > 0 && (
            <div className="head-actions">
              <button className="btn btn-secondary btn-sm" onClick={markAll}>
                <Icon name="check" /> Mark all read
              </button>
            </div>
          )}
        </div>

        {feedLoading && <div className="empty" style={{ margin: '12px 0' }}>Loading…</div>}

        {!feedLoading && recentAlerts.length === 0 && (
          <div className="empty" style={{ padding: '28px 0', textAlign: 'center' }}>
            <Icon name="bell" size={24} />
            <p style={{ marginTop: 8, color: 'var(--muted)' }}>No changes yet. We're watching your saved companies.</p>
          </div>
        )}

        {!feedLoading && recentAlerts.length > 0 && (
          <div className="feed" style={{ marginBottom: 28 }}>
            {recentAlerts.map((a) => {
              const means = universalMeans(a);
              return (
                <div key={a.id} className={cn('al', a.severity, a.unread && 'unread')}>
                  <div className="ic-l">
                    <Icon name={a.severity === 'bad' ? 'alert' : a.severity === 'warn' ? 'warn' : a.severity === 'ok' ? 'check' : 'info'} />
                  </div>
                  <div>
                    <div className="head-row">
                      <h3><Link to={`/app/company/${a.companyNumber}`}>{a.companyName}</Link></h3>
                      <span className={cn('severity', `badge-${a.severity === 'bad' ? 'bad' : a.severity === 'warn' ? 'warn' : a.severity === 'ok' ? 'ok' : 'info'}`)}>{a.severity}</span>
                    </div>
                    <p className="what">{a.title} — <span className="muted">{a.description}</span></p>
                    {means && <div className="means"><b>What it means:</b> {means}</div>}
                  </div>
                  <div className="right">
                    <span className="when">{relativeTime(a.when)}</span>
                    <Link to={`/app/company/${a.companyNumber}`} className="icon-btn"><Icon name="external" size={14} /></Link>
                    {a.unread && (
                      <button className="icon-btn" onClick={() => markOne(a.id)} title="Mark read">
                        <Icon name="check" size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Saved companies list */}
      <div className="stats">
        <div className="stat"><span className="label">Total saved</span><span className="val">{items.length}</span></div>
        <div className="stat"><span className="label">Clear</span><span className="val ok">{counts.safe}</span></div>
        <div className="stat"><span className="label">Watch closely</span><span className="val warn">{counts.watch}</span></div>
        <div className="stat"><span className="label">Red flags</span><span className="val bad">{counts.red}</span></div>
      </div>

      <div className="toolbar">
        <div className="search-mini">
          <Icon name="search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter saved…" />
        </div>
        {FILTERS.map((f) => (
          <button key={f} className={cn('filter-chip', filter === f && 'active')} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'safe' ? 'Clear' : f === 'watch' ? 'Watch' : 'Red flag'}
          </button>
        ))}
        <div className="sort">
          Sort:
          <select><option>Recently updated</option><option>Name A-Z</option><option>Risk score</option></select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bulkbar">
          <span className="count">{selected.size} selected</span>
          <div className="btns">
            <Link to={`/app/compare?numbers=${[...selected].join(',')}`} className="btn btn-ghost btn-sm"><Icon name="compare" /> Compare</Link>
            <button className="btn btn-ghost btn-sm"><Icon name="refresh" /> Refresh</button>
            <button
              className="btn btn-ghost btn-sm"
              disabled={items.length === 0}
              aria-label="Export saved companies as CSV"
              onClick={() => {
                const header = 'Company Name,Company Number,Note,Saved On';
                const rows = items.map((s) =>
                  [
                    `"${s.companyName.replace(/"/g, '""')}"`,
                    s.companyNumber,
                    `"${(s.note ?? '').replace(/"/g, '""')}"`,
                    s.createdAt.slice(0, 10),
                  ].join(',')
                );
                const csv = [header, ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'careermove-saved.csv';
                a.click();
                URL.revokeObjectURL(url);
                setToast({ text: `Exported ${items.length} companies`, tone: 'ok' });
              }}
            >
              <Icon name="download" /> Export CSV
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => selected.forEach(remove)}><Icon name="trash" /> Remove</button>
          </div>
        </div>
      )}

      <div className="saved-table">
        <div className="head">
          <span><Icon name="check" size={12} /></span>
          <span>Company</span>
          <span>Status</span>
          <span>Trust verdict</span>
          <span>Current risk</span>
          <span></span>
        </div>
        {loading && [0, 1, 2].map((i) => <div key={i} className="srow"><div /><div className="skel" style={{ height: 32 }} /><div /><div /><div /><div /></div>)}
        {!loading && filtered.length === 0 && (
          <div className="empty" style={{ margin: 18 }}>No saved companies yet. <Link to="/app/search" style={{ color: 'var(--brand)' }}>Add one →</Link></div>
        )}
        {!loading && filtered.map((s) => {
          const r = reports[s.companyNumber];
          const bucket = bucketFor(s.companyNumber);
          const pillStyle = bucket === 'safe' ? { background: 'var(--ok-bg)', color: 'var(--ok)' }
            : bucket === 'red' ? { background: 'var(--bad-bg)', color: 'var(--bad)' }
            : bucket === 'watch' ? { background: 'var(--warn-bg)', color: 'var(--warn)' }
            : { background: 'var(--soft)', color: 'var(--muted)' };
          const pillText = bucket === 'safe' ? 'OK' : bucket === 'red' ? 'AVOID' : bucket === 'watch' ? 'WATCH' : '...';
          const status = r?.profile?.companyStatus ?? '—';
          return (
          <div key={s.companyNumber} className="srow">
            <input type="checkbox" checked={selected.has(s.companyNumber)} onChange={() => toggle(s.companyNumber)} />
            <div className="co">
              <div className="crest-sm">{crestInitials(s.companyName)}</div>
              <div>
                <Link to={`/app/company/${s.companyNumber}`} style={{ fontWeight: 500 }}>{s.companyName}</Link>
                <div className="small muted mono">#{s.companyNumber} · saved {formatDate(s.createdAt)}</div>
              </div>
            </div>
            <span className={cn('badge', status === 'active' ? 'badge-ok' : status === '—' ? 'badge-neutral' : 'badge-bad')}>
              <span className="dot" />{status}
            </span>
            <div>
              <span className="v-pill" style={pillStyle}>{pillText}</span>
              <span className="small">{r ? `${r.assessment.score}/100` : 'loading'}</span>
            </div>
            <span className={cn('change', bucket === 'safe' ? 'ok' : bucket === 'red' ? 'bad' : 'warn')}>
              {r?.assessment.riskLevel ?? '—'}
            </span>
            <div className="actions">
              <Link to={`/app/company/${s.companyNumber}`} className="icon-btn" title="Open"><Icon name="external" size={14} /></Link>
              <button className="icon-btn" title="Refresh" onClick={async () => {
                const fresh = await api.refreshReport(s.companyNumber).catch(() => null);
                setReports((cur) => ({ ...cur, [s.companyNumber]: fresh }));
              }}><Icon name="refresh" size={14} /></button>
              <button className="icon-btn" onClick={() => remove(s.companyNumber)} title="Remove"><Icon name="trash" size={14} /></button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
