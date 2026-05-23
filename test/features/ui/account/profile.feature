# RTM mapping: FR-PROF-001..007 (Profile sub-route, UI scope)
@account @ui @account-profile
Feature: Account — Profile sub-route
  /account renders the tier card, account details and quick actions for the
  signed-in user. All assertions derive from the API snapshot to remain
  data-resilient across seed changes.

  @FR-PROF-001 @P0
  Scenario Outline: Discount text matches the tier table
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    Then the tier card discount matches my tier

    Examples:
      | tier     |
      | silver   |
      | gold     |
      | platinum |

  @FR-PROF-002 @P0
  Scenario Outline: Tier card points equal the API points value
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    Then the tier card points equal my snapshot points

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-PROF-003 @P1
  Scenario Outline: Progress label targets the next tier
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    Then the progress label targets the next tier

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-PROF-005 @P1
  Scenario Outline: Account details show name, email and join month
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    Then Account Details show my name, email and join month

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-PROF-006 @P2
  Scenario Outline: View Orders quick action navigates to /account/orders
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    When I click the View Orders quick action
    Then I should be on "/account/orders"
    And the Order History heading is visible

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-PROF-007 @P2
  Scenario Outline: Rewards quick action navigates to /account/rewards
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    When I click the Rewards quick action
    Then I should be on "/account/rewards"
    And the Rewards heading is visible

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |
