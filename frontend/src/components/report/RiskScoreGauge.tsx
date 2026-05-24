import type { RiskLevel } from '../../types';

const colors: Record<RiskLevel, string> = {
  LOW: '#15803d',
  MODERATE: '#b45309',
  HIGH: '#c2410c',
  CRITICAL: '#b91c1c',
};

interface Props {
  score: number;
  level: RiskLevel;
  size?: number;
}

export function RiskScoreGauge({ score, level, size = 180 }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - 24) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = colors[level];
  const cx = size / 2;
  const cy = size / 2 + 10;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`} role="img" aria-label={`Risk score ${clamped}`}>
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          stroke="#e5e7eb"
          strokeWidth={16}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          stroke={color}
          strokeWidth={16}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms ease' }}
        />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize={size / 4}
          fontWeight={800}
          fill="#111827"
        >
          {clamped}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize={11}
          letterSpacing={1.2}
          fill="#5b6475"
          fontWeight={700}
        >
          /100
        </text>
      </svg>
    </div>
  );
}
