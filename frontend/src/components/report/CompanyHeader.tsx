import type { CompanyProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { formatDate, yearsSince } from '../../lib/format';

const statusTone: Record<string, 'green' | 'amber' | 'red' | 'gray'> = {
  active: 'green',
  dissolved: 'red',
  liquidation: 'red',
  administration: 'red',
  receivership: 'red',
  'voluntary-arrangement': 'amber',
};

export function CompanyHeader({ profile }: { profile: CompanyProfile }) {
  const years = yearsSince(profile.incorporatedOn);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge tone={statusTone[profile.companyStatus] ?? 'gray'}>{profile.companyStatus}</Badge>
        <Badge tone="gray">#{profile.companyNumber}</Badge>
        <Badge tone="gray">{profile.companyType}</Badge>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{profile.companyName}</h1>
      <div className="mt-2 text-sm text-muted">
        Incorporated {formatDate(profile.incorporatedOn)}
        {years !== null && years > 0 && ` · ${years} years old`}
        {profile.registeredOffice && (
          <>
            {' · '}
            {[
              profile.registeredOffice.line1,
              profile.registeredOffice.locality,
              profile.registeredOffice.postalCode,
            ]
              .filter(Boolean)
              .join(', ')}
          </>
        )}
      </div>
    </div>
  );
}
