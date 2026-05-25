import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaSwitch, usePersona } from '../lib/persona';
import { relativeTime } from '../lib/format';
import { cn } from '../lib/cn';

type Sev = 'bad' | 'warn' | 'ok' | 'info';

interface FeedAlert {
  id: string;
  severity: Sev;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  meansByPersona: { candidate: string; freelancer: string; agency: string };
  when: string;
  unread?: boolean;
  day: string;
}

const MOCK_ALERTS: FeedAlert[] = [
  {
    id: 'a1', severity: 'bad', companyId: '09349736', companyName: 'BULB ENERGY LTD',
    title: 'Insolvency case opened', description: 'Administration filing posted to Companies House.',
    meansByPersona: {
      candidate: 'Do not sign anything. Find another role.',
      freelancer: 'Stop work immediately. Existing invoices at risk.',
      agency: '3 active placements at risk · ~£18k in pending fees.',
    },
    when: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread: true, day: 'Today',
  },
  {
    id: 'a2', severity: 'warn', companyId: '03977902', companyName: 'EXAMPLE CONSULTING LTD',
    title: 'Director resigned', description: 'A director resignation has been filed (TM01).',
    meansByPersona: {
      candidate: 'Leadership change — find out why before signing.',
      freelancer: 'Check the new signer can authorise payment.',
      agency: 'Verify the placement hiring manager is unchanged.',
    },
    when: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    unread: true, day: 'Today',
  },
  {
    id: 'a3', severity: 'warn', companyId: '13571112', companyName: 'NEWCO STUDIOS LTD',
    title: 'Accounts now overdue', description: 'Statutory accounts deadline has passed without filing.',
    meansByPersona: {
      candidate: 'Operational drift signal — verify before joining.',
      freelancer: 'Cashflow caution. Tighten payment terms.',
      agency: 'Move from "safe" to "watch closely" until resolved.',
    },
    when: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    day: 'Yesterday',
  },
  {
    id: 'a4', severity: 'ok', companyId: '09446231', companyName: 'MONZO BANK LIMITED',
    title: 'Confirmation statement filed on time', description: 'Annual confirmation statement filed.',
    meansByPersona: {
      candidate: 'Good housekeeping signal.',
      freelancer: 'No action needed.',
      agency: 'No action needed.',
    },
    when: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    day: 'Yesterday',
  },
  {
    id: 'a5', severity: 'info', companyId: '04500110', companyName: 'CARILLION CONSTRUCTION LIMITED',
    title: 'New charge registered', description: 'A new lender charge has been registered.',
    meansByPersona: {
      candidate: 'Worth knowing about — not necessarily negative.',
      freelancer: 'New secured lending — note before extending credit.',
      agency: 'Note before new placement.',
    },
    when: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    day: 'Earlier this week',
  },
];

const FILTERS = ['all', 'unread', 'red', 'watch', 'info'] as const;

export function AlertsPage() {
  const { persona } = usePersona();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all');

  useEffect(() => {
    // Future: api.listAlerts()
  }, []);

  const filtered = useMemo(() => alerts.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return a.unread;
    if (filter === 'red') return a.severity === 'bad';
    if (filter === 'watch') return a.severity === 'warn';
    if (filter === 'info') return a.severity === 'info' || a.severity === 'ok';
    return true;
  }), [alerts, filter]);

  const grouped: Record<string, FeedAlert[]> = {};
  filtered.forEach((a) => { (grouped[a.day] ||= []).push(a); });

  const unreadCount = alerts.filter((a) => a.unread).length;
  const markAll = () => setAlerts((cur) => cur.map((a) => ({ ...a, unread: false })));

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1><em>{alerts.length}</em> changes across your watch list</h1>
          <p className="sub">
            {persona === 'candidate' && 'Updates on companies you saved as potential employers.'}
            {persona === 'freelancer' && "Updates on your client list — watch for anything that puts an invoice at risk."}
            {persona === 'agency' && "Updates on your watch list — fee and placement risk surfaces here first."}
          </p>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary btn-sm" onClick={markAll} disabled={unreadCount === 0}>
            <Icon name="check" /> Mark all read
          </button>
          <Link to="/account" className="btn btn-secondary btn-sm"><Icon name="settings" /> Alert settings</Link>
        </div>
      </div>

      <div style={{ padding: '14px 0' }}><PersonaSwitch showLabel={false} /></div>

      <div className="stats">
        <div className="stat"><span className="label">Unread</span><span className="val">{unreadCount}</span></div>
        <div className="stat"><span className="label">Red flags</span><span className="val bad">{alerts.filter((a) => a.severity === 'bad').length}</span></div>
        <div className="stat"><span className="label">Watch closely</span><span className="val warn">{alerts.filter((a) => a.severity === 'warn').length}</span></div>
        <div className="stat"><span className="label">Companies watched</span><span className="val">12</span></div>
      </div>

      <div className="toolbar">
        {FILTERS.map((f) => (
          <button key={f} className={cn('filter-chip', filter === f && 'active')} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'unread' ? `Unread (${unreadCount})` : f === 'red' ? 'Red' : f === 'watch' ? 'Watch' : 'Info'}
          </button>
        ))}
        <div className="sort">
          Range:
          <select><option>Last 30 days</option><option>Last 7 days</option><option>Last 24 hours</option></select>
        </div>
      </div>

      <div className="feed">
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day} className="day">
            <h4>{day}</h4>
            <div className="alerts">
              {items.map((a) => (
                <div key={a.id} className={cn('al', a.severity, a.unread && 'unread')}>
                  <div className="ic-l"><Icon name={a.severity === 'bad' ? 'alert' : a.severity === 'warn' ? 'warn' : a.severity === 'ok' ? 'check' : 'info'} /></div>
                  <div>
                    <div className="head-row">
                      <h3><Link to={`/app/company/${a.companyId}`}>{a.companyName}</Link></h3>
                      <span className={cn('severity', `badge-${a.severity === 'bad' ? 'bad' : a.severity === 'warn' ? 'warn' : a.severity === 'ok' ? 'ok' : 'info'}`)}>{a.severity}</span>
                    </div>
                    <p className="what">{a.title} — <span className="muted">{a.description}</span></p>
                    <div className="means"><b>What it means for you:</b> {a.meansByPersona[persona]}</div>
                  </div>
                  <div className="right">
                    <span className="when">{relativeTime(a.when)}</span>
                    <Link to={`/app/company/${a.companyId}`} className="icon-btn"><Icon name="external" size={14} /></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
