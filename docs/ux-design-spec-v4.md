# UX / Visual Design Spec — v4
**CareerMoveChecker · Sprint items 1–10**
Prepared by: UX/Product Design  
Date: 2026-06-02

---

## How to read this document

Each item is self-contained. Every CSS value, class name, and prop reference is taken verbatim from the existing design system (`index.css`, `pages.css`, and the component files). No new tokens are introduced unless explicitly stated. "Engineer must not make design decisions" — if something is not listed here, it is out of scope for this item.

---

## Item 1 — Render `explanationSummary` in answer card

### File to modify
`frontend/src/pages/CompanyReportPage.tsx`

### Location
Zone B, inside `.answer-body`, immediately **after** the existing `<p className="answer-verdict">` paragraph and **before** the `.ticks` div.

### Markup to insert
```tsx
{a.explanationSummary && (
  <p style={{
    fontSize: 14,
    color: 'var(--ink-2)',
    lineHeight: 1.6,
    marginTop: 8,
    marginBottom: 0,
  }}>
    {a.explanationSummary}
  </p>
)}
```

### Design tokens used
| Property | Value |
|---|---|
| font-size | 14px |
| color | `var(--ink-2)` — #1f2937 |
| line-height | 1.6 |
| margin-top | 8px |
| margin-bottom | 0 (the existing `.ticks` div already has its own top margin via `.ticks { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }`) |

### States
- **Data present:** Paragraph renders inline, no expansion needed.
- **Data absent / empty string / null / undefined:** The conditional guard `{a.explanationSummary && …}` silently renders nothing. Do not show a placeholder.
- **Loading:** Not applicable — this is inside the `if (!report)` guard in the component; the paragraph only renders once the full report is available.

### Mobile/responsive
No special responsive behaviour required. The paragraph flows naturally within `.answer-body` which applies `padding: 28px 22px` at ≤1000px (existing rule in `pages.css`). The `max-width: 60ch` on `.answer-verdict` does NOT apply to this paragraph — it is full-width within the padded container, which is intentional so longer summaries use available space.

### Accessibility
- Plain `<p>` element — no additional ARIA required.
- Screen readers will read it in document order after the verdict, which is the correct reading sequence.

### Edge cases
- If `a.explanationSummary` is a non-empty whitespace-only string, it will render an invisible paragraph. Guard with `a.explanationSummary?.trim()` if the backend is not guaranteed to strip whitespace.
- Maximum length is not constrained — the paragraph wraps naturally. Do not truncate.

---

## Item 2 — Disqualification match detail (reason, dates)

### File to modify
`frontend/src/pages/CompanyReportPage.tsx`

### Location
Zone B, inside the existing `.disq-banner.bad` conditional block. This is the block triggered when `report.disqualificationCheck.status === 'MATCH'`.

### Current markup (for reference)
```tsx
<div className={cn('disq-banner', report.disqualificationCheck.status === 'MATCH' && 'bad')}>
  <Icon name={...} />
  {report.disqualificationCheck.status === 'MATCH'
    ? `⚠ ${...} disqualified officer(s) detected ...`
    : 'No disqualified officers detected ...'}
</div>
```

### New markup — replace the entire `<div className={cn('disq-banner', ...)}>` with:
```tsx
{report.disqualificationCheck && (
  <div className={cn('disq-banner', report.disqualificationCheck.status === 'MATCH' && 'bad')}>
    <Icon name={report.disqualificationCheck.status === 'MATCH' ? 'alert' : 'shield'} />
    {report.disqualificationCheck.status === 'MATCH' ? (
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          ⚠ {report.disqualificationCheck.matches.length} disqualified officer(s) detected on the current board
        </div>
        {report.disqualificationCheck.matches.map((m, i) => (
          <div key={i} style={{ fontSize: 13, marginTop: 4 }}>
            <span style={{ fontWeight: 600 }}>{m.name}</span>
            {(m.reason || m.disqualifiedFrom || m.disqualifiedUntil) && (
              <span style={{ fontWeight: 400, marginLeft: 6 }}>
                {m.reason && <>{m.reason}</>}
                {m.disqualifiedFrom && (
                  <> · {formatDate(m.disqualifiedFrom)}
                  {m.disqualifiedUntil ? ` – ${formatDate(m.disqualifiedUntil)}` : ' – ongoing'}
                  </>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    ) : (
      'No disqualified officers detected on the current board.'
    )}
  </div>
)}
```

### Design tokens used
| Element | Property | Value |
|---|---|---|
| Top summary line | font-weight | 600 |
| Top summary line | margin-bottom | 6px |
| Per-match row | font-size | 13px |
| Per-match row | margin-top | 4px (between rows) |
| Match name | font-weight | 600 |
| Reason + date range | font-weight | 400 |
| Reason + date range | margin-left | 6px |
| Container | className | `disq-banner bad` (unchanged) — provides `background: var(--bad-bg); color: var(--bad); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; font-size: 13.5px; font-weight: 500;` |

### Date formatting
Use the existing `formatDate()` helper (already imported in the file) for both `disqualifiedFrom` and `disqualifiedUntil`.

