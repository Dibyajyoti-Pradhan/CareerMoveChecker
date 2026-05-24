import type { Officer } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table';
import { formatDate } from '../../lib/format';
import { Badge } from '../ui/Badge';

export function OfficerTable({ officers }: { officers: Officer[] }) {
  if (officers.length === 0) {
    return <EmptyState title="No officers visible" description="Companies House did not return officer records." />;
  }
  return (
    <Table>
      <THead>
        <TR>
          <TH>Name</TH>
          <TH>Role</TH>
          <TH>Appointed</TH>
          <TH>Status</TH>
          <TH>Nationality</TH>
        </TR>
      </THead>
      <TBody>
        {officers.map((o, i) => (
          <TR key={i}>
            <TD className="font-semibold">{o.name}</TD>
            <TD>{o.role}</TD>
            <TD>{formatDate(o.appointedOn)}</TD>
            <TD>
              {o.resignedOn ? (
                <Badge tone="gray">Resigned {formatDate(o.resignedOn)}</Badge>
              ) : (
                <Badge tone="green">Active</Badge>
              )}
            </TD>
            <TD className="text-muted">{o.nationality ?? '—'}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
