import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaSwitch, usePersona } from '../lib/persona';
import { api } from '../api/client';
import type { CompanySearchHit } from '../types';
import { crestInitials, formatDate, relativeTime } from '../lib/format';

const TRY_CHIPS = ['Monzo Bank Limited', 'Deliveroo Plc', 'Greggs Plc', '09446231'];

const PERSONA_H1 = {
  candidate: { plain: 'Check the ', em: 'employer', after: ' before you sign.' },
  freelancer: { plain: 'Check the ', em: 'client', after: ' before you invoice.' },
  agency: { plain: 'Check the ', em: 'client', after: ' before your candidate goes.' },
};

const PERSONA_SUB = {
  candidate: 'Type a company name or 8-digit Companies House number. UK companies only.',
  freelancer: 'Type a client name or 8-digit number. Run unlimited checks on Pro.',
  agency: 'Type a client name or 8-digit number. Use Bulk check for 50 at once.',
};

const PERSONA_RAIL_Q = {
  candidate: 'Will this company still be here next year?',
  freelancer: 'Will you actually get paid?',
  agency: 'Will you get your fee — and will your candidate survive?',
};

const PERSONA_RAIL_BULLETS = {
  candidate: ['Is the company still alive?', 'Are they likely to last 12 months?', 'Is the founder still here?', 'Are people running for the exits?'],
  freelancer: ['Are they still in business?', 'Have they gone bust before?', 'Has the director killed companies?', 'Are they keeping up filings?'],
  agency: ['Banned officers on the board?', 'Will the placement fee clear?', 'Stable leadership?', 'Real office or just a mailbox?'],
};

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [hits, setHits] = useState<CompanySearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(initialQ));
  const { persona } = usePersona();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialQ) {
      setHits([]);
      setSearched(false);
      return;
    }
    setLoading(true);
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
        setLoading(false);
      }
    });
    return () => { stop = true; };
  }, [initialQ]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setParams(q.trim() ? { q: q.trim() } : {});
  };

  const h1 = PERSONA_H1[persona];
  const noResults = searched && !loading && hits.length === 0 && initialQ;

  return (
    <>
      <section className="command">
        <div className="wrap">
          <PersonaSwitch />
          <h1>{h1.plain}<em>{h1.em}</em>{h1.after}</h1>
          <p className="sub">{PERSONA_SUB[persona]}</p>

          <form className="search-row search-shell" onSubmit={submit}>
            <div className="input-prefix">
              <span className="pf"><Icon name="search" size={18} /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Company name or 8-digit number" autoFocus />
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
                <div className="recent-mini">
                  <h5>Try one of these</h5>
                  {TRY_CHIPS.map((c) => (
                    <button key={c} className="rrow" onClick={() => { setQ(c); setParams({ q: c }); }} style={{ background: 'transparent', border: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                      <span>{c}</span>
                      <Icon name="arrow-right" size={12} />
                    </button>
                  ))}
                </div>
                <div className="recent-mini">
                  <h5>Why are you checking today?</h5>
                  <div className="rrow" data-pf="candidate"><span>"I just got an offer letter"</span></div>
                  <div className="rrow" data-pf="candidate"><span>"A recruiter cold-emailed me"</span></div>
                  <div className="rrow" data-pf="candidate"><span>"I'm relocating for the role"</span></div>
                  <div className="rrow" data-pf="freelancer"><span>"New client signing an SOW"</span></div>
                  <div className="rrow" data-pf="freelancer"><span>"A payment is late"</span></div>
                  <div className="rrow" data-pf="freelancer"><span>"A friend referred them"</span></div>
                  <div className="rrow" data-pf="agency"><span>"New client briefs a role"</span></div>
                  <div className="rrow" data-pf="agency"><span>"Candidate asked is this safe?"</span></div>
                  <div className="rrow" data-pf="agency"><span>"Weekly pipeline hygiene"</span></div>
                </div>
              </div>
            )}

            {loading && (
              <div className="result-list">
                {[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 92 }} />)}
              </div>
            )}

            {noResults && (
              <div className="state-card">
                <div className="glyph"><Icon name="search" size={20} /></div>
                <h3>No matches for "{initialQ}"</h3>
                <p>Check the spelling, or paste the 8-character company number.</p>
                <div className="suggestions">
                  {TRY_CHIPS.map((c) => (
                    <button key={c} className="chip" onClick={() => { setQ(c); setParams({ q: c }); }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {!loading && hits.length > 0 && (
              <>
                <div className="q-banner">
                  <h3>{PERSONA_RAIL_Q[persona]}</h3>
                  <span className="pill">{hits.length} results</span>
                </div>
                <div className="result-list">
                  {hits.map((h) => (
                    <ResultRow key={h.companyNumber} hit={h} q={initialQ} onOpen={() => navigate(`/app/company/${h.companyNumber}`)} />
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="rail">
            <div className="rail-card">
              <h5>What you'll learn</h5>
              <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 500, margin: '0 0 10px' }}>"{PERSONA_RAIL_Q[persona]}"</p>
              <ul>
                {PERSONA_RAIL_BULLETS[persona].map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
            <div className="rail-card quota-card" data-pf="candidate">
              <h5>Free tier</h5>
              <div className="bar"><i style={{ width: '40%' }} /></div>
              <div className="meta">3 of 5 free checks remaining this month</div>
              <Link className="btn btn-primary btn-sm" to="/pricing" style={{ marginTop: 10, width: '100%' }}>Upgrade to Pro</Link>
            </div>
            <div className="rail-card quota-card" data-pf="freelancer">
              <h5>Pro</h5>
              <div className="meta">Unlimited checks · 12 saved clients</div>
            </div>
            <div className="rail-card quota-card" data-pf="agency">
              <h5>Agency</h5>
              <div className="meta">Unlimited checks · 412 watched clients · 8 team seats</div>
              <Link className="btn btn-primary btn-sm" to="/app/bulk" style={{ marginTop: 10, width: '100%' }}>Bulk check 50 →</Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function ResultRow({ hit, q, onOpen }: { hit: CompanySearchHit; q: string; onOpen: () => void }) {
  const { persona } = usePersona();
  const verdict = pickVerdict(hit);
  const isClickable = true;
  return (
    <div className="result" onClick={isClickable ? onOpen : undefined} style={{ cursor: 'pointer' }}>
      <div className="crest">{crestInitials(hit.companyName)}</div>
      <div className="body">
        <h4>{highlightMark(hit.companyName, q)}</h4>
        <div className="meta">
          <span className="mono">#{hit.companyNumber}</span>
          <span className="pip" />
          <span style={{ textTransform: 'capitalize' }}>{hit.companyStatus}</span>
          {hit.incorporatedOn && (<><span className="pip" /><span>Incorporated {formatDate(hit.incorporatedOn)}</span></>)}
          <span className="pip" /><span>{hit.companyType}</span>
        </div>
        <div className={`pverdict ${verdict.tone}`}>
          <span className="v-pill">{verdict.pill[persona]}</span>
          <span className="ans">{verdict.ans[persona]}</span>
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

function pickVerdict(hit: CompanySearchHit) {
  const status = (hit.companyStatus || '').toLowerCase();
  if (status === 'dissolved') {
    return {
      tone: 'no',
      pill: { candidate: 'Avoid', freelancer: 'Avoid', agency: 'Avoid' } as const,
      ans: {
        candidate: 'Company is dissolved — not a viable employer.',
        freelancer: 'Company is dissolved — do not invoice.',
        agency: 'Dissolved — do not contract or place.',
      } as const,
    };
  }
  if (status.includes('liquidation') || status.includes('administration') || status.includes('receivership')) {
    return {
      tone: 'no',
      pill: { candidate: 'Avoid', freelancer: 'Avoid', agency: 'Avoid' } as const,
      ans: {
        candidate: 'In wind-up — high risk of disappearing.',
        freelancer: 'In wind-up — payment unlikely.',
        agency: 'In wind-up — fee at serious risk.',
      } as const,
    };
  }
  if (status === 'active') {
    return {
      tone: 'yes',
      pill: { candidate: 'Likely OK', freelancer: 'Likely OK', agency: 'Likely OK' } as const,
      ans: {
        candidate: 'Active. Open the full report for the full picture.',
        freelancer: 'Active. Open report before agreeing terms.',
        agency: 'Active. Open report for disqualified-officer check.',
      } as const,
    };
  }
  return {
    tone: 'dunno',
    pill: { candidate: 'Unclear', freelancer: 'Unclear', agency: 'Unclear' } as const,
    ans: { candidate: 'Open report.', freelancer: 'Open report.', agency: 'Open report.' } as const,
  };
}
