# RTM mapping: FR-ACC-001..006 (Authentication & Navigation, UI scope)
@account @ui @account-auth-nav
Feature: Account — authentication and navigation
  Authenticated dashboard shell guards `/account*` and exposes a shared
  sidebar with Profile, Order History, Rewards links plus Sign Out.

  @FR-ACC-001 @P0 @smoke
  Scenario: Unauthenticated visit is redirected to login
    Given I am not signed in
    When I open the URL "/account"
    Then I should be redirected to "/login"

  @FR-ACC-002 @P1
  Scenario Outline: Sidebar links navigate to each sub-route
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    When I click the "<label>" sidebar link
    Then I should be on "<path>"
    And the active sidebar link is "<label>"

    Examples:
      | tier     | label         | path             |
      | bronze   | Profile       | /account         |
      | bronze   | Order History | /account/orders  |
      | bronze   | Rewards       | /account/rewards |
      | silver   | Profile       | /account         |
      | silver   | Order History | /account/orders  |
      | silver   | Rewards       | /account/rewards |
      | gold     | Profile       | /account         |
      | gold     | Order History | /account/orders  |
      | gold     | Rewards       | /account/rewards |
      | platinum | Profile       | /account         |
      | platinum | Order History | /account/orders  |
      | platinum | Rewards       | /account/rewards |

  @FR-ACC-003 @P0 @smoke @known-bug @known-bug:FR-ACC-003
  Scenario Outline: Sign Out clears session and returns to login
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    When I click Sign Out
    Then I should be redirected to "/login"

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-ACC-004 @P1
  Scenario Outline: After Sign Out, /account requires re-authentication
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    When I click Sign Out
    And I open the URL "/account"
    Then I should be redirected to "/login"

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-ACC-005 @P2
  Scenario Outline: Back to menu returns to home with session intact
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    When I click Back to menu
    Then I should be on "/"

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  @FR-ACC-006 @P1
  Scenario Outline: Sidebar card shows the user's identity and points
    Given I am signed into the account area as a "<tier>" user
    And I open the profile page
    Then the sidebar shows my name and email
    And the sidebar shows my tier and points

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |
