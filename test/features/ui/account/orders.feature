# RTM mapping: FR-ORD-001..010 (Order History, UI scope)
@account @ui @account-orders
Feature: Account — Order History
  /account/orders lists the signed-in user's orders with sorting, filters
  and pagination. The "gold" user is used for the bulk of scenarios because
  its seed has > 10 orders, exercising pagination.

  @FR-ORD-001 @P0 @smoke
  Scenario Outline: Orders page loads
    Given I am signed into the account area as a "<tier>" user
    And I open the orders page
    Then the Order History heading is visible

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-ORD-002 @P1
  Scenario Outline: Counter matches the API order count
    Given I am signed into the account area as a "<tier>" user
    And I open the orders page
    Then the orders counter matches the API order count

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-ORD-003 @P1
  Scenario Outline: Each row shows id, date, status and total
    Given I am signed into the account area as a "<tier>" user
    And I open the orders page
    Then each visible order row shows an id, date, status and total

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-ORD-004 @P1
  Scenario Outline: Status badge values are constrained to the allowed set
    Given I am signed into the account area as a "<tier>" user
    And I open the orders page
    Then every status badge uses an allowed value

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-ORD-005 @P2
  Scenario: Default sort is Date descending
    Given I am signed into the account area as a "gold" user
    And I open the orders page
    Then orders are sorted by date descending

  @FR-ORD-006 @P2
  Scenario: Sort by Total toggles ascending and descending
    Given I am signed into the account area as a "gold" user
    And I open the orders page
    When I sort orders by Total
    Then orders are sorted by total descending
    When I toggle sort by Total again
    Then orders are sorted by total ascending

  @FR-ORD-007 @P2
  Scenario: Filters disclosure reveals filter controls
    Given I am signed into the account area as a "gold" user
    And I open the orders page
    When I open the orders filters panel
    Then the orders filter controls are visible

  @FR-ORD-008 @P1
  Scenario: Pagination splits results with disabled edges
    Given I am signed into the account area as a "gold" user
    And I open the orders page
    Then pagination splits the results correctly
    And Next page becomes enabled when there is a next page
