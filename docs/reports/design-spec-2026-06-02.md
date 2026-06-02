# CareerMoveChecker — Design Spec
**Date:** 2026-06-02  
**Author:** Designer  
**Scope:** 10 implementation items across SearchPage, CompanyReportPage, SavedPage, ComparePage, and seo.ts

---

## Item 1 — Render `addressSnippet` in search result rows

**UI change:** Yes

**States:**
- Default: address visible as third line below the meta badge row
- Empty / null / blank string: line is not rendered at all (no placeholder, no dash, no empty space)
- Long address (>60 chars): truncated with CSS `text-overflow: ellipsis` on a single line; no tooltip needed

**Responsive:**
- On mobile (≤1000px) the address line behaves identically — it truncates the same way because the row width simply narrows

**Accessibility:**
- No additional ARIA needed; the parent `div[role="button"]` already has a comprehensive `aria-label` that includes company name, number, and status. The address is supplementary visual context, not required for AT users
- If the engineer wants to include it in the `aria-label`, append `, registered at {addressSnippet}` only when the value is non-empty

**Exact spec:**
- Location: inside `.body`, as a new sibling `<div>` immediately below the existing `.meta` div
- The new element has no class of its own; style it inline or with the `.small` and `.muted` utility classes from index.css
- Font: 12px (`small`), color `var(--muted)` — matches the muted inline text already used in `.meta`
- Font-family: default `var(--sans)` (not mono — addresses are prose, not codes)
- Overflow: `overflow: hidden; white-space: nowrap; text-overflow: ellipsis;`
- Max-width: constrained naturally by the `.body` flex column, which already has `flex: 1` and is bounded by the row width
- Guard: wrap in `{hit.addressSnippet && hit.addressSnippet.trim() && ( <div ...> )}` — renders nothing if the value is empty string, whitespace-only, or absent (even though the type says `string`, the field is optional in practice per the brief)

**CSS classes to use:** `small`, `muted`

---

## Item 2 — Show `Charge.deliveredOn` in Finance tab

**UI change:** Yes

**States:**
- Default (both dates present): two labelled dates shown stacked vertically inside the right-side `<div>` of the `.acc-row`
- `deliveredOn` absent (optional field): show only "Created" date; no placeholder row for the missing date
- `createdOn` present in all cases (it is `string`, not optional in the type)

**Responsive:**
- The `.acc-row` layout is already a two-column flex row. Stacking the dates vertically inside the right cell keeps the row from overflowing on narrow screens

**Accessibility:**
- Labels are visible text; no ARIA labels needed beyond what the parent structure already provides

**Exact spec:**
- The right-side `<div style={{ textAlign: 'right' }}>` currently contains a `zone-tag` span and then `<div className="small muted">{formatDate(c.createdOn)}</div>`
- Replace the single date div with a stacked block:
  - Line 1: `<div className="small muted">Created: {formatDate(c.createdOn)}</div>`
  - Line 2 (conditional): `{c.deliveredOn && <div className="small muted">Delivered: {formatDate(c.deliveredOn)}</div>}`
- Label text is "Created" and "Delivered" — plain English, no jargon
- Both lines use the same `small muted` styling as the existing date line
- The `zone-tag` status badge remains at the top of the right cell, unchanged
- Vertical gap between the two date lines is handled naturally by the block-level `<div>` stacking; no additional margin is needed

**CSS classes to use:** `small`, `muted`

---

## Item 3 — Wire the bulk Refresh button in SavedPage bulkbar

**UI change:** Yes

**States:**
- Default (idle): button reads "Refresh" with the `refresh` icon, `btn btn-ghost btn-sm` classes
- Loading: button is `disabled`, icon replaced with a `<span className="spinner" />` (18 × 18px, already defined in index.css), button text changes to "Refreshing…". The spinner sits in place of the icon using the same 8px gap the `.btn` class provides
- Success: button returns to idle state; a toast appears (green, `tone: 'ok'`) with text "Companies refreshed"
- Error: button returns to idle state; a toast appears (red, `tone: 'bad'`) with text "Refresh failed — try again"
- No intermediate per-row feedback is needed; the bulk action refreshes all selected items and resolves to one toast

**Toast copy:**
- Success: `"Companies refreshed"` (or `"{N} companies refreshed"` if the count is available)
- Error: `"Refresh failed — try again"`

**Toast mechanism:** SavedPage already has a `toast` state and renders a fixed-position toast div with `ok`/`bad` tones. Use the same `setToast(...)` pattern already used by the Export CSV button and the individual row refresh buttons.

**Responsive:** No special mobile behavior — the bulkbar is scroll-visible on narrow screens and the button shrinks naturally with `btn-sm`

