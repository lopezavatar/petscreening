@home
Feature: Home page (catalog landing)

  All UI requirements for `/` — consolidated. Per-scenario tags preserve RTM
  traceability (FR-HOME-*, TIER-HOME-*, NFR-HOME-*, UX-HOME-*) plus priority
  (@P0/@P1/@P2) and category (@smoke / @a11y).

  Scenarios are data-driven against the live products API (snapshot taken in
  the @home Before hook), so the suite is resilient to seed changes: product
  names, prices, availability and category membership are never hard-coded.

  # ─── FR-HOME-001 ─ Catalog loads ────────────────────────────────────────────
  @FR-HOME-001 @P0 @smoke
  Scenario: Catalog page returns 200 and renders the grid
    Given the home page responds with HTTP 200
    When I open the home page
    Then the hero heading "Fresh Pies, Delivered by Drone" is visible
    And the product catalog grid is visible

  # ─── FR-HOME-002 ─ Catalog count ────────────────────────────────────────────
  @FR-HOME-002 @P1
  Scenario: Catalog counter matches the products API
    Given I open the home page
    Then the pie counter matches the catalog total
    And the products API matches the catalog snapshot

  # ─── FR-HOME-003 ─ Pagination default ───────────────────────────────────────
  @FR-HOME-003 @P1
  Scenario: Default page size is 6 with Previous/Next controls
    Given I open the home page
    Then the product grid shows the first page of products
    And the Previous page control is visible
    And the Next page control is visible
    And pagination shows the expected number of page buttons

  # ─── FR-HOME-004 ─ Pagination edges ─────────────────────────────────────────
  @FR-HOME-004 @P2
  Scenario: Previous is disabled on first page
    Given I open the home page
    Then the Previous page button is disabled
    And the Next page button is enabled

  @FR-HOME-004 @P2
  Scenario: Next is disabled on the last page
    Given I open the home page
    When I click the last pagination page
    Then the Next page button is disabled
    And the Previous page button is enabled

  # ─── FR-HOME-005 ─ Sort dropdown ────────────────────────────────────────────
  @FR-HOME-005 @P1
  Scenario: Default sort is Popularity
    Given I open the home page
    Then the sort dropdown label is "Popularity"

  @FR-HOME-005 @P1
  Scenario Outline: Sort dropdown applies the selected order
    Given I open the home page
    When I select sort option "<option>"
    Then the sort dropdown label is "<option>"
    And the visible products are ordered by <key> <direction>

    Examples:
      | option              | key   | direction |
      | Price: Low to High  | price | asc       |
      | Price: High to Low  | price | desc      |
      | Name: A-Z           | name  | asc       |
      | Name: Z-A           | name  | desc      |

  # ─── FR-HOME-006 ─ Category chips ───────────────────────────────────────────
  @FR-HOME-006 @P1
  Scenario: Selecting a category restricts the grid to that category's badge
    Given I open the home page
    And I open the filters panel
    When I select a category that has at least 1 in-stock product
    Then the product grid has at least 1 visible product
    And every visible product card has the active category badge

  @FR-HOME-006 @P1
  Scenario: "All" chip clears the category filter
    Given I open the home page
    And I open the filters panel
    When I select a category that has at least 1 in-stock product
    And I select the "All" category chip
    Then the pie counter matches the catalog total

  # ─── FR-HOME-007 ─ Price range ──────────────────────────────────────────────
  @FR-HOME-007 @P1
  Scenario: Min/max price filter excludes items outside the range
    Given I open the home page
    And I open the filters panel
    When I set the price range to min 27 and max 30
    Then every visible product price is between 27 and 30

  @FR-HOME-007 @P1
  Scenario: Setting min=max=catalog minimum keeps the cheapest product visible
    Given I open the home page
    And I open the filters panel
    When I set the price range to the catalog minimum exactly
    Then the product grid has at least 1 visible product

  @FR-HOME-007 @P1
  Scenario: Setting min=max=catalog maximum keeps the most expensive product visible
    Given I open the home page
    And I open the filters panel
    When I set the price range to the catalog maximum exactly
    Then the product grid has at least 1 visible product

  @FR-HOME-007 @P2
  Scenario: An inverted price window matches no products
    Given I open the home page
    And I open the filters panel
    When I set the price range to an inverted window
    Then no products are visible

  # ─── FR-HOME-008 ─ In Stock Only ────────────────────────────────────────────
  @FR-HOME-008 @P1
  Scenario: Toggling "In Stock Only" hides every unavailable product
    Given I open the home page
    And I open the filters panel
    When I turn on the "In Stock Only" switch
    Then no out-of-stock product is visible across all pages

  # ─── FR-HOME-009 ─ Combined filters (AND) ───────────────────────────────────
  @FR-HOME-009 @P2
  Scenario: Category + price + stock combine with AND semantics
    Given I open the home page
    And I open the filters panel
    When I select a category that has at least 1 in-stock product
    And I turn on the "In Stock Only" switch
    Then every visible product card has the active category badge
    And no out-of-stock product is visible across all pages
    And the pie counter matches the visible product count

  # ─── FR-HOME-009a ─ Clear All Filters ───────────────────────────────────────
  @FR-HOME-009a @P1
  Scenario: Clear All Filters is hidden when no filters are active
    Given I open the home page
    And I open the filters panel
    Then the "Clear All Filters" control is not visible

  @FR-HOME-009a @P1
  Scenario: Clear All Filters resets every active filter
    Given I open the home page
    And I open the filters panel
    When I select a category that has at least 1 in-stock product
    And I set the price range to min 30 and max 40
    And I turn on the "In Stock Only" switch
    And I click "Clear All Filters"
    Then the pie counter matches the catalog total
    And the "All" category chip is selected
    And the min price input is empty
    And the max price input is empty
    And the "In Stock Only" switch is off
    And the "Clear All Filters" control is not visible

  # ─── FR-HOME-010 ─ Add to cart ──────────────────────────────────────────────
  @FR-HOME-010 @P0 @smoke
  Scenario: Clicking Add increments cart count
    Given I open the home page
    When I add the first in-stock product to the cart
    Then the header cart shortcut shows 1 item
    When I add the second in-stock product to the cart
    Then the header cart shortcut shows 2 items

  # ─── FR-HOME-011 ─ Sticky cart drawer visibility ────────────────────────────
  @FR-HOME-011 @P1
  Scenario: Drawer is hidden when the cart is empty
    Given I open the home page
    Then the sticky cart drawer is not visible

  @FR-HOME-011 @P1
  Scenario: Drawer appears once an item is added
    Given I open the home page
    When I add the first in-stock product to the cart
    Then the sticky cart drawer is visible

  # ─── FR-HOME-012 ─ Drawer subtotal ──────────────────────────────────────────
  @FR-HOME-012 @P0 @smoke
  Scenario: Subtotal equals sum of price × qty for the items added
    Given I open the home page
    When I add the first in-stock product to the cart
    And I add the second in-stock product to the cart 2 times
    Then the cart drawer subtotal equals the picked products total

  # ─── FR-HOME-013 ─ Drawer Checkout navigation ───────────────────────────────
  @FR-HOME-013 @P0 @smoke
  Scenario: Checkout button navigates to /checkout
    Given I open the home page
    When I add the first in-stock product to the cart
    And I click the cart drawer Checkout button
    Then the URL path is "/checkout"

  # ─── FR-HOME-014 ─ Cart persistence ─────────────────────────────────────────
  @FR-HOME-014 @P1
  Scenario: Cart survives a page reload
    Given I open the home page
    When I add the first in-stock product to the cart
    And I reload the page
    Then the header cart shortcut shows 1 item
    And the sticky cart drawer is visible

  # ─── FR-HOME-015 ─ Sign In link ─────────────────────────────────────────────
  @FR-HOME-015 @P1
  Scenario: Guest clicking Sign In is routed to /login
    Given I open the home page as a guest
    When I click the header "Sign In" link
    Then the URL path is "/login"

  # ─── FR-HOME-016 ─ Tier badge replaces Sign In ──────────────────────────────
  @FR-HOME-016 @P1
  Scenario Outline: Authenticated user sees tier badge instead of Sign In
    Given I am signed in as a "<tier>" user
    When I open the home page
    Then the header "Sign In" link is not visible
    And the header tier badge button is visible

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  # ─── FR-HOME-017 ─ Tier badge opens account menu ────────────────────────────
  @FR-HOME-017 @P2
  Scenario: Clicking the tier badge opens the account menu
    Given I am signed in as a "gold" user
    When I open the home page
    And I click the header tier badge button
    Then the account menu shows "My Profile"
    And the account menu shows "Order History"
    And the account menu shows "Sign Out"

  # ─── FR-HOME-018 ─ Header logo ──────────────────────────────────────────────
  @FR-HOME-018 @P2 @a11y
  Scenario: Logo links back to the home page
    Given I open the home page
    Then the header logo has href "/"

  @FR-HOME-018 @P2 @a11y
  Scenario: Logo is keyboard-focusable
    Given I open the home page
    When I focus the header logo via keyboard
    Then the header logo is the active element

  # ─── TIER-HOME-001 ─ Tier badge initial per user ────────────────────────────
  @TIER-HOME-001 @P1
  Scenario Outline: Tier badge shows the correct initial for each tier
    Given I am signed in as a "<tier>" user
    When I open the home page
    Then the tier badge initial is "<initial>"

    Examples:
      | tier     | initial |
      | bronze   | B       |
      | silver   | S       |
      | gold     | G       |
      | platinum | P       |

  # ─── TIER-HOME-002 ─ Catalog price is tier-agnostic ─────────────────────────
  @TIER-HOME-002 @P1
  Scenario Outline: Catalog price displayed equals the API price for every tier
    Given I am signed in as a "<tier>" user
    When I open the home page
    Then the displayed price of every visible in-stock product matches the catalog

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  # ─── NFR-HOME-002 ─ No console errors ───────────────────────────────────────
  @NFR-HOME-002 @P2
  Scenario: Initial load produces no console errors
    When I open the home page
    Then the browser console has no errors

  # ─── NFR-HOME-005 ─ Image alt text ──────────────────────────────────────────
  @NFR-HOME-005 @P2 @a11y
  Scenario: Every visible product image alt matches its pie name
    Given I open the home page
    Then every product image alt text matches its pie name

  # ─── UX-HOME-002 ─ Visible focus styles ─────────────────────────────────────
  @UX-HOME-002 @P2 @a11y
  Scenario: Add button shows a visible focus indicator
    Given I open the home page
    When I focus the first Add button
    Then the focused element has a visible focus indicator

  @UX-HOME-002 @P2 @a11y
  Scenario: Pagination buttons show a visible focus indicator
    Given I open the home page
    When I focus the Next page button
    Then the focused element has a visible focus indicator
