import type { PscEntry } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table';
import { formatDate } from '../../lib/format';

export function PscTable({ entries }: { entries: PscEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No PSC data visible"
        description="No persons with significant control returned. This may need manual review — many small companies have a single PSC."
      />
    );
  }
  return (
    <Table>
      <THead>
        <TR>
          <TH>Name</TH>
          <TH>Kind</TH>
          <TH>Nature of control</TH>
          <TH>Notified</TH>
        </TR>
      </THead>
      <TBody>
        {entries.map((p, i) => (
          <TR key={i}>
            <TD className="font-semibold">{p.name}</TD>
            <TD className="text-muted">{p.kind}</TD>
            <TD className="text-sm">
              <ul className="list-disc list-inside">
                {p.natureOfControl.map((n) => (
                  <li key={n}>{n.replaceAll('-', ' ')}</li>
                ))}
              </ul>
            </TD>
            <TD>{formatDate(p.notifiedOn)}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
