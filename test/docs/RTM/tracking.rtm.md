# RTM — Tracking page (`/tracking/{orderId}`)

Live tracking of a placed order. Reached from the confirmation CTA, from the
account order history, or via a direct shareable URL. Two main states:

- **Found**: shows drone-flight map, ETA, progress bar and status timeline.
- **Not found**: shows `Order not found` with a **Return to menu** button (e.g.
  the QA fixture URL `/tracking/PITS-20260522-P4AB` produces this state).

## Page summary

### Found state

- **← Back to menu** + brand logo.
- H1 "Track Your Order" + Order ID badge.
- Map: shows **PITS** kitchen marker, **You** marker, drone position and the
  text `X km remaining`.
- Stats: **Estimated arrival** (minutes), progress percentage and current
  status label.
- Status timeline: `Preparing` → `Dispatched` → `In Flight` → `Arriving` →
  `Delivered`.
- **Order Summary** (read-only): items, delivery destination.
- **Need help with your order?** disclosure / contact.

### Not-found state

- Message "Order not found".
- **Return to menu** button → `/`.

## Functional requirements

### Found state

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-TRK-001 | GET `/tracking/{validId}` returns 200 and renders the tracking layout. | P0 | All + Guest | UI | `tracking/load_valid.feature` | Not Started |
| FR-TRK-002 | The order ID displayed on the page matches the URL segment. | P1 | All + Guest | UI | `tracking/order_id_match.feature` | Implemented |
| FR-TRK-003 | Status label is one of `Preparing`, `Dispatched`, `In Flight`, `Arriving`, `Delivered`. | P1 | All + Guest | UI | `tracking/status_label.feature` | Implemented |
| FR-TRK-004 | Status progresses monotonically over time (no regression). | P1 | All + Guest | UI / API | `tracking/status_monotonic.feature` | Not Started |
| FR-TRK-005 | "Estimated arrival (min)" decreases over time until status becomes `Delivered`. | P1 | All + Guest | UI / API | `tracking/eta_decreases.feature` | Implemented |
| FR-TRK-006 | "X km remaining" reaches 0 when status becomes `Delivered`. | P2 | All + Guest | UI | `tracking/distance_to_zero.feature` | Not Started |
| FR-TRK-007 | Progress percentage is in `[0, 100]` and reaches 100 % only at `Delivered`. | P1 | All + Guest | UI | `tracking/progress_range.feature` | Implemented |
| FR-TRK-008 | Progress percentage matches the highlighted step in the timeline. | P1 | All + Guest | UI | `tracking/progress_step_match.feature` | Implemented |
| FR-TRK-009 | Drone marker position interpolates between PITS and You as progress grows. | P2 | All + Guest | UI | `tracking/drone_interpolation.feature` | Not Started |
| FR-TRK-010 | Order Summary lists every product (with `× qty`) and the delivery destination. | P1 | All + Guest | UI | `tracking/order_summary.feature` | Implemented |
| FR-TRK-011 | **← Back to menu** navigates to `/` without affecting cart state. | P3 | All + Guest | UI | `tracking/back_button.feature` | Not Started |
| FR-TRK-012 | **Need help with your order?** discloses a help block / contact channel. | P3 | All + Guest | UI | `tracking/help_disclosure.feature` | Not Started |
| FR-TRK-013 | Tracking page updates automatically (polling or sockets) without manual reload. | P2 | All + Guest | UI | `tracking/auto_update.feature` | Not Started |
| FR-TRK-014 | URL is shareable: opening it in a new tab/browser shows the same order state. | P2 | All + Guest | UI | `tracking/shareable_url.feature` | Not Started |

### Not-found state

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-TRK-020 | GET `/tracking/{unknownId}` (e.g. `PITS-20260522-P4AB`) renders the "Order not found" panel. | P1 | All + Guest | UI | `tracking/not_found.feature` | Implemented |
| FR-TRK-021 | Not-found state returns HTTP 404 (or 200 with semantic error component — confirm spec). | P2 | All + Guest | UI / API | `tracking/not_found_status.feature` | Not Started |
| FR-TRK-022 | **Return to menu** in the not-found state navigates to `/`. | P1 | All + Guest | UI | `tracking/not_found_return.feature` | Implemented |
| FR-TRK-023 | Malformed IDs (e.g. `/tracking/abc`, empty, special chars) render the not-found state (no crash). | P1 | All + Guest | UI | `tracking/malformed_id.feature` | Implemented |

