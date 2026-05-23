@confirmation @regression @P1
Feature: Confirmation page

  # ─── FR-CONF-001 ─────────────────────────────────────────────────────────────

  @FR-CONF-001
  Scenario: Guest navigates directly to /confirmation with no active order
    Given I navigate directly to /confirmation with no active order
    Then I am redirected to the home page

  # ─── FR-CONF-003 ─────────────────────────────────────────────────────────────

  @FR-CONF-003
  Scenario: Single-product order shows quantity and product name
    Given the confirmation is seeded with 2 units of "Blueberry Crumble"
    When I am on the confirmation page
    Then the item summary shows "2 Blueberry Crumble, flying to you by drone."

  @FR-CONF-003
  Scenario: Multi-product order shows total item count
    Given the confirmation is seeded with 1 unit of "Blueberry Crumble" and 2 units of "Peach Lattice"
    When I am on the confirmation page
    Then the item summary shows "3 items, flying to you by drone."

  # ─── FR-CONF-004 ─────────────────────────────────────────────────────────────

  @FR-CONF-004
  Scenario Outline: Delivery to value matches the distance mode
    Given the confirmation is seeded with display address "<displayAddress>"
    When I am on the confirmation page
    Then the "Delivery to" field shows "<expectedValue>"

    Examples:
      | displayAddress                     | expectedValue               |
      | 456 Oak Ave, Los Angeles, CA 90001 | 456 Oak Ave, Los Angeles    |
      | Slider: 5.0 km from kitchen        | Slider: 5.0 km from kitchen |
      | Manual entry: 7.5 km from kitchen  | Manual entry: 7.5 km from kitchen |

  # ─── FR-CONF-005 ─────────────────────────────────────────────────────────────

  @FR-CONF-005
  Scenario: Distance field and billing line item both reflect the seeded distance
    Given the confirmation is seeded with distance 8.3 km
    When I am on the confirmation page
    Then the "Distance" field shows "8.3 km"
    And the order summary contains a line item mentioning "8.3 km"

  # ─── FR-CONF-010 ─────────────────────────────────────────────────────────────

  @FR-CONF-010
  Scenario: Clicking "Place another order" resets to home with an empty cart
    Given the confirmation is seeded with a completed order
    When I am on the confirmation page
    And I click "Place another order"
    Then I am redirected to the home page
    And the cart session storage is empty

  # ─── FR-CONF-011 ─────────────────────────────────────────────────────────────

  @FR-CONF-011
  Scenario: Page refresh after successful order preserves the confirmation data
    Given the confirmation is seeded with order ID "PITS-20260522-9W76"
    When I am on the confirmation page
    And I refresh the confirmation page
    Then the confirmation page shows order ID "PITS-20260522-9W76"

  # ─── TIER-CONF-001 ───────────────────────────────────────────────────────────

  @TIER-CONF-001
  Scenario Outline: No member discount line for <tier> users
    Given the confirmation is seeded with a billing for a "<tier>" user with no loyalty discount
    When I am on the confirmation page
    Then no member discount line is visible in the order summary

    Examples:
      | tier   |
      | guest  |
      | bronze |

  # ─── TIER-CONF-002 ───────────────────────────────────────────────────────────

  @TIER-CONF-002
  Scenario Outline: Member discount line is shown for <tier> users
    Given the confirmation is seeded with a billing for a "<tier>" user with a "<discount>"% loyalty discount
    When I am on the confirmation page
    Then the order summary shows a "<tier>" member discount of "<discount>"%

    Examples:
      | tier     | discount |
      | Silver   | 5        |
      | Gold     | 10       |
      | Platinum | 15       |

  # ─── TIER-CONF-003 ───────────────────────────────────────────────────────────

  @TIER-CONF-003
  Scenario Outline: Rewards page shows updated points balance after a purchase
    Given I am logged in as a "<tier>" tier user
    And the confirmation is seeded with an order earning 22 points for that user
    When I navigate to the account rewards page
    Then my points balance has increased by 22 points from the initial balance

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |
