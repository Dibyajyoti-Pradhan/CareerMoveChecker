import type { Charge } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/format';

const tone = {
  outstanding: 'amber',
  satisfied: 'green',
  'part-satisfied': 'amber',
} as const;

export function ChargesTable({ charges }: { charges: Charge[] }) {
  if (charges.length === 0) {
    return <EmptyState title="No charges" description="No outstanding charges visible at Companies House." />;
  }
  return (
    <Table>
      <THead>
        <TR>
          <TH>Status</TH>
          <TH>Created</TH>
          <TH>Description</TH>
          <TH>Entitled</TH>
        </TR>
      </THead>
      <TBody>
        {charges.map((c) => (
          <TR key={c.id}>
            <TD><Badge tone={tone[c.status]}>{c.status}</Badge></TD>
            <TD>{formatDate(c.createdOn)}</TD>
            <TD>{c.description}</TD>
            <TD className="text-muted">{c.personsEntitled?.join(', ') ?? '—'}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
