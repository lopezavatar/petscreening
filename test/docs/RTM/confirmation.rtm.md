# RTM — Confirmation page (`/confirmation`)

Post-checkout receipt screen, reachable only after `PLACE ORDER` succeeds.
Surfaces the generated order ID and entry points to tracking.

## Page summary

- Sky / drone illustration.
- Headline "Your pie is on its way!" and order ID badge (format
  `PITS-YYYYMMDD-XXXX`, e.g. `PITS-20260522-9W76`).
- Short summary line: `N {product}, flying to you by drone.`
- Delivery facts block: **Delivery to**, **Distance**, **Scheduled**.
- **Order Summary**: items, delivery line, loyalty discount (if any), tip, total.
- Primary CTA: **Track Your Order** → `/tracking/{orderId}`.
- Secondary CTA: **Place another order** → `/`.

## Functional requirements

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-CONF-001 | Direct navigation to `/confirmation` without a recent order redirects to `/`. | P1 | All + Guest | UI | `confirmation/no_order_redirect.feature` | Implemented |
| FR-CONF-002 | After a successful order, page displays the new order ID in the format `PITS-YYYYMMDD-XXXX`. | P0 | All + Guest | UI | `confirmation/order_id_format.feature` | Not Started |
| FR-CONF-003 | Item summary line states the correct count and product name(s). | P1 | All + Guest | UI | `confirmation/item_summary.feature` | Implemented |
| FR-CONF-004 | "Delivery to" reflects the chosen mode (address text, "Slider: X km from kitchen", or "Manual: X km"). | P1 | All + Guest | UI | `confirmation/delivery_to_mode.feature` | Implemented |
| FR-CONF-005 | "Distance" value (km) matches the one used in checkout billing. | P1 | All + Guest | UI | `confirmation/distance_match.feature` | Implemented |
| FR-CONF-006 | "Scheduled" displays the chosen date/time in `Weekday, Month D, YYYY, HH:mm` format. | P2 | All + Guest | UI | `confirmation/scheduled_format.feature` | Not Started |
| FR-CONF-007 | Order Summary line items match the checkout summary at submission (items, delivery, loyalty discount, tip). | P0 | All + Guest | UI | `confirmation/summary_match.feature` | Not Started |
| FR-CONF-008 | Order Summary total equals `Σ line items` and matches the value charged at checkout. | P0 | All + Guest | UI | `confirmation/total_consistency.feature` | Not Started |
| FR-CONF-009 | **Track Your Order** navigates to `/tracking/{orderId}` using the generated ID. | P0 | All + Guest | UI | `confirmation/track_cta.feature` | Not Started |
| FR-CONF-010 | **Place another order** navigates to `/` and starts an empty cart. | P1 | All + Guest | UI | `confirmation/another_order_cta.feature` | Implemented |
| FR-CONF-011 | Refreshing `/confirmation` after success keeps showing the same order (no double-post). | P1 | All + Guest | UI | `confirmation/refresh_stable.feature` | Implemented |
| FR-CONF-012 | Order ID can be selected/copied as text. | P3 | All + Guest | UI | `confirmation/order_id_copy.feature` | Not Started |

## Tier-specific behavior

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| TIER-CONF-001 | Guest / Bronze confirmation shows NO `member discount` line. | P1 | Guest, Bronze | UI | `confirmation/tier_no_discount.feature` | Implemented |
| TIER-CONF-002 | Silver / Gold / Platinum confirmation shows the corresponding `member discount (X%)` line with the matching negative amount. | P1 | Silver, Gold, Platinum | UI | `confirmation/tier_discount_line.feature` | Implemented |
| TIER-CONF-003 | Points earned for the order are awarded to the authenticated user's balance (visible later on `/account/rewards`). | P1 | Bronze/Silver/Gold/Platinum | UI / API | `confirmation/points_awarded.feature` | Implemented |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-CONF-001 | Confirmation page renders in < 1.5 s after submit on local environment. | P2 | Performance | `confirmation/perf.spec` | Not Started |
| NFR-CONF-002 | Responsive at 320 px – 1440 px. | P1 | Responsive | `confirmation/responsive.feature` | Not Started |
| NFR-CONF-003 | Works on Chromium, Firefox, WebKit. | P1 | Cross-browser | cucumber profiles | Not Started |
| NFR-CONF-004 | No console errors. | P2 | UI | `confirmation/no_console_errors.feature` | Not Started |

## UX / Design

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| UX-CONF-001 | Confirmation illustration uses brand sky scene; loads without layout shift. | P3 | Visual | `confirmation/visual.spec` | Not Started |
| UX-CONF-002 | Order ID is styled as a highlighted code/badge for scanability. | P3 | Visual | `confirmation/order_id_style.feature` | Not Started |
| UX-CONF-003 | Primary vs secondary CTAs are visually differentiated. | P2 | Visual | `confirmation/cta_hierarchy.feature` | Not Started |

## Accessibility (WCAG 2.1 AA)

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| A11Y-CONF-001 | Page has exactly one `h1` ("Your pie is on its way!"). | P2 | A11Y | `confirmation/heading_structure.feature` | Not Started |
| A11Y-CONF-002 | Decorative drone illustration is hidden from AT (`aria-hidden="true"` or empty alt). | P2 | A11Y | `confirmation/decorative_image.feature` | Not Started |
| A11Y-CONF-003 | Both CTAs are reachable by keyboard with a visible focus ring. | P1 | A11Y | `confirmation/keyboard_nav.feature` | Not Started |
| A11Y-CONF-004 | Color contrast ≥ 4.5:1 for body text. | P1 | A11Y (axe) | `confirmation/axe_scan.spec` | Not Started |
| A11Y-CONF-005 | Axe-core scan passes with zero serious/critical violations. | P1 | A11Y (axe) | `confirmation/axe_scan.spec` | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-CONF-001 | Card number, CVV, expiry are NOT echoed back on the confirmation page or in network responses. | P0 | Security | `confirmation/no_payment_leak.spec` | Not Started |
| SEC-CONF-002 | Order data on this route belongs only to the current session/user (no IDOR by URL guessing). | P0 | Security / API | `confirmation/no_idor.feature` | Not Started |
