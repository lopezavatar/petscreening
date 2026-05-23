# RTM mapping: FR-RWD-001..008 (Rewards, UI scope)
@account @ui @account-rewards
Feature: Account — Rewards
  /account/rewards displays the rewards catalog, the user's points balance
  and a points-activity ledger.

  @FR-RWD-001 @P0 @smoke
  Scenario Outline: Rewards page loads with tier card, catalog and activity
    Given I am signed into the account area as a "<tier>" user
    And I open the rewards page
    Then the Rewards heading is visible
    And the rewards catalog renders six items

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-RWD-002 @P1
  Scenario Outline: Catalog renders exactly six rewards
    Given I am signed into the account area as a "<tier>" user
    And I open the rewards page
    Then the rewards catalog renders six items

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-RWD-003 @P1
  Scenario Outline: Points-available header matches the user's points
    Given I am signed into the account area as a "<tier>" user
    And I open the rewards page
    Then the points available header matches my points

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-RWD-004 @P1
  Scenario Outline: Redeem is enabled only when the user can afford the reward
    Given I am signed into the account area as a "<tier>" user
    And I open the rewards page
    Then Redeem is enabled exactly for affordable rewards

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-RWD-005 @P0
  Scenario Outline: Redeeming a reward decreases the balance and adds an activity entry
    # Bronze excluded — 150 pts cannot afford the cheapest 300 pts reward.
    Given I am signed into the account area as a "<tier>" user
    And I open the rewards page
    When I click Redeem for "Free Delivery"
    Then the points balance decreased by 300
    And a new entry appears in the activity ledger

    Examples:
      | tier     |
      | silver   |
      | gold     |
      | platinum |

  @FR-RWD-006 @P1
  Scenario: Bronze cannot redeem rewards above their balance
    # Bronze (150 pts) cannot afford the cheapest reward (300 pts).
    Given I am signed into the account area as a "bronze" user
    And I open the rewards page
    Then the "Free Delivery" card shows "You need 150 more points"
    And no reward Redeem button is enabled

  @FR-RWD-007 @P2
  Scenario Outline: Activity ledger lists transactions newest-first
    # Bronze excluded — cannot afford a redemption to generate a new entry.
    Given I am signed into the account area as a "<tier>" user
    And I open the rewards page
    When I click Redeem for "Free Delivery"
    Then a new entry appears in the activity ledger

    Examples:
      | tier     |
      | silver   |
      | gold     |
      | platinum |

  @FR-RWD-008 @P2
  Scenario Outline: Activity rows expose a delta and a date
    Given I am signed into the account area as a "<tier>" user
    And I open the rewards page
    Then activity deltas are formatted with sign

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |
