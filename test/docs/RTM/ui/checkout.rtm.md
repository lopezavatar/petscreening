# RTM — Checkout page (`/checkout`)

End-to-end purchase flow: cart review, delivery location, schedule, weather,
promo, tip, billing summary and payment. Requires a non-empty cart (otherwise
the route redirects back to `/`).

## Page summary

- **← Back** header + H1 "Checkout".
- **Your Order** section: per-item line with `−` / quantity / `+` and **Remove**;
  subtotal.
- **Delivery location** mode tabs: **Address** (geocoding input + Look up),
  **Slider** (0–50 km), **Manual** (km input).
- **Delivery date and time** pickers.
- **Weather simulation** toggle: **Clear** / **Raining** (note: rain adds $10
  surcharge on weekdays only).
- **Delivery instructions** textarea (0/200 characters).
- **Promo code** input + **Apply** (supported codes: `WELCOME10`, `SAVE5`,
  `BIGORDER20`, `FREEDELIVERY`; `EXPIRED2024` must fail).
- **Tip** selector: 15 %, 18 % (default), 20 %, 25 %, Custom, No tip; max
  $100, no negative values.
- **Order Summary**: Items, delivery line, loyalty discount, promo, tip, total.
- **Payment**: Name, Card number, Expiry MM/YY, CVV.
- **Pricing Rules Reference** collapsible panel.
- **PLACE ORDER** button — disabled until form is valid.

## Pricing rules (source of truth: `src/lib/constants.ts`, `src/lib/billing.ts`)

| Rule | Value |
|---|---|
| Base delivery (≤ 10 km) | $10.00 |
| Long-range delivery (> 10 km) | $25.00 |
| Rain surcharge (weekdays only) | +$10.00 |
| Weekend flat rate (Sat/Sun) | $50.00 (overrides base + rain) |
| Loyalty discount | applied to delivery total: Bronze 0 %, Silver 5 %, Gold 10 %, Platinum 15 % |

## Functional requirements

### Cart management

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-CHK-001 | GET `/checkout` with a non-empty cart returns 200 and renders all sections. | P0 | All + Guest | UI | `checkout/load.feature` | Not Started |
| FR-CHK-002 | GET `/checkout` with an empty cart redirects to `/`. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-003 | `+` increases item quantity by 1 and recomputes subtotal & total. | P0 | All + Guest | UI | `checkout/qty_increase.feature` | Not Started |
| FR-CHK-004 | `−` decreases quantity by 1, but never below 1 (button disabled at qty 1). | P1 | All + Guest | UI | `checkout.feature` | Implemented (known bug — `−` is NOT disabled at qty 1) |
| FR-CHK-005 | **Remove** removes the line. If it was the last item, user is redirected to `/`. | P1 | All + Guest | UI | `checkout.feature` | Implemented |

### Delivery location

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-CHK-010 | Address tab: typing an address + **Look up** resolves a distance from PITS Kitchen (DTLA) and updates the billing line. | P1 | All + Guest | UI / API | `checkout.feature` | Implemented |
| FR-CHK-011 | Address tab: invalid / unresolved address shows an error and keeps Place Order disabled. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-012 | Slider tab: distance values 0 – 50 km; numeric label updates live. | P1 | All + Guest | UI | `checkout.feature` | Implemented (drift: min is 0.5, not 0) |
| FR-CHK-013 | Slider tab: ≤ 10 km shows "$10 base (within 10km)"; > 10 km shows long-range label. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-014 | Manual tab: accepts positive numeric distance; rejects negatives and non-numerics. | P2 | All + Guest | UI | `checkout/manual_validation.feature` | Not Started |
| FR-CHK-015 | Switching tabs preserves the most recent valid distance value in the summary. | P2 | All + Guest | UI | `checkout/tab_switch_state.feature` | Not Started |

