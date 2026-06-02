import { Link } from 'react-router-dom';

interface ScoreGaugeProps {
  score: number;
  confidence: number;
}

export function ScoreGauge({ score, confidence }: ScoreGaugeProps) {
  const barColor =
    score <= 39 ? 'var(--bad)' : score <= 69 ? 'var(--warn)' : 'var(--ok)';

  const riskLabel =
    score <= 39 ? 'high risk' :
    score <= 69 ? 'moderate risk' :
    'low risk';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--ink)',
            fontFamily: 'var(--mono)',
          }}
        >
          {score} / 100
        </span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          Confidence: {Math.round(confidence * 100)}%
        </span>
      </div>

      <div
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Risk score"
        aria-valuetext={`${score} out of 100 — ${riskLabel}, confidence ${Math.round(confidence * 100)}%`}
        style={{
          height: 10,
          borderRadius: 5,
          background: 'var(--soft)',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            borderRadius: 5,
            background: barColor,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
        <Link
          to="/methodology"
          style={{ color: 'var(--brand)', textDecoration: 'none' }}
        >
          How is this calculated? → Methodology
        </Link>
      </div>
    </div>
  );
}
