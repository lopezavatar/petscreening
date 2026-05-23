# RTM — Account area (`/account`, `/account/orders`, `/account/rewards`)

Authenticated user dashboard. Composed of three sub-routes sharing a common
sidebar (Profile / Order History / Rewards / Sign Out). Requires login.

## Page summary

### Shared shell

- **← Back to menu** + brand logo (top bar).
- Sidebar card with user name, email, tier badge and current points.
- Sidebar nav: **Profile** (`/account`), **Order History** (`/account/orders`),
  **Rewards** (`/account/rewards`).
- **Sign Out** button.

### `/account` (Profile)

- H1 "My Profile".
- Tier card: tier label, `X% discount`, current points, progress bar
  "Progress to {nextTier}", "Y pts to go".
- Account details: Name, Email, Member since `Month YYYY` (from `joinedAt`).
- Quick actions: **View Orders**, **Rewards**.

### `/account/orders` (Order History)

- H1 "Order History".
- Toolbar: **Filters** toggle, "N orders" counter, **Sort by:** Date / Total.
- Order rows with `PIE-XXXXXX`, date, status (`Pending`, `In Transit`,
  `Delivered`, `Cancelled`), total. Each row is clickable (drill-down).
- Pagination (page size ≈ 10).

### `/account/rewards` (Rewards)

- H1 "Rewards".
- Header card: tier, `X% discount`, current points, progress bar.
- **Rewards Catalog**: 6 redeemable items
  (`Free Delivery 300pts`, `$5 Off 500pts`, `$10 Off 900pts`,
   `Free Signature Pie 1500pts`, `Double Points Pass 750pts`,
   `Priority Delivery 400pts`) with **Redeem** button.
- **Points Activity**: recent earn/redeem ledger.

## Functional requirements

### Authentication & navigation

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-ACC-001 | Visiting `/account*` while unauthenticated redirects to `/login`. | P0 | Guest | UI / API | `account/auth_nav.feature` | Implemented |
| FR-ACC-002 | Sidebar links navigate to Profile, Orders and Rewards and highlight the active route. | P1 | All tiers | UI | `account/auth_nav.feature` | Implemented |
| FR-ACC-003 | **Sign Out** clears the session and redirects to `/`. | P0 | All tiers | UI / API | `account/auth_nav.feature` | Implemented (known-bug) |
| FR-ACC-004 | After Sign Out, returning to `/account` redirects to `/login`. | P1 | All tiers | UI | `account/auth_nav.feature` | Implemented |
| FR-ACC-005 | **← Back to menu** returns to `/` while keeping the session active. | P2 | All tiers | UI | `account/auth_nav.feature` | Implemented |
| FR-ACC-006 | Sidebar card shows the user name, email, tier label and current points for the logged-in user. | P1 | All tiers | UI | `account/auth_nav.feature` | Implemented |

### Profile (`/account`)

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-PROF-001 | "X% discount" matches the tier table (Bronze 0, Silver 5, Gold 10, Platinum 15). | P0 | All tiers | UI | `account/profile.feature` | Implemented |
| FR-PROF-002 | Current points equals `users[].points` from the API. | P0 | All tiers | UI / API | `account/profile.feature` | Implemented |
| FR-PROF-003 | "Progress to {nextTier}" label uses the next tier name; Platinum shows a max/"top tier" state instead. | P1 | All tiers | UI | `account/profile.feature` | Implemented |
| FR-PROF-004 | "Y pts to go" equals `nextTier.minPoints - currentPoints`. | P1 | Bronze/Silver/Gold | UI | `account/profile.feature` | Not Automated — trivial arithmetic, low ROI (covered indirectly by FR-PROF-003) |
| FR-PROF-005 | Account Details show Name, Email and "Member since" formatted as `Month YYYY` from `joinedAt`. | P1 | All tiers | UI | `account/profile.feature` | Implemented |
| FR-PROF-006 | Quick action **View Orders** navigates to `/account/orders`. | P2 | All tiers | UI | `account/profile.feature` | Implemented |
| FR-PROF-007 | Quick action **Rewards** navigates to `/account/rewards`. | P2 | All tiers | UI | `account/profile.feature` | Implemented |

