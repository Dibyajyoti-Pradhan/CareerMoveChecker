import { ChangeEvent, DragEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { api } from '../api/client';
import type { BulkResult } from '../types';
import { cn } from '../lib/cn';
import { formatDate } from '../lib/format';
import { ScoreGauge } from '../components/ScoreGauge';

export function BulkCheckPage() {
  const [result, setResult] = useState<BulkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'safe' | 'watch' | 'avoid' | 'unmatched'>('all');
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file: File) => {
    setFilename(file.name);
    setLoading(true);
    const text = await file.text();
    const numbers = text.split(/[\r\n,]+/).map((s) => s.trim()).filter(Boolean);
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

  const filtered = result?.rows.filter((r) => filter === 'all' || r.bucket === filter) ?? [];

  return (
    <div className="wrap">
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
            <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={upload} />
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
          </div>

          <div className="results-table">
            <div className="head">
              <span>#</span><span></span><span>Company</span><span>Status</span><span>Verdict</span><span>Confidence</span><span></span>
            </div>
            {filtered.map((r) => (
              <div key={r.index} className="brow">
                <span className="ix">{String(r.index).padStart(3, '0')}</span>
                <input type="checkbox" />
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
        >
          <Icon name="upload" size={32} />
          <h3 style={{ margin: '14px 0 6px' }}>{dragOver ? 'Release to upload' : 'Drop a CSV here or click "Upload CSV"'}</h3>
          <p>One company per row. Use the template if you're not sure of the format.</p>
        </div>
      )}
    </div>
  );
}
