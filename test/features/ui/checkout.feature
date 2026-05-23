@checkout
Feature: Checkout page (/checkout)

  P1 UI requirements for /checkout — consolidated. Per-scenario tags preserve
  RTM traceability (FR-CHK-*, TIER-CHK-*) + priority (@P1) + category
  (@smoke, @regression). Scenarios are data-driven against the live
  /api/products snapshot taken in the @checkout Before hook, so the suite is
  resilient to seed changes (prices, availability).

  Date/time strategy: weekday-dependent scenarios pick the *next Monday*
  computed at runtime so the suite remains stable regardless of when it runs.

  # ─── FR-CHK-002 ─ Empty cart redirect ───────────────────────────────────
  @FR-CHK-002 @P1 @smoke
  Scenario: GET /checkout with an empty cart redirects to /
    Given I navigate directly to /checkout with no cart
    Then I am redirected to the home page

  # ─── FR-CHK-005 ─ Remove line / last item ───────────────────────────────
  @FR-CHK-005 @P1 @regression
  Scenario: Remove deletes the line; the last remaining item redirects to /
    Given I open checkout with 2 different in-stock products
    When I remove the first product line
    Then only the second product line remains
    When I remove the remaining product line
    Then I am redirected to the home page

  # ─── FR-CHK-010 ─ Address lookup resolves distance ──────────────────────
  @FR-CHK-010 @P1
  Scenario: Address lookup resolves a distance and updates billing
    Given the geocoding API is mocked to return a location 5 km from the kitchen
    And I open checkout with 1 of the cheapest in-stock product
    And I set the delivery date to the next Monday
    When I look up the address "100 Main St"
    Then the order summary shows a "Base delivery" line for distance within 10 km

  # ─── FR-CHK-011 ─ Address invalid ───────────────────────────────────────
  @FR-CHK-011 @P1
  Scenario: Invalid address shows an error and keeps Place Order disabled
    Given the geocoding API is mocked to return no results
    And I open checkout with 1 of the cheapest in-stock product
    When I look up the address "asdfqwertyz"
    Then the address lookup shows the error "Could not find that address. Try a more specific location."
    And the PLACE ORDER button is disabled

  # ─── FR-CHK-012 ─ Slider range 0-50 ─────────────────────────────────────
  @FR-CHK-012 @P1
  Scenario: Slider distance accepts the full documented range
    Given I open checkout with 1 of the cheapest in-stock product
    When I select the "Slider" delivery tab
    Then the distance slider exposes a maximum of 50
    And the distance slider exposes a minimum less than or equal to 0.5

  # ─── FR-CHK-013 ─ Slider label switches at 10 km ────────────────────────
  @FR-CHK-013 @P1
  Scenario Outline: Slider label reflects pricing band
    Given I open checkout with 1 of the cheapest in-stock product
    When I set the slider distance to <km>
    Then the slider rate label contains "$<expected> base"

    Examples:
      | km | expected |
      | 5  | 10       |
      | 25 | 25       |

  # ─── FR-CHK-021 ─ Past dates rejected ───────────────────────────────────
  @FR-CHK-021 @P1
  Scenario: Past delivery date is rejected
    Given I open checkout with 1 of the cheapest in-stock product
    When I set the delivery date to yesterday
    Then the date validation error "This date is in the past. Delivery not available." is shown
    And the PLACE ORDER button is disabled

  # ─── FR-CHK-022 ─ Delivery hours 08:00–22:00 ────────────────────────────
  @FR-CHK-022 @P1
  Scenario Outline: Times outside 08:00–22:00 are rejected
    Given I open checkout with 1 of the cheapest in-stock product
    When I set the delivery time to "<time>"
    Then a delivery-hours error message is shown
    And the PLACE ORDER button is disabled

    Examples:
      | time  |
      | 06:30 |
      | 23:30 |

  # ─── FR-CHK-024 ─ Rain on weekend does NOT add surcharge ────────────────
  @FR-CHK-024 @P1
  Scenario: Rain on a weekend date keeps the weekend flat total
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the delivery date to the next Saturday
    And I set the slider distance to 5
    When I toggle the weather to Raining
    Then the order summary does not contain a "Rain surcharge" line
    And the order summary shows a "Weekend delivery (flat rate)" line of $50.00

  # ─── FR-CHK-040 ─ WELCOME10 ─────────────────────────────────────────────
  @FR-CHK-040 @P1 @smoke
  Scenario: WELCOME10 applies 10% off the subtotal
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    When I apply the promo code "WELCOME10"
    Then the order summary shows a "Promo: WELCOME10" line equal to 10% of the subtotal

  # ─── FR-CHK-041 ─ SAVE5 minimum order ───────────────────────────────────
  @FR-CHK-041 @P1
  Scenario: SAVE5 applies $5 off when subtotal >= $25
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    When I apply the promo code "SAVE5"
    Then the order summary shows a "Promo: SAVE5" line of -$5.00

  @FR-CHK-041 @P1
  Scenario: SAVE5 is rejected when subtotal < $25
    Given I open checkout with a synthetic $10.00 cart
    And I set the slider distance to 5
    When I apply the promo code "SAVE5"
    Then the promo error message contains "Minimum order $25 required"
    And no promo line is shown in the order summary

  # ─── FR-CHK-042 ─ BIGORDER20 cap at $15 ─────────────────────────────────
  @FR-CHK-042 @P1
  Scenario: BIGORDER20 discount is capped at $15
    Given I open checkout with a synthetic $200.00 cart
    And I set the slider distance to 5
    When I apply the promo code "BIGORDER20"
    Then the order summary shows a "Promo: BIGORDER20" line of -$15.00

  # ─── FR-CHK-043 ─ FREEDELIVERY ──────────────────────────────────────────
  @FR-CHK-043 @P1
  Scenario: FREEDELIVERY zeroes the delivery cost
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    And the current delivery cost is captured as the baseline
    When I apply the promo code "FREEDELIVERY"
    Then the promo discount equals the baseline delivery cost

  # ─── FR-CHK-044 ─ EXPIRED2024 ───────────────────────────────────────────
  @FR-CHK-044 @P1
  Scenario: EXPIRED2024 shows an expired error and is not applied
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    When I apply the promo code "EXPIRED2024"
    Then the promo error message contains "expired"
    And no promo line is shown in the order summary

  # ─── FR-CHK-050 ─ Tip presets ───────────────────────────────────────────
  @FR-CHK-050 @P1
  Scenario Outline: Tip preset applies subtotal × pct
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    When I select the <pct>% tip preset
    Then the order summary shows a "Tip" line equal to <pct>% of the subtotal

    Examples:
      | pct |
      | 15  |
      | 18  |
      | 20  |
      | 25  |

  # ─── FR-CHK-052 ─ Custom tip ────────────────────────────────────────────
  @FR-CHK-052 @P1
  Scenario: Custom tip greater than $100 is rejected
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    When I select the custom tip option
    And I enter a custom tip of "150"
    Then the tip error message contains "Maximum tip is $100"

  @FR-CHK-052 @P1
  Scenario: Custom negative tip is rejected
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    When I select the custom tip option
    And I enter a custom tip of "-5"
    Then the tip error message contains "Tip cannot be negative"

  # ─── FR-CHK-061 ─ Card formatting & 16-digit cap ────────────────────────
  @FR-CHK-061 @P1
  Scenario: Card number is grouped 4-4-4-4 and capped at 16 digits
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    When I type "12345678901234567890" into the card number field
    Then the card number field value is "1234 5678 9012 3456"

  # ─── FR-CHK-062 ─ Expiry MM/YY auto-format ──────────────────────
  @FR-CHK-062 @P1
  Scenario: Expiry is auto-formatted to MM / YY
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    When I type "1228" into the expiry field
    Then the expiry field value is "12 / 28"

  @FR-CHK-062 @P1 @known-bug:FR-CHK-062
  Scenario: Past expiry date is rejected
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    And I fill the cardholder, card number and CVV with valid values
    When I type "0120" into the expiry field
    Then the PLACE ORDER button is disabled

  # ─── FR-CHK-065 ─ Cart cleared after successful order ───────────────────
  @FR-CHK-065 @P1 @regression
  Scenario: Successful order clears the cart
    Given I open checkout with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    And I set the delivery date to the next Monday
    And I set the delivery time to "14:00"
    And I fill all payment fields with valid values
    When I click PLACE ORDER
    Then I am redirected to /confirmation
    And the cart session storage is empty

  # ─── TIER-CHK-001 — Guest, no loyalty line ──────────────────────────────
  @TIER-CHK-001 @P1
  Scenario: Guest checkout shows no loyalty discount line
    Given I open checkout as a guest with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    And I set the delivery date to the next Monday
    Then the order summary does not contain a "member discount" line

  # ─── TIER-CHK-002 — Bronze, 0% (no line) ────────────────────────────────
  @TIER-CHK-002 @P1
  Scenario: Bronze checkout shows no loyalty discount line
    Given I open checkout as a "bronze" tier user with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    And I set the delivery date to the next Monday
    Then the order summary does not contain a "member discount" line

  # ─── TIER-CHK-003 / 004 / 005 — Silver / Gold / Platinum ────────────────
  @TIER-CHK-003 @TIER-CHK-004 @TIER-CHK-005 @P1
  Scenario Outline: <tier> shows the expected loyalty discount on weekday base delivery
    Given I open checkout as a "<tier>" tier user with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    And I set the delivery date to the next Monday
    Then the order summary shows a "<label> member discount (<pct>%)" line of -$<expected>

    Examples:
      | tier     | label    | pct | expected |
      | silver   | Silver   | 5   | 0.50     |
      | gold     | Gold     | 10  | 1.00     |
      | platinum | Platinum | 15  | 1.50     |

  # ─── TIER-CHK-006 — Loyalty applies to weekend flat ────────────────────
  @TIER-CHK-006 @P1
  Scenario: Gold discount applies to the weekend flat rate
    Given I open checkout as a "gold" tier user with 1 of the cheapest in-stock product
    And I set the slider distance to 5
    And I set the delivery date to the next Saturday
    Then the order summary shows a "Gold member discount (10%)" line of -$5.00