### Order history (`/account/orders`)

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-ORD-001 | GET `/account/orders` returns 200 and lists the user's orders. | P0 | All tiers | UI | `account/orders.feature` | Implemented |
| FR-ORD-002 | Counter "N orders" matches the row count returned by `/api/orders`. | P1 | All tiers | UI / API | `account/orders.feature` | Implemented |
| FR-ORD-003 | Each row shows order ID `PIE-XXXXXX`, date `MMM D, YYYY`, status badge and `$total`. | P1 | All tiers | UI | `account/orders.feature` | Implemented |
| FR-ORD-004 | Status badge values are limited to `Pending`, `In Transit`, `Delivered`, `Cancelled`. | P1 | All tiers | UI | `account/orders.feature` | Implemented |
| FR-ORD-005 | Default sort is Date ↓ (newest first). | P2 | All tiers | UI | `account/orders.feature` | Implemented |
| FR-ORD-006 | **Sort by Total** toggles ascending/descending and reorders the list correctly. | P2 | All tiers | UI | `account/orders.feature` | Implemented |
| FR-ORD-007 | **Filters** disclosure opens filter controls (status, date range, total range). | P2 | All tiers | UI | `account/orders.feature` | Implemented |
| FR-ORD-008 | Pagination splits results (≈ 10 per page) with Previous/Next; edges are disabled appropriately. | P1 | All tiers | UI | `account/orders.feature` | Implemented |
| FR-ORD-009 | Clicking a row opens the order detail (or tracking, for in-flight orders). | P1 | All tiers | UI | `account/orders.feature` | Implemented (known-bug) |
| FR-ORD-010 | A user with no orders sees an empty-state message and a CTA back to the catalog. | P2 | All tiers (new) | UI | `account/orders.feature` | Implemented (known-bug) |

### Rewards (`/account/rewards`)

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-RWD-001 | GET `/account/rewards` returns 200 and shows tier card + catalog + activity. | P0 | All tiers | UI | `account/rewards.feature` | Implemented |
| FR-RWD-002 | Catalog renders exactly six items with name, description and points cost. | P1 | All tiers | UI | `account/rewards.feature` | Implemented |
| FR-RWD-003 | "X points available" header matches the sidebar points balance. | P1 | All tiers | UI | `account/rewards.feature` | Implemented |
| FR-RWD-004 | **Redeem** is enabled only when `userPoints >= reward.pointsCost`. | P1 | All tiers | UI | `account/rewards.feature` | Implemented |
| FR-RWD-005 | Redeeming subtracts the cost from the balance and refreshes the activity ledger. | P0 | All tiers | UI / API | `account/rewards.feature` | Implemented |
| FR-RWD-006 | Attempting to redeem without enough points shows "You need N more points" and does not deduct. | P1 | Bronze | UI | `account/rewards.feature` | Implemented |
| FR-RWD-007 | "Points Activity" lists transactions chronologically (newest first) with `+N pts` or `-N pts`. | P2 | All tiers | UI | `account/rewards.feature` | Implemented |
| FR-RWD-008 | Each transaction shows an order reference (when applicable) and date. | P2 | All tiers | UI | `account/rewards.feature` | Implemented |

## Tier-specific behavior

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| TIER-ACC-001 | Bronze sees `bronze`, `0% discount`, points 150, progress "350 pts to silver". | P1 | Bronze | UI | `account/tier_specific.feature` | Implemented (known-bug: renders "No discount") |
| TIER-ACC-002 | Silver sees `silver`, `5% discount`, points 820, progress "680 pts to gold". | P1 | Silver | UI | `account/tier_specific.feature` | Implemented |
| TIER-ACC-003 | Gold sees `gold`, `10% discount`, points 2100, progress "900 pts to platinum". | P1 | Gold | UI | `account/tier_specific.feature` | Implemented |
| TIER-ACC-004 | Platinum (4500 pts) sees `platinum`, `15% discount` and a "top tier"/max-progress state. | P1 | Platinum | UI | `account/tier_specific.feature` | Implemented |
| TIER-ACC-005 | Bronze can redeem only **Free Delivery** initially (≥ 300 pts after enough orders); other rewards stay disabled. | P2 | Bronze | UI | `account/tier_specific.feature` | Implemented |
| TIER-ACC-006 | Platinum can redeem every catalog item. | P2 | Platinum | UI | `account/tier_specific.feature` | Implemented |
| TIER-ACC-007 | Cross-tier isolation: each user only sees their own orders and points. | P0 | All tiers | API | `account/tier_data_isolation.feature` | Not Started |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-ACC-001 | Each sub-route renders in < 1.5 s on local env. | P2 | Performance | `account/perf.spec` | Not Started |
| NFR-ACC-002 | Responsive at 320 px – 1440 px; sidebar collapses to a drawer on mobile. | P1 | Responsive | `account/responsive.feature` | Not Started |
| NFR-ACC-003 | Works on Chromium, Firefox, WebKit. | P1 | Cross-browser | cucumber profiles | Not Started |
| NFR-ACC-004 | No console errors on Profile, Orders or Rewards. | P2 | UI | `account/non_functional.feature` | Implemented |

