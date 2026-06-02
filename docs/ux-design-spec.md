# CareerMoveChecker — UX / Visual Design Spec
## 10 Improvement Items
**Prepared for:** Engineering  
**Based on codebase read:** 2026-06-02  
**All file paths are absolute from repo root `/home/user/CareerMoveChecker/`**

---

## Item 1 — ScoreGauge visible in Zone B verdict card

### Components affected
- `frontend/src/pages/CompanyReportPage.tsx`
- `frontend/src/components/ScoreGauge.tsx` (read-only — no changes needed)

### Current state
`ScoreGauge` is already imported at line 10 of `CompanyReportPage.tsx` and already rendered at lines 209–211 inside `.answer-body`:

```tsx
<div style={{ marginBottom: 24 }}>
  <ScoreGauge score={a.score} confidence={a.confidence} />
</div>
```

The component is therefore **already present in Zone B**. No insertion is needed.

### What IS needed — layout and sizing audit
The `ScoreGauge` renders correctly but has no explicit width constraint inside `.answer-body` (which has `padding: 36px 40px` on desktop, `28px 22px` on mobile per `pages.css` line 669). On narrow mobile viewports the gauge bar fills the full card width — this is correct behaviour and should be preserved.

**Verify the following in the rendered output and fix if broken:**

1. The `<div style={{ marginBottom: 24 }}>` wrapper must sit **above** `.answer-q` (the mono-caps "Should you trust this company?" label). Order in JSX is correct at lines 209–215; do not reorder.
2. `ScoreGauge` receives `score={a.score}` (number 0–100) and `confidence={a.confidence}` (float 0–1). Both come from `report.assessment`. No prop changes needed.
3. The gauge's internal `role="meter"` div already has `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`. See Item 6 for the missing `aria-valuetext` fix.

### States
| State | Behaviour |
|---|---|
| Loading | Zone B does not render; only the `<div className="skel" style={{ height: 200 }} />` skeleton shows. No change needed. |
| Report null | Zone B does not render; "Company not found" state-card shows. No change needed. |
| Score = 0 | Bar renders at 0% width; colour is `var(--bad)`. Correct. |
| Score = 100 | Bar renders at 100% width; colour is `var(--ok)`. Correct. |

### Responsive behaviour
`.answer-body` already shrinks padding on mobile (line 669 of `pages.css`). No additional rules needed.

### Accessibility
See Item 6 for `aria-valuetext` addition to `ScoreGauge`.

### Copy
No copy changes. The existing "How is this calculated? → Methodology" link text in `ScoreGauge.tsx` line 65 is preserved as-is.

---

## Item 2 — API error states on Search, Report, and Compare pages

### Components affected
- `frontend/src/pages/SearchPage.tsx`
- `frontend/src/pages/CompanyReportPage.tsx`
- `frontend/src/pages/ComparePage.tsx`

### Design pattern — error card
Use the existing `.state-card` class (defined in `pages.css` lines 360–365) with the `.danger` modifier (defined on line 361: `border-color: var(--bad); background: var(--bad-bg)`).

The glyph icon for error states is `"alert"` (already used in the codebase, e.g. `CompanyReportPage.tsx` line 203).

The Retry button uses `className="btn btn-secondary btn-sm"`.

**Error card template (reuse across all three pages):**
```tsx
<div className="state-card danger">
  <div className="glyph" style={{ background: 'var(--bad-bg)', color: 'var(--bad)' }}>
    <Icon name="alert" size={20} />
  </div>
  <h3>{PAGE_SPECIFIC_TITLE}</h3>
  <p>{PAGE_SPECIFIC_BODY}</p>
  <button className="btn btn-secondary btn-sm" onClick={RETRY_HANDLER}>
    <Icon name="refresh" /> Try again
  </button>
</div>
```

---

### 2a — SearchPage error state

**New state variable** — add alongside existing `loading` and `searched`:
```tsx
const [error, setError] = useState(false);
```

**Update the `useEffect` that calls `api.searchCompanies`** (currently lines 43–58). Change the `.catch` handler:
```tsx
// Before
.catch(() => {
  if (!stop) {
    setHits([]);
    setLoading(false);
  }
});

// After
.catch(() => {
  if (!stop) {
    setHits([]);
    setLoading(false);
    setError(true);
  }
});
```

Also reset error on new search start:
```tsx
setError(false); // add this line alongside setLoading(true) and setSearched(true)
```

**Where the error card renders** — inside the results column `<div>` (the first child of `.search-grid`), rendered when `error && !loading`. Place it immediately after the `{loading && ...}` block and before the `{noResults && ...}` block:

```tsx
{error && !loading && (
  <div className="state-card danger">
    <div className="glyph" style={{ background: 'var(--bad-bg)', color: 'var(--bad)' }}>
      <Icon name="alert" size={20} />
    </div>
    <h3>Search failed</h3>
    <p>We couldn't reach Companies House right now. Check your connection and try again.</p>
    <button
      className="btn btn-secondary btn-sm"
      onClick={() => {
        setError(false);
        setParams(q.trim() ? { q: q.trim() } : {});
      }}
    >
      <Icon name="refresh" /> Try again
    </button>
  </div>
)}
```

**Exact copy:**
- Heading: `Search failed`
- Body: `We couldn't reach Companies House right now. Check your connection and try again.`
- Button: `Try again`

**Distinguish error from no-results:** `noResults` is only truthy when `searched && !loading && hits.length === 0 && initialQ` — and now also only when `!error`. Add `&& !error` to the `noResults` condition:
```tsx
const noResults = searched && !loading && hits.length === 0 && initialQ && !error;
```

---

### 2b — CompanyReportPage error state

**Current issue:** `api.getReport` at line 77 uses `.then((r) => { ... })` with no `.catch`. The `api.client.ts` definition (line 36–37) already swallows errors with `.catch(() => null)`, so the page shows "Company not found" on any failure (network or genuine 404). These must be distinguished.

**Change `api.getReport` call signature** — the `api` client's `.catch(() => null)` must be removed so the page can distinguish error from not-found. Change `client.ts` line 36–37 from:
```ts
getReport: (companyNumber: string) =>
  http<CompanyReport>(`/api/companies/${encodeURIComponent(companyNumber)}/report`).catch(() => null),
```
to:
```ts
getReport: (companyNumber: string) =>
  http<CompanyReport>(`/api/companies/${encodeURIComponent(companyNumber)}/report`),
```

**Add new state variable** in `CompanyReportPage`:
```tsx
const [error, setError] = useState(false);
```

**Update the `useEffect`** (lines 74–84):
```tsx
useEffect(() => {
  let stop = false;
  setLoading(true);
  setError(false);
  api.getReport(id)
    .then((r) => {
      if (!stop) {
        setReport(r);
        setLoading(false);
      }
    })
    .catch((err) => {
      if (!stop) {
        // HTTP 404 → not found; anything else → error
        if (String(err?.message).includes('404')) {
          setReport(null);
        } else {
          setError(true);
        }
        setLoading(false);
      }
    });
  return () => { stop = true; };
}, [id]);
```

**Where the error card renders** — between the loading guard and the not-found guard (currently lines 99–109). Insert after `if (loading) return ...`:

```tsx
if (error) return (
  <div className="wrap" style={{ padding: 60 }}>
    <div className="state-card danger">
      <div className="glyph" style={{ background: 'var(--bad-bg)', color: 'var(--bad)' }}>
        <Icon name="alert" size={20} />
      </div>
      <h3>Report unavailable</h3>
      <p>We couldn't load the report for {id}. This may be a temporary issue with Companies House data.</p>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => {
          setLoading(true);
          setError(false);
          api.getReport(id)
            .then((r) => { setReport(r); setLoading(false); })
            .catch(() => { setError(true); setLoading(false); });
        }}
      >
        <Icon name="refresh" /> Try again
      </button>
    </div>
  </div>
);
```

**Exact copy:**
- Heading: `Report unavailable`
- Body: `We couldn't load the report for {id}. This may be a temporary issue with Companies House data.`  
  *(where `{id}` is the raw company number from `useParams`)*
- Button: `Try again`

---

### 2c — ComparePage error state

**New state variable:**
```tsx
const [error, setError] = useState(false);
```

**Update the `useEffect`** (lines 20–25):
```tsx
useEffect(() => {
  if (numbers.length === 0) { setReports([]); return; }
  setLoading(true);
  setError(false);
  api.compare(numbers)
    .then((r) => { setReports(r); setLoading(false); })
    .catch(() => { setError(true); setLoading(false); });
  setParams(numbers.length ? { numbers: numbers.join(',') } : {});
}, [numbers.join(',')]); // eslint-disable-line
```

**Where the error card renders** — below the `{loading && ...}` block and above the `{!loading && reports.length === 0 && ...}` block:

```tsx
{error && !loading && (
  <div className="state-card danger" style={{ marginTop: 24 }}>
    <div className="glyph" style={{ background: 'var(--bad-bg)', color: 'var(--bad)' }}>
      <Icon name="alert" size={20} />
    </div>
    <h3>Comparison failed</h3>
    <p>We couldn't load one or more reports. Check your company numbers and try again.</p>
    <button
      className="btn btn-secondary btn-sm"
      onClick={() => {
        setError(false);
        setLoading(true);
        api.compare(numbers)
          .then((r) => { setReports(r); setLoading(false); })
          .catch(() => { setError(true); setLoading(false); });
      }}
    >
      <Icon name="refresh" /> Try again
    </button>
  </div>
)}
```

**Exact copy:**
- Heading: `Comparison failed`
- Body: `We couldn't load one or more reports. Check your company numbers and try again.`
- Button: `Try again`

### States summary for all three pages
| State | Visual |
|---|---|
| Loading | Existing skeleton/spinner unchanged |
| Empty / not found | Existing `.state-card` (no `.danger` modifier) unchanged |
| Error | New `.state-card.danger` with alert icon and retry button |
| Success | Normal content unchanged |

### Responsive behaviour
`.state-card` already works on all viewports (it is a block-level box with `text-align: center` and no grid columns).

