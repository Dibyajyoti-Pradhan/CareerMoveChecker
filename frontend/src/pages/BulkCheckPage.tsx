import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { api } from '../api/client';
import type { BulkResult } from '../types';
import { cn } from '../lib/cn';
import { extractCompanyNumber } from '../lib/format';
import { ScoreGauge } from '../components/ScoreGauge';

export function BulkCheckPage() {
  const [result, setResult] = useState<BulkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'safe' | 'watch' | 'avoid' | 'unmatched'>('all');
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'bad' } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savingSelected, setSavingSelected] = useState(false);
  const [pasteInput, setPasteInput] = useState('');
  const selectAllRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedPasteNumbers = parseBulkInput(pasteInput);

  const toggleRow = (n: string) => setSelected((cur) => {
    const next = new Set(cur);
    next.has(n) ? next.delete(n) : next.add(n);
    return next;
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const processFile = async (file: File) => {
    setFilename(file.name);
    setLoading(true);
    const text = await file.text();
    const numbers = parseBulkInput(text);
    try {
      const r = await api.bulkCheck(numbers);
      setResult(r);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const processManualList = async () => {
    if (parsedPasteNumbers.length === 0) return;
    setFilename('Pasted list');
    setLoading(true);
    setSelected(new Set());
    try {
      const r = await api.bulkCheck(parsedPasteNumbers);
      setResult(r);
      setToast({ text: `Checked ${parsedPasteNumbers.length} pasted entries`, tone: 'ok' });
    } catch {
      setResult(null);
      setToast({ text: 'Bulk check failed — try again', tone: 'bad' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = result?.rows.filter((r) => filter === 'all' || r.bucket === filter) ?? [];
  const selectedRows = result?.rows.filter((row) => row.companyNumber && selected.has(row.companyNumber)) ?? [];

  const saveSelectedToWatchlist = async () => {
    if (selectedRows.length === 0 || savingSelected) return;
    setSavingSelected(true);
    try {
      const outcomes = await Promise.allSettled(
        selectedRows.map((row) => api.saveCompany({ companyNumber: row.companyNumber!, companyName: row.companyName ?? row.input }))
      );
      const savedCount = outcomes.filter((outcome) => outcome.status === 'fulfilled').length;
      if (savedCount === 0) throw new Error('No companies saved');
      setToast({ text: `Saved ${savedCount} selected compan${savedCount === 1 ? 'y' : 'ies'} to your watchlist`, tone: 'ok' });
    } catch {
      setToast({ text: 'Could not save selected companies — try again', tone: 'bad' });
    } finally {
      setSavingSelected(false);
    }
  };

  useEffect(() => {
    if (!selectAllRef.current || !result) return;
    const eligible = filtered.filter(r => r.companyNumber);
    const allChecked = eligible.length > 0 && eligible.every(r => selected.has(r.companyNumber!));
    const someChecked = eligible.some(r => selected.has(r.companyNumber!));
    selectAllRef.current.indeterminate = someChecked && !allChecked;
    selectAllRef.current.checked = allChecked;
  }, [selected, filtered, result]);

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
          <p className="small muted"><Link to="/app/saved" style={{ color: 'var(--brand)' }}>Saved</Link> / Bulk check</p>
          <h1>Bulk check · <em>{result?.totalRows ?? '50'} clients</em> in one upload</h1>
          <p className="sub">Upload a CSV of company numbers or names. Get plain-English verdicts for each.</p>
        </div>
        <div className="head-actions">
          <a className="btn btn-secondary btn-sm" href="data:text/csv;charset=utf-8,company_number%0A09446231%0A03977902%0A13571112" download="cmc-template.csv">
            <Icon name="download" /> CSV template
          </a>
          <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
            <Icon name="upload" /> Upload CSV
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={upload} />
          </label>
        </div>
      </div>

      <div className="stages">
        <div className={cn('stage', filename && 'done')}>
          <div className="ix">{filename ? <Icon name="check" size={14} /> : '1'}</div>
          <div><h5>Upload CSV</h5><p>{filename || 'Pick a file to start'}</p></div>
        </div>
        <div className={cn('stage', loading && 'current', !loading && result && 'done')}>
          <div className="ix">{result && !loading ? <Icon name="check" size={14} /> : '2'}</div>
          <div><h5>Match to Companies House</h5><p>{loading ? 'Looking up…' : result ? `${result.matched} matched, ${result.unmatched} unmatched` : 'Waiting for upload'}</p></div>
        </div>
        <div className={cn('stage', result && !loading && 'current')}>
          <div className="ix">3</div>
          <div><h5>Review results</h5><p>{result ? 'Filter, sort, take action' : 'Ready when scan completes'}</p></div>
        </div>
      </div>

      {filename && (
        <div className="upload-card">
          <div className="info">
            <h5>{filename}</h5>
            <p>{result ? `${result.totalRows} rows uploaded · ${result.matched} matched · ${result.unmatched} unmatched` : 'Processing…'}</p>
            <div className="stats-line">
              <span>Safe: <b>{result?.rows.filter((r) => r.bucket === 'safe').length ?? 0}</b></span>
              <span>Watch: <b>{result?.rows.filter((r) => r.bucket === 'watch').length ?? 0}</b></span>
              <span>Avoid: <b>{result?.rows.filter((r) => r.bucket === 'avoid').length ?? 0}</b></span>
            </div>
          </div>
          <div className="row">
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
              <Icon name="upload" /> New upload
              <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={upload} />
            </label>
          </div>
        </div>
      )}

      {!filename && (
        <section className="manual-list" aria-labelledby="manual-list-title" style={{ marginTop: 24 }}>
          <div className="rail-card" style={{ padding: 20 }}>
            <div className="page-head" style={{ marginBottom: 12 }}>
              <div>
                <div className="s-eyebrow">No CSV needed</div>
                <h2 id="manual-list-title" style={{ fontSize: '1.25rem', margin: '4px 0' }}>Paste company numbers or names</h2>
                <p className="small muted" style={{ margin: 0 }}>
                  Copy a shortlist from a spreadsheet, email, or Companies House links. We'll clean it up before matching.
                </p>
              </div>
              <span className="pill">Extracted {parsedPasteNumbers.length}</span>
            </div>
            <label htmlFor="bulk-paste-input" className="small muted" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Paste one per line, comma separated, or paste Companies House URLs
            </label>
            <textarea
              id="bulk-paste-input"
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              rows={6}
              placeholder={'09446231\n03977902\nhttps://find-and-update.company-information.service.gov.uk/company/SC095000'}
              style={{
                width: '100%',
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: '12px 14px',
                resize: 'vertical',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                lineHeight: 1.6,
                background: 'var(--canvas)',
                color: 'var(--ink)',
              }}
            />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <p className="small muted" style={{ margin: 0 }}>
                Headers such as “company_number” are ignored; blank rows are skipped.
              </p>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={processManualList}
                disabled={parsedPasteNumbers.length === 0 || loading}
              >
                <Icon name="search" /> Run pasted list
              </button>
            </div>
          </div>
        </section>
      )}

      {result && (
        <>
          <div className="stats">
            <div className="stat"><span className="label">Uploaded</span><span className="val">{result.totalRows}</span></div>
            <div className="stat"><span className="label">Safe to send</span><span className="val ok">{result.rows.filter((r) => r.bucket === 'safe').length}</span></div>
            <div className="stat"><span className="label">Watch closely</span><span className="val warn">{result.rows.filter((r) => r.bucket === 'watch').length}</span></div>
            <div className="stat"><span className="label">Do not contract</span><span className="val bad">{result.rows.filter((r) => r.bucket === 'avoid').length}</span></div>
          </div>

          <div className="toolbar">
            {(['all', 'safe', 'watch', 'avoid', 'unmatched'] as const).map((f) => (
              <button key={f} className={cn('filter-chip', filter === f && 'active')} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'safe' ? 'Safe' : f === 'watch' ? 'Watch' : f === 'avoid' ? 'Avoid' : 'Unmatched'}
              </button>
            ))}
            {selected.size > 0 && (
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{selected.size} selected</span>
            )}
            {selected.size > 0 && (
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={saveSelectedToWatchlist}
                disabled={selectedRows.length === 0 || savingSelected}
              >
                {savingSelected ? <span className="spinner" /> : <Icon name="star" />}
                {savingSelected ? 'Saving…' : 'Save selected to watchlist'}
              </button>
            )}
            {result && result.rows.some((r) => r.bucket === 'avoid' || r.bucket === 'watch') && (
              <button
                className="btn btn-secondary btn-sm"
                aria-label="Copy Avoid and Watch companies as plain text to clipboard"
                onClick={() => {
                  const flagged = result.rows.filter(
                    (r) => r.bucket === 'avoid' || r.bucket === 'watch'
                  );
                  const lines = flagged.map((r) => {
                    const name = r.companyName ?? r.input;
                    const num = r.companyNumber ? ` (#${r.companyNumber})` : '';
                    const bucket = r.bucket === 'avoid' ? 'AVOID' : 'WATCH';
                    const score = r.score != null ? ` · Score: ${r.score}/100` : '';
                    return `${bucket}  ${name}${num}${score}`;
                  });
                  const text = [
                    `CareerMove bulk check — ${flagged.length} flagged company(ies)`,
                    `Exported: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                    '',
                    ...lines,
                  ].join('\n');
                  navigator.clipboard?.writeText(text)
                    .then(() => setToast({ text: `${flagged.length} flagged companies copied`, tone: 'ok' }))
                    .catch(() => setToast({ text: 'Could not copy — try again', tone: 'bad' }));
                }}
              >
                Copy flagged
              </button>
            )}
            <button
              className="btn btn-secondary btn-sm"
              aria-label="Export bulk check results as CSV"
              style={{ marginLeft: 'auto' }}
              onClick={() => {
                if (!result) return;
                const header = 'Row,Input,Matched,Company Name,Company Number,Status,Risk Level,Score,Confidence,Bucket';
                const rows = result.rows.map((r) =>
                  [
                    r.index,
                    `"${r.input.replace(/"/g, '""')}"`,
                    r.matched ? 'yes' : 'no',
                    `"${(r.companyName ?? '').replace(/"/g, '""')}"`,
                    r.companyNumber ?? '',
                    r.companyStatus ?? '',
                    r.riskLevel ?? '',
                    r.score ?? '',
                    r.confidence ?? '',
                    r.bucket ?? '',
                  ].join(',')
                );
                const csv = [header, ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `careermove-bulk-${result.uploadId}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                setToast({ text: `Exported ${result.rows.length} rows`, tone: 'ok' });
              }}
            >
              <Icon name="download" /> Export CSV
            </button>
          </div>

          <div className="results-table">
            <div className="head">
              <span>#</span>
              <span>
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  onChange={(e) => {
                    const eligible = filtered.filter(r => r.companyNumber);
                    if (e.target.checked) {
                      setSelected(new Set(eligible.map(r => r.companyNumber!)));
                    } else {
                      setSelected(new Set());
                    }
                  }}
                />
              </span>
              <span>Company</span><span>Status</span><span>Verdict</span><span>Confidence</span><span></span>
            </div>
            {filtered.map((r) => (
              <div key={r.index} className="brow">
                <span className="ix">{String(r.index).padStart(3, '0')}</span>
                <input
                  type="checkbox"
                  checked={r.companyNumber ? selected.has(r.companyNumber) : false}
                  onChange={() => r.companyNumber && toggleRow(r.companyNumber)}
                />
                <div>
                  <div style={{ fontWeight: 500 }}>{r.companyName ?? r.input}</div>
                  <div className="small muted mono">{r.companyNumber ? `#${r.companyNumber}` : `input: ${r.input}`}</div>
                </div>
                <span className={cn('badge', r.companyStatus === 'active' ? 'badge-ok' : 'badge-neutral')}>{r.companyStatus ?? '—'}</span>
                <div>
                  <span className={cn('v-pill', r.bucket === 'safe' && 'mono', r.bucket === 'avoid' && 'mono')}
                    style={{
                      background: r.bucket === 'safe' ? 'var(--ok-bg)' : r.bucket === 'watch' ? 'var(--warn-bg)' : r.bucket === 'avoid' ? 'var(--bad-bg)' : 'var(--soft)',
                      color: r.bucket === 'safe' ? 'var(--ok)' : r.bucket === 'watch' ? 'var(--warn)' : r.bucket === 'avoid' ? 'var(--bad)' : 'var(--muted)',
                    }}>
                    {r.bucket === 'safe' ? 'SAFE' : r.bucket === 'watch' ? 'WATCH' : r.bucket === 'avoid' ? 'AVOID' : 'UNMATCHED'}
                  </span>
                </div>
                <ScoreGauge score={r.score ?? 0} confidence={r.confidence ?? 0} />
                <span>
                  {r.companyNumber && <Link to={`/app/company/${r.companyNumber}`} className="icon-btn"><Icon name="external" size={14} /></Link>}
                </span>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty" style={{ margin: 18 }}>No rows match this filter.</div>}
          </div>
        </>
      )}

      {!filename && (
        <div
          className="empty"
          role="button"
          tabIndex={0}
          aria-label="Drop a CSV file here, or press Enter or Space to open the file picker"
          style={{
            marginTop: 32,
            padding: 60,
            border: dragOver ? '2px dashed var(--brand)' : '2px dashed var(--hair)',
            borderRadius: 12,
            background: dragOver ? 'var(--canvas)' : undefined,
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
        >
          <Icon name="upload" size={32} />
          <h3 style={{ margin: '14px 0 6px' }}>{dragOver ? 'Release to upload' : 'Drop a CSV here or click "Upload CSV"'}</h3>
          <p>One company per row. Use the template if you're not sure of the format.</p>
        </div>
      )}
    </div>
  );
}

const MAX_BULK_ROWS = 50;
const HEADER_CELLS = new Set(['company_number', 'company number', 'companynumber', 'number', 'name', 'company_name', 'company name']);

const parseBulkInput = (text: string) => {
  return text
    .split(/[\r\n,;\t]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => extractCompanyNumber(s) ?? s)
    .filter((s) => !HEADER_CELLS.has(s.toLowerCase()))
    .slice(0, MAX_BULK_ROWS);
};