### Schedule & weather

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-CHK-020 | Delivery date defaults to today; time defaults to "now". | P2 | All + Guest | UI | `checkout/datetime_defaults.feature` | Not Started |
| FR-CHK-021 | Past dates / past times are rejected (validation error, Place Order disabled). | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-022 | Delivery hours are restricted to 08:00 – 22:00 (per Pricing Rules reference). | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-023 | **Raining** toggle on a weekday adds a $10.00 rain surcharge line to the summary. | P0 | All + Guest | UI / unit | `checkout/rain_weekday.feature` | Not Started |
| FR-CHK-024 | **Raining** toggle on a weekend does NOT add a surcharge (weekend flat overrides). | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-025 | Selecting a Saturday or Sunday delivery date forces the $50.00 weekend flat rate, replacing per-km lines. | P0 | All + Guest | UI | `checkout/weekend_flat.feature` | Not Started |

### Delivery instructions

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-CHK-030 | Instructions textarea is optional and limited to 200 characters; counter reflects current length. | P2 | All + Guest | UI | `checkout/instructions_limit.feature` | Not Started |

### Promo codes

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-CHK-040 | `WELCOME10` applies 10 % off the subtotal. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-041 | `SAVE5` applies $5 off only when subtotal ≥ $25; otherwise shows minimum-order error. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-042 | `BIGORDER20` applies 20 % off capped at $15 discount. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-043 | `FREEDELIVERY` zeroes out the delivery line. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-044 | `EXPIRED2024` returns "expired" error and is not applied. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-045 | Unknown promo code returns "Invalid promo code" error. | P2 | All + Guest | UI | `checkout/promo_invalid.feature` | Not Started |
| FR-CHK-046 | Promo input is case-insensitive and trims whitespace before validation. | P2 | All + Guest | UI | `checkout/promo_normalize.feature` | Not Started |

### Tip

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-CHK-050 | Tip preset chips (15/18/20/25 %) compute `subtotal × pct` and update summary line. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-051 | **No tip** sets tip to $0 and removes the line. | P2 | All + Guest | UI | `checkout/tip_none.feature` | Not Started |
| FR-CHK-052 | **Custom** accepts a positive amount ≤ $100; negatives are rejected; > $100 shows "Maximum tip is $100". | P1 | All + Guest | UI | `checkout.feature` | Implemented |

### Payment & submission

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-CHK-060 | All four payment fields (Name, Card, Expiry, CVV) must be filled before **PLACE ORDER** enables. | P0 | All + Guest | UI | `checkout/payment_required.feature` | Not Started |
| FR-CHK-061 | Card number is digit-grouped (4-4-4-4) and limited to 16 digits. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-062 | Expiry auto-formats to `MM/YY` and rejects past expiry. | P1 | All + Guest | UI | `checkout.feature` | Implemented (known bug — past expiry NOT rejected) |
| FR-CHK-063 | CVV accepts 3 digits only. | P1 | All + Guest | UI | `checkout.feature` | Implemented (known bug — CVV accepts > 3 digits) |
| FR-CHK-064 | Successful submit redirects to `/confirmation` with a generated order ID in the format `PITS-YYYYMMDD-XXXX`. | P0 | All + Guest | UI | `checkout/place_order_success.feature` | Not Started |
| FR-CHK-065 | After successful submit the cart is cleared. | P1 | All + Guest | UI | `checkout.feature` | Implemented |
| FR-CHK-066 | Network failure during submit shows an error and does NOT clear the cart. | P1 | All + Guest | UI | `checkout/place_order_failure.feature` | Skipped (app submits client-side only — no network call to intercept) |
| FR-CHK-067 | **Pricing Rules Reference** expands to show the rule table; collapses on second click. | P3 | All + Guest | UI | `checkout/rules_panel.feature` | Not Started |
| FR-CHK-068 | **← Back** preserves cart state and returns to the previous page. | P2 | All + Guest | UI | `checkout/back_preserves_cart.feature` | Not Started |