### Accessibility
- `.state-card.danger` has `border-color: var(--bad)` and `background: var(--bad-bg)`. The text colour inside uses `var(--ink)` for the heading and `var(--muted)` for the body — both pass 4.5:1 contrast on `var(--bad-bg)` (#fbe7e7).
- The retry button uses `className="btn btn-secondary btn-sm"`. It has no `disabled` state during retry; wrap the retry handler to set `loading(true)` so the button disappears while refetching.
- No `role="alert"` needed; the card replaces page content entirely so focus should land on the first focusable element (the retry button) automatically.

---

## Item 3 — Tab ARIA roles and keyboard navigation on Company Report (Zone C)

### Components affected
- `frontend/src/pages/CompanyReportPage.tsx`

### Current structure (lines 266–273)
```tsx
<section className="zone-c">
  <div className="tabs" style={{ marginTop: 32 }}>
    {TAB_IDS.map((t) => (
      <button key={t} className={cn('tab', tab === t && 'active')} onClick={() => setTab(t)}>
        {TAB_LABELS[t]}
      </button>
    ))}
  </div>
  {tab === 'flags' && (...)}
  {tab === 'identity' && (...)}
  ...
```

### Required changes

#### 3a — Tab list container
The `.tabs` div must become the ARIA tablist. Change:
```tsx
<div className="tabs" style={{ marginTop: 32 }}>
```
to:
```tsx
<div
  className="tabs"
  style={{ marginTop: 32 }}
  role="tablist"
  aria-label="Company report sections"
  onKeyDown={handleTabKeyDown}
>
```

#### 3b — Individual tab buttons
Each `<button>` in the `TAB_IDS.map` must carry ARIA tab attributes:
```tsx
<button
  key={t}
  id={`tab-${t}`}
  role="tab"
  aria-selected={tab === t}
  aria-controls={`panel-${t}`}
  tabIndex={tab === t ? 0 : -1}
  className={cn('tab', tab === t && 'active')}
  onClick={() => setTab(t)}
>
  {TAB_LABELS[t]}
</button>
```

- `id="tab-{t}"` — e.g. `tab-flags`, `tab-identity`, `tab-people`, `tab-finance`, `tab-filings`
- `role="tab"`
- `aria-selected={tab === t}` — boolean, true for active tab
- `aria-controls="panel-{t}"` — links to the panel below
- `tabIndex={tab === t ? 0 : -1}` — roving tabindex; only the active tab is in the tab order

#### 3c — Tab panel divs
Each tab's content section must be wrapped in a `<div>` with panel attributes. Currently each panel renders via a bare conditional `{tab === 'flags' && (...)}`. Wrap each:

**Flags panel** (currently starts at line 275):
```tsx
<div
  id="panel-flags"
  role="tabpanel"
  aria-labelledby="tab-flags"
  hidden={tab !== 'flags'}
  tabIndex={0}
>
  {/* existing flags JSX */}
</div>
```

Repeat the same pattern for `identity`, `people`, `finance`, and `filings` panels.

- `id="panel-{t}"` — matches `aria-controls` on the button
- `role="tabpanel"`
- `aria-labelledby="tab-{t}"` — matches the button `id`
- `hidden={tab !== t}` — use HTML `hidden` attribute rather than conditional rendering so screen readers can still find all panels; this also avoids destroying component state (e.g. the Leaflet map) on tab switch. **This is a meaningful change from conditional rendering to always-render with `hidden`.**
- `tabIndex={0}` — allows panel to receive focus via keyboard

**Note on always rendering vs conditional:** Because `tab === 'identity'` currently mounts/unmounts the `<AddressMap>` component (which creates a Leaflet map instance), switching to `hidden` means the map is always mounted. The `AddressMap` component reads `coords` state and renders a skeleton or null when coords are absent — this is safe. However the Leaflet instance will `invalidateSize()` once on mount regardless of visibility. Add `if (!containerRef.current || containerRef.current.offsetParent === null) return;` before the `L.map()` call inside `AddressMap` to avoid initialising a map in a hidden panel. Better alternative: keep conditional rendering for the `identity` tab only and use `hidden` for the others (which have no complex mount logic). Spec both approaches:

**Preferred approach (simplest, no Leaflet side-effect):** Keep conditional rendering but still add `hidden` to the non-map panels. For the identity panel specifically, keep `{tab === 'identity' && (...)}` but wrap it:
```tsx
{tab === 'identity' && (
  <div id="panel-identity" role="tabpanel" aria-labelledby="tab-identity" tabIndex={0}>
    {/* existing identity JSX */}
  </div>
)}
```
For all other four panels, use always-render with `hidden`:
```tsx
<div
  id="panel-flags"
  role="tabpanel"
  aria-labelledby="tab-flags"
  hidden={tab !== 'flags'}
  tabIndex={0}
>
  {/* existing flags JSX */}
</div>
```

#### 3d — Keyboard handler
Add this function in the component body (before the `return` statement):

```tsx
const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
  const currentIdx = TAB_IDS.indexOf(tab);
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    const nextIdx = (currentIdx + 1) % TAB_IDS.length;
    setTab(TAB_IDS[nextIdx]);
    // Move browser focus to the newly active tab button
    document.getElementById(`tab-${TAB_IDS[nextIdx]}`)?.focus();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    const prevIdx = (currentIdx - 1 + TAB_IDS.length) % TAB_IDS.length;
    setTab(TAB_IDS[prevIdx]);
    document.getElementById(`tab-${TAB_IDS[prevIdx]}`)?.focus();
  } else if (e.key === 'Home') {
    e.preventDefault();
    setTab(TAB_IDS[0]);
    document.getElementById(`tab-${TAB_IDS[0]}`)?.focus();
  } else if (e.key === 'End') {
    e.preventDefault();
    setTab(TAB_IDS[TAB_IDS.length - 1]);
    document.getElementById(`tab-${TAB_IDS[TAB_IDS.length - 1]}`)?.focus();
  }
};
```

### States
- No loading/error state for the tabs themselves; they only render when `report` is truthy.
- All 5 `TAB_LABELS` strings remain unchanged.

### Responsive behaviour
`.tabs` already has `overflow-x: auto` (index.css line 268), so horizontal scrolling works on mobile. No new responsive rules needed.

### Accessibility
- Pattern follows [ARIA Authoring Practices Guide — Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
- `tabIndex={0}` on the active tab and `-1` on others implements the roving tabindex pattern.
- `tabIndex={0}` on the panel allows users to Tab from the tablist into the panel content.
- `aria-label="Company report sections"` on the tablist gives screen-reader context.

---

## Item 4 — Copy Link button in id-actions row

### Components affected
- `frontend/src/pages/CompanyReportPage.tsx`

### Current state — already implemented
Reading lines 118–122 and 156–184, the Copy Link button **already exists in the `id-actions` row**:

```tsx
<button
  className="btn btn-secondary btn-sm"
  onClick={handleCopyLink}
  aria-label="Copy report link to clipboard"
>
  <Icon name="copy" /> Copy link
</button>
```

It sits between the Compare `<Link>` (line 165) and the Companies House external `<a>` (line 175). The `handleCopyLink` function at lines 118–122 uses `navigator.clipboard.writeText(canonicalUrl)` and triggers the existing toast system.

The toast system is already implemented at lines 31, 68–72, 118–122, and 127–139. Toast states: `tone: 'ok'` renders with `var(--ok-bg)` background and `var(--ok)` text; `tone: 'bad'` renders with `var(--bad-bg)` background and `var(--bad)` text.

**No changes needed for Item 4** — the feature is already complete. Verify the engineer has not deleted it in a prior refactor; if it is missing, re-add per the JSX above.

### Copy (exact strings)
- Button label: `Copy link`
- `aria-label`: `"Copy report link to clipboard"`
- Toast success: `"Link copied to clipboard"` (tone: `ok`)
- Toast failure: `"Could not copy — try again"` (tone: `bad`)

---

## Item 5 — Director history cross-check UI

### Components affected
- `frontend/src/pages/CompanyReportPage.tsx`
- `frontend/src/types/index.ts` (data shape already correct — see `Officer.previousCompanies`)
- Backend mock data (no mock.ts file exists; mock data comes from the live backend in dev mode)

### Current state — already substantially implemented
Reading lines 339–468, the People tab already renders:
1. A summary line at lines 346–351 when `showDirectorSummary` is true
2. A `<details>/<summary>` collapsible for each officer with `previousCompanies` data at lines 362–448
3. Badge styles using `.zone-tag` classes (direct/deduced/not) at lines 416–424
4. The disclaimer copy at lines 435–437

**What is incomplete / needs fixing:**

#### 5a — Summary line placement
Currently the summary `<p>` (lines 346–350) renders **inside** the `.data-card` div, **above** the `<h3>Officers` heading. The intended design places it above the card, acting as a section-level callout.

Move it outside and above the `.data-card`:

```tsx
{/* Outside .data-card, above it */}
{showDirectorSummary && (
  <p
    className="small"
    style={{
      fontSize: 13,
      color: 'var(--warn)',
      background: 'var(--warn-bg)',
      border: '1px solid #f0d99b',
      borderRadius: 10,
      padding: '10px 14px',
      marginBottom: 12,
    }}
    role="note"
    aria-live="polite"
  >
    <Icon name="warn" size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
    {officersWithDissolvedHistory.length} of {report.officers.length} director
    {report.officers.length !== 1 ? 's have' : ' has'} previously been associated
    with dissolved or liquidated companies.
  </p>
)}
<div className="data-card">
  <h3>Officers ({report.officers.length})</h3>
  ...
```

#### 5b — Collapsible details structure — keep as-is
The `<details>/<summary>` HTML element pattern already used (lines 373–439) is correct. No structural change. Ensure the `<Icon name="chevron-right" size={12} />` inside the `<summary>` rotates to point down when the `<details>` is open. Add to `index.css` or inline:

```css
/* In index.css or pages.css, inside a new rule: */
details[open] summary .ico { transform: rotate(90deg); }
```
Or inline via a CSS custom property — add `style={{ transition: 'transform 0.15s' }}` to the Icon's wrapper `<span>` and use a `data-open` attribute toggled via an `onToggle` handler on `<details>`. The simplest approach is pure CSS:

```css
/* Add to pages.css, inside the COMPANY REPORT section */
details[open] > summary svg,
details[open] > summary .ico { transform: rotate(90deg); transition: transform .15s; }
```

#### 5c — Badge styles for dissolved vs active companies
Currently uses `.zone-tag` variants (lines 416–424):
- `status === 'active'` → `zone-tag direct` (green)
- `status === 'liquidation'` → `zone-tag deduced` (amber)
- all others (including `'dissolved'`) → `zone-tag not` (grey/muted)

**Fix:** `dissolved` should also render in amber (`.zone-tag deduced`), not grey. Change:

```tsx
// Before
className={
  pc.status === 'active'
    ? 'zone-tag direct'
    : pc.status === 'liquidation'
    ? 'zone-tag deduced'
    : 'zone-tag not'
}

// After
className={
  pc.status === 'active'
    ? 'zone-tag direct'
    : (pc.status === 'liquidation' || pc.status === 'dissolved')
    ? 'zone-tag deduced'
    : 'zone-tag not'
}
```

#### 5d — Disclaimer copy
Currently at lines 435–437:
```tsx
<p style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
  Director history is drawn from public Companies House records and may not be complete. This is not a credit check.
</p>
```
Preserve exactly as-is. Do not edit the disclaimer text.

#### 5e — Mock data
There is no `mock.ts` file. The backend's `DirectorTrackRecordService.java` provides real data via Companies House in dev mode. To test the UI in isolation, add a test company number that has officers with dissolved history associations. If the engineer needs to verify the UI locally without hitting CH:

In `backend/src/main/java/com/careermovechecker/companieshouse/CompaniesHouseMapper.java` (or wherever `Officer` objects are constructed), ensure at least one officer in the mock/dev profile has:

```json
"previousCompanies": [
  {
    "name": "ALPHA TRADING LTD",
    "number": "99991001",
    "status": "dissolved",
    "ceasedOn": "2021-03-15"
  },
  {
    "name": "BETA SERVICES LTD",
    "number": "99991002",
    "status": "active",
    "ceasedOn": null
  }
]
```

The `Officer` type in `types/index.ts` already supports this shape (lines 30–36). No type changes needed.

### States
| State | Behaviour |
|---|---|
| `previousCompanies` is undefined | Officer row renders without any history section. |
| `previousCompanies` is empty array | No history section renders (`o.previousCompanies.length > 0` guards it). |
| All previous companies active | `hasProblematic` is false; renders green `zone-tag direct` "No dissolved company associations". |
| Any dissolved/liquidation | `hasProblematic` is true; renders amber `zone-tag deduced` warning and collapsible `<details>`. |

### Accessible summary line copy (exact string)
`"{N} of {total} director{s have / has} previously been associated with dissolved or liquidated companies."`

Where N = `officersWithDissolvedHistory.length`, total = `report.officers.length`.

### Disclaimer copy (exact, do not change)
`"Director history is drawn from public Companies House records and may not be complete. This is not a credit check."`

---

## Item 6 — aria-valuetext on ScoreGauge + contrast fix

### Components affected
- `frontend/src/components/ScoreGauge.tsx`
- `frontend/src/index.css` (muted colour)

### 6a — aria-valuetext

**Current state (ScoreGauge.tsx lines 38–46):**
```tsx
<div
  role="meter"
  aria-valuenow={score}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Risk score"
  ...
>
```

`aria-valuetext` is missing. Without it, screen readers announce the bare number "74" with no context.

**Add `aria-valuetext`:**

First, derive a `riskLabel` string from `score` using the same thresholds as `barColor`:
```tsx
// Add inside ScoreGauge component, before the return statement
const riskLabel =
  score <= 39 ? 'high risk' :
  score <= 69 ? 'moderate risk' :
  'low risk';
```

The thresholds mirror the existing `barColor` logic (lines 9–11):
- `score <= 39` → bad → `high risk`
- `score <= 69` → warn → `moderate risk`
- `score >= 70` → ok → `low risk`

Then add `aria-valuetext` to the meter div:
```tsx
aria-valuetext={`${score} out of 100 — ${riskLabel}, confidence ${Math.round(confidence * 100)}%`}
```

**Full exact string format:**
`"{score} out of 100 — {riskLabel}, confidence {confidencePct}%"`

Example: `"74 out of 100 — low risk, confidence 82%"`

### 6b — Contrast fix

**Issue:** The confidence percentage and the "How is this calculated?" link both use `color: 'var(--muted)'`, which is `#5b6473` (from `index.css` line 15).

Calculate contrast of `#5b6473` on `#ffffff` (white background of `.answer-body`):
- Luminance of `#5b6473` ≈ 0.124
- Contrast ratio = (1 + 0.05) / (0.124 + 0.05) ≈ **6.04:1** — passes AA for normal text (4.5:1 required) but only barely for large text.

The confidence text is `font-size: 13px` (ScoreGauge.tsx line 34) — this is **small text** (< 18pt / 14pt bold). At 13px, 6:1 passes. No change needed to `--muted` value.

However, the `--muted` value is also applied to the `aria-label` display text on the methodology link (line 62 of ScoreGauge.tsx). The `<Link>` already uses `color: 'var(--brand)'` (#1e3a8a) — contrast of #1e3a8a on #ffffff is approximately **10.5:1**, which passes AAA. No change needed.

**If the team still wants to increase muted text contrast** across the product, change in `index.css` line 16:
```css
/* Before */
--muted: #5b6473;

/* After (increases contrast to ~7.5:1 on white) */
--muted: #4a5260;
```

Only make this change if a WCAG audit has specifically flagged `--muted` at small sizes. The hex value `#4a5260` is the spec recommendation.

### Summary of ScoreGauge.tsx changes
```tsx
// Add riskLabel derivation before return:
const riskLabel =
  score <= 39 ? 'high risk' :
  score <= 69 ? 'moderate risk' :
  'low risk';

// Update the meter div:
<div
  role="meter"
  aria-valuenow={score}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Risk score"
  aria-valuetext={`${score} out of 100 — ${riskLabel}, confidence ${Math.round(confidence * 100)}%`}
  style={{ ... }}
>
```

---

## Item 7 — Mobile layout fixes (search rail + saved-table)

### Components affected
- `frontend/src/pages.css`

### 7a — Search rail order fix (mobile)

**Problem:** On screens ≤ 1000px, `pages.css` line 665 collapses `.search-grid` to `grid-template-columns: 1fr !important`. This stacks the main results column first and the `.rail` aside second (visually below). On mobile, the rail (which contains "What you'll learn" and "Bulk check") should appear **below** the search results — which is the default DOM order. No reordering is needed for the rail itself.

However the `<aside className="rail">` is the second child of `.search-grid`. If a designer has requested it appear **above** results on mobile (e.g. as a contextual explainer before the user sees results), add `order` CSS:

```css
/* Add to pages.css inside the @media (max-width: 1000px) block, after the search-grid rule */
@media (max-width: 1000px) {
  .search-grid { grid-template-columns: 1fr !important; }
  .search-grid .rail { order: -1; } /* Move rail above results on mobile */
}
```

**If the rail should stay below results** (current DOM order, correct for mobile search UX), no change is needed. The spec recommends **keeping the rail below** (i.e., do NOT add `order: -1`) because users should see results first. This means no CSS change is needed for this sub-item.

**What IS broken and must be fixed:** On very narrow viewports (≤ 480px), the `.rail` cards have no horizontal padding reduction. Add:

```css
/* Inside @media (max-width: 1000px) in pages.css */
.rail-card { padding: 14px; }
```

### 7b — Saved-table mobile columns

**Current rule (pages.css lines 670–672):**
```css
.saved-table .head, .srow { grid-template-columns: 38px 1fr; }
.saved-table .head > :not(:nth-child(-n+2)),
.srow > :not(:nth-child(-n+2)) { display: none; }
```

This collapses to 2 columns on mobile: checkbox + company name. All other columns (Status, Trust verdict, Current risk, Actions) are hidden.

**Requested fix:** Show 3 columns on mobile — checkbox, company name, and the verdict pill. The verdict pill (column 4 in `.srow`, the `<div>` containing `.v-pill`) is the most useful quick-scan information.

**Change the mobile rule:**

```css
/* Replace lines 670–672 in the @media (max-width: 1000px) block */
.saved-table .head, .srow { grid-template-columns: 38px 1fr auto; }
.saved-table .head > :not(:nth-child(-n+3)),
.srow > :not(:nth-child(-n+3)) { display: none; }
```

This keeps columns 1, 2, and 3 visible. Column 3 in the DOM is the `<span className="badge ...">` status badge (not the verdict). To make column 4 (verdict) visible instead of column 3 (status), use `:nth-child` exclusion targeting column 4:

```css
/* To show columns 1, 2, and 4 (checkbox, name, verdict): */
.saved-table .head, .srow { grid-template-columns: 38px 1fr auto; }
.saved-table .head > :nth-child(3),
.srow > :nth-child(3),
.saved-table .head > :nth-child(n+5),
.srow > :nth-child(n+5) { display: none; }
```

This hides the 3rd child (Status badge) and all children from 5th onward (Current risk, Actions), keeping children 1 (checkbox), 2 (company), and 4 (Trust verdict). The `auto` in `grid-template-columns` sizes the verdict pill to its content width.

**The 6-column header labels** in the `.head` div (`<span><Icon name="check" size={12} /></span>`, `<span>Company</span>`, `<span>Status</span>`, `<span>Trust verdict</span>`, `<span>Current risk</span>`, `<span></span>`) — on mobile the visible header cells will be: col 1 (check icon), col 2 (Company), col 4 (Trust verdict). The empty-string header for actions (col 6) is hidden.

### Exact CSS diff for pages.css

In the `@media (max-width: 1000px)` block (which starts at line 662), replace:

```css
/* Old — lines 670–672 */
.saved-table .head, .srow { grid-template-columns: 38px 1fr; }
.saved-table .head > :not(:nth-child(-n+2)),
.srow > :not(:nth-child(-n+2)) { display: none; }
```

With:

```css
/* New */
.saved-table .head, .srow { grid-template-columns: 38px 1fr auto; }
.saved-table .head > :nth-child(3),
.srow > :nth-child(3),
.saved-table .head > :nth-child(n+5),
.srow > :nth-child(n+5) { display: none; }
.rail-card { padding: 14px; }
```

### Responsive behaviour
- ≥ 1001px: existing 6-column layout unchanged
- ≤ 1000px: 3-column layout (checkbox | company name | verdict pill)

### Accessibility
- Hiding table columns with `display: none` also hides them from the AT. This is acceptable because the full report is accessible via the "Open" link in each row — on mobile the actions column is hidden, but the company name cell contains a `<Link>` to the full report (line 293 of `SavedPage.tsx`).

---

## Item 8 — MarketingNav links + AppNav title attributes

### Components affected
- `frontend/src/layout/MarketingNav.tsx`
- `frontend/src/layout/AppNav.tsx`

### 8a — MarketingNav new links

**Current state (MarketingNav.tsx lines 12–15):**
```tsx
<nav className="nav-links" aria-label="Main navigation">
  <NavLink to="/methodology">Methodology</NavLink>
  <NavLink to="/pricing">Pricing</NavLink>
</nav>
```

**Add two links** — "For recruiters" and "For freelancers" — between the logo and the existing links. These are persona-specific landing pages. Insert them as the first two links:

```tsx
<nav className="nav-links" aria-label="Main navigation">
  <NavLink to="/for/recruiters">For recruiters</NavLink>
  <NavLink to="/for/freelancers">For freelancers</NavLink>
  <NavLink to="/methodology">Methodology</NavLink>
  <NavLink to="/pricing">Pricing</NavLink>
</nav>
```

**Nav order (left to right):** For recruiters · For freelancers · Methodology · Pricing

If the `/for/recruiters` and `/for/freelancers` routes do not yet exist in the router, the links should still be added — they will render as styled text links that 404 until the pages are built. The PM owns route creation.

**Responsive:** On ≤ 1000px, `.nav-links` is `display: none` (index.css line 318), so no mobile overflow issue.

### 8b — AppNav title attributes

Reading `AppNav.tsx` lines 33–57, the four `<NavLink>` elements in `.app-tabs` are:

| Link | Current `title` | Required `title` |
|---|---|---|
| `/app/search` | none | `"Search UK companies"` |
| `/app/compare` | none | `"Compare up to 3 companies side by side"` |
| `/app/saved` | none | `"Your saved companies and change alerts"` |
| `/app/bulk` | none | `"Bulk check up to 50 companies"` |

The "Upgrade ↗" `<Link>` and "← Back to site" `<Link>` in `.nav-cta` (lines 64–67) also need titles:
- Upgrade link: `title="View Pro and Agency pricing plans"`
- Back to site link: `title="Return to the CareerMove marketing site"`

**Exact JSX changes in AppNav.tsx:**

```tsx
<NavLink to="/app/search" title="Search UK companies" className={({ isActive }) => (isActive ? 'active' : '')}>
  <Icon name="search" />
  <span>Search</span>
</NavLink>

<NavLink to="/app/compare" title="Compare up to 3 companies side by side" className={({ isActive }) => (isActive ? 'active' : '')}>
  <Icon name="compare" />
  <span>Compare</span>
</NavLink>

<NavLink
  to="/app/saved"
  title="Your saved companies and change alerts"
  className={({ isActive }) => (isActive ? 'active' : '')}
  aria-label={unread > 0 ? `Saved — ${unread} unread alert${unread !== 1 ? 's' : ''}` : undefined}
>
  {/* existing badge JSX unchanged */}
  <span>Saved</span>
</NavLink>

<NavLink to="/app/bulk" title="Bulk check up to 50 companies" className={({ isActive }) => (isActive ? 'active' : '')}>
  <Icon name="upload" />
  <span>Bulk check</span>
</NavLink>
```

And in `.nav-cta`:
```tsx
<Link
  className="btn btn-primary btn-sm"
  to="/pricing"
  title="View Pro and Agency pricing plans"
  style={{ fontSize: 12 }}
>
  Upgrade ↗
</Link>
<Link
  className="btn btn-ghost btn-sm"
  to="/"
  title="Return to the CareerMove marketing site"
  style={{ color: 'var(--muted)' }}
>
  ← Back to site
</Link>
```

### Accessibility
- `title` attributes provide tooltip text on hover and are read by some screen readers as supplementary information. They are not a substitute for `aria-label` on icon-only controls — the AppNav links already have visible text labels (`<span>Search</span>` etc.) so `title` here is bonus context, not the primary accessible name.
- The existing `aria-label` on the Saved NavLink (for the unread badge count) is preserved.

---

## Item 9 — Print stylesheet for Company Report

### Components affected
- `frontend/src/index.css` (extend the existing `@media print` block)
- `frontend/src/pages.css` (add print-specific layout rules)
- `frontend/src/pages/CompanyReportPage.tsx` (add print-only header JSX)

### 9a — Elements to hide for print

The existing `@media print` block in `index.css` (lines 330–334):
```css
@media print {
  .no-print { display: none !important; }
  .nav, footer { display: none !important; }
  body { background: #fff; }
}
```

Extend this block with the following additional selectors:

```css
@media print {
  .no-print { display: none !important; }
  .nav, footer { display: none !important; }
  body { background: #fff; }

  /* Hide interactive elements */
  .id-actions { display: none !important; }
  .answer-cta { display: none !important; }
  .tabs { display: none !important; }
  .feedback-row { display: none !important; }  /* aria-label="Report feedback" section */
  .bulkbar { display: none !important; }
  .toolbar { display: none !important; }
  .addr-map-sv { display: none !important; } /* Street View link */

  /* Page setup */
  @page {
    size: A4;
    margin: 18mm 16mm;
  }

  /* Remove shadows and borders that don't print well */
  .answer-card { box-shadow: none !important; border: 1px solid #ccc !important; }
  .flag, .data-card, .zone-c .data-card { box-shadow: none !important; }
}
```

**Note on `.feedback-row`:** The feedback section uses an inline `aria-label="Report feedback"` on a `<div>` (lines 518–561 of CompanyReportPage.tsx). Add `className="feedback-row no-print"` to that div instead of targeting it by aria-label in CSS:

Change:
```tsx
<div
  style={{ display: 'flex', alignItems: 'center', gap: 12, ... }}
  aria-label="Report feedback"
>
```
To:
```tsx
<div
  className="feedback-row no-print"
  style={{ display: 'flex', alignItems: 'center', gap: 12, ... }}
  aria-label="Report feedback"
>
```

### 9b — Print-only header

Add a print-only header JSX element inside `CompanyReportPage`, just before `{/* ZONE A */}`:

```tsx
{/* Print-only header — hidden in browser, visible in print */}
<div
  className="print-header"
  aria-hidden="true"
  style={{ display: 'none' }}
>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 14, borderBottom: '2px solid #0b1220', marginBottom: 24 }}>
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5b6473', marginBottom: 4 }}>
        CareerMove · Trust Report
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#5b6473' }}>
        Printed {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#5b6473', textAlign: 'right' }}>
      careermove.uk/c/{p.companyNumber}
    </div>
  </div>
</div>
```

**Note:** `p` is only in scope inside the `return` after the `report` null-check, so this JSX must live inside the main return after `const p = report.profile;` (line 111).

This header has `style={{ display: 'none' }}` in browser. The print stylesheet makes it visible:

```css
/* Add to the @media print block in index.css */
.print-header { display: block !important; }
```

### 9c — Show all tab panels in print

When printing, all five tab panels must be visible simultaneously regardless of the active tab. Since Item 3 introduces `hidden` attribute on panels (except the identity panel which uses conditional rendering), add:

```css
/* In pages.css, add a new @media print block at the bottom of the file */
@media print {
  /* Show all tab panels simultaneously */
  [role="tabpanel"] { display: block !important; }
  [role="tabpanel"][hidden] { display: block !important; }

  /* Add section dividers between panels */
  [role="tabpanel"] + [role="tabpanel"] {
    border-top: 1px solid #e6e8ee;
    margin-top: 24px;
    padding-top: 24px;
  }

  /* Avoid page breaks inside flag cards and person rows */
  .flag, .person, .tl-item { break-inside: avoid; }

  /* Flag grid: single column for print */
  .flag-grid { grid-template-columns: 1fr !important; }

  /* Grid-2 (officers + PSC): single column for print */
  .grid-2 { grid-template-columns: 1fr !important; }

  /* Address map: hide in print (Leaflet canvas doesn't print) */
  .addr-map { display: none !important; }
}
```

**Note on identity panel conditional rendering:** If the identity tab panel is still using `{tab === 'identity' && (...)}` conditional rendering (per the choice made in Item 3), it will not render in print when another tab is active. Change the identity panel to also use `hidden` (always render but conditionally show) to make it print-visible. The Leaflet map inside is hidden via `.addr-map { display: none !important; }` in print CSS.

### 9d — Where to add rules in pages.css
Add the new `@media print` block at the **very end of pages.css**, after the `.addr-map` Leaflet override section (after line 797).

### Legal disclaimer in print
The `<div className="legal">` in `PricingPage.tsx` is not on the report page. On the report page, no explicit legal section exists — but the existing footer (hidden in print via `.nav, footer { display: none !important; }`) contains disclaimers. Add a print-only disclaimer at the bottom of the page, just above the closing `</div>` of `.wrap`:

```tsx
<p
  className="print-disclaimer"
  aria-hidden="true"
  style={{ display: 'none', fontSize: 11, color: '#5b6473', borderTop: '1px solid #e6e8ee', paddingTop: 14, marginTop: 24, lineHeight: 1.5 }}
>
  This report is based on public Companies House data. It is not a credit report, legal advice, or guarantee of solvency. CareerMove turns public records into plain English — you decide. Data fetched: {relativeTime(report.dataFetchedAt)}.
</p>
```

Add to print CSS:
```css
.print-disclaimer { display: block !important; }
```

---

## Item 10 — Pricing page nav link + FAQ + social proof stat

### Components affected
- `frontend/src/layout/MarketingNav.tsx` (already covered in Item 8a — Pricing link exists)
- `frontend/src/pages/PricingPage.tsx`

### 10a — Nav link
The Pricing nav link already exists in `MarketingNav.tsx` (line 14: `<NavLink to="/pricing">Pricing</NavLink>`). No change needed beyond what Item 8a specifies.

### 10b — Social proof stat line

**Placement:** Insert between the subtitle paragraph and the `.pricing` grid, replacing the current `marginTop: 48` on the pricing div with a smaller gap. The stat line goes directly above the plan cards.

**Copy (exact):**
```
Trusted by 2,400+ professionals checking companies before they sign.
```

**JSX to insert between the `<p style={{ fontSize: 17 ... }}>` (line 19) and the `<div className="pricing">` (line 22):**

```tsx
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '28px 0 0',
    color: 'var(--muted)',
    fontSize: 13.5,
  }}
>
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: 'var(--ok-bg)',
      color: 'var(--ok)',
      flexShrink: 0,
    }}
    aria-hidden="true"
  >
    <Icon name="check" size={12} />
  </span>
  Trusted by{' '}
  <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>2,400+ professionals</strong>
  {' '}checking companies before they sign.
</div>
```

Change the `.pricing` div `marginTop` from `48` to `32`:
```tsx
<div className="pricing" style={{ marginTop: 32 }}>
```

### 10c — FAQ accordion

**Placement:** Add a new `<section>` below the `.pricing` grid and above the `.legal` div (currently line 80). The legal div must remain in place unchanged.

**State variable** — add at the top of `PricingPage` component (which currently has no state):

```tsx
const [openFaq, setOpenFaq] = useState<number | null>(null);
```

This makes `PricingPage` a client component; add `useState` import. It is already a functional component — just add the hook.

**Interaction pattern:** Accordion — only one item open at a time. Click the same open item to close it (toggle). Clicking a different item closes the previous and opens the new one.

```tsx
const toggleFaq = (idx: number) => setOpenFaq((cur) => (cur === idx ? null : idx));
```

**FAQ data — 4 Q&As (exact copy):**

```tsx
const FAQS = [
  {
    q: "Is CareerMove a credit check?",
    a: "No. CareerMove reads public Companies House records — the same ones any company search on the government website would show. We don't access credit files, bank data, or any private information. Think of it as a plain-English read of the public register.",
  },
  {
    q: "How current is the data?",
    a: "We pull data directly from the Companies House API at the moment you run a report. Most filings appear on Companies House within 24–48 hours of being submitted. We show you the timestamp on every report so you always know how fresh it is.",
  },
  {
    q: "Can I check a company before a contract?",
    a: "Yes — that's the primary use case. We designed CareerMove for professionals who want a quick, honest read before they sign a contract, place a candidate, or raise an invoice. The report takes under 60 seconds.",
  },
  {
    q: "What does the Agency plan include that Pro doesn't?",
    a: "Agency adds disqualified officer cross-checking (via the Companies House disqualification register), bulk checks up to 500 companies, team seats for up to 5 users, and beta API access. Pro is ideal for sole practitioners; Agency is built for teams.",
  },
];
```

**JSX for the FAQ section:**

```tsx
<section style={{ marginTop: 64 }}>
  <h2
    style={{
      fontSize: 'clamp(22px, 3vw, 32px)',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      marginBottom: 24,
    }}
  >
    Frequently asked questions
  </h2>

  <div
    style={{
      border: '1px solid var(--hair)',
      borderRadius: 16,
      overflow: 'hidden',
      background: '#fff',
    }}
    role="list"
  >
    {FAQS.map((item, idx) => (
      <div
        key={idx}
        role="listitem"
        style={{ borderBottom: idx < FAQS.length - 1 ? '1px solid var(--hair)' : 'none' }}
      >
        <button
          onClick={() => toggleFaq(idx)}
          aria-expanded={openFaq === idx}
          aria-controls={`faq-panel-${idx}`}
          id={`faq-btn-${idx}`}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            padding: '20px 24px',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            textAlign: 'left',
            font: '500 15px/1.4 var(--sans)',
            color: 'var(--ink)',
          }}
        >
          <span>{item.q}</span>
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
              transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: 'var(--muted)',
              fontSize: 20,
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            +
          </span>
        </button>

        <div
          id={`faq-panel-${idx}`}
          role="region"
          aria-labelledby={`faq-btn-${idx}`}
          hidden={openFaq !== idx}
          style={{
            padding: '0 24px 20px',
            fontSize: 14,
            color: 'var(--ink-2)',
            lineHeight: 1.65,
          }}
        >
          {item.a}
        </div>
      </div>
    ))}
  </div>
</section>
```

**Insert location:** After the closing `</div>` of `.pricing` grid (currently around line 78) and before `<div className="legal">`.

### Legal disclaimer preservation
The existing `.legal` section (lines 80–83) must remain unchanged and below the FAQ section:
```tsx
<div className="legal" style={{ marginTop: 48, borderTop: '1px solid var(--hair)', paddingTop: 24 }}>
  <p><strong>What CareerMove is not:</strong> a credit report, legal advice, or a guarantee of solvency. We turn Companies House public records into plain English. You decide.</p>
  <p style={{ textAlign: 'right' }}>Prices shown exclude VAT. Subject to change before launch.</p>
</div>
```
Do not edit this text.

### States for FAQ
| State | Behaviour |
|---|---|
| All closed (initial) | All panels have `hidden` attribute; only question buttons visible |
| One open | That panel visible; all others hidden; `+` rotates to `×` (45°) |
| Click open item | That panel closes; all hidden |
| Click different item | Previous closes, new opens |

### Responsive behaviour
The FAQ container is a single-column block; it adapts to all viewport widths naturally. On ≤ 1000px, `.pricing` already collapses to 1 column (pages.css line 663). The FAQ section is below the pricing grid, so no additional responsive rules needed.

### Accessibility
- `aria-expanded` on the button correctly communicates the open/closed state.
- `aria-controls` + `aria-labelledby` links the button to its panel.
- `hidden` attribute removes the panel from the accessibility tree when closed (screen readers skip it).
- The `+` character rotate-to-`×` is `aria-hidden="true"` to avoid screen reader confusion.
- The `role="list"` / `role="listitem"` grouping is optional but provides structural semantics. An alternative is to use `<dl>/<dt>/<dd>` — both are acceptable.
- All text passes WCAG 2.1 AA contrast: `var(--ink)` (#0b1220) on `#fff` is ~21:1.

---

## Cross-cutting notes for the engineer

1. **Import additions needed:**
   - `PricingPage.tsx`: add `{ useState }` to the React import.
   - No new component imports are needed across any file.

2. **No new CSS classes needed** beyond what is specified in each item. All styles use existing tokens (`var(--bad)`, `var(--ok)`, etc.) or inline styles matching the existing pattern.

3. **No new dependencies.** All features use React hooks, HTML native elements (`<details>`, `hidden`, `aria-*`), and existing CSS.

4. **Testing checklist per item:**
   - Item 1: Open a report; confirm ScoreGauge appears above the verdict text, not after.
   - Item 2: Temporarily throw in api/client.ts to verify error card appears and retry works.
   - Item 3: Tab through the zone-c tabs with keyboard only; confirm ArrowLeft/Right move focus and activate panels; confirm screen reader announces "tab, selected, 1 of 5" pattern.
   - Item 4: Click "Copy link" in id-actions; confirm toast appears and clipboard contains the canonical URL.
   - Item 5: Use a company with officers who have previousCompanies data; confirm amber warning badge, collapsible history, and disclaimer render.
   - Item 6: Inspect the meter element in DevTools; confirm `aria-valuetext` reads correctly.
   - Item 7: Resize browser to 375px; confirm saved-table shows 3 columns (checkbox, name, verdict).
   - Item 8: Verify new MarketingNav links appear; hover AppNav links and verify tooltips.
   - Item 9: Print a report (`Ctrl+P`); confirm all 5 tab panels print, nav is hidden, print header appears.
   - Item 10: Open Pricing page; confirm stat line, FAQ accordion open/close, and legal disclaimer unchanged.
