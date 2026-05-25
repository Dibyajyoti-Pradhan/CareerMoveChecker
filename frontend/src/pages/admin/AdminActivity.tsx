import { useEffect, useState } from 'react';
import { admin } from '../../api/admin';
import { AdminPageHead } from './AdminLayout';
import { formatNumber } from '../../lib/format';

export function AdminActivity() {
  const [searches, setSearches] = useState<{ day: string; cnt: number }[]>([]);
  const [views, setViews] = useState<{ day: string; cnt: number }[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    admin.searchesByDay(30).then(setSearches);
    admin.viewsByDay(30).then(setViews);
    admin.feedback(0, 20).then(setFeedback).catch(() => setFeedback([]));
  }, []);

  return (
    <>
      <AdminPageHead title="Activity & users" sub="No-auth v1 — activity is anonymous per session" />

      <div className="adm-card">
        <h3>Searches per day (30d)</h3>
        <Chart data={searches} />
      </div>

      <div className="adm-card">
        <h3>Report views per day (30d)</h3>
        <Chart data={views} />
      </div>

      <div className="adm-card">
        <h3>Recent feedback ({feedback.length})</h3>
        {feedback.length === 0 && <div className="empty">No feedback submitted yet.</div>}
        {feedback.length > 0 && (
          <div className="adm-table">
            <div className="head" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr' }}>
              <span>Rating</span><span>Use case</span><span>Comment</span><span>Company</span>
            </div>
            {feedback.map((f: any) => (
              <div key={f.id} className="row" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr' }}>
                <span className="mono">{f.rating}/5</span>
                <span className="mono small">{f.useCase}</span>
                <span className="small">{f.comment || <em className="muted">no comment</em>}</span>
                <span className="mono small">#{f.companyNumber}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Chart({ data }: { data: { day: string; cnt: number }[] }) {
  if (data.length === 0) return <div className="empty">No data yet.</div>;
  const max = Math.max(...data.map((d) => Number(d.cnt)), 1);
  return (
    <div>
      <div className="spark" style={{ height: 80 }}>
        {data.map((d, i) => (
          <i key={d.day} className={i === data.length - 1 ? 'today' : ''} style={{ height: `${(Number(d.cnt) / max) * 100}%` }} title={`${d.day}: ${d.cnt}`} />
        ))}
      </div>
      <div className="row muted" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 11.5 }}>
        <span className="mono">{data[0]?.day}</span>
        <span className="mono">{formatNumber(data.reduce((a, d) => a + Number(d.cnt), 0))} total</span>
        <span className="mono">{data.at(-1)?.day}</span>
      </div>
    </div>
  );
}