**Accessibility:**
- Button must be keyboard-focusable (already is via `btn` class)
- During loading, `disabled` attribute prevents double-submission
- The spinner is `aria-hidden="true"` since the button text "Refreshing…" already conveys the state to AT users
- `aria-label` on the button: `"Refresh selected companies"` (add this in default state too so AT users know it applies to the selection)

**CSS classes to use:** `btn`, `btn-ghost`, `btn-sm`, `spinner`

---

## Item 4 — Remove hardcoded fake "1h ago" cache timestamp from search results

**UI change:** Yes (removal / replacement)

**States:**
- Only one state: the static "Live" label replaces the fake timestamp in every result row
- No loading or error variants needed

**Responsive:** No change — the `.right` column of the result row already accommodates short text

**Accessibility:** No ARIA change needed. If the engineer wants to be precise, add `aria-label="Live Companies House data"` to the replacement element, but it is not required

**Exact spec:**
- Remove the `<span className="cached">{relativeTime(new Date(Date.now() - 60 * 60 * 1000).toISOString())}</span>` entirely from line 250 of SearchPage.tsx
- Replace with: `<span className="cached">Live</span>`
- The `.cached` class is already applied; no new class is needed
- The word "Live" is plain-English, non-misleading (it conveys that results come from the live Companies House API), and avoids the lie of a stale relative timestamp
- Do not use a green dot or any badge — the `cached` element in the `.right` column is purely informational fine-print and should remain subtle

**CSS classes to use:** `cached` (existing class already applied to that span)

---

## Item 5 — Fix thumbs-down feedback `rating: 0` → `rating: -1`

**UI change:** No

**States:** N/A — this is a data-only fix with no visible UI change

**Responsive:** N/A

**Accessibility:** N/A

**Exact spec:**
- In CompanyReportPage.tsx, inside the `feedbackState === 'commenting'` block, the `api.submitFeedback` call currently passes `rating: 0`
- Change that single value to `rating: -1` to semantically distinguish a negative vote (thumbs-down) from a neutral/unrated submission
- The thumbs-up path already correctly passes `rating: 1`
- No label text, button appearance, toast copy, or user-facing string changes at all

**CSS classes to use:** None

---

## Item 6 — Add Escape-to-close and blur-to-close to Compare autocomplete dropdown

**UI change:** Yes (behaviour only — no new visual elements)

**States:**
- Open: dropdown visible, `aria-expanded="true"` on the input
- Closed via Escape: dropdown hidden, focus remains on the input (do not move focus away)
- Closed via blur (click outside): dropdown hidden after a 150ms delay (the delay allows a click on a suggestion item to register its `onClick` before the blur fires and closes the list)

**Responsive:** No special mobile behavior — the dropdown already renders correctly on narrow screens

**Accessibility:**
- Add `role="combobox"` to the `<input>` element
- Add `aria-expanded={suggestions.length > 0}` to the input (boolean — true when dropdown is showing)
- Add `aria-haspopup="listbox"` to the input
- Add `role="listbox"` to the suggestions container `<div>`
- Add `role="option"` to each suggestion `<button>` inside the dropdown
- Add `aria-selected="false"` to each option button (none are pre-selected; keyboard selection is not in scope for this item)
- `aria-label` on the input: `"Search companies to compare"` (it currently has no label)
- The `id` of the listbox container should be set (e.g. `id="compare-suggestions"`) and the input should reference it with `aria-controls="compare-suggestions"`

**Focus management after Escape:**
- Focus stays on the input (`inputRef.current?.focus()` is not required because focus is already there when Escape is pressed; just call `setSuggestions([])`)
- Do not move focus to the first suggestion on arrow-down for this item — that is out of scope

**Exact spec for Escape:**
- Add an `onKeyDown` handler to the `<input>` in ComparePage
- If `e.key === 'Escape'` and `suggestions.length > 0`: call `setSuggestions([])` and `e.preventDefault()` (prevents browser-level Escape behaviour such as clearing the field in some browsers)

**Exact spec for blur-to-close:**
- Add `onBlur` to the `<input>`: `onBlur={() => { window.setTimeout(() => setSuggestions([]), 150); }}`
- 150ms is sufficient for a mouse click on a suggestion button to fire before the list disappears

**CSS classes to use:** None (behaviour change only)

---

## Item 7 — Fix `INFO` severity flag badge colour

**UI change:** Yes

**States:**
- POSITIVE: green — `zone-tag direct` (unchanged)
- INFO: grey — `zone-tag not`
- WARNING: orange — `zone-tag deduced` (unchanged)
- CRITICAL: orange — `zone-tag deduced` (unchanged)
- No hover or focus states on the badge itself; it is non-interactive

**Responsive:** No change

