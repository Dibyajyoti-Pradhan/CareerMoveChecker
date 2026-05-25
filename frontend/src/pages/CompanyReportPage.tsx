import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaSwitch, usePersona } from '../lib/persona';
import { api } from '../api/client';
import type { CompanyReport, Persona } from '../types';
import { crestInitials, formatDate, relativeTime, yearsSince } from '../lib/format';
import { cn } from '../lib/cn';

const PERSONA_QUESTION = {
  candidate: 'Will this company still be here next year?',
  freelancer: 'Will you actually get paid?',
  agency: 'Will you get your fee — and will your candidate survive?',
};

const PERSONA_SAVE_LINE = {
  candidate: 'Save for later. Come back when the offer letter arrives.',
  freelancer: 'Save to your client list. Re-check before each new SOW.',
  agency: 'Add to your watch list. Get alerts if anything changes.',
};

const PERSONA_SAVE_CTA = {
  candidate: 'Save for later',
  freelancer: 'Save client',
  agency: 'Add to watch list',
};

const TAB_IDS = ['flags', 'identity', 'people', 'finance', 'filings', 'cant'] as const;
type TabId = typeof TAB_IDS[number];

const TAB_LABELS: Record<TabId, string> = {
  flags: 'Risk flags',
  identity: 'Identity & address',
  people: 'Officers & ownership',
  finance: 'Charges & accounts',
  filings: 'Filing history',
  cant: "What we can't answer",
};

