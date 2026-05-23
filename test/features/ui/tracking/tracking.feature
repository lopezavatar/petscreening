@tracking @regression @P1
Feature: Tracking page — P1 UI requirements

  # ─── FR-TRK-002 ───────────────────────────────────────────────────────────────

  @FR-TRK-002
  Scenario: Displayed order ID matches the URL segment
    Given the tracking page is seeded with order ID "PITS-20260522-T3ST"
    When I navigate to the tracking page for order "PITS-20260522-T3ST"
    Then the displayed order ID is "PITS-20260522-T3ST"

  @FR-TRK-002
  Scenario: Displayed order ID is not substituted by another order in storage
    Given the tracking page is seeded with order ID "PITS-20260522-AAAA"
    And a second order "PITS-20260522-BBBB" is also stored
    When I navigate to the tracking page for order "PITS-20260522-AAAA"
    Then the displayed order ID is "PITS-20260522-AAAA"

  # ─── FR-TRK-003 ───────────────────────────────────────────────────────────────

  @FR-TRK-003
  Scenario: Initial status label is "Preparing" at page load
    Given the tracking page is seeded with a valid order
    When I navigate to the tracking page for that order
    Then the status label in the progress bar is "Preparing"
    And the "Preparing" step in the timeline is the active step

  @FR-TRK-003
  Scenario: Status label is always one of the allowed values
    Given the tracking page is seeded with a valid order
    When I navigate to the tracking page for that order
    Then the status label in the progress bar is one of:
      | Preparing  |
      | Dispatched |
      | In Flight  |
      | Arriving   |
      | Delivered  |

  # ─── FR-TRK-005 ───────────────────────────────────────────────────────────────

  @FR-TRK-005
  Scenario: ETA does not increase while the order is in progress
    Given the tracking page is seeded with a valid order
    When I navigate to the tracking page for that order
    And I note the current estimated arrival time
    And I wait 2 seconds for delivery progress to advance
    Then the estimated arrival time has not increased

  @FR-TRK-005
  Scenario: ETA is "Now" or 0 min when the order reaches Delivered
    Given the tracking page is seeded with an order at full progress
    When I navigate to the tracking page for that order
    Then the estimated arrival shows "Now"

  # ─── FR-TRK-007 ───────────────────────────────────────────────────────────────

  @FR-TRK-007
  Scenario: Progress percentage starts at 0% on page load
    Given the tracking page is seeded with a valid order
    When I navigate to the tracking page for that order
    Then the progress percentage is 0%

  @FR-TRK-007
  Scenario: Progress percentage never exceeds 100%
    Given the tracking page is seeded with a valid order
    When I navigate to the tracking page for that order
    And I wait 2 seconds for delivery progress to advance
    Then the progress percentage is between 0% and 100%

  @FR-TRK-007
  Scenario: Progress percentage is 100% when status is Delivered
    Given the tracking page is seeded with an order at full progress
    When I navigate to the tracking page for that order
    Then the progress percentage is 100%
    And the status label in the progress bar is "Delivered"

  # ─── FR-TRK-008 ───────────────────────────────────────────────────────────────
  # BUG-TRK-003: getProgressForStatus boundary mismatch — progress bar label and
  #              highlighted timeline step can diverge.

  @FR-TRK-008 @known-bug @known-bug:BUG-TRK-003
  Scenario: Progress bar status label matches the active timeline step at initial load
    Given the tracking page is seeded with a valid order
    When I navigate to the tracking page for that order
    Then the status label in the progress bar is "Preparing"
    # spec: initial progress is 0%, which falls in Preparing range [0,15)
    And the "Preparing" step in the timeline is the active step

  # ─── FR-TRK-010 ───────────────────────────────────────────────────────────────

  @FR-TRK-010
  Scenario: Single product is listed with name and quantity
    Given the tracking page is seeded with 1 unit of "Signature Cherry Lattice" at $32.00
    When I navigate to the tracking page for that order
    Then the Order Summary heading is visible
    And the order line item "Signature Cherry Lattice × 1" is visible
    And the delivery destination is shown

  @FR-TRK-010
  Scenario: Multiple products are each listed with name and quantity
    Given the tracking page is seeded with 2 units of "Signature Cherry Lattice" at $32.00 and 3 units of "Blueberry Crumble" at $28.00
    When I navigate to the tracking page for that order
    Then the Order Summary heading is visible
    And the order line item "Signature Cherry Lattice × 2" is visible
    And the order line item "Blueberry Crumble × 3" is visible
    And the delivery destination is shown

  # ─── FR-TRK-020 ───────────────────────────────────────────────────────────────

  @FR-TRK-020
  Scenario: Navigating to an unknown order ID shows the not-found panel
    Given no order is stored in the session
    When I navigate to the tracking page for order "PITS-20260522-P4AB"
    Then the "Order not found" message is visible
    And the "Return to menu" button is visible
    And the tracking layout is not rendered

  @FR-TRK-020
  Scenario: Known valid-format ID that is not in session shows not-found panel
    Given the tracking page is seeded with order ID "PITS-20260522-T3ST"
    When I navigate to the tracking page for order "PITS-20260522-XXXX"
    Then the "Order not found" message is visible

  # ─── FR-TRK-022 ───────────────────────────────────────────────────────────────

  @FR-TRK-022
  Scenario: "Return to menu" navigates to the home page
    Given no order is stored in the session
    When I navigate to the tracking page for order "PITS-20260522-P4AB"
    And I click "Return to menu"
    Then I am on the home page

  # ─── FR-TRK-023 ───────────────────────────────────────────────────────────────

  @FR-TRK-023
  Scenario Outline: Malformed order ID shows not-found panel and does not crash
    Given no order is stored in the session
    When I navigate to the tracking page for order "<malformedId>"
    Then the "Order not found" message is visible
    And no console error occurs

    Examples:
      | malformedId   |
      | abc           |
      | 123           |
      | PITS-         |
      | %3Cscript%3E  |
      | --            |
      | a%20b%20c     |

  # ─── TIER-TRK-002 ─────────────────────────────────────────────────────────────
  # @known-bug:TIER-TRK-002 — OrderRow.tsx has no "Track Order" link; the feature
  # is not yet implemented. Remove this tag once the link is added.

  @TIER-TRK-002 @known-bug @known-bug:TIER-TRK-002
  Scenario: Bronze user navigates from order history to the tracking page
    Given I am logged in as a "bronze" user
    And a "pending" order is seeded for that user with order ID "PITS-20260522-T3ST"
    When I go to the account orders page
    And I click the "Track Order" link for order "PITS-20260522-T3ST"
    Then I am on the tracking page for order "PITS-20260522-T3ST"

  # ─── NFR-TRK-004 ─────────────────────────────────────────────────────────────

  @NFR-TRK-004
  Scenario Outline: Tracking page layout reflows at <viewport> width without overflow
    Given the tracking page is seeded with a valid order
    And the viewport width is <width> px
    When I navigate to the tracking page for that order
    Then the page has no horizontal overflow
    And the order summary is visible
    And the status timeline is visible

    # spec: must cover 320 px – 1440 px boundary values
    Examples:
      | viewport       | width |
      | minimum (320)  |   320 |
      | mobile (375)   |   375 |
      | tablet (768)   |   768 |
      | desktop (1024) |  1024 |
      | maximum (1440) |  1440 |
