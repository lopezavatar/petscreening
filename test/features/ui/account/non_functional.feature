# RTM mapping: NFR-ACC-004 (no console errors)
@account @ui @account-nfr
Feature: Account — non-functional UI checks

  @NFR-ACC-004 @P2
  Scenario Outline: No console errors on each sub-route
    Given I am signed into the account area as a "<tier>" user
    And I open the <route> page
    Then there are no console errors

    Examples:
      | tier     | route   |
      | bronze   | profile |
      | bronze   | orders  |
      | bronze   | rewards |
      | silver   | profile |
      | silver   | orders  |
      | silver   | rewards |
      | gold     | profile |
      | gold     | orders  |
      | gold     | rewards |
      | platinum | profile |
      | platinum | orders  |
      | platinum | rewards |
