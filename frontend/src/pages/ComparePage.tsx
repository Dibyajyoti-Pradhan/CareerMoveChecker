import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PersonaSwitch, usePersona } from '../lib/persona';
import { api } from '../api/client';
import type { CompanyReport } from '../types';
import { crestInitials, formatDate, yearsSince } from '../lib/format';
import { cn } from '../lib/cn';
import { HERO_QUESTION } from '../lib/persona-copy';

const MAX = 3;

export function ComparePage() {
  const [params, setParams] = useSearchParams();
  const initial = (params.get('numbers') ?? '').split(',').filter(Boolean).slice(0, MAX);
  const [numbers, setNumbers] = useState<string[]>(initial);
  const [reports, setReports] = useState<CompanyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const { persona } = usePersona();

  useEffect(() => {
    if (numbers.length === 0) { setReports([]); return; }
    setLoading(true);
    api.compare(numbers).then((r) => { setReports(r); setLoading(false); }).catch(() => setLoading(false));
    setParams(numbers.length ? { numbers: numbers.join(',') } : {});
  }, [numbers.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = (e: FormEvent) => {
    e.preventDefault();
    const n = input.trim();
    if (!n || numbers.includes(n) || numbers.length >= MAX) return;
    setNumbers([...numbers, n]);
    setInput('');
  };

  const remove = (n: string) => setNumbers(numbers.filter((x) => x !== n));

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Compare up to <em>three</em></h1>
          <p className="sub">
            {persona === 'candidate' && 'Pick between offers — see which company is most likely to still be here next year.'}
            {persona === 'freelancer' && 'Pick between clients — see which is most likely to pay.'}
            {persona === 'agency' && 'Pick between clients — see which is safest to place candidates with.'}
          </p>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary btn-sm"><Icon name="download" /> Export PDF</button>
        </div>
      </div>

      <div style={{ padding: '14px 0' }}><PersonaSwitch showLabel={false} /></div>

      <form onSubmit={add} style={{ display: 'flex', gap: 8, marginBottom: 14, maxWidth: 480 }}>
        <div className="input-prefix" style={{ flex: 1 }}>
          <span className="pf"><Icon name="search" /></span>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add an 8-digit company number" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={numbers.length >= MAX}>Add</button>
      </form>

      <div className="question-strip">
        <h3>{HERO_QUESTION[persona]}</h3>
        <span className="count">{numbers.length} of {MAX} slots used</span>
      </div>

      {loading && <div className="empty" style={{ margin: 18 }}>Loading…</div>}

      {!loading && reports.length === 0 && (
        <div className="empty">Add a company number to start comparing.</div>
      )}

      {!loading && reports.length > 0 && (
        <div className="compare-grid">
          <div className="crow header">
            <div className="clabel">Zone A · who they are</div>
            {reports.map((r) => (
              <div key={r.profile.companyNumber} className="co-cell">
                <button className="icon-btn" style={{ alignSelf: 'flex-end' }} onClick={() => remove(r.profile.companyNumber)}>
                  <Icon name="x" size={14} />
                </button>
                <div className="crest-sm">{crestInitials(r.profile.companyName)}</div>
                <h4>{r.profile.companyName}</h4>
                <div className="small muted mono">#{r.profile.companyNumber} · {formatDate(r.profile.incorporatedOn)}</div>
                <span className={cn('badge', r.profile.companyStatus === 'active' ? 'badge-ok' : 'badge-bad')}>
                  <span className="dot" />{r.profile.companyStatus}
                </span>
              </div>
            ))}
            {Array.from({ length: MAX - reports.length }).map((_, i) => (
              <div key={`empty-${i}`} className="co-cell" style={{ opacity: 0.4 }}>
                <div className="empty" style={{ padding: 18 }}>Empty slot</div>
              </div>
            ))}
          </div>

          <Row label="Verdict" cells={reports.map((r) => ({
            tone: r.assessment.riskLevel === 'LOW' ? 'ok' : r.assessment.riskLevel === 'MODERATE' ? 'warn' : 'bad',
            val: r.assessment.riskLevel === 'LOW' ? 'Probably yes' : r.assessment.riskLevel === 'CRITICAL' ? 'Avoid' : 'Caution',
            sub: r.assessment.verdict.slice(0, 80) + '…',
          }))} bestIdx={findBest(reports)} worstIdx={findWorst(reports)} />

          <Row label="Trading history" cells={reports.map((r) => {
            const y = yearsSince(r.profile.incorporatedOn);
            return { tone: (y ?? 0) >= 5 ? 'ok' : 'warn', val: y ? `${y} years` : '—', sub: `Incorporated ${formatDate(r.profile.incorporatedOn)}` };
          })} />

          <Row label="Insolvency" cells={reports.map((r) => ({
            tone: r.insolvency.length === 0 ? 'ok' : 'bad',
            val: r.insolvency.length === 0 ? 'Clean' : `${r.insolvency.length} case(s)`,
            sub: r.insolvency.length === 0 ? 'Register clean' : 'On file',
          }))} />

          <Row label="Filings on time" cells={reports.map((r) => ({
            tone: r.profile.accountsOverdue ? 'bad' : 'ok',
            val: r.profile.accountsOverdue ? 'Overdue' : 'On time',
            sub: r.profile.lastAccountsMadeUpTo ? `Last: ${formatDate(r.profile.lastAccountsMadeUpTo)}` : '',
          }))} />

          <Row label="Outstanding charges" cells={reports.map((r) => {
            const outstanding = r.charges.filter((c) => c.status === 'outstanding').length;
            return { tone: outstanding === 0 ? 'ok' : outstanding < 3 ? 'warn' : 'bad', val: `${outstanding}`, sub: outstanding === 0 ? 'No outstanding charges' : `${outstanding} outstanding` };
          })} />

          <Row label="Officers" cells={reports.map((r) => ({
            tone: 'ok',
            val: `${r.officers.filter((o) => !o.resignedOn).length} active`,
            sub: `${r.officers.length} total in record`,
          }))} />
        </div>
      )}
    </div>
  );
}

interface RowProps {
  label: string;
  cells: { tone: 'ok' | 'warn' | 'bad'; val: string; sub: string }[];
  bestIdx?: number;
  worstIdx?: number;
}

function Row({ label, cells, bestIdx, worstIdx }: RowProps) {
  return (
    <div className="crow">
      <div className="clabel">{label}</div>
      {cells.map((c, i) => (
        <div key={i} className={cn('ccell', i === bestIdx && 'best', i === worstIdx && 'worst')}>
          <div className="v-line">
            <Icon name={c.tone === 'ok' ? 'check' : 'warn'} className={c.tone} />
            <span style={{ color: c.tone === 'ok' ? 'var(--ok)' : c.tone === 'warn' ? 'var(--warn)' : 'var(--bad)' }}>{c.val}</span>
          </div>
          <div className="sub">{c.sub}</div>
        </div>
      ))}
      {Array.from({ length: 3 - cells.length }).map((_, i) => (
        <div key={`e-${i}`} className="ccell" style={{ opacity: 0.3 }}>—</div>
      ))}
    </div>
  );
}

function findBest(reports: CompanyReport[]): number {
  if (reports.length === 0) return -1;
  let best = 0;
  reports.forEach((r, i) => { if (r.assessment.score > reports[best].assessment.score) best = i; });
  return best;
}

function findWorst(reports: CompanyReport[]): number {
  if (reports.length < 2) return -1;
  let worst = 0;
  reports.forEach((r, i) => { if (r.assessment.score < reports[worst].assessment.score) worst = i; });
  return worst;
}