### States
- **CLEAR:** Unchanged — single-line banner with shield icon.
- **MATCH, matches have full data (reason + both dates):** Full sub-row per match.
- **MATCH, matches have partial data:** Each field is individually optional. If `m.reason` is absent, skip. If `m.disqualifiedFrom` is absent, skip the entire date range. If `m.disqualifiedUntil` is absent but `m.disqualifiedFrom` is present, render "– ongoing".
- **MATCH, zero matches in array:** The `matches.map()` renders nothing; only the headline renders. This is a backend error state — acceptable as a degraded rendering.
- **ERROR status:** Not changed by this item — no `.bad` class, no match rows.

### Mobile/responsive
The banner is already `flex; align-items: center` at all breakpoints. Adding `flex: 1` on the inner `<div>` ensures the text column fills available space next to the icon. No other responsive changes needed.

### Accessibility
- The `⚠` character already exists in the current code; keep it as-is (decorative, accompanied by the icon which is `aria-hidden="true"`).
- Match detail rows are plain text — no additional ARIA required.
- Color contrast: `var(--bad)` on `var(--bad-bg)` meets WCAG AA (verified in existing usage throughout the codebase).

### Edge cases
- `m.reason` may be a long string. It wraps naturally at 13px within the banner. Do not truncate.
- The `formatDate()` helper returns `'—'` for null/undefined inputs — do not call it if the date field is absent; use the conditional guards above instead.

---

## Item 3 — Officer nationality in People tab

### File to modify
`frontend/src/pages/CompanyReportPage.tsx`

### Location
Inside `panel-people`, within `report.officers.map(...)`, the `.role` span on line 433 (current code):
```tsx
<div className="role">{o.role}{o.occupation && ` · ${o.occupation}`}</div>
```

### New markup — replace that single line with:
```tsx
<div className="role">
  {o.role}
  {o.occupation && ` · ${o.occupation}`}
  {o.nationality && ` · ${o.nationality}`}
</div>
```

### Design tokens used
The `.role` class in `pages.css` is: `font-size: 12.5px; color: var(--muted)`. No additional styling is applied to the nationality fragment — it inherits everything from `.role`.

### States
- **nationality present:** Appended after occupation (or after role if occupation absent) with the separator ` · `.
- **nationality absent / undefined:** Nothing appended. The existing occupation logic is unaffected.
- **Both occupation and nationality absent:** Only role text renders — no trailing separator.

### Mobile/responsive
`.role` wraps naturally if the combined string is long. No changes required.

### Accessibility
Plain text within an existing element. No additional ARIA required.

### Edge cases
- If `o.nationality` is an empty string `""`, the falsy check `{o.nationality && ...}` will not render it. This is correct behaviour.
- Nationality strings from Companies House are free-text (e.g. "British", "German", "United States"). They should be rendered as-is without transformation.
- The existing `.person` grid is `grid-template-columns: 36px 1fr auto` — the `.role` line is in the `1fr` column and wraps if long. This is acceptable.

---

## Item 4 — Inline note entry on Saved companies

### Files to modify
1. `frontend/src/pages/SavedPage.tsx` — state, markup, save logic
2. `frontend/src/pages.css` — one new rule for the note display text

### Part A: SavedPage.tsx changes

#### New state (add alongside existing state declarations at the top of `SavedPage`):
```tsx
const [editingNote, setEditingNote] = useState<string | null>(null);
const [noteValue, setNoteValue] = useState('');
```

- `editingNote`: holds the `companyNumber` of the row currently in edit mode, or `null` if none.
- `noteValue`: the live text input value while editing.

#### New `saveNote` handler (add after the `toggle` function):
```tsx
const saveNote = async (companyNumber: string) => {
  const trimmed = noteValue.trim();
  try {
    await api.updateSavedNote(companyNumber, trimmed);
    setItems((cur) =>
      cur.map((s) =>
        s.companyNumber === companyNumber ? { ...s, note: trimmed || undefined } : s
      )
    );
  } catch {
    setToast({ text: 'Could not save note — try again', tone: 'bad' });
  }
  setEditingNote(null);
  setNoteValue('');
};
```

Note: `api.updateSavedNote(companyNumber, note)` is the assumed API method. The engineer must wire this to the appropriate backend endpoint. If the method does not yet exist on the `api` client, it should be added as `updateSavedNote(companyNumber: string, note: string): Promise<void>`.

#### Markup changes within `sorted.map((s) => ...)`:

**Current company name cell:**
```tsx
<div className="co">
  <div className="crest-sm">{crestInitials(s.companyName)}</div>
  <div>
    <Link to={`/app/company/${s.companyNumber}`} style={{ fontWeight: 500 }}>{s.companyName}</Link>
    <div className="small muted mono">#{s.companyNumber} · saved {formatDate(s.createdAt)}</div>
  </div>
</div>
```

**Replace with:**
```tsx
<div className="co">
  <div className="crest-sm">{crestInitials(s.companyName)}</div>
  <div>
    <Link to={`/app/company/${s.companyNumber}`} style={{ fontWeight: 500 }}>{s.companyName}</Link>
    <div className="small muted mono">#{s.companyNumber} · saved {formatDate(s.createdAt)}</div>
    {s.note && editingNote !== s.companyNumber && (
      <div className="saved-note">{s.note}</div>
    )}
    {editingNote === s.companyNumber && (
      <input
        type="text"
        className="note-input"
        value={noteValue}
        placeholder="Add note…"
        autoFocus
        onChange={(e) => setNoteValue(e.target.value)}
        onBlur={() => saveNote(s.companyNumber)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') saveNote(s.companyNumber);
          if (e.key === 'Escape') { setEditingNote(null); setNoteValue(''); }
        }}
        aria-label={`Note for ${s.companyName}`}
      />
    )}
  </div>
</div>
```

