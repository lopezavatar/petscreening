@api @products
Feature: GET /api/products — Product listing, filtering, and contract

  All P1 functional requirements for GET /api/products plus a contract test
  that validates the full response schema.

  Price thresholds for filter tests (minPrice / maxPrice / range) are derived
  at runtime from the live catalog snapshot so the suite stays resilient to
  seed changes — no literal prices are hard-coded.

  RTM: test/docs/RTM/api/products.rtm.md

  # ─── CONTRACT ────────────────────────────────────────────────────────────────

  @CONTRACT @P1 @api
  Scenario: Response contract — every product object in the array conforms to the expected schema
    When I request GET /api/products
    Then the response status is 200
    And the Content-Type header contains "application/json"
    And the response body is a non-empty array of products
    And every product in the array conforms to the product schema

  # ─── NFR-PRODUCTS-002 ─ Content-Type ─────────────────────────────────────────

  @NFR-PRODUCTS-002 @P1 @api
  Scenario: GET /api/products returns Content-Type application/json
    When I request GET /api/products
    Then the Content-Type header contains "application/json"

  # ─── NFR-PRODUCTS-003 ─ Seeded catalog size ──────────────────────────────────

  @NFR-PRODUCTS-003 @P1 @api
  Scenario: Seeded catalog has at least 12 products spanning all four categories
    When I request GET /api/products
    Then the response status is 200
    And the response contains at least 12 products
    And products from all four categories are present

  # ─── FR-PRODUCTS-003 / FR-PRODUCTS-004 ─ Category filter ─────────────────────

  @FR-PRODUCTS-003 @FR-PRODUCTS-004 @P1 @api
  Scenario Outline: Category filter returns only products in the requested category
    When I request GET /api/products with category filter "<category>"
    Then the response status is 200
    And every returned product has category "<category>"
    And at least one product is returned

    Examples:
      | category |
      | fruit    |
      | cream    |
      | savory   |
      | seasonal |

  # ─── FR-PRODUCTS-005 ─ Available filter (true) ────────────────────────────────

  @FR-PRODUCTS-005 @P1 @api
  Scenario: available=true filter returns only available products
    When I request GET /api/products with available filter "true"
    Then the response status is 200
    And every returned product has available equal to true
    And at least one product is returned

  # ─── FR-PRODUCTS-006 ─ Available filter (false) ───────────────────────────────

  @FR-PRODUCTS-006 @P1 @api
  Scenario: available=false filter returns only unavailable products
    When I request GET /api/products with available filter "false"
    Then the response status is 200
    And every returned product has available equal to false
    And at least one product is returned

  # ─── FR-PRODUCTS-007 ─ minPrice filter ───────────────────────────────────────

  @FR-PRODUCTS-007 @P1 @api
  Scenario: minPrice filter excludes products below the threshold
    When I request GET /api/products with a minPrice threshold picked from the catalog
    Then the response status is 200
    And every returned product has price at or above the applied minPrice threshold
    And at least one product is returned

  # ─── FR-PRODUCTS-008 ─ maxPrice filter ───────────────────────────────────────

  @FR-PRODUCTS-008 @P1 @api
  Scenario: maxPrice filter excludes products above the threshold
    When I request GET /api/products with a maxPrice threshold picked from the catalog
    Then the response status is 200
    And every returned product has price at or below the applied maxPrice threshold
    And at least one product is returned

  # ─── FR-PRODUCTS-009 ─ Price range filter ────────────────────────────────────

  @FR-PRODUCTS-009 @P1 @api
  Scenario: Combined minPrice and maxPrice filter returns only products within the range
    When I request GET /api/products with a price range picked from the catalog
    Then the response status is 200
    And every returned product has price within the applied price range
    And at least one product is returned

  # ─── FR-PRODUCTS-010 ─ Sort by price asc ─────────────────────────────────────

  @FR-PRODUCTS-010 @P1 @api
  Scenario: sortBy=price and sortOrder=asc returns products sorted by ascending price
    When I request GET /api/products sorted by "price" in "asc" order
    Then the response status is 200
    And the products are sorted by price in ascending order

  # ─── FR-PRODUCTS-011 ─ Sort by price desc ────────────────────────────────────

  @FR-PRODUCTS-011 @P1 @api
  Scenario: sortBy=price and sortOrder=desc returns products sorted by descending price
    When I request GET /api/products sorted by "price" in "desc" order
    Then the response status is 200
    And the products are sorted by price in descending order

  # ─── FR-PRODUCTS-014 ─ Combined filters ──────────────────────────────────────

  @FR-PRODUCTS-014 @P1 @api
  Scenario: Combined category, availability, and sort filters produce the correct filtered sorted list
    When I request GET /api/products with category "fruit", available "true", sorted by "price"
    Then the response status is 200
    And every returned product has category "fruit"
    And every returned product has available equal to true
    And the products are sorted by price in ascending order
    And at least one product is returned