export function CompanyReportPage() {
  const { id = '' } = useParams();
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabId>('flags');
  const { persona } = usePersona();

  useEffect(() => {
    let stop = false;
    setLoading(true);
    api.getReport(id).then((r) => {
      if (!stop) {
        setReport(r);
        setLoading(false);
      }
    });
    return () => { stop = true; };
  }, [id]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const r = await api.refreshReport(id);
      setReport(r);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <div className="wrap" style={{ padding: 60 }}><div className="skel" style={{ height: 200 }} /></div>;
  if (!report) return (
    <div className="wrap" style={{ padding: 60 }}>
      <div className="state-card">
        <div className="glyph"><Icon name="search" size={20} /></div>
        <h3>Company not found</h3>
        <p>We couldn't find {id} at Companies House.</p>
        <Link to="/app/search" className="btn btn-primary">Back to search</Link>
      </div>
    </div>
  );

  const p = report.profile;
  const a = report.assessment;
  const years = yearsSince(p.incorporatedOn);
  const verdict = pickVerdict(a.riskLevel, persona);

  return (
    <div className="wrap">
      {/* ============ ZONE A ============ */}
      <section className="zone-a">
        <div className="id-card">
          <div className="left">
            <div className="crest">{crestInitials(p.companyName)}</div>
            <div>
              <h1>{p.companyName}</h1>
              <div className="badges">
                <span className={cn('badge', p.companyStatus === 'active' ? 'badge-ok' : 'badge-bad')}>
                  <span className="dot" />{p.companyStatus}
                </span>
                <span className="badge badge-neutral">{p.companyType}</span>
                <span className="badge badge-neutral mono">#{p.companyNumber}</span>
              </div>
            </div>
          </div>
          <div className="id-actions">
            <div className="refresh-line">Updated {relativeTime(report.dataFetchedAt)}</div>
            <div className="row">
              <button className="btn btn-secondary btn-sm" onClick={refresh} disabled={refreshing}>
                <Icon name="refresh" /> {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                <Icon name="print" /> Print
              </button>
              <Link className="btn btn-secondary btn-sm" to={`/app/compare?numbers=${p.companyNumber}`}>
                <Icon name="compare" /> Compare
              </Link>
            </div>
          </div>
        </div>

        <div className="id-meta">
          <div className="it"><span className="label">Company no.</span><span className="val">#{p.companyNumber}</span></div>
          <div className="it"><span className="label">Incorporated</span><span className="val">{formatDate(p.incorporatedOn)}{years !== null && ` · ${years}y`}</span></div>
          <div className="it"><span className="label">Type</span><span className="val">{p.companyType}</span></div>
          <div className="it"><span className="label">SIC</span><span className="val">{p.sicCodes?.join(', ') || '—'}</span></div>
        </div>

        <div className="switch-bar">
          <PersonaSwitch />
          <span className="cap">Same data — phrased for your decision.</span>
        </div>
      </section>

      {/* ============ ZONE B ============ */}
      <section className="zone-b">
        <div className="answer-card">
          <div className="answer-body">
            {persona === 'agency' && report.disqualificationCheck && (
              <div className={cn('disq-banner', report.disqualificationCheck.status === 'MATCH' && 'bad')}>
                <Icon name={report.disqualificationCheck.status === 'MATCH' ? 'alert' : 'shield'} />
                {report.disqualificationCheck.status === 'MATCH'
                  ? `⚠ ${report.disqualificationCheck.matches.length} disqualified officer(s) detected on the current board: ${report.disqualificationCheck.matches.map((m) => m.name).join(', ')}.`
                  : 'No disqualified officers detected on the current board.'}
              </div>
            )}

            <div className="answer-q">{PERSONA_QUESTION[persona]}</div>
            <h3 className="answer-h"><em>{verdict.headline}</em></h3>
            <p className="answer-verdict">{a.verdict}</p>

            <div className="ticks">
              {a.topReasons.slice(0, 4).map((r, i) => (
                <div key={i} className="tick">
                  <span className="m"><Icon name="check" size={12} /></span>
                  <span>{r}<span className="ev">Direct · Companies House</span></span>
                </div>
              ))}
            </div>

            <div className="answer-cta">
              <span className="save-line"><b>{PERSONA_SAVE_LINE[persona].split('.')[0]}.</b>{PERSONA_SAVE_LINE[persona].split('.').slice(1).join('.')}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => api.saveCompany({ companyNumber: p.companyNumber, companyName: p.companyName }).catch(() => {})}>
                <Icon name="star" /> {PERSONA_SAVE_CTA[persona]}
              </button>
              {persona === 'freelancer' && (
                <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard?.writeText(`${p.companyName}\n#${p.companyNumber}\n${p.registeredOffice?.line1 ?? ''}`)}>
                  <Icon name="copy" /> Copy invoice block
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ ZONE C ============ */}
      <section className="zone-c">
        <div className="tabs" style={{ marginTop: 32 }}>
          {TAB_IDS.map((t) => (
            <button key={t} className={cn('tab', tab === t && 'active')} onClick={() => setTab(t)}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === 'flags' && (
          <div className="flag-grid" style={{ marginTop: 18 }}>
            {a.flags.map((f) => (
              <div key={f.id} className="flag">
                <span className={cn('m', f.severity === 'CRITICAL' && 'bad', f.severity === 'WARNING' && 'warn', (f.severity === 'POSITIVE' || f.severity === 'INFO') && 'ok')}>
                  <Icon name={f.severity === 'CRITICAL' || f.severity === 'WARNING' ? 'warn' : 'check'} size={12} />
                </span>
                <div>
                  <div className="head-row">
                    <h4>{f.title}</h4>
                    <span className={cn('zone-tag', f.severity === 'POSITIVE' ? 'direct' : 'deduced')}>{f.severity}</span>
                  </div>
                  <p>{f.explanation}</p>
                  <div className="ev">Evidence: {f.evidence}</div>
                  <div className="reco">{f.recommendedAction}</div>
                </div>
              </div>
            ))}
            {a.flags.length === 0 && <div className="empty">No flags raised. Clean across all checked signals.</div>}
          </div>
        )}

        {tab === 'identity' && (
          <div className="data-card">
            <h3>Registered office</h3>
            <p style={{ color: 'var(--ink-2)' }}>
              {p.registeredOffice ? [p.registeredOffice.line1, p.registeredOffice.line2, p.registeredOffice.locality, p.registeredOffice.postalCode, p.registeredOffice.country].filter(Boolean).join(', ') : '—'}
            </p>
            <h3 style={{ marginTop: 24 }}>Accounts & filings</h3>
            <div className="acc-row"><span>Accounts status</span><span className={p.accountsOverdue ? 'mono' : 'mono'} style={{ color: p.accountsOverdue ? 'var(--bad)' : 'var(--ok)' }}>{p.accountsOverdue ? 'OVERDUE' : 'On time'}</span></div>
            <div className="acc-row"><span>Confirmation statement</span><span style={{ color: p.confirmationStatementOverdue ? 'var(--bad)' : 'var(--ok)' }}>{p.confirmationStatementOverdue ? 'OVERDUE' : 'On time'}</span></div>
            <div className="acc-row"><span>Last accounts made up to</span><span className="mono">{formatDate(p.lastAccountsMadeUpTo)}</span></div>
            <div className="acc-row"><span>Next accounts due</span><span className="mono">{formatDate(p.nextAccountsDue)}</span></div>
          </div>
        )}

        {tab === 'people' && (
          <div className="grid-2" style={{ marginTop: 18 }}>
            <div className="data-card">
              <h3>Officers ({report.officers.length})</h3>
              {report.officers.length === 0 && <div className="empty">No officers returned.</div>}
              {report.officers.map((o, i) => (
                <div key={i} className="person">
                  <div className="av">{crestInitials(o.name)}</div>
                  <div>
                    <div className="name">{o.name}</div>
                    <div className="role">{o.role}{o.occupation && ` · ${o.occupation}`}</div>
                  </div>
                  <div className="when">{o.resignedOn ? `Resigned ${formatDate(o.resignedOn)}` : `Active since ${formatDate(o.appointedOn)}`}</div>
                </div>
              ))}
            </div>
            <div className="data-card">
              <h3>Persons with significant control ({report.psc.length})</h3>
              {report.psc.length === 0 && <div className="empty">No PSC declared. Requires manual review.</div>}
              {report.psc.map((p, i) => (
                <div key={i} className="person">
                  <div className="av"><Icon name="user" /></div>
                  <div>
                    <div className="name">{p.name}</div>
                    <div className="role">{p.kind} · {p.natureOfControl.join(', ').replaceAll('-', ' ')}</div>
                  </div>
                  <div className="when">{formatDate(p.notifiedOn)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'finance' && (
          <div className="data-card">
            <h3>Charges ({report.charges.length})</h3>
            {report.charges.length === 0 && <div className="empty">No charges on file.</div>}
            {report.charges.map((c) => (
              <div key={c.id} className="acc-row">
                <div>
                  <div style={{ fontWeight: 500 }}>{c.description}</div>
                  <div className="small muted">{c.personsEntitled?.join(', ')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={cn('zone-tag', c.status === 'outstanding' ? 'deduced' : 'direct')}>{c.status}</span>
                  <div className="small muted">{formatDate(c.createdOn)}</div>
                </div>
              </div>
            ))}
            <h3 style={{ marginTop: 24 }}>Insolvency ({report.insolvency.length})</h3>
            {report.insolvency.length === 0 ? (
              <div className="empty" style={{ background: 'var(--ok-bg)', borderColor: 'var(--ok)', color: 'var(--ok)' }}>Insolvency register clean.</div>
            ) : (
              report.insolvency.map((i) => (
                <div key={i.caseNumber} className="acc-row">
                  <div><b>{i.type}</b> · {i.status}</div>
                  <div className="small muted">{formatDate(i.startedOn)}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'filings' && (
          <div className="data-card">
            <h3>Recent filings</h3>
            <div className="timeline">
              {report.filings.slice(0, 20).map((f) => (
                <div key={f.id} className={cn('tl-item', f.category === 'insolvency' ? 'bad' : f.category === 'accounts' ? 'ok' : '')}>
                  <div className="when">{formatDate(f.date)} · {f.type}</div>
                  <h5>{f.category.replace('-', ' ')}</h5>
                  <p>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'cant' && (
          <div className="cant-card">
            <h4>What we can't answer from Companies House</h4>
            <div className="cant-grid">
              {[
                { q: 'Will this be a nice place to work?', site: 'Glassdoor', url: 'https://www.glassdoor.co.uk' },
                { q: 'Will the salary keep up with the market?', site: 'Levels.fyi', url: 'https://www.levels.fyi' },
                { q: 'Are layoffs imminent?', site: 'Layoffs.fyi', url: 'https://layoffs.fyi' },
                { q: 'Do they pay invoices on time?', site: 'Trustpilot / trade references', url: 'https://uk.trustpilot.com' },
                { q: 'What\'s the runway?', site: 'News / accounts XBRL', url: 'https://news.google.com' },
              ].map((c) => (
                <div key={c.q} className="cant-row">
                  <span className="q">{c.q}</span>
                  <a href={c.url} target="_blank" rel="noreferrer">Try {c.site} <Icon name="external" size={12} /></a>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function pickVerdict(level: string, persona: Persona) {
  if (level === 'CRITICAL') return { headline: 'No — serious risk.', tone: 'no' as const };
  if (level === 'HIGH') return { headline: 'Caution — verify before proceeding.', tone: 'maybe' as const };
  if (level === 'MODERATE') return { headline: 'Probably — but check.', tone: 'maybe' as const };
  return {
    headline: persona === 'candidate' ? 'Probably yes.' : persona === 'freelancer' ? 'Probably yes — strong signals.' : 'Probably yes on both.',
    tone: 'yes' as const,
  };
}