**Accessibility:**
- The existing `zone-tag` element is non-interactive and carries no ARIA role. The grey colour `var(--muted)` on `var(--soft)` background meets contrast requirements for supplementary decorative labels (it is not the primary communication — the title and explanation text carry the meaning)
- If the engineer wants to be precise, they can add `aria-label={f.severity}` to the badge span so screen readers read the severity level, but this is already conveyed by the flag title and explanation text

**Verification of `.zone-tag.not`:**
- Confirmed in index.css line 228: `.zone-tag.not { background: var(--soft); color: var(--muted); }` — `var(--soft)` is `#eef1f6` (light grey), `var(--muted)` is `#5b6473` (grey text). This is the correct neutral/grey treatment for informational, non-urgent flags.

**Exact spec — className ternary chain:**

Replace the current expression (line 399 of CompanyReportPage.tsx):
```
cn('zone-tag', f.severity === 'POSITIVE' ? 'direct' : 'deduced')
```

With this four-way ternary:
```
cn('zone-tag',
  f.severity === 'POSITIVE' ? 'direct'
  : f.severity === 'INFO'     ? 'not'
  : 'deduced'
)
```

Explanation of the logic:
- POSITIVE → `direct` (green)
- INFO → `not` (grey)
- WARNING and CRITICAL both fall through to `deduced` (orange) — this is correct because they share the same visual treatment

**CSS classes to use:** `zone-tag`, `direct`, `not`, `deduced`

---

## Item 8 — Add "Show all N reasons" expand for `topReasons`

**UI change:** Yes

**States:**
- Collapsed (default): first 4 reasons visible + "Show all N reasons" button below the list (only shown when `topReasons.length > 4`)
- Expanded: all reasons visible + "Show fewer" button below the list
- Edge case (≤4 reasons total): no button rendered at all; the `.ticks` div renders as-is with no change
- No transition animation — instant show/hide is specified

**Responsive:** No special mobile behavior — the `.ticks` list and button are already full-width

**Accessibility:**
- The expand/collapse button must be keyboard-accessible. `.btn.btn-ghost.btn-sm` already has `:focus-visible` ring via the `.btn` rule in index.css
- Add `aria-expanded={showAllReasons}` to the button
- Add `aria-controls` pointing to the `id` of the `.ticks` container (e.g. `id="top-reasons-list"`, `aria-controls="top-reasons-list"`)
- Button copy changes dynamically (see copy below); screen readers will announce the current label

**Button placement:** Immediately below the `.ticks` div, inside the same `<div style={{ marginBottom: 24 }}>` wrapper that currently contains the `.ticks` div. The button sits outside the `.ticks` div itself.

**Button copy:**
- Collapsed: `Show all {a.topReasons.length} reasons`
- Expanded: `Show fewer`

**State management:** Add a `showAllReasons` boolean to component state, initialised to `false`. The slicing logic changes from `a.topReasons.slice(0, 4)` to `showAllReasons ? a.topReasons : a.topReasons.slice(0, 4)`.

**Exact spec:**
- The button is only rendered when `a.topReasons.length > 4`
- In collapsed state, the `.ticks` div renders `a.topReasons.slice(0, 4)` — exactly 4 items
- In expanded state, the `.ticks` div renders `a.topReasons` — all items
- Button: `<button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} aria-expanded={showAllReasons} aria-controls="top-reasons-list" onClick={() => setShowAllReasons(!showAllReasons)}>`
- The `.ticks` div gets `id="top-reasons-list"`
- No icon in the button — text only

**CSS classes to use:** `btn`, `btn-ghost`, `btn-sm`

---

## Item 9 — Extend `useSeo` to update OG/Twitter tags per-page

**UI change:** No (meta tag updates are not visible to end users)

**States:** N/A — the hook runs on every navigation; it is always in the "active" state

**Responsive:** N/A

**Accessibility:** N/A (OG/Twitter tags are consumed by crawlers and link-preview renderers, not AT)

**Exact spec for `useSeo` (seo.ts):**

The `SeoOpts` interface already has `title`, `description`, and `canonical`. No new options are needed — the OG/Twitter values are derived from what is already passed:

- `og:title` → set to `title`
- `og:description` → set to `description` (only when description is provided)
- `og:url` → set to `canonical` (only when canonical is provided)
- `twitter:title` → set to `title`
- `twitter:description` → set to `description` (only when description is provided)

Add these five `getOrCreate` calls inside the existing `useEffect` in `useSeo`, after the existing `canonical` block. Use these selectors and attribute shapes:

| Tag | Selector | Tag name | Creation attrs |
|-----|----------|----------|----------------|
| `og:title` | `meta[property="og:title"]` | `meta` | `{ property: 'og:title' }` |
| `og:description` | `meta[property="og:description"]` | `meta` | `{ property: 'og:description' }` |
| `og:url` | `meta[property="og:url"]` | `meta` | `{ property: 'og:url' }` |
| `twitter:title` | `meta[name="twitter:title"]` | `meta` | `{ name: 'twitter:title' }` |
| `twitter:description` | `meta[name="twitter:description"]` | `meta` | `{ name: 'twitter:description' }` |