**Current actions cell:**
```tsx
<div className="actions">
  <Link to={`/app/company/${s.companyNumber}`} className="icon-btn" title="Open"><Icon name="external" size={14} /></Link>
  <button className="icon-btn" title="Refresh" onClick={...}><Icon name="refresh" size={14} /></button>
  <button className="icon-btn" onClick={() => remove(s.companyNumber)} title="Remove"><Icon name="trash" size={14} /></button>
</div>
```

**Replace with (add edit button as the first action):**
```tsx
<div className="actions">
  <button
    className="icon-btn"
    title={s.note ? 'Edit note' : 'Add note'}
    aria-label={s.note ? `Edit note for ${s.companyName}` : `Add note for ${s.companyName}`}
    onClick={() => {
      setEditingNote(s.companyNumber);
      setNoteValue(s.note ?? '');
    }}
  >
    <Icon name="edit" size={14} />
  </button>
  <Link to={`/app/company/${s.companyNumber}`} className="icon-btn" title="Open"><Icon name="external" size={14} /></Link>
  <button className="icon-btn" title="Refresh" onClick={...}><Icon name="refresh" size={14} /></button>
  <button className="icon-btn" onClick={() => remove(s.companyNumber)} title="Remove"><Icon name="trash" size={14} /></button>
</div>
```

### Part B: pages.css additions

Add within the `/* ==================== SAVED ====================  */` section, after `.icon-btn:hover`:

```css
.saved-note {
  font-size: 12px;
  color: var(--muted);
  margin-top: 3px;
  font-style: italic;
}

.note-input {
  margin-top: 4px;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 12px;
  font-family: var(--sans);
  color: var(--ink);
  background: #fff;
  width: 100%;
  max-width: 240px;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}

.note-input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(30,58,138,.10);
}

.note-input::placeholder {
  color: var(--muted-2);
}
```

