# RTM — Home / Catalog page (`/`)

Public landing & product catalog. Acts as the entry point for both guest and
authenticated users (Bronze → Platinum) and the start of the purchase funnel.

## Page summary

- Header: brand logo (links to `/`), **Sign In** link (guests) or **tier badge
  button** (authenticated, opens account menu), and a **cart shortcut** showing
  the item count once the cart is non-empty (links to `/checkout`).
- Hero: H1 "Fresh Pies, Delivered by Drone" + supporting paragraph.
- Toolbar: **Filters** toggle, **N pies** counter, **Sort** dropdown
  (defaults to *Popularity*).
- Filter panel (collapsible): Category chips (`All`, `Fruit`, `Cream`, `Savory`,
  `Seasonal`), Price range (min/max), *In Stock Only* toggle.
- Product grid: 6 pies per page with image, category, name, description,
  price and **Add** button.
- Pagination: Previous / 1..N / Next.
- Sticky cart drawer (appears when cart > 0): item count, subtotal, **Checkout** CTA.

## Functional requirements

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-HOME-001 | Page returns HTTP 200 and renders the catalog grid on `/`. | P0 | All + Guest | UI smoke | `home/load_catalog.feature` | Implemented |
| FR-HOME-002 | Catalog shows exactly 15 active products from `data/db.json` (seed). | P1 | All + Guest | UI / API | `home/catalog_count.feature` | Implemented |
| FR-HOME-003 | Pagination splits products into pages of 6 with Previous/Next controls. | P1 | All + Guest | UI | `home/pagination.feature` | Implemented |
| FR-HOME-004 | *Previous page* button is disabled on page 1; *Next page* disabled on last page. | P2 | All + Guest | UI | `home/pagination_edges.feature` | Implemented |
| FR-HOME-005 | Sort dropdown supports Popularity (default), Price asc/desc, Name asc/desc. | P1 | All + Guest | UI | `home/sort.feature` | Implemented |
| FR-HOME-006 | Category filter chips (`All`, `Fruit`, `Cream`, `Savory`, `Seasonal`) restrict the grid; *All* clears the filter. | P1 | All + Guest | UI | `home/filter_category.feature` | Implemented |
| FR-HOME-007 | Price range min/max filter excludes items outside `[min, max]`. | P1 | All + Guest | UI | `home/filter_price.feature` | Implemented |
| FR-HOME-008 | *In Stock Only* switch hides products where `available === false` (Georgia Peach, Garden Vegetable). | P1 | All + Guest | UI | `home/filter_stock.feature` | Implemented |
| FR-HOME-009 | Multiple filters combine with AND semantics; counter updates to reflect filtered total. | P2 | All + Guest | UI | `home/filter_combined.feature` | Implemented |
| FR-HOME-009a | **Clear all filters** control resets category to `All`, clears price range min/max, turns *In Stock Only* off, and restores the full catalog (15 items) and the *N pies* counter; control is disabled/hidden when no filters are active. | P1 | All + Guest | UI | `home/filter_clear_all.feature` | Implemented |
| FR-HOME-010 | Clicking **Add** increments the cart for the chosen pie and updates the cart shortcut count. | P0 | All + Guest | UI | `home/add_to_cart.feature` | Implemented |
| FR-HOME-011 | Sticky cart drawer becomes visible only when cart contains ≥ 1 item. | P1 | All + Guest | UI | `home/cart_drawer_visibility.feature` | Implemented |
| FR-HOME-012 | Cart drawer subtotal equals `Σ price × qty` of items in the cart. | P0 | All + Guest | UI | `home/cart_subtotal.feature` | Implemented |
| FR-HOME-013 | Drawer **Checkout** button navigates to `/checkout`. | P0 | All + Guest | UI | `home/cart_to_checkout.feature` | Implemented |
| FR-HOME-014 | Cart contents persist across page reloads (cart state in storage / context). | P1 | All + Guest | UI | `home/cart_persistence.feature` | Implemented |
| FR-HOME-015 | Header **Sign In** link routes guests to `/login`. | P1 | Guest | UI | `home/header_signin.feature` | Implemented |
| FR-HOME-016 | When authenticated, the Sign-In link is replaced by a tier badge button (e.g. `g Gold`). | P1 | Bronze/Silver/Gold/Platinum | UI | `home/header_tier_badge.feature` | Implemented |
| FR-HOME-017 | Tier badge button opens the account menu (or navigates to `/account`). | P2 | Bronze/Silver/Gold/Platinum | UI | `home/header_account_menu.feature` | Implemented |
| FR-HOME-018 | Logo in header always links back to `/` and is keyboard-focusable. | P2 | All + Guest | UI / A11Y | `home/header_logo.feature` | Implemented |

