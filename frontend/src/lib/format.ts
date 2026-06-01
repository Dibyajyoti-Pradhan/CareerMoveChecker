export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function yearsSince(iso?: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-GB');
}

export function formatPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function crestInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
}

// Extract the Companies House company number from a CH URL, path fragment, or raw input.
// Accepts: full URL (find-and-update.company-information.service.gov.uk/company/09446231),
//   path fragment (/company/09446231), or bare number/prefix (09446231, SC123456).
// Returns the uppercased number if matched, else null.
export function extractCompanyNumber(input: string): string | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/company\/([A-Z0-9]{6,10})/i);
  if (urlMatch) return urlMatch[1].toUpperCase();
  const bare = trimmed.match(/^[A-Z0-9]{6,10}$/i);
  if (bare) return trimmed.toUpperCase();
  return null;
}
