import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaSwitch, usePersona } from '../lib/persona';
import { api } from '../api/client';
import type { FeedResponse } from '../types';
import { relativeTime } from '../lib/format';
import { cn } from '../lib/cn';

const FILTERS = ['all', 'unread', 'red', 'watch', 'info'] as const;

export function AlertsPage() {
  const { persona } = usePersona();
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all');

  const load = () => {
    setLoading(true);
    api.alertsFeed().then((r) => { setFeed(r); setLoading(false); }).catch(() => { setFeed({ groups: [], unread: 0, totalCount: 0 }); setLoading(false); });
  };

  useEffect(load, []);

  const markAll = async () => { await api.alertsMarkAllRead(); load(); };
  const markOne = async (id: number) => { await api.alertsMarkRead(id); load(); };

  const filteredGroups = useMemo(() => {
    if (!feed) return [];
    return feed.groups.map((g) => ({
      ...g,
      items: g.items.filter((a) => {
        if (filter === 'all') return true;
        if (filter === 'unread') return a.unread;
        if (filter === 'red') return a.severity === 'bad';
        if (filter === 'watch') return a.severity === 'warn';
        if (filter === 'info') return a.severity === 'info' || a.severity === 'ok';
        return true;
      }),
    })).filter((g) => g.items.length > 0);
  }, [feed, filter]);

  const totalCount = feed?.totalCount ?? 0;
  const unread = feed?.unread ?? 0;
  const allItems = feed?.groups.flatMap((g) => g.items) ?? [];

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1><em>{totalCount}</em> changes across your watch list</h1>
          <p className="sub">
            {persona === 'candidate' && 'Updates on companies you saved as potential employers.'}
            {persona === 'freelancer' && "Updates on your client list — watch for anything that puts an invoice at risk."}
            {persona === 'agency' && "Updates on your watch list — fee and placement risk surfaces here first."}
          </p>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary btn-sm" onClick={markAll} disabled={unread === 0}>
            <Icon name="check" /> Mark all read
          </button>
          <Link to="/account" className="btn btn-secondary btn-sm"><Icon name="settings" /> Alert settings</Link>
        </div>
      </div>

      <div style={{ padding: '14px 0' }}><PersonaSwitch showLabel={false} /></div>

      <div className="stats">
        <div className="stat"><span className="label">Unread</span><span className="val">{unread}</span></div>
        <div className="stat"><span className="label">Red flags</span><span className="val bad">{allItems.filter((a) => a.severity === 'bad').length}</span></div>
        <div className="stat"><span className="label">Watch closely</span><span className="val warn">{allItems.filter((a) => a.severity === 'warn').length}</span></div>
        <div className="stat"><span className="label">Total alerts</span><span className="val">{totalCount}</span></div>
      </div>

      <div className="toolbar">
        {FILTERS.map((f) => (
          <button key={f} className={cn('filter-chip', filter === f && 'active')} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'unread' ? `Unread (${unread})` : f === 'red' ? 'Red' : f === 'watch' ? 'Watch' : 'Info'}
          </button>
        ))}
      </div>

      {loading && <div className="empty" style={{ margin: 18 }}>Loading…</div>}

      {!loading && totalCount === 0 && (
        <div className="empty" style={{ marginTop: 18, padding: 60 }}>
          <Icon name="bell" size={32} />
          <h3 style={{ margin: '14px 0 6px' }}>No alerts yet</h3>
          <p>Save some companies first, then we'll poll Companies House every 10 minutes and surface any changes here.</p>
          <Link to="/app/saved" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>Go to saved →</Link>
        </div>
      )}

      {!loading && filteredGroups.length > 0 && (
        <div className="feed">
          {filteredGroups.map((g) => (
            <div key={g.day} className="day">
              <h4>{g.day}</h4>
              <div className="alerts">
                {g.items.map((a) => (
                  <div key={a.id} className={cn('al', a.severity, a.unread && 'unread')}>
                    <div className="ic-l"><Icon name={a.severity === 'bad' ? 'alert' : a.severity === 'warn' ? 'warn' : a.severity === 'ok' ? 'check' : 'info'} /></div>
                    <div>
                      <div className="head-row">
                        <h3><Link to={`/app/company/${a.companyNumber}`}>{a.companyName}</Link></h3>
                        <span className={cn('severity', `badge-${a.severity === 'bad' ? 'bad' : a.severity === 'warn' ? 'warn' : a.severity === 'ok' ? 'ok' : 'info'}`)}>{a.severity}</span>
                      </div>
                      <p className="what">{a.title} — <span className="muted">{a.description}</span></p>
                      {a.meansByPersona[persona] && (
                        <div className="means"><b>What it means for you:</b> {a.meansByPersona[persona]}</div>
                      )}
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