All five use `setAttribute('content', value)` after being retrieved/created by `getOrCreate`.

Guards:
- `og:title` and `twitter:title` always set (title is required in `SeoOpts`)
- `og:description` and `twitter:description` only set when `description` is provided (matches existing guard on the `<meta name="description">` tag)
- `og:url` only set when `canonical` is provided (matches existing guard on `<link rel="canonical">`)

**Exact spec for `index.html` — static fallback `og:image`:**

Add one new `<meta>` tag and one new Twitter image tag to the `<!-- Open Graph -->` block in index.html, after the existing `og:locale` tag:

```html
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:image" content="/og-image.png" />
```

The path `/og-image.png` is a placeholder. No actual image file needs to exist for the engineer to add the tag — the tag should reference `/og-image.png` and the image will be supplied separately. The static fallback in index.html is not overwritten by `useSeo` (the hook does not touch `og:image`).

**CSS classes to use:** None

---

## Item 10 — Per-item remove + "Clear all" for recent searches

**UI change:** Yes

**States:**
- Default row: `×` button is always visible (not hover-only on desktop; always visible on mobile — this avoids discoverability problems on touch devices where hover does not exist)
- Row hover (desktop): `×` button may optionally increase opacity from 0.6 to 1.0 if the engineer wants a subtle visual cue, but it must never be opacity-0 in the default state
- "Clear all" button: always visible in the section header when `recent.length > 0`; hidden entirely when the list is empty (the whole section is already hidden when `recent.length === 0`)
- Empty state after all items removed: show a `<div className="empty">` with text "No recent searches" in place of the list. The section heading "Recent searches" should still be visible so users understand what the section was
- No confirmation dialog — the brief says "keep it simple" and recent searches are low-stakes; an undo mechanism is also not required

**Responsive:**
- On mobile (≤1000px): `×` button is always visible at full opacity (no hover state on touch)
- On desktop: always visible at opacity 0.6, full opacity on row hover — this is optional polish, not a requirement

**Accessibility:**
- Each `×` button: `aria-label={`Remove ${r.name} from recent searches`}` — this is essential because the button has no visible text
- "Clear all" button: `aria-label="Clear all recent searches"`
- Both buttons are standard `<button>` elements and are keyboard-focusable by default
- Focus ring is provided by the `.btn` class's `:focus-visible` rule; if the engineer uses the `.icon-btn` class (as used elsewhere in the codebase) ensure that class also has a focus ring — `.btn btn-icon` is the safer choice since `.btn` explicitly has `outline: 2px solid var(--brand); outline-offset: 2px` on `:focus-visible`
- After removing a row, focus should return to the next row in the list if one exists, or to the section heading if the list becomes empty. This is a nice-to-have; the minimum requirement is that focus is not lost to `<body>`

**Exact spec — per-row `×` button:**
- Placed inside the existing `.rrow` button's layout, floated to the right — but because `.rrow` is itself a `<button>`, the `×` must be a visually separate interactive element. The engineer should restructure the row: replace the outer `<button className="rrow">` with a `<div className="rrow">` that contains (a) the clickable company name area as a `<button>` or `<Link>` and (b) the `×` icon button as a sibling
- The `×` button: `<button className="btn btn-icon btn-ghost" aria-label={...} onClick={(e) => { e.stopPropagation(); removeRecent(r.number); }}>`
- Use `<Icon name="x" size={12} />` inside the button — the `x` icon is already defined in Icon.tsx
- `onClick` must call `e.stopPropagation()` to prevent the row click from triggering navigation

**Exact spec — "Clear all" button:**
- Placed in the `<h5>Recent searches</h5>` header row, inline to the right
- The header `<h5>` should become a flex row: `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>` wrapping the `<h5>` and the "Clear all" button
- The "Clear all" button: `<button className="btn btn-ghost btn-sm" aria-label="Clear all recent searches" onClick={clearAllRecent}>Clear all</button>`
- `clearAllRecent` removes all items from localStorage and calls `setRecent([])`

**Helper functions to add (SearchPage.tsx):**
- `removeRecentSearch(number: string)`: filters that number out of localStorage and returns the updated array
- `clearRecentSearches()`: sets localStorage key to `'[]'`
- Both should call `setRecent(getRecentSearches())` after mutating storage

**Empty state:**
- When `recent.length === 0`, the outer `{recent.length > 0 && (...)}` guard already prevents the section from rendering. After all items are removed the section disappears entirely. This is acceptable behaviour — do not add a persistent empty state unless the PM requests it

**CSS classes to use:** `btn`, `btn-ghost`, `btn-sm`, `btn-icon`, `empty`