## UX / Design

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| UX-ACC-001 | Tier badge color matches design-system token (`bronze #CD7F32`, `silver #C0C0C0`, `gold #FFD700`, `platinum #E5E4E2`). | P2 | Visual | `account/tier_badge_color.feature` | Not Started |
| UX-ACC-002 | Active sidebar item is visually distinct (icon + background). | P2 | Visual | `account/sidebar_active.feature` | Not Started |
| UX-ACC-003 | Order status badge uses distinct color tokens per status, plus an icon (not color-only). | P2 | Visual / A11Y | `account/status_badge_style.feature` | Not Started |
| UX-ACC-004 | Reward cards have consistent layout and clear CTA hierarchy. | P3 | Visual | `account/rewards_card_layout.feature` | Not Started |

## Accessibility (WCAG 2.1 AA)

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| A11Y-ACC-001 | Sidebar navigation is a `<nav>` with `aria-label="Account"`; active link uses `aria-current="page"`. | P1 | A11Y | `account/sidebar_aria.feature` | Not Started |
| A11Y-ACC-002 | Each sub-route has exactly one `h1` ("My Profile" / "Order History" / "Rewards"). | P2 | A11Y | `account/heading_structure.feature` | Not Started |
| A11Y-ACC-003 | Progress bar exposes `role="progressbar"` with `aria-valuemin/now/max`. | P1 | A11Y | `account/progressbar_aria.feature` | Not Started |
| A11Y-ACC-004 | Orders pagination uses `aria-label` per button and `aria-current="page"`. | P2 | A11Y | `account/orders_pagination_aria.feature` | Not Started |
| A11Y-ACC-005 | Disabled **Redeem** buttons expose `aria-disabled="true"` and the reason via `aria-describedby`. | P1 | A11Y | `account/redeem_disabled_aria.feature` | Not Started |
| A11Y-ACC-006 | All interactive elements reachable by keyboard with a visible focus ring. | P1 | A11Y | `account/keyboard_nav.feature` | Not Started |
| A11Y-ACC-007 | Color contrast ≥ 4.5:1 for body text and badges; passes axe-core scan. | P1 | A11Y (axe) | `account/axe_scan.spec` | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-ACC-001 | All `/api/users/{id}`, `/api/orders?userId=...` endpoints reject requests from a different user (no IDOR). | P0 | Security / API | `account/api_idor.feature` | Not Started |
| SEC-ACC-002 | Tier and points cannot be modified from the client (write attempts return 4xx). | P0 | API | `account/no_client_writes.feature` | Not Started |
| SEC-ACC-003 | Redeem endpoint validates the points balance server-side; client manipulation cannot redeem unaffordable rewards. | P0 | API | `account/redeem_server_validation.feature` | Not Started |
| SEC-ACC-004 | Sign-Out invalidates the server session/cookie (cannot be replayed). | P0 | Security | `account/sign_out_invalidates_session.feature` | Not Started |
| SEC-ACC-005 | Email address and order details are not exposed in HTML rendered to unauthenticated users (no SSR leakage). | P1 | Security | `account/no_ssr_leak.spec` | Not Started |

## Known intentional defects (regression coverage)

| ID | Description | Source | Priority | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| BUG-ACC-001 | `calculatePointsEarned` uses `Math.floor`, so points are under-credited for fractional subtotals. | `src/lib/loyalty.ts` | P2 | `account/bug_points_floor.feature` | Not Started |
| BUG-ACC-002 | `isPointsExpired` uses `>=` instead of `>`, expiring points exactly on the anniversary date. | `src/lib/loyalty.ts` | P2 | `account/bug_points_expiry_boundary.feature` | Not Started |