## Tier-specific behavior

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| TIER-TRK-001 | Guest can view a tracking URL only if they hold the order ID; no tier data is rendered. | P2 | Guest | UI | `tracking/guest_view.feature` | Not Started |
| TIER-TRK-002 | Authenticated users can reach the tracking page from `/account/orders` for their own orders. | P1 | Bronze/Silver/Gold/Platinum | UI | `tracking/account_to_tracking.feature` | Implemented — tagged `@known-bug:TIER-TRK-002`; `OrderRow.tsx` has no Track Order link (feature not yet built) |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-TRK-001 | Initial render in < 2.0 s on local environment. | P2 | Performance | `tracking/perf.spec` | Not Started |
| NFR-TRK-002 | Auto-update polling frequency ≤ 1 request / 5 s and stops when tab is hidden. | P2 | Performance | `tracking/poll_frequency.feature` | Not Started |
| NFR-TRK-003 | Map component is rendered without layout shift (CLS ≤ 0.1). | P2 | Performance | `tracking/cls.spec` | Not Started |
| NFR-TRK-004 | Responsive at 320 px – 1440 px (map and timeline reflow gracefully). | P1 | Responsive | `tracking/responsive.feature` | Implemented |
| NFR-TRK-005 | Works on Chromium, Firefox, WebKit. | P1 | Cross-browser | cucumber profiles | Not Started |
| NFR-TRK-006 | No console errors during full delivery lifecycle. | P2 | UI | `tracking/no_console_errors.feature` | Not Started |

## UX / Design

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| UX-TRK-001 | Active status node in the timeline is visually highlighted (not color-only). | P2 | Visual / A11Y | `tracking/timeline_active.feature` | Not Started |
| UX-TRK-002 | Drone marker direction/animation matches the path between markers. | P3 | Visual | `tracking/drone_anim.spec` | Not Started |
| UX-TRK-003 | Tracking layout matches design-system spacing, typography and color tokens. | P3 | Visual | `tracking/visual.spec` | Not Started |

## Accessibility (WCAG 2.1 AA)

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| A11Y-TRK-001 | Status timeline uses `aria-current="step"` (or equivalent) on the active stage. | P1 | A11Y | `tracking/timeline_aria.feature` | Not Started |
| A11Y-TRK-002 | Progress bar exposes `role="progressbar"` with `aria-valuemin/now/max`. | P1 | A11Y | `tracking/progressbar_aria.feature` | Not Started |
| A11Y-TRK-003 | Map content has a textual alternative (e.g. "Drone is X km from delivery address"). | P1 | A11Y | `tracking/map_text_alt.feature` | Not Started |
| A11Y-TRK-004 | Status changes are announced via `aria-live="polite"`. | P2 | A11Y | `tracking/status_announce.feature` | Not Started |
| A11Y-TRK-005 | Color contrast ≥ 4.5:1 for text and ≥ 3:1 for icons; passes axe-core scan. | P1 | A11Y (axe) | `tracking/axe_scan.spec` | Not Started |
| A11Y-TRK-006 | All interactive controls (Back, Help disclosure) reachable by keyboard. | P1 | A11Y | `tracking/keyboard_nav.feature` | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-TRK-001 | Order ID enumeration: random IDs return the not-found state, never another user's data. | P0 | Security / API | `tracking/no_idor.feature` | Not Started |
| SEC-TRK-002 | API responses do not leak payment data or other users' PII. | P0 | Security | `tracking/no_pii_leak.spec` | Not Started |
| SEC-TRK-003 | Path parameter is sanitized; injection payloads (`<script>`, SQLi-style) do not break rendering. | P1 | Security | `tracking/path_param_sanitization.feature` | Not Started |

## Known intentional defects (regression coverage)

| ID | Description | Source | Priority | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| BUG-TRK-001 | `getStatusFromProgress` uses `< 90` instead of `< 85`, so the `Arriving` status can be skipped. | `src/lib/tracking.ts` | P2 | `tracking/bug_skips_arriving.feature` | Not Started |
| BUG-TRK-002 | `calculateETA` ignores rain — ETA should be 20 % longer when raining but isn't. | `src/lib/tracking.ts` | P2 | `tracking/bug_eta_ignores_rain.feature` | Not Started |
| BUG-TRK-003 | Progress percentage doesn't always map to the highlighted status (boundary mismatch). | `src/lib/tracking.ts:getProgressForStatus` | P2 | `tracking/bug_progress_status_mismatch.feature` | Not Started |