### States
| State | Behaviour |
|---|---|
| No note, not editing | Only the pencil icon in actions. No text below company name. |
| Note exists, not editing | Small muted italic note text (`saved-note` class) visible below the company metadata line. Pencil icon in actions with title "Edit note". |
| Editing (any row) | Input replaces note display. `autoFocus` activates immediately. Other rows are unaffected — only one row edits at a time (a new click on another row's pencil calls `setEditingNote(newNumber)`, which closes the previous editor without saving). |
| Blur / Enter | Saves via `saveNote()`. On success, updates local `items` state optimistically. On failure, shows toast "Could not save note — try again" with `tone: 'bad'`. Editor closes in both cases. |
| Escape | Cancels without saving. Editor closes, `noteValue` cleared. |
| Empty note saved | Saving an empty string or whitespace-only string clears the note (`note: undefined` in local state). |

### Mobile/responsive
At ≤1000px the saved table collapses to `grid-template-columns: 38px 1fr auto` (existing rule in `pages.css`). The company cell (column 2, `1fr`) accommodates the note text and note input naturally. The `max-width: 240px` on `.note-input` prevents the input from stretching the column on very wide viewports; on mobile the `1fr` column constrains it automatically.

### Accessibility
- Edit button: `aria-label` is dynamic — "Add note for {companyName}" when no note exists, "Edit note for {companyName}" when a note is present.
- Input: `aria-label={`Note for ${s.companyName}`}` (static, identifies the field).
- `autoFocus` on the input is intentional — the user clicked a button to invoke it, so focus movement is expected and desirable.
- Keyboard: Enter saves, Escape cancels — both standard patterns.
- `Icon name="edit"` renders `aria-hidden="true"` (all icons do, per `Icon.tsx`) — the button's `aria-label` carries the accessible name.

### Edge cases
- Only one row can be in edit mode at a time. If the user clicks another row's pencil while editing, the first editor closes via `setEditingNote(newNumber)`. Because the `onBlur` fires before the new `onClick`, the previous note is saved (desired behaviour — the user clicked away).
- Note text with embedded newlines from the backend should render collapsed on one line in `.saved-note` (CSS `overflow: hidden` is not needed; the small font and natural wrapping handle it). The input does not support multi-line entry.
- The `api.updateSavedNote` call must handle empty string to mean "clear the note". Backend must accept `""` or `null` and clear the field accordingly.

---

## Item 5 — Fix id-card action row mobile overflow

### File to modify
`frontend/src/pages.css`

### Location
Inside the existing `@media (max-width: 1000px)` block at the bottom of the COMPANY REPORT section. The existing block already modifies `.id-meta` et al. Add two rules to that block.

### Rules to add (insert inside the existing `@media (max-width: 1000px)` block, immediately after `.answer-body { padding: 28px 22px; }` line):

```css
.id-card { grid-template-columns: 1fr; }
.id-actions .row { flex-wrap: wrap; }
```

No other changes. That is the complete implementation.

### Design rationale
The `.id-card` currently uses `grid-template-columns: 1fr auto`. On narrow viewports the `auto` column (actions) receives a minimum width sufficient to hold the widest button, which can cause the grid to overflow. Switching to `1fr` stacks the actions block below the identity block. The action buttons within `.id-actions .row` then wrap onto multiple lines (the `.row` class already has `flex-wrap: wrap; gap: 12px`). This is a pure CSS fix — no JavaScript or markup changes.

### States
- **≥ 1001px (desktop):** `.id-card { grid-template-columns: 1fr auto; }` — unchanged from current.
- **≤ 1000px (mobile):** Single column; actions wrap.

### Accessibility
No change. The DOM order (identity, then actions) is already the correct reading/focus order.

### Edge cases
- `.id-actions { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }` already exists. The `align-items: flex-end` will right-align the wrapped buttons on mobile. This is acceptable. If left-alignment is preferred, add `align-items: flex-start` inside the media query for `.id-actions` — but do not add this unless the PM confirms preference.
- The `refresh-line` (monospace timestamp) above the action row is unaffected.

---

## Item 6 — Wire bulk check row checkboxes + select-all

### File to modify
`frontend/src/pages/BulkCheckPage.tsx`

### New state (add alongside existing state declarations):
```tsx
const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
```

- Key type is `number` — uses `r.index` (the `BulkRow.index` field) as the unique identifier.
- Reset this state when a new file is uploaded. Add `setSelectedRows(new Set())` inside `processFile()`, after `setFilename(file.name)`.

### New helper functions (add after state declarations):

```tsx
const toggleRow = (index: number) => {
  setSelectedRows((cur) => {
    const next = new Set(cur);
    next.has(index) ? next.delete(index) : next.add(index);
    return next;
  });
};

const allSelected = filtered.length > 0 && filtered.every((r) => selectedRows.has(r.index));

const toggleSelectAll = () => {
  if (allSelected) {
    setSelectedRows(new Set());
  } else {
    setSelectedRows(new Set(filtered.map((r) => r.index)));
  }
};
```

Note: `allSelected` and `toggleSelectAll` depend on `filtered`, so they must be placed after `const filtered = ...` line, not before it.

### Markup changes

#### Header row — add checkbox before the `#` column:
**Current:**
```tsx
<div className="head">
  <span>#</span><span></span><span>Company</span><span>Status</span><span>Verdict</span><span>Confidence</span><span></span>
</div>
```

**Replace with:**
```tsx
<div className="head">
  <span>
    <input
      type="checkbox"
      checked={allSelected}
      onChange={toggleSelectAll}
      aria-label="Select all rows"
      style={{ accentColor: 'var(--accent)' }}
    />
  </span>
  <span>#</span><span></span><span>Company</span><span>Status</span><span>Verdict</span><span>Confidence</span><span></span>
</div>
```

This adds one column to the grid. The grid column definition in `.results-table .head` and `.brow` is currently `grid-template-columns: 40px 38px 1fr 120px 200px 140px 60px`. Add a new `32px` column at the start:

#### CSS change required — in pages.css, find:
```css
.results-table .head { display: grid; grid-template-columns: 40px 38px 1fr 120px 200px 140px 60px; ... }
.brow { display: grid; grid-template-columns: 40px 38px 1fr 120px 200px 140px 60px; ... }
```

**Replace both column definitions with:**
```css
grid-template-columns: 32px 40px 38px 1fr 120px 200px 140px 60px;
```

Apply to both `.results-table .head` and `.brow` rules. All other properties on those rules stay unchanged.

Also update the mobile responsive rule. In the existing `@media (max-width: 1000px)` block in `pages.css`:
```css
.results-table .head, .brow { grid-template-columns: 38px 1fr 80px; }
.results-table .head > :not(:nth-child(-n+3)),
.brow > :not(:nth-child(-n+3)) { display: none; }
```
**Replace with:**
```css
.results-table .head, .brow { grid-template-columns: 32px 38px 1fr; }
.results-table .head > :not(:nth-child(-n+3)),
.brow > :not(:nth-child(-n+3)) { display: none; }
```
This hides all columns after the 3rd (checkbox, #, company) on mobile.

#### Data rows — wire the existing decorative `<input type="checkbox" />`:
**Current:**
```tsx
<input type="checkbox" />
```

**Replace with:**
```tsx
<input
  type="checkbox"
  checked={selectedRows.has(r.index)}
  onChange={() => toggleRow(r.index)}
  aria-label={`Select ${r.companyName ?? r.input}`}
  style={{ accentColor: 'var(--accent)' }}
/>
```

#### Selection count badge — add next to "Export CSV" button in the toolbar:
**Current toolbar Export CSV button:**
```tsx
<button
  className="btn btn-secondary btn-sm"
  aria-label="Export bulk check results as CSV"
  style={{ marginLeft: 'auto' }}
  onClick={...}
>
  <Icon name="download" /> Export CSV
</button>
```

**Replace with:**
```tsx
<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
  {selectedRows.size > 0 && (
    <span
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 12,
        color: 'var(--ink-2)',
        background: 'var(--soft)',
        border: '1px solid var(--line)',
        borderRadius: 6,
        padding: '4px 8px',
      }}
      aria-live="polite"
      aria-label={`${selectedRows.size} row${selectedRows.size !== 1 ? 's' : ''} selected`}
    >
      {selectedRows.size} selected
    </span>
  )}
  <button
    className="btn btn-secondary btn-sm"
    aria-label="Export bulk check results as CSV"
    onClick={...}
  >
    <Icon name="download" /> Export CSV
  </button>
</div>
```

### States
| State | Behaviour |
|---|---|
| No rows selected | Badge hidden. Select-all checkbox unchecked. |
| Some rows selected (not all) | Badge shows "N selected". Select-all checkbox in indeterminate state — set `ref.indeterminate = true` (see edge case below). |
| All visible rows selected | Badge shows "N selected". Select-all checkbox checked. |
| Filter changes (e.g. switch from "all" to "safe") | `allSelected` recomputes against the new `filtered` array. `selectedRows` state is not cleared — rows from other filter buckets remain selected (they are just not visible). This is intentional to match the SavedPage pattern. |
| New file uploaded | `selectedRows` resets to empty `Set`. |

### Checkbox indeterminate state
The native `indeterminate` property cannot be set via JSX props. Add a `ref` to the select-all checkbox:

```tsx
const selectAllRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (selectAllRef.current) {
    const someSelected = selectedRows.size > 0 && !allSelected;
    selectAllRef.current.indeterminate = someSelected;
  }
}, [selectedRows.size, allSelected]);
```

Then add `ref={selectAllRef}` to the select-all `<input>`.

### Mobile/responsive
On ≤1000px the checkbox column (32px) plus the # column (38px) plus company (1fr) are the only visible columns — all others are hidden per the updated media query above.

### Accessibility
- Select-all: `aria-label="Select all rows"`.
- Row checkboxes: `aria-label={`Select ${r.companyName ?? r.input}`}`.
- Selection count badge: `aria-live="polite"` so screen readers announce changes without interrupting.
- `accentColor: 'var(--accent)'` (the CSS property `accent-color`) applies brand orange tint to the native checkbox. This is a progressive enhancement — unsupported browsers fall back to the system checkbox style.

### Edge cases
- `r.index` is the canonical key, not array position. If `filtered` changes order due to filter switching, the set membership check `selectedRows.has(r.index)` remains correct.
- Do not wire the "Export CSV" button to export only selected rows — that is out of scope for this item. The export continues to export all `result.rows` as before.

---

## Item 7 — "Show all N filings" expand in filings tab

### File to modify
`frontend/src/pages/CompanyReportPage.tsx`

### New state (add alongside existing state declarations):
```tsx
const [showAllFilings, setShowAllFilings] = useState(false);
```

Reset this state when a new company loads by including it in the `useEffect` cleanup (add `setShowAllFilings(false)` in the existing `useEffect` that calls `api.getReport(id)`, inside the callback before `setReport(r)`).

### Location
Inside `panel-filings`, replace the current `.data-card` contents.

### Current markup:
```tsx
<div className="data-card">
  <h3>Recent filings</h3>
  <div className="timeline">
    {report.filings.slice(0, 20).map((f) => (
      ...
    ))}
  </div>
</div>
```

### New markup:
```tsx
<div className="data-card">
  <h3>
    Recent filings
    {report.filings.length > 20 && !showAllFilings && (
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--muted)',
          fontWeight: 400,
          marginLeft: 10,
          letterSpacing: '.01em',
        }}
      >
        (showing 20 of {report.filings.length})
      </span>
    )}
  </h3>
  <div className="timeline">
    {(showAllFilings ? report.filings : report.filings.slice(0, 20)).map((f) => (
      <div key={f.id} className={cn('tl-item', f.category === 'insolvency' ? 'bad' : f.category === 'accounts' ? 'ok' : '')}>
        <div className="when">{formatDate(f.date)} · {f.type}</div>
        <h5>{f.category.replace('-', ' ')}</h5>
        <p>{f.description}</p>
      </div>
    ))}
  </div>
  {report.filings.length > 20 && !showAllFilings && (
    <button
      className="btn btn-ghost btn-sm"
      style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}
      onClick={() => setShowAllFilings(true)}
    >
      Show all {report.filings.length} filings
    </button>
  )}
</div>
```

### Design tokens used
| Element | Class / Property | Value |
|---|---|---|
| "Show all" button | `btn btn-ghost btn-sm` | Existing button styles. Ghost = `background: transparent; color: var(--ink-2)`. Override color to `var(--muted)` inline to give it a link-style de-emphasis. |
| "Show all" button | margin-top | 12px (below the timeline) |
| "Show all" button | font-size | 13px (override of `btn-sm`'s 13px — same, but stated explicitly) |
| "(showing 20 of N)" label | font-family | `var(--mono)` |
| "(showing 20 of N)" label | font-size | 11px |
| "(showing 20 of N)" label | color | `var(--muted)` |
| "(showing 20 of N)" label | font-weight | 400 |
| "(showing 20 of N)" label | margin-left | 10px (separation from "Recent filings" text) |

### States
| State | Behaviour |
|---|---|
| ≤ 20 filings total | No button, no "(showing X of Y)" label. `showAllFilings` state is irrelevant. |
| > 20 filings, collapsed (default) | First 20 items shown. "(showing 20 of N)" in header. "Show all N filings" button below timeline. |
| > 20 filings, expanded | All filings shown. Button hidden. Header label hidden. No "collapse" button — once expanded, stays expanded for the session. |
| New company loaded (id changes) | `showAllFilings` resets to `false` (see state reset above). |

### Mobile/responsive
The button and label are block-level elements — they reflow naturally on narrow viewports. No additional responsive rules needed.

### Accessibility
- The "(showing 20 of N)" span is inside `<h3>` — screen readers will read the full h3 text including the count. This is intentional.
- "Show all N filings" button is a native `<button>` with descriptive text — no `aria-label` needed.
- After clicking "Show all", focus remains on the (now-hidden) button's position. The newly visible filings are in document flow below — no focus management needed.

### Edge cases
- `report.filings.length` may be 0. The existing empty-state handling is unchanged (if no filings, the `.timeline` renders nothing — add `{report.filings.length === 0 && <div className="empty">No filing history available.</div>}` if desired, but this is out of scope for this item).
- The threshold of 20 is hardcoded. Do not make it configurable.

---

## Item 8 — PSC ceasedOn + distinguish former PSCs

### File to modify
`frontend/src/pages/CompanyReportPage.tsx`

### Location
Inside `panel-people`, the PSC section. Current code:
```tsx
<div className="data-card">
  <h3>Persons with significant control ({report.psc.length})</h3>
  {report.psc.length === 0 && <div className="empty">No PSC declared. Requires manual review.</div>}
  {report.psc.map((p, i) => (
    <div key={i} className="person">
      <div className="av"><Icon name="user" /></div>
      <div>
        <div className="name">{p.name}</div>
        <div className="role">{p.kind} · {p.natureOfControl.join(', ').replaceAll('-', ' ')}</div>
      </div>
      <div className="when">{formatDate(p.notifiedOn)}</div>
    </div>
  ))}
</div>
```

### New markup — replace the entire PSC `.data-card`:
```tsx
{(() => {
  const activePsc = report.psc.filter((p) => !p.ceasedOn);
  const ceasedPsc = report.psc.filter((p) => !!p.ceasedOn);
  return (
    <div className="data-card">
      <h3>
        Persons with significant control
        {report.psc.length > 0 ? (
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--muted)',
              fontWeight: 400,
              marginLeft: 10,
              letterSpacing: '.01em',
            }}
          >
            {activePsc.length} active{ceasedPsc.length > 0 ? `, ${ceasedPsc.length} ceased` : ''}
          </span>
        ) : (
          ` (${report.psc.length})`
        )}
      </h3>
      {report.psc.length === 0 && (
        <div className="empty">No PSC declared. Requires manual review.</div>
      )}
      {activePsc.map((p, i) => (
        <div key={`active-${i}`} className="person">
          <div className="av"><Icon name="user" /></div>
          <div>
            <div className="name">{p.name}</div>
            <div className="role">{p.kind} · {p.natureOfControl.join(', ').replaceAll('-', ' ')}</div>
          </div>
          <div className="when">Notified {formatDate(p.notifiedOn)}</div>
        </div>
      ))}
      {ceasedPsc.map((p, i) => (
        <div key={`ceased-${i}`} className="person" style={{ opacity: 0.6 }}>
          <div className="av"><Icon name="user" /></div>
          <div>
            <div className="name">
              {p.name}
              <span
                className="zone-tag deduced"
                style={{ marginLeft: 8, fontSize: 9, padding: '2px 5px' }}
              >
                Former PSC
              </span>
            </div>
            <div className="role">{p.kind} · {p.natureOfControl.join(', ').replaceAll('-', ' ')}</div>
          </div>
          <div className="when">Ceased {formatDate(p.ceasedOn)}</div>
        </div>
      ))}
    </div>
  );
})()}
```

### Design tokens used
| Element | Class / Property | Value |
|---|---|---|
| "N active, M ceased" header label | `var(--mono)`, 11px, `var(--muted)`, weight 400, margin-left 10px | Same pattern as Item 7 header label |
| Active PSC rows | No change from current | Standard `.person` styling |
| "Notified {date}" `.when` | Text change only | "Notified " prefix added (was just `{formatDate(p.notifiedOn)}`) |
| Ceased PSC rows | `opacity: 0.6` on `.person` container | Inline style — entire row including avatar, name, role, date |
| "Former PSC" tag | `zone-tag deduced` + inline overrides | Existing `zone-tag deduced` = `background: var(--warn-bg); color: var(--warn); font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .07em; padding: 3px 7px; border-radius: 5px; font-weight: 600`. Override to `fontSize: 9, padding: '2px 5px'` to keep it compact inline with the name. |
| "Ceased {date}" `.when` | "Ceased " prefix instead of "Notified " | Uses same `formatDate()` helper on `p.ceasedOn` |

### Sort order
Active PSCs render first (in original array order filtered by `!p.ceasedOn`). Ceased PSCs render second (in original array order filtered by `!!p.ceasedOn`). No additional sorting.

### States
| State | Behaviour |
|---|---|
| All PSCs active | Header: "N active" (no ceased count). All rows rendered normally. |
| Mixed (some ceased) | Header: "N active, M ceased". Active rows first, ceased rows below with opacity 0.6 and "Former PSC" tag. |
| All PSCs ceased | Header: "0 active, N ceased". All rows rendered as ceased. |
| No PSCs | Header: "(0)" via the existing fallback. Empty state div renders. |

### Mobile/responsive
`.person { display: grid; grid-template-columns: 36px 1fr auto; }` — unchanged. The inline "Former PSC" tag is within the name div (`1fr` column) and wraps naturally if the name is long. No responsive-specific changes needed.

### Accessibility
- `opacity: 0.6` reduces visual prominence without removing content from the accessibility tree. Screen readers will still announce ceased PSC rows.
- "Former PSC" tag has no `aria-label` — its text content "FORMER PSC" is readable by screen readers as-is.
- The `zone-tag deduced` class has `background: var(--warn-bg); color: var(--warn)` — contrast of orange-on-pale-orange may be marginal. The tag is supplementary to the opacity treatment and the "Ceased" date text; it is not the sole indication of ceased status.

### Edge cases
- `p.ceasedOn` is typed `string | undefined` in `PscEntry`. The filter `!!p.ceasedOn` handles `undefined` and empty string `""`. If the backend sends `null`, add `p.ceasedOn != null` to the filter condition.
- `formatDate(undefined)` returns `'—'` per the existing helper — this is acceptable for the ceased date display if data is missing.

---

## Item 9 — Add SIC code + company type rows to ComparePage

### File to modify
`frontend/src/pages/ComparePage.tsx`

### Location
Inside the `{!loading && reports.length > 0 && ( <div className="compare-grid"> ... </div> )}` block. Add the two new `<Row>` entries immediately after the existing `<Row label="Trading history" .../>` component and before `<Row label="Insolvency" .../>`.

### New rows to insert:
```tsx
<Row label="Company type" cells={reports.map((r) => ({
  tone: 'ok' as const,
  val: r.profile.companyType,
  sub: '',
}))} />

<Row label="Industry (SIC)" cells={reports.map((r) => ({
  tone: 'ok' as const,
  val: r.profile.sicCodes?.join(', ') || '—',
  sub: '',
}))} />
```

### Design tokens used
The `Row` component renders each cell as:
```tsx
<div className={cn('ccell', ...)}>
  <div className="v-line">
    <Icon name="check" className="ok" />
    <span style={{ color: 'var(--ok)' }}>{c.val}</span>
  </div>
  <div className="sub">{c.sub}</div>
</div>
```

For `tone: 'ok'`, the icon is `check` in `var(--ok)` colour and the val text is `var(--ok)`. This is the correct rendering — company type and SIC code are neutral facts, not positive signals, but the `Row` component's visual language does not have a "neutral" tone separate from "ok". Using `ok` always is the specified design intent for these rows. The `sub` is an empty string — the `.sub` div renders but is invisible (empty text, no height).

### States
| State | Behaviour |
|---|---|
| `companyType` present | Renders the string verbatim (e.g. "private-unlimited", "ltd"). |
| `companyType` absent / empty | TypeScript types do not mark this optional, so it should always be present. If absent, `r.profile.companyType` evaluates to `undefined` and renders as `""` — acceptable. |
| `sicCodes` present, one or more | Codes joined with `', '` (e.g. "62012, 62020"). |
| `sicCodes` absent or empty array | Falls back to `'—'`. |

### Mobile/responsive
The compare grid collapses to `grid-template-columns: 1fr` at ≤1000px (existing rule). The two new rows collapse the same way — no additional changes needed.

### Accessibility
No changes to the `Row` component. The two new rows follow the same pattern as all existing rows.

### Edge cases
- Do NOT add `bestIdx` or `worstIdx` props to these rows. They have no meaningful "best/worst" ranking — company type and industry are not scored.
- SIC codes from Companies House are always 5-digit strings. A company can have multiple SIC codes (up to 4). The joined string could be up to 29 characters (`"62012, 62020, 62030, 62040"`) — this fits comfortably within the `ccell` column.
- The `RowProps` interface in `ComparePage.tsx` currently requires `cells` items to have `{ tone, val, sub }`. Both new rows satisfy this contract with the `sub: ''` value.

---

## Item 10 — Fix AppNav mobile accessibility

### Files to modify
1. `frontend/src/layout/AppNav.tsx` — add `aria-label` props
2. `frontend/src/index.css` — add `.sr-only` utility class

### Part A: AppNav.tsx changes

The four `<NavLink>` elements currently have `title` attributes for tooltip-style labelling. Add persistent `aria-label` attributes to each. These are in addition to (not replacing) the `title` attributes.

#### Search link — current:
```tsx
<NavLink to="/app/search" className={...} title="Search UK companies">
  <Icon name="search" />
  <span>Search</span>
</NavLink>
```
**Add** `aria-label="Search UK companies"`.

#### Compare link — current:
```tsx
<NavLink to="/app/compare" className={...} title="Compare up to 3 companies side by side">
  <Icon name="compare" />
  <span>Compare</span>
</NavLink>
```
**Add** `aria-label="Compare companies"`.

#### Saved link — current:
```tsx
<NavLink to="/app/saved" className={...} aria-label={unread > 0 ? `Saved — ${unread} unread alert${unread !== 1 ? 's' : ''}` : undefined} title="Your saved companies and change alerts">
```
**Replace the `aria-label` value** with:
```tsx
aria-label={unread > 0 ? `Saved — ${unread} unread alerts` : 'Saved companies'}
```
The current code uses `undefined` as the value when `unread === 0`, which means no `aria-label` is present and screen readers fall back to the link's text content ("Saved"). The new value `'Saved companies'` is more descriptive and always present.

Note on plural: The spec says `${unread} unread alerts` (always "alerts" plural). This differs from the current implementation which uses `alert${unread !== 1 ? 's' : ''}` (correctly singular for 1). Implement as specified: `Saved — ${unread} unread alerts` always.

#### Bulk check link — current:
```tsx
<NavLink to="/app/bulk" className={...} title="Bulk check up to 50 companies">
  <Icon name="upload" />
  <span>Bulk check</span>
</NavLink>
```
**Add** `aria-label="Bulk check"`.

#### Complete updated nav markup:
```tsx
<nav className="app-tabs" aria-label="App">
  <NavLink
    to="/app/search"
    className={({ isActive }) => (isActive ? 'active' : '')}
    title="Search UK companies"
    aria-label="Search UK companies"
  >
    <Icon name="search" />
    <span>Search</span>
  </NavLink>
  <NavLink
    to="/app/compare"
    className={({ isActive }) => (isActive ? 'active' : '')}
    title="Compare up to 3 companies side by side"
    aria-label="Compare companies"
  >
    <Icon name="compare" />
    <span>Compare</span>
  </NavLink>
  <NavLink
    to="/app/saved"
    className={({ isActive }) => (isActive ? 'active' : '')}
    aria-label={unread > 0 ? `Saved — ${unread} unread alerts` : 'Saved companies'}
    title="Your saved companies and change alerts"
  >
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <Icon name="star" />
      {unread > 0 && (
        <span aria-hidden="true" style={{
          position: 'absolute', top: -4, right: -6,
          background: 'var(--bad)', color: '#fff',
          borderRadius: '50%', fontSize: 10, fontWeight: 700,
          width: 16, height: 16, display: 'flex',
          alignItems: 'center', justifyContent: 'center', lineHeight: 1,
        }}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </span>
    <span>Saved</span>
  </NavLink>
  <NavLink
    to="/app/bulk"
    className={({ isActive }) => (isActive ? 'active' : '')}
    title="Bulk check up to 50 companies"
    aria-label="Bulk check"
  >
    <Icon name="upload" />
    <span>Bulk check</span>
  </NavLink>
</nav>
```

### Part B: index.css — add `.sr-only`

Add immediately before the `/* ============================================================ Responsive ============================================================ */` block (i.e. after the `Toggle` section and before the `Footer` section):

```css
/* ============================================================
   Screen-reader only utility
   ============================================================ */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

This class is not yet used in any component by this item, but it is a standard utility that subsequent items or other engineers may reference. Adding it now prevents ad-hoc duplication.

### States
- **Desktop (≥ 1001px):** `<span>` text is visible alongside the icon. `aria-label` on the link is still present but the visible text acts as the primary label. No conflict — `aria-label` overrides the accessible name computation, so screen readers will announce the `aria-label` value.
- **Mobile (≤ 1000px):** `app-tabs span:not(.dot-unread) { display: none; }` hides the text spans. The `aria-label` on the link is the only accessible name for screen readers. The `title` attribute provides a browser tooltip on long-press/hover.

### Accessibility
- `aria-label` on a `<NavLink>` (renders as `<a>`) overrides the computed accessible name from child text. This is the correct pattern when you want more context than the visible text.
- The unread dot badge has `aria-hidden="true"` — it is purely visual. The count information is surfaced via the `aria-label` on the link itself.
- The `<nav aria-label="App">` container is already present and provides a landmark region.

### Edge cases
- `unread` is fetched from `api.alertsFeed()` on mount and may briefly be `0` before the API responds. During this window, the `aria-label` is `'Saved companies'` — correct.
- If `api.alertsFeed()` throws, `unread` remains `0` (per `catch(() => {})`) — the safe default.
- The `aria-label` for Compare is `"Compare companies"` (shorter than the `title`). This is intentional — the title is tooltip-quality detail; the aria-label is a concise accessible name.

---

## Cross-cutting notes for the engineer

1. **`formatDate` is already imported** in `CompanyReportPage.tsx`. Items 1, 2, 3, 7, 8 all operate inside that file and may use it freely.

2. **`cn()` is already imported** in all modified files. Use it for conditional class joining wherever needed.

3. **No new design tokens are introduced** in this spec. All colours, font sizes, spacing values, and border radii reference existing CSS variables from `index.css`.

4. **Icon `"edit"` already exists** in `Icon.tsx` with path `'M2 12v2h2l7-7-2-2-7 7zM10 3l2 2'`. It can be used as `<Icon name="edit" size={14} />` with no changes to the Icon component.

5. **`PscEntry.ceasedOn` is already typed** as `string | undefined` in `types/index.ts`. No type changes required for Item 8.

6. **`SavedCompany.note` is already typed** as `string | undefined` in `types/index.ts`. No type changes required for Item 4.

7. **`RiskAssessment.explanationSummary` is already typed** as `string` in `types/index.ts`. No type changes required for Item 1.

8. **`DisqualificationMatch.reason`, `.disqualifiedFrom`, `.disqualifiedUntil` are already typed** as `string | undefined` in `types/index.ts`. No type changes required for Item 2.

9. **Items 5 and 6 both modify `pages.css`**. The grid column change for `.results-table .head` and `.brow` (Item 6) and the `.id-card` mobile fix (Item 5) are in different sections of the file and do not conflict.

10. **Items 4 and 10 both modify `index.css` or `pages.css`**. Item 4 adds `.saved-note` and `.note-input` to the SAVED section of `pages.css`. Item 10 adds `.sr-only` to `index.css`. No conflict.
