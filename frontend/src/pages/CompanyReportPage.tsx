import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { api } from '../api/client';
import type { CompanyReport } from '../types';
import { crestInitials, formatDate, relativeTime, yearsSince } from '../lib/format';
import { cn } from '../lib/cn';
import { REPORT_QUESTION, REPORT_SAVE_LINE, REPORT_SAVE_CTA } from '../lib/persona-copy';
import { useSeo } from '../lib/seo';
import { ScoreGauge } from '../components/ScoreGauge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TAB_IDS = ['flags', 'identity', 'people', 'finance', 'filings'] as const;
type TabId = typeof TAB_IDS[number];

const TAB_LABELS: Record<TabId, string> = {
  flags: 'Risk flags',
  identity: 'Identity & address',
  people: 'Officers & ownership',
  finance: 'Charges & accounts',
  filings: 'Filing history',
};

export function CompanyReportPage() {
  const { id = '' } = useParams();
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabId>('flags');
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'bad' } | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'submitting' | 'done'>('idle');

  const companyName = report?.profile.companyName ?? 'Company report';
  const companyNumber = report?.profile.companyNumber ?? id;

  useSeo({
    title: `${companyName} — CareerMove`,
    description: `Plain-English trust check on ${companyName} (#${companyNumber}) using Companies House data.`,
    canonical: `https://careermove.uk/c/${companyNumber}`,
  });

  // Schema.org JSON-LD — inject on load, remove on unmount.
  useEffect(() => {
    if (!report) return;
    const p = report.profile;
    const address = p.registeredOffice
      ? [p.registeredOffice.line1, p.registeredOffice.line2, p.registeredOffice.locality, p.registeredOffice.postalCode, p.registeredOffice.country].filter(Boolean).join(', ')
      : undefined;
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: p.companyName,
      identifier: p.companyNumber,
      ...(address ? { address } : {}),
      ...(p.incorporatedOn ? { foundingDate: p.incorporatedOn } : {}),
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'report-ld-json';
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
    return () => {
      document.getElementById('report-ld-json')?.remove();
    };
  }, [report]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let stop = false;
    setLoading(true);
    setError(false);
    api.getReport(id).then((r) => {
      if (!stop) {
        setReport(r);
        setLoading(false);
      }
    }).catch((err: Error) => {
      if (!stop) {
        if (err.message.includes('404')) {
          setReport(null);
        } else {
          setError(true);
        }
        setLoading(false);
      }
    });
    return () => { stop = true; };
  }, [id]);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIdx = TAB_IDS.indexOf(tab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (currentIdx + 1) % TAB_IDS.length;
      setTab(TAB_IDS[nextIdx]);
      document.getElementById(`tab-${TAB_IDS[nextIdx]}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (currentIdx - 1 + TAB_IDS.length) % TAB_IDS.length;
      setTab(TAB_IDS[prevIdx]);
      document.getElementById(`tab-${TAB_IDS[prevIdx]}`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setTab(TAB_IDS[0]);
      document.getElementById(`tab-${TAB_IDS[0]}`)?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setTab(TAB_IDS[TAB_IDS.length - 1]);
      document.getElementById(`tab-${TAB_IDS[TAB_IDS.length - 1]}`)?.focus();
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      const r = await api.refreshReport(id);
      setReport(r);
      setToast({ text: 'Report refreshed from Companies House', tone: 'ok' });
    } catch {
      setToast({ text: 'Refresh failed — try again', tone: 'bad' });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <div className="wrap" style={{ padding: 60 }}><div className="skel" style={{ height: 200 }} /></div>;
  if (error) return (
    <div className="wrap" style={{ padding: 60 }}>
      <div className="state-card danger">
        <div className="glyph" style={{ background: 'var(--bad-bg)', color: 'var(--bad)' }}>
          <Icon name="alert" size={20} />
        </div>
        <h3>Report unavailable</h3>
        <p>We couldn't load the report for {id}. This may be a temporary issue with Companies House data.</p>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { setLoading(true); setError(false); api.getReport(id).then(r => { setReport(r); setLoading(false); }).catch(() => { setError(true); setLoading(false); }); }}
        >
          <Icon name="refresh" /> Try again
        </button>
      </div>
    </div>
  );
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
  const verdict = pickVerdict(a.riskLevel);

  const canonicalUrl = `https://careermove.uk/c/${p.companyNumber}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(canonicalUrl)
      .then(() => setToast({ text: 'Link copied to clipboard', tone: 'ok' }))
      .catch(() => setToast({ text: 'Could not copy — try again', tone: 'bad' }));
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
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopyLink}
                aria-label="Copy report link to clipboard"
              >
                <Icon name="copy" /> Copy link
              </button>
              <a
                className="btn btn-secondary btn-sm"
                href={`https://find-and-update.company-information.service.gov.uk/company/${p.companyNumber}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Open ${report.profile.companyName} on Companies House (opens in new tab)`}
              >
                <Icon name="external" /> Companies House
              </a>
            </div>
          </div>
        </div>

        <div className="id-meta">
          <div className="it"><span className="label">Company no.</span><span className="val">#{p.companyNumber}</span></div>
          <div className="it"><span className="label">Incorporated</span><span className="val">{formatDate(p.incorporatedOn)}{years !== null && ` · ${years}y`}</span></div>
          <div className="it"><span className="label">Type</span><span className="val">{p.companyType}</span></div>
          <div className="it"><span className="label">SIC</span><span className="val">{p.sicCodes?.join(', ') || '—'}</span></div>
        </div>
      </section>

      {/* ============ ZONE B ============ */}
      <section className="zone-b">
        <div className="answer-card">
          <div className="answer-body">
            {report.disqualificationCheck && (
              <div className={cn('disq-banner', report.disqualificationCheck.status === 'MATCH' && 'bad')}>
                <Icon name={report.disqualificationCheck.status === 'MATCH' ? 'alert' : 'shield'} />
                {report.disqualificationCheck.status === 'MATCH'
                  ? `⚠ ${report.disqualificationCheck.matches.length} disqualified officer(s) detected on the current board: ${report.disqualificationCheck.matches.map((m) => m.name).join(', ')}.`
                  : 'No disqualified officers detected on the current board.'}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <ScoreGauge score={a.score} confidence={a.confidence} />
            </div>

            <div className="answer-q">{REPORT_QUESTION}</div>
            <h3 className="answer-h"><em>{verdict.headline}</em></h3>
            <p className="answer-verdict">{a.verdict}</p>

            <div className="ticks">
              {a.topReasons.slice(0, 4).map((r, i) => {
                const src = classifyReason(r);
                return (
                  <div key={i} className="tick">
                    <span className="m"><Icon name="check" size={12} /></span>
                    <span>{r}<span className="ev">{src === 'direct' ? 'Direct · Companies House' : 'Deduced'}</span></span>
                  </div>
                );
              })}
            </div>

            <div className="answer-cta">
              <span className="save-line"><b>{REPORT_SAVE_LINE.split('.')[0]}.</b>{REPORT_SAVE_LINE.split('.').slice(1).join('.')}</span>
              <button className="btn btn-secondary btn-sm" onClick={async () => {
                try {
                  await api.saveCompany({ companyNumber: p.companyNumber, companyName: p.companyName });
                  setToast({ text: `Saved ${p.companyName}`, tone: 'ok' });
                } catch {
                  setToast({ text: 'Could not save', tone: 'bad' });
                }
              }}>
                <Icon name="star" /> {REPORT_SAVE_CTA}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopyLink}
                aria-label="Copy report link to clipboard"
              >
                <Icon name="copy" /> Copy link
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const summary = `${report.profile.companyName} · ${p.companyNumber} · Risk level: ${a.riskLevel} · Score: ${a.score}/100 · ${a.verdict} · ${canonicalUrl}`;
                  navigator.clipboard?.writeText(summary)
                    .then(() => setToast({ text: 'Summary copied to clipboard', tone: 'ok' }))
                    .catch(() => setToast({ text: 'Could not copy — try again', tone: 'bad' }));
                }}
                aria-label="Copy shareable summary to clipboard"
              >
                <Icon name="external" /> Share summary
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ZONE C ============ */}
      <section className="zone-c">
        <div className="tabs" style={{ marginTop: 32 }} role="tablist" aria-label="Company report sections" onKeyDown={handleTabKeyDown}>
          {TAB_IDS.map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              className={cn('tab', tab === t && 'active')}
              onClick={() => setTab(t)}
              role="tab"
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <div id="panel-flags" role="tabpanel" aria-labelledby="tab-flags" tabIndex={0} hidden={tab !== 'flags'}>
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
            {a.recommendedActions && a.recommendedActions.length > 0 && (
              <section aria-label="Recommended next steps" style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--mono)', marginBottom: 12 }}>
                  Recommended next steps
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {a.recommendedActions.map((ra, i) => (
                    <div key={ra.id} style={{ background: 'var(--canvas)', border: '1px solid var(--hair)', borderLeft: '3px solid var(--brand)', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--brand)', fontWeight: 600, paddingTop: 2, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{ra.title}</div>
                          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{ra.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </div>

        <div id="panel-identity" role="tabpanel" aria-labelledby="tab-identity" tabIndex={0} hidden={tab !== 'identity'}>
          <div className="data-card">
            <h3>Registered office</h3>
            <p style={{ color: 'var(--ink-2)' }}>
              {p.registeredOffice ? [p.registeredOffice.line1, p.registeredOffice.line2, p.registeredOffice.locality, p.registeredOffice.postalCode, p.registeredOffice.country].filter(Boolean).join(', ') : '—'}
            </p>
            {p.registeredOffice?.postalCode && (
              <AddressMap
                postcode={p.registeredOffice.postalCode}
                address={[p.registeredOffice.line1, p.registeredOffice.line2, p.registeredOffice.locality, p.registeredOffice.postalCode].filter(Boolean).join(', ')}
              />
            )}
            <h3 style={{ marginTop: 24 }}>Accounts & filings</h3>
            <div className="acc-row"><span>Accounts status</span><span className={p.accountsOverdue ? 'mono' : 'mono'} style={{ color: p.accountsOverdue ? 'var(--bad)' : 'var(--ok)' }}>{p.accountsOverdue ? 'OVERDUE' : 'On time'}</span></div>
            <div className="acc-row"><span>Confirmation statement</span><span style={{ color: p.confirmationStatementOverdue ? 'var(--bad)' : 'var(--ok)' }}>{p.confirmationStatementOverdue ? 'OVERDUE' : 'On time'}</span></div>
            <div className="acc-row"><span>Last accounts made up to</span><span className="mono">{formatDate(p.lastAccountsMadeUpTo)}</span></div>
            <div className="acc-row"><span>Next accounts due</span><span className="mono">{formatDate(p.nextAccountsDue)}</span></div>
          </div>
        </div>

        <div id="panel-people" role="tabpanel" aria-labelledby="tab-people" tabIndex={0} hidden={tab !== 'people'}>
        {(() => {
          const officersWithDissolvedHistory = report.officers.filter(o =>
            o.previousCompanies?.some(pc => pc.status === 'dissolved' || pc.status === 'liquidation')
          );
          const showDirectorSummary = officersWithDissolvedHistory.length > 0 && report.officers.some(o => o.previousCompanies);
          return (
          <div className="grid-2" style={{ marginTop: 18 }}>
            <div className="data-card">
              {showDirectorSummary && (
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                  {officersWithDissolvedHistory.length} of {report.officers.length} director{report.officers.length !== 1 ? 's' : ''} have been associated with dissolved companies.
                </p>
              )}
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
                  {o.previousCompanies && o.previousCompanies.length > 0 && (() => {
                    const hasProblematic = o.previousCompanies!.some(
                      pc => pc.status === 'dissolved' || pc.status === 'liquidation'
                    );
                    return (
                      <div style={{ gridColumn: '1 / -1', paddingLeft: 50, marginTop: 8 }}>
                        {hasProblematic ? (
                          <>
                            <span className="zone-tag deduced" aria-label="Previously associated with dissolved companies">
                              ⚠ Previously associated with dissolved companies
                            </span>
                            <details style={{ marginTop: 10 }}>
                              <summary
                                style={{
                                  cursor: 'pointer',
                                  fontSize: 13,
                                  color: 'var(--brand)',
                                  fontWeight: 500,
                                  listStyle: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                                aria-label={`Toggle director history for ${o.name}`}
                              >
                                <span className="zone-tag deduced" style={{ fontSize: 10, padding: '2px 6px' }}>Deduced</span>
                                Director history
                                <Icon name="chevron-right" size={12} />
                              </summary>
                              <div style={{ marginTop: 10 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid var(--hair)' }}>
                                      <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: 'var(--ink-2)', fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company</th>
                                      <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: 'var(--ink-2)', fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                                      <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: 'var(--ink-2)', fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ceased</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {o.previousCompanies!.map((pc, j) => (
                                      <tr key={j} style={{ borderBottom: '1px solid var(--hair)' }}>
                                        <td style={{ padding: '8px 8px' }}>
                                          <a
                                            href={`https://find-and-update.company-information.service.gov.uk/company/${pc.number}`}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            style={{ color: 'var(--brand)', textDecoration: 'none' }}
                                            aria-label={`Open ${pc.name} on Companies House (opens in new tab)`}
                                          >
                                            {pc.name}
                                          </a>
                                        </td>
                                        <td style={{ padding: '8px 8px' }}>
                                          <span
                                            className={
                                              pc.status === 'active'
                                                ? 'zone-tag direct'
                                                : pc.status === 'liquidation'
                                                ? 'zone-tag deduced'
                                                : 'zone-tag not'
                                            }
                                            aria-label={`Status: ${pc.status}`}
                                          >
                                            {pc.status}
                                          </span>
                                        </td>
                                        <td style={{ padding: '8px 8px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
                                          {pc.ceasedOn ? formatDate(pc.ceasedOn) : '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <p style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                                  Director history is drawn from public Companies House records and may not be complete. This is not a credit check.
                                </p>
                              </div>
                            </details>
                          </>
                        ) : (
                          <span className="zone-tag direct" aria-label="No dissolved company associations">
                            ✓ No dissolved company associations
                          </span>
                        )}
                      </div>
                    );
                  })()}
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
          );
        })()}
        </div>

        <div id="panel-finance" role="tabpanel" aria-labelledby="tab-finance" tabIndex={0} hidden={tab !== 'finance'}>
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
        </div>

        <div id="panel-filings" role="tabpanel" aria-labelledby="tab-filings" tabIndex={0} hidden={tab !== 'filings'}>
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
        </div>

      </section>

      {/* Feedback */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', borderTop: '1px solid var(--hair)', marginTop: 32 }}
        aria-label="Report feedback"
      >
        {feedbackState === 'done' ? (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>Thanks for your feedback.</p>
        ) : (
          <>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Was this report useful?</span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={feedbackState === 'submitting'}
              aria-label="Yes, this report was useful"
              onClick={async () => {
                setFeedbackState('submitting');
                try {
                  await api.submitFeedback({ companyNumber, rating: 1, useCase: 'report-page' });
                  setFeedbackState('done');
                  setToast({ text: 'Thanks for your feedback', tone: 'ok' });
                } catch {
                  setFeedbackState('idle');
                  setToast({ text: 'Could not submit feedback — try again', tone: 'bad' });
                }
              }}
            >👍</button>
            <button
              className="btn btn-ghost btn-sm"
              disabled={feedbackState === 'submitting'}
              aria-label="No, this report was not useful"
              onClick={async () => {
                setFeedbackState('submitting');
                try {
                  await api.submitFeedback({ companyNumber, rating: 0, useCase: 'report-page' });
                  setFeedbackState('done');
                  setToast({ text: 'Thanks for your feedback', tone: 'ok' });
                } catch {
                  setFeedbackState('idle');
                  setToast({ text: 'Could not submit feedback — try again', tone: 'bad' });
                }
              }}
            >👎</button>
          </>
        )}
      </div>
    </div>
  );
}

// Classify a topReasons string as a direct Companies House fact or a deduced inference.
// Conservative rule: anything that is not unambiguously a raw CH field is 'deduced'.
const DIRECT_PATTERNS = [
  /\bactive\b/i,
  /\bstatus\b/i,
  /\bregistered (office|address)\b/i,
  /\baccounts (overdue|due|filed|on time)\b/i,
  /\bconfirmation statement\b/i,
  /\bincorporated\b/i,
  /\bcompany number\b/i,
  /\bdissolved\b/i,
  /\bliquidation\b/i,
];

function classifyReason(reason: string): 'direct' | 'deduced' {
  return DIRECT_PATTERNS.some((p) => p.test(reason)) ? 'direct' : 'deduced';
}

function pickVerdict(level: string) {
  if (level === 'CRITICAL') return { headline: 'No — serious risk.', tone: 'no' as const };
  if (level === 'HIGH') return { headline: 'Caution — verify before proceeding.', tone: 'maybe' as const };
  if (level === 'MODERATE') return { headline: 'Caution — verify before proceeding.', tone: 'maybe' as const };
  return { headline: 'Probably yes.', tone: 'yes' as const };
}

function AddressMap({ postcode, address }: { postcode: string; address: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stop = false;
    setCoords(null);
    setFailed(false);
    const clean = postcode.replace(/\s+/g, '');
    fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (!stop) setCoords({ lat: d.result.latitude, lon: d.result.longitude }); })
      .catch(() => { if (!stop) setFailed(true); });
    return () => { stop = true; };
  }, [postcode]);

  useEffect(() => {
    if (!coords || !containerRef.current) return;
    const map = L.map(containerRef.current, {
      center: [coords.lat, coords.lon],
      zoom: 17,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);
    const pin = L.divIcon({
      className: 'cm-pin',
      html: '<span class="cm-pin-dot"></span><span class="cm-pin-pulse"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([coords.lat, coords.lon], { icon: pin }).addTo(map);
    setTimeout(() => map.invalidateSize(), 50);
    return () => { map.remove(); };
  }, [coords]);

  if (failed) return null;
  if (!coords) return <div className="skel" style={{ height: 320, marginTop: 12, borderRadius: 10 }} />;

  const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${coords.lat},${coords.lon}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=18/${coords.lat}/${coords.lon}`;
  const shortAddr = address.length > 60 ? address.slice(0, 60).trim() + '…' : address;

  return (
    <div className="addr-map">
      <div ref={containerRef} className="addr-map-canvas" />
      <div className="addr-map-card">
        <div className="addr-map-card-text">
          <div className="addr-map-card-pc">{postcode}</div>
          <div className="addr-map-card-addr">{shortAddr}</div>
        </div>
        <a
          href={osmUrl}
          target="_blank"
          rel="noreferrer"
          className="addr-map-card-link"
          aria-label="Open in OpenStreetMap"
          title="Open in OpenStreetMap"
        >
          <Icon name="external" size={14} />
        </a>
      </div>
      <a
        href={streetViewUrl}
        target="_blank"
        rel="noreferrer"
        className="addr-map-sv"
        title="Open Street View"
      >
        Street View →
      </a>
    </div>
  );
}
