import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { CompanyReport, FeedbackUseCase } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { CompanyHeader } from '../components/report/CompanyHeader';
import { RiskScoreGauge } from '../components/report/RiskScoreGauge';
import { RiskBadge } from '../components/report/RiskBadge';
import { RiskFlagCard } from '../components/report/RiskFlagCard';
import { RecommendedActions } from '../components/report/RecommendedActions';
import { OfficerTable } from '../components/report/OfficerTable';
import { PscTable } from '../components/report/PscTable';
import { ChargesTable } from '../components/report/ChargesTable';
import { FilingTimeline } from '../components/report/FilingTimeline';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { formatDate, formatPercent } from '../lib/format';

const useCaseLabels: Record<FeedbackUseCase, string> = {
  JOINING_AS_EMPLOYEE: 'Joining as employee',
  FREELANCE_CLIENT_WORK: 'Freelance client work',
  SUPPLIER_CHECK: 'Supplier check',
  LANDLORD_TENANT_CHECK: 'Landlord / tenant check',
  INVESTMENT_RESEARCH: 'Investment research',
  OTHER: 'Other',
};

export function CompanyReportPage() {
  const { id = '' } = useParams();
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [note, setNote] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [useCase, setUseCase] = useState<FeedbackUseCase>('JOINING_AS_EMPLOYEE');
  const [comment, setComment] = useState('');
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getReport(id).then((r) => {
      if (cancelled) return;
      setReport(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const refresh = async () => {
    setRefreshing(true);
    const r = await api.refreshReport(id);
    setReport(r);
    setRefreshing(false);
    toast.push('Report refreshed', 'success');
  };

  const save = async () => {
    if (!report) return;
    setSaving(true);
    await api.saveCompany({
      companyNumber: report.profile.companyNumber,
      companyName: report.profile.companyName,
      note: note || undefined,
    });
    setSaving(false);
    setSaveOpen(false);
    setNote('');
    toast.push('Saved to your dashboard', 'success');
  };

  const sendFeedback = async () => {
    await api.submitFeedback({
      companyNumber: id,
      rating,
      useCase,
      comment: comment || undefined,
    });
    setFeedbackOpen(false);
    setComment('');
    toast.push('Thanks — feedback sent', 'success');
  };

  if (loading) {
    return (
      <div className="container-page py-10 space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Company not found"
          description={`We couldn't find a Companies House record for ${id}.`}
          action={
            <Link to="/app/search" className="text-brand font-semibold">
              Back to search
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <CompanyHeader profile={report.profile} />
        <div className="flex flex-wrap gap-2 no-print">
          <Button variant="secondary" onClick={() => setSaveOpen(true)}>Save</Button>
          <Button variant="secondary" onClick={() => setFeedbackOpen(true)}>Was this useful?</Button>
          <Link
            to={`/app/company/${id}/print`}
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-line bg-white text-sm font-semibold hover:bg-soft"
          >
            Print view
          </Link>
          <Button onClick={refresh} loading={refreshing}>Refresh</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <RiskScoreGauge score={report.assessment.score} level={report.assessment.riskLevel} />
          <div className="mt-2 flex justify-center">
            <RiskBadge level={report.assessment.riskLevel} />
          </div>
          <div className="mt-4 text-xs text-muted text-center">
            Model: {report.assessment.modelVersion} · Confidence {formatPercent(report.assessment.confidence)}
          </div>
          <div className="mt-3 text-xs text-muted text-center">
            Data fetched {formatDate(report.dataFetchedAt)} · Computed {formatDate(report.computedAt)}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="text-lg font-bold mb-2">Verdict</h2>
            <p className="text-ink leading-relaxed">{report.assessment.verdict}</p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold mb-3">Top reasons</h2>
            <ul className="space-y-2">
              {report.assessment.topReasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/10 text-brand text-xs font-bold">{i + 1}</span>
                  <span className="text-sm leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Alert tone="info">
          {report.assessment.explanationSummary}
        </Alert>
      </div>

      <div className="mt-8">
        <Tabs
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div className="grid gap-5 md:grid-cols-2">
                  <Card>
                    <h3 className="text-base font-bold mb-3">Risk flags</h3>
                    {report.assessment.flags.length === 0 ? (
                      <p className="text-sm text-muted">No specific risk flags emitted.</p>
                    ) : (
                      <div className="space-y-3">
                        {report.assessment.flags.map((f) => (
                          <RiskFlagCard key={f.id} flag={f} />
                        ))}
                      </div>
                    )}
                  </Card>
                  <Card>
                    <h3 className="text-base font-bold mb-3">Recommended actions</h3>
                    <RecommendedActions actions={report.assessment.recommendedActions} />
                  </Card>
                </div>
              ),
            },
            { id: 'officers', label: 'Officers', count: report.officers.length, content: <OfficerTable officers={report.officers} /> },
            { id: 'psc', label: 'Ownership / PSC', count: report.psc.length, content: <PscTable entries={report.psc} /> },
            { id: 'charges', label: 'Charges', count: report.charges.length, content: <ChargesTable charges={report.charges} /> },
            { id: 'filings', label: 'Filing history', count: report.filings.length, content: <FilingTimeline filings={report.filings} /> },
            {
              id: 'raw',
              label: 'Raw data',
              content: (
                <pre className="rounded-2xl border border-line bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[480px]">
                  {JSON.stringify(report, null, 2)}
                </pre>
              ),
            },
          ]}
        />
      </div>

      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title={`Save ${report.profile.companyName}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        <label className="block text-sm font-semibold mb-2">Note (optional)</label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. interviewing Q2, asked for net-30 terms..."
        />
      </Modal>

      <Modal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="How useful was this report?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
            <Button onClick={sendFeedback}>Send</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Rating (1–5)</label>
            <Input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Use case</label>
            <Select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as FeedbackUseCase)}
              className="w-full"
            >
              {(Object.keys(useCaseLabels) as FeedbackUseCase[]).map((k) => (
                <option key={k} value={k}>
                  {useCaseLabels[k]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Comment (optional)</label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
