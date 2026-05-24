import type { RiskLevel } from '../../types';
import { Badge } from '../ui/Badge';

const tone: Record<RiskLevel, 'green' | 'amber' | 'red' | 'gray'> = {
  LOW: 'green',
  MODERATE: 'amber',
  HIGH: 'amber',
  CRITICAL: 'red',
};

const label: Record<RiskLevel, string> = {
  LOW: 'Low visible risk',
  MODERATE: 'Some caution',
  HIGH: 'High caution',
  CRITICAL: 'Serious visible risk',
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge tone={tone[level]}>{level} · {label[level]}</Badge>;
}
