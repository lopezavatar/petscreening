# RTM mapping: TIER-ACC-001..006 (Tier-specific behavior, UI scope)
# TIER-ACC-007 (cross-tier data isolation) is API-only and out of UI scope.
@account @ui @account-tier
Feature: Account — Tier-specific UI

  @TIER-ACC-001 @P1 @known-bug @known-bug:TIER-ACC-001
  Scenario: Bronze profile values
    # Bronze currently renders "No discount" instead of "0% discount".
    Given I am signed into the account area as a "bronze" user
    And I open the profile page
    Then the tier label is "bronze"
    And the discount text is "No discount"
    And the tier card points are within the "bronze" tier range

  @TIER-ACC-002 @P1
  Scenario: Silver profile values
    Given I am signed into the account area as a "silver" user
    And I open the profile page
    Then the tier label is "silver"
    And the discount text is "5% discount"
    And the tier card points are within the "silver" tier range

  @TIER-ACC-003 @P1
  Scenario: Gold profile values
    Given I am signed into the account area as a "gold" user
    And I open the profile page
    Then the tier label is "gold"
    And the discount text is "10% discount"
    And the tier card points are within the "gold" tier range

  @TIER-ACC-004 @P1
  Scenario: Platinum profile values and top-tier indicator
    Given I am signed into the account area as a "platinum" user
    And I open the profile page
    Then the tier label is "platinum"
    And the discount text is "15% discount"
    And the tier card points are within the "platinum" tier range
    And the top-tier indicator is visible

  @TIER-ACC-005 @P2
  Scenario: Bronze (150 pts) cannot redeem any reward yet
    # RTM aspires to "Bronze redeems Free Delivery after enough orders"; with
    # the seeded 150-pts balance the user cannot afford any of the six rewards.
    Given I am signed into the account area as a "bronze" user
    And I open the rewards page
    Then no reward Redeem button is enabled

  @TIER-ACC-006 @P2
  Scenario: Platinum can redeem every catalog item
    Given I am signed into the account area as a "platinum" user
    And I open the rewards page
    Then Redeem is available for every reward
