import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaSwitch, usePersona } from '../lib/persona';
import { api } from '../api/client';
import { SAVED_TITLE_EM, SAVED_SUB, SAVED_STAT_LABEL, SAVED_FILTER_LABEL } from '../lib/persona-copy';
import type { CompanyReport, SavedCompany, RiskLevel } from '../types';
import { crestInitials, formatDate, relativeTime } from '../lib/format';
import { cn } from '../lib/cn';

const FILTERS = ['all', 'safe', 'watch', 'red'] as const;

type Bucket = 'safe' | 'watch' | 'red' | 'unknown';

export function SavedPage() {
  const { persona } = usePersona();
  const [items, setItems] = useState<SavedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<Record<string, CompanyReport | null>>({});

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
  }, []);

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
      <div className="page-head">
        <div>
          <h1>Your saved <em>{SAVED_TITLE_EM[persona]}</em></h1>
          <p className="sub">{SAVED_SUB[persona]}</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary btn-sm"><Icon name="refresh" /> Refresh all</button>
          <Link className="btn btn-primary btn-sm" to="/app/search"><Icon name="plus" /> Add a company</Link>
        </div>
      </div>

      <div style={{ padding: '14px 0' }}><PersonaSwitch showLabel={false} /></div>

      <div className="stats">
        <div className="stat"><span className="label">Total saved</span><span className="val">{items.length}</span></div>
        <div className="stat"><span className="label">{SAVED_STAT_LABEL[persona]}</span><span className="val ok">{counts.safe}</span></div>
        <div className="stat"><span className="label">Watch closely</span><span className="val warn">{counts.watch}</span></div>
        <div className="stat"><span className="label">Red flags</span><span className="val bad">{counts.red}</span></div>
      </div>

      <div className="alerts-card">
        <Icon name="bell" />
        <p><b>2 changes</b> across your saved companies since you last visited.</p>
        <Link to="/app/alerts">See alerts →</Link>
      </div>

      <div className="toolbar">
        <div className="search-mini">
          <Icon name="search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter saved…" />
        </div>
        {FILTERS.map((f) => (
          <button key={f} className={cn('filter-chip', filter === f && 'active')} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'safe' ? SAVED_FILTER_LABEL[persona] : f === 'watch' ? 'Watch' : 'Red flag'}
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
            <button className="btn btn-ghost btn-sm"><Icon name="download" /> Export PDF</button>
            <button className="btn btn-ghost btn-sm" onClick={() => selected.forEach(remove)}><Icon name="trash" /> Remove</button>
          </div>
        </div>
      )}

      <div className="saved-table">
        <div className="head">
          <span><Icon name="check" size={12} /></span>
          <span>Company</span>
          <span>Status</span>
          <span>{persona === 'candidate' ? 'Will it last?' : persona === 'freelancer' ? 'Will they pay?' : 'Safe to place?'}</span>
          <span>Change</span>
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