## Tier-specific behavior

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| TIER-HOME-001 | Tier badge label matches the logged-in user's tier (`Bronze` / `Silver` / `Gold` / `Platinum`). | P1 | Bronze/Silver/Gold/Platinum | UI | `home/tier_badge_per_user.feature` | Implemented |
| TIER-HOME-002 | Catalog prices on `/` are listed **without** tier discount (discount applies to delivery, not pies). | P1 | All | UI | `home/tier_no_product_discount.feature` | Implemented |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-HOME-001 | First Contentful Paint ≤ 2.0 s on cable network, Largest Contentful Paint ≤ 2.5 s. | P2 | Performance (Lighthouse) | `home/perf_lighthouse.spec` | Not Started |
| NFR-HOME-002 | No console errors on initial load (only documented Next.js dev warnings allowed). | P2 | UI | `home/no_console_errors.feature` | Implemented |
| NFR-HOME-003 | Catalog grid renders correctly at 320 px, 768 px, 1024 px and 1440 px viewports. | P1 | Visual / Responsive | `home/responsive.feature` | Not Started |
| NFR-HOME-004 | Browser compatibility: latest Chrome, Firefox, WebKit (Safari) per Playwright projects. | P1 | Cross-browser | cucumber profiles `firefox`, `webkit` | Not Started |
| NFR-HOME-005 | All product images include a meaningful `alt` attribute matching the pie name. | P2 | A11Y / UI | `home/alt_text.feature` | Implemented |

## UX / Design-system requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| UX-HOME-001 | Brand colors, typography and spacing match `Pie In The Sky Design System/colors_and_type.css`. | P2 | Visual regression | `home/visual.spec` | Not Started |
| UX-HOME-002 | Hover/focus styles on **Add**, filter chips and pagination buttons are visible (non-color cue). | P2 | UI / A11Y | `home/focus_styles.feature` | Implemented |
| UX-HOME-003 | Category chip selected state is visually distinct from unselected. | P3 | Visual | `home/chip_state.feature` | Not Started |

## Accessibility requirements (WCAG 2.1 AA)

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| A11Y-HOME-001 | All interactive controls reachable by keyboard, in a logical tab order. | P1 | A11Y | `home/keyboard_nav.feature` | Not Started |
| A11Y-HOME-002 | Color contrast ≥ 4.5:1 for body text and ≥ 3:1 for large text / icons. | P1 | A11Y (axe) | `home/axe_scan.spec` | Not Started |
| A11Y-HOME-003 | Each product card uses an `h3` for the pie name; page has a single `h1`. | P2 | A11Y | `home/heading_structure.feature` | Not Started |
| A11Y-HOME-004 | Cart-count badge announces updates to screen readers (`aria-live="polite"`). | P2 | A11Y | `home/cart_announce.feature` | Not Started |
| A11Y-HOME-005 | Filters disclosure button exposes `aria-expanded` reflecting open/closed state. | P2 | A11Y | `home/filters_aria.feature` | Not Started |
| A11Y-HOME-006 | Pagination buttons expose `aria-label` (`Previous page`, `Page N`, `Next page`) and `aria-current="page"`. | P2 | A11Y | `home/pagination_aria.feature` | Not Started |
| A11Y-HOME-007 | The page passes automated axe-core scan with zero serious/critical violations. | P1 | A11Y (axe) | `home/axe_scan.spec` | Not Started |

## Security requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-HOME-001 | Product API (`/api/products`) is read-only; POST/PUT/DELETE return 4xx. | P1 | API | `home/products_api_readonly.feature` | Not Started |
| SEC-HOME-002 | No PII or session tokens leaked in client bundle, network responses or console. | P1 | Security | `home/no_pii_leak.spec` | Not Started |
