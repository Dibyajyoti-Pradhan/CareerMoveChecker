import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaSwitch, usePersona } from '../lib/persona';
import { api } from '../api/client';
import { SAVED_TITLE_EM, SAVED_SUB, SAVED_STAT_LABEL, SAVED_FILTER_LABEL } from '../lib/persona-copy';
import type { SavedCompany } from '../types';
import { crestInitials, formatDate, relativeTime } from '../lib/format';
import { cn } from '../lib/cn';

const FILTERS = ['all', 'safe', 'watch', 'red'] as const;

export function SavedPage() {
  const { persona } = usePersona();
  const [items, setItems] = useState<SavedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.listSaved().then((r) => { setItems(r); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = items.filter((s) =>
    !search.trim() || s.companyName.toLowerCase().includes(search.toLowerCase()) || s.companyNumber.includes(search)
  );

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
        <div className="stat"><span className="label">{SAVED_STAT_LABEL[persona]}</span><span className="val ok">{Math.max(0, items.length - 2)}</span></div>
        <div className="stat"><span className="label">Watch closely</span><span className="val warn">1</span></div>
        <div className="stat"><span className="label">Red flags</span><span className="val bad">1</span></div>
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
        {!loading && filtered.map((s) => (
          <div key={s.companyNumber} className="srow">
            <input type="checkbox" checked={selected.has(s.companyNumber)} onChange={() => toggle(s.companyNumber)} />
            <div className="co">
              <div className="crest-sm">{crestInitials(s.companyName)}</div>
              <div>
                <Link to={`/app/company/${s.companyNumber}`} style={{ fontWeight: 500 }}>{s.companyName}</Link>
                <div className="small muted mono">#{s.companyNumber} · saved {formatDate(s.createdAt)}</div>
              </div>
            </div>
            <span className="badge badge-ok"><span className="dot" />Active</span>
            <div>
              <span className="v-pill" style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}>YES</span>
              <span className="small">Strong signals.</span>
            </div>
            <span className="change ok">+ Filings on time</span>
            <div className="actions">
              <Link to={`/app/company/${s.companyNumber}`} className="icon-btn" title="Open"><Icon name="external" size={14} /></Link>
              <button className="icon-btn" title="Refresh"><Icon name="refresh" size={14} /></button>
              <button className="icon-btn" onClick={() => remove(s.companyNumber)} title="Remove"><Icon name="trash" size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