## Tier-specific behavior

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| TIER-CHK-001 | Guest checkout shows no loyalty discount line. | P1 | Guest | UI | `checkout.feature` | Implemented |
| TIER-CHK-002 | Bronze checkout shows no loyalty discount line (0 %). | P1 | Bronze | UI | `checkout.feature` | Implemented |
| TIER-CHK-003 | Silver shows `Silver member discount (5%)` line equal to `-0.05 × delivery total`. | P1 | Silver | UI | `checkout.feature` | Implemented (UI renders amount as `$-X.XX`, not `-$X.XX` — drift) |
| TIER-CHK-004 | Gold shows `Gold member discount (10%)` line equal to `-0.10 × delivery total`. | P1 | Gold | UI | `checkout.feature` | Implemented (UI renders amount as `$-X.XX`, not `-$X.XX` — drift) |
| TIER-CHK-005 | Platinum shows `Platinum member discount (15%)` line equal to `-0.15 × delivery total`. | P1 | Platinum | UI | `checkout.feature` | Implemented (UI renders amount as `$-X.XX`, not `-$X.XX` — drift) |
| TIER-CHK-006 | Loyalty discount also applies to weekend flat rate (`-0.10 × $50 = -$5` for Gold). | P1 | Silver/Gold/Platinum | UI | `checkout.feature` | Implemented |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-CHK-001 | Order summary recalculation completes in < 100 ms after any input change. | P2 | Performance | `checkout/perf_recalc.spec` | Not Started |
| NFR-CHK-002 | Geocoding API response handled within 3 s; UI shows a loader meanwhile. | P2 | Performance | `checkout/geocoding_loader.feature` | Not Started |
| NFR-CHK-003 | Page is fully usable at 320 px – 1440 px viewports (no horizontal scroll). | P1 | Responsive | `checkout/responsive.feature` | Not Started |
| NFR-CHK-004 | Works on Chromium, Firefox and WebKit. | P1 | Cross-browser | cucumber profiles | Not Started |
| NFR-CHK-005 | No console errors during a complete happy-path order. | P2 | UI | `checkout/no_console_errors.feature` | Not Started |

## UX / Design

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| UX-CHK-001 | Disabled **PLACE ORDER** button is visually distinct (opacity / cursor). | P2 | Visual | `checkout/place_order_disabled_style.feature` | Not Started |
| UX-CHK-002 | Currency values are right-aligned in the summary and use `$X.XX` format. | P2 | Visual | `checkout/currency_format.feature` | Not Started |
| UX-CHK-003 | Active tab in the delivery-location selector is visually distinct. | P3 | Visual | `checkout/tabs_active_style.feature` | Not Started |
| UX-CHK-004 | Rain toggle uses recognizable icons and high-contrast active state. | P3 | Visual | `checkout/rain_toggle_style.feature` | Not Started |

