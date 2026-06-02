import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { api } from '../api/client';
import type { CompanySearchHit } from '../types';
import { crestInitials, extractCompanyNumber, formatDate, relativeTime } from '../lib/format';
import { SEARCH_H1, SEARCH_SUB, SEARCH_RAIL_Q, SEARCH_RAIL_BULLETS } from '../lib/persona-copy';
import { useSeo } from '../lib/seo';

const TRY_CHIPS = ['Monzo Bank Limited', 'Deliveroo Plc', 'Greggs Plc', '09446231'];

const RECENT_KEY = 'cmc.recent';
const MAX_RECENT = 5;
function getRecentSearches(): { name: string; number: string }[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function addRecentSearch(name: string, number: string) {
  const cur = getRecentSearches().filter((r) => r.number !== number);
  localStorage.setItem(RECENT_KEY, JSON.stringify([{ name, number }, ...cur].slice(0, MAX_RECENT)));
}

export function SearchPage() {
  useSeo({
    title: 'Search UK companies — CareerMove',
    description: 'Find any UK company and run a plain-English trust check in 60 seconds.',
  });

  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [hits, setHits] = useState<CompanySearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(Boolean(initialQ));
  const [recent, setRecent] = useState(() => getRecentSearches());
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialQ) {
      setHits([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setError(false);
    setSearched(true);
    let stop = false;
    api.searchCompanies(initialQ).then((r) => {
      if (!stop) {
        setHits(r);
        setLoading(false);
      }
    }).catch(() => {
      if (!stop) {
        setHits([]);
        setError(true);
        setLoading(false);
      }
    });
    return () => { stop = true; };
  }, [initialQ]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const companyNumber = extractCompanyNumber(q);
    if (companyNumber) {
      navigate(`/app/company/${companyNumber}`);
      return;
    }
    setParams(q.trim() ? { q: q.trim() } : {});
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    const companyNumber = extractCompanyNumber(pasted);
    if (companyNumber) {
      e.preventDefault();
      setQ(companyNumber);
      navigate(`/app/company/${companyNumber}`);
    }
  };

  const noResults = searched && !loading && !error && hits.length === 0 && initialQ;

  return (
    <>
      <section className="command">
        <div className="wrap">
          <h1>{SEARCH_H1}</h1>
          <p className="sub">{SEARCH_SUB}</p>

          <form className="search-row search-shell" onSubmit={submit}>
            <div className="input-prefix">
              <span className="pf"><Icon name="search" size={18} /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} onPaste={handlePaste} placeholder="Company name, 8-digit number, or paste a Companies House URL" autoFocus />
            </div>
            <button className="btn btn-primary btn-lg" type="submit">Search</button>
          </form>

          <div className="hints">
            <span><kbd>↵</kbd> open</span>
            <span><kbd>⌘K</kbd> jump to search</span>
            <span>UK companies · live Companies House data</span>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="search-grid">
          <div>
            {!searched && (
              <div className="idle-grid">
                {recent.length > 0 && (
                  <div className="recent-mini" style={{ marginBottom: 16 }}>
                    <h5>Recent searches</h5>
                    {recent.map((r) => (
                      <button key={r.number} className="rrow" onClick={() => navigate(`/app/company/${r.number}`)} style={{ background: 'transparent', border: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }} aria-label={`View report for ${r.name}`}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>#{r.number}</div>
                        </div>
                        <Icon name="arrow-right" size={12} />
                      </button>
                    ))}
                  </div>
                )}
                <div className="recent-mini">
                  <h5>Try one of these</h5>
                  {TRY_CHIPS.map((c) => (
                    <button key={c} className="rrow" onClick={() => { setQ(c); setParams({ q: c }); }} style={{ background: 'transparent', border: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                      <span>{c}</span>
                      <Icon name="arrow-right" size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="result-list">
                {[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 92 }} />)}
              </div>
            )}

            {error && !loading && (
              <div className="state-card danger">
                <div className="glyph" style={{ background: 'var(--bad-bg)', color: 'var(--bad)' }}>
                  <Icon name="alert" size={20} />
                </div>
                <h3>Search failed</h3>
                <p>We couldn't reach Companies House right now. Check your connection and try again.</p>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setError(false); setParams(initialQ ? { q: initialQ } : {}); }}
                >
                  <Icon name="refresh" /> Try again
                </button>
              </div>
            )}

            {noResults && (
              <>
                <div className="state-card">
                  <div className="glyph"><Icon name="search" size={20} /></div>
                  <h3>No companies found for '{initialQ}'</h3>
                  <ul style={{ textAlign: 'left', margin: '12px 0', paddingLeft: 20, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                    <li>Try the 8-digit company number (e.g. <span style={{ fontFamily: 'var(--mono)' }}>09446231</span>) for an exact match.</li>
                    <li>New companies can take up to 24 hours to appear after incorporation.</li>
                  </ul>
                  <a
                    className="btn btn-secondary btn-sm"
                    href={`https://find-and-update.company-information.service.gov.uk/company-overview?lang=en&q=${encodeURIComponent(initialQ)}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Search on Companies House <Icon name="external" />
                  </a>
                </div>
                <div className="suggestions" style={{ marginTop: 16 }}>
                  {TRY_CHIPS.map((c) => (
                    <button key={c} className="chip" onClick={() => { setQ(c); setParams({ q: c }); }}>{c}</button>
                  ))}
                </div>
              </>
            )}

            {!loading && hits.length > 0 && (
              <>
                <div className="q-banner">
                  <h3>{SEARCH_RAIL_Q}</h3>
                  <span className="pill">{hits.length} results</span>
                </div>
                <div className="result-list">
                  {hits.map((h) => (
                    <ResultRow key={h.companyNumber} hit={h} q={initialQ} onOpen={() => {
                      addRecentSearch(h.companyName, h.companyNumber);
                      setRecent(getRecentSearches());
                      navigate(`/app/company/${h.companyNumber}`);
                    }} />
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="rail">
            <div className="rail-card">
              <h5>What you'll learn</h5>
              <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 500, margin: '0 0 10px' }}>"{SEARCH_RAIL_Q}"</p>
              <ul>
                {SEARCH_RAIL_BULLETS.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
            <div className="rail-card quota-card">
              <h5>Bulk check</h5>
              <div className="meta">Run up to 50 client checks at once.</div>
              <Link className="btn btn-primary btn-sm" to="/app/bulk" style={{ marginTop: 10, width: '100%' }}>Bulk check 50 →</Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function ResultRow({ hit, q, onOpen }: { hit: CompanySearchHit; q: string; onOpen: () => void }) {
  const statusTone = statusBadgeTone(hit.companyStatus);
  return (
    <div className="result" onClick={onOpen} style={{ cursor: 'pointer' }}>
      <div className="crest">{crestInitials(hit.companyName)}</div>
      <div className="body">
        <h4>{highlightMark(hit.companyName, q)}</h4>
        <div className="meta">
          <span className="mono">#{hit.companyNumber}</span>
          <span className="pip" />
          <span className={`badge badge-${statusTone}`} style={{ textTransform: 'capitalize' }}>{hit.companyStatus}</span>
          {hit.incorporatedOn && (<><span className="pip" /><span>Incorporated {formatDate(hit.incorporatedOn)}</span></>)}
          <span className="pip" /><span>{hit.companyType}</span>
        </div>
      </div>
      <div className="right">
        <span className="cached">{relativeTime(new Date(Date.now() - 60 * 60 * 1000).toISOString())}</span>
        <Link to={`/app/company/${hit.companyNumber}`} className="btn btn-secondary btn-sm" onClick={(e) => e.stopPropagation()}>
          Open report <Icon name="arrow-right" />
        </Link>
      </div>
    </div>
  );
}

function highlightMark(text: string, q: string) {
  if (!q.trim()) return text;
  const idx = text.toLowerCase().indexOf(q.trim().toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

// Returns a CSS badge tone based solely on the CH status string — a direct fact, not an engine verdict.
function statusBadgeTone(status: string): 'ok' | 'bad' | 'neutral' {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'ok';
  if (s === 'dissolved' || s.includes('liquidation') || s.includes('administration') || s.includes('receivership')) return 'bad';
  return 'neutral';
}
