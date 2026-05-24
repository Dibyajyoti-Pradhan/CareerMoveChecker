import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { CompanyReport } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { CompanyHeader } from '../components/report/CompanyHeader';
import { RiskScoreGauge } from '../components/report/RiskScoreGauge';
import { RiskBadge } from '../components/report/RiskBadge';
import { formatDate, formatPercent } from '../lib/format';

export function CompanyPrintPage() {
  const { id = '' } = useParams();
  const [report, setReport] = useState<CompanyReport | null>(null);

  useEffect(() => {
    api.getReport(id).then((r) => {
      setReport(r);
      setTimeout(() => window.print(), 400);
    });
  }, [id]);

  if (!report) return <div className="container-narrow py-10"><Skeleton className="h-64" /></div>;

  return (
    <div className="container-narrow py-10 bg-white print:py-0 print:px-0">
      <div className="flex items-start justify-between border-b border-line pb-6">
        <CompanyHeader profile={report.profile} />
        <div className="text-right">
          <RiskScoreGauge score={report.assessment.score} level={report.assessment.riskLevel} size={140} />
          <div className="mt-1"><RiskBadge level={report.assessment.riskLevel} /></div>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Verdict</h2>
        <p className="mt-2 leading-relaxed">{report.assessment.verdict}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Top reasons</h2>
        <ol className="mt-2 list-decimal list-inside space-y-1">
          {report.assessment.topReasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ol>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Risk flags</h2>
        <div className="mt-2 space-y-3">
          {report.assessment.flags.map((f) => (
            <div key={f.id} className="border border-line rounded-xl p-3">
              <div className="font-bold">{f.title} <span className="text-xs uppercase ml-2 text-muted">({f.severity})</span></div>
              <div className="text-sm mt-1">{f.explanation}</div>
              <div className="text-xs text-muted mt-1">Evidence: {f.evidence}</div>
              <div className="text-xs text-muted">Action: {f.recommendedAction}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Recommended actions</h2>
        <ol className="mt-2 list-decimal list-inside space-y-1">
          {report.assessment.recommendedActions.map((a) => (
            <li key={a.id}><span className="font-semibold">{a.title}.</span> {a.detail}</li>
          ))}
        </ol>
      </section>

      <section className="mt-8 border-t border-line pt-4 text-xs text-muted">
        <div>Model: {report.assessment.modelVersion} · Confidence {formatPercent(report.assessment.confidence)}</div>
        <div>Data fetched {formatDate(report.dataFetchedAt)} · Computed {formatDate(report.computedAt)}</div>
        <div className="mt-3">
          CareerMoveChecker uses public data sources, primarily Companies House, to support general business and career due diligence. It is not a credit report, legal advice, financial advice, AML/KYB verification, employment advice, or a guarantee of solvency, safety, or trustworthiness. Always verify important decisions with appropriate professional checks.
        </div>
      </section>
    </div>
  );
}