## Accessibility (WCAG 2.1 AA)

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| A11Y-CHK-001 | Every input has a programmatic label. | P1 | A11Y | `checkout/labels.feature` | Not Started |
| A11Y-CHK-002 | Distance slider exposes `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`. | P1 | A11Y | `checkout/slider_aria.feature` | Not Started |
| A11Y-CHK-003 | Tab list for delivery location uses `role="tablist"` / `role="tab"` / `role="tabpanel"`. | P2 | A11Y | `checkout/tabs_aria.feature` | Not Started |
| A11Y-CHK-004 | Validation errors are linked to fields via `aria-describedby` and announced. | P1 | A11Y | `checkout/error_aria.feature` | Not Started |
| A11Y-CHK-005 | Instruction-counter "0/200 characters" is updated via `aria-live="polite"`. | P2 | A11Y | `checkout/counter_aria.feature` | Not Started |
| A11Y-CHK-006 | Tab order follows visual order (order → location → date → weather → instructions → promo → tip → payment → place order). | P2 | A11Y | `checkout/tab_order.feature` | Not Started |
| A11Y-CHK-007 | Color contrast ≥ 4.5:1 for body, ≥ 3:1 for icons; passes axe-core scan. | P1 | A11Y (axe) | `checkout/axe_scan.spec` | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-CHK-001 | Payment fields are never persisted to local/session storage or logs. | P0 | Security | `checkout/no_pan_storage.spec` | Not Started |
| SEC-CHK-002 | Card / CVV inputs use `autocomplete="cc-number"` / `cc-csc` and `inputmode="numeric"`. | P2 | Security / A11Y | `checkout/payment_autocomplete.feature` | Not Started |
| SEC-CHK-003 | Promo-code endpoint validates server-side; spoofing the client cannot apply unknown codes. | P0 | API | `checkout/promo_server_validation.feature` | Not Started |
| SEC-CHK-004 | Billing total is recomputed server-side at order creation (client total cannot be trusted). | P0 | API | `checkout/billing_server_recompute.feature` | Not Started |
| SEC-CHK-005 | Loyalty discount cannot be applied by a guest tampering with the request. | P0 | API | `checkout/loyalty_guest_tamper.feature` | Not Started |

## Known intentional defects (regression coverage)

| ID | Description | Source | Priority | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| BUG-CHK-001 | Points are computed with `Math.floor(subtotal)` so `$29.50` earns 29 pts instead of 30. | `src/lib/loyalty.ts:calculatePointsEarned` | P2 | `checkout/bug_points_floor.feature` | Not Started |

## Implementation notes (P1 UI pass)

All P1 UI scenarios above are implemented in a single
[checkout.feature](../../features/ui/checkout.feature) file with steps in
[checkoutSteps.ts](../../stepDefinitions/ui/checkoutSteps.ts) and POM
[CheckoutPage.ts](../../pages/CheckoutPage.ts). Suite result:
**33/35 scenarios pass; the 2 failures are the `@known-bug` regressions
intentionally documented below.**

### Application bugs surfaced by this pass (asserting correct behavior; left to fail)

| Ref | Bug | Evidence |
|---|---|---|
| FR-CHK-004 | `−` quantity button is enabled at qty 1 (allows decrement attempts). | `QuantityControl` does not set `disabled` when `quantity === 1`. |
| FR-CHK-062 | Expiry MM/YY auto-formats correctly but a past date (e.g. `01 / 20`) is accepted with no validation error. | `PaymentForm` performs format-only validation. |
| FR-CHK-063 | CVV input accepts more than 3 digits (e.g. `1234`). | `cvv` field has no `maxLength={3}` and no length validator. |

### UI drift recorded (test asserts current behavior; flagged here for design review)

| Ref | Drift | What the test does |
|---|---|---|
| FR-CHK-012 | Slider minimum is **0.5 km**, not 0 as stated in RTM. | Test asserts `min <= 0.5`. |
| TIER-CHK-003/004/005 | Loyalty discount amount renders as `$-X.XX` while promo discount renders as `-$X.XX` — sign-position inconsistency. | Step `shows a {string} line of -${float}` accepts both formats. |
| FR-CHK-066 | App never makes a network call at submit time (the order is built fully client-side, see `src/app/checkout/page.tsx`), so a network-failure scenario cannot be intercepted via `page.route`. | Marked **Skipped** above; needs server-submit feature work first. |

### Test-side notes

- Direct `goto('/checkout')` after writing `pits_cart` in `sessionStorage`
  triggers a CartContext hydration race that produces a Next.js error overlay.
  All scenarios open `/` first, write the cart, reload, then click the
  Checkout button (`seedCartAndOpenCheckout` helper).
- `today` in this run is **2026-05-23 (Saturday)**, so the weekend flat
  rate `$50` is the default. Scenarios that need the base-delivery line
  explicitly set the date to the next Monday.
