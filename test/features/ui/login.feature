@login
Feature: Login page (/login)

  All UI requirements for the login form — consolidated. Per-scenario tags
  preserve RTM traceability (FR-LOGIN-*, TIER-LOGIN-*, UX-LOGIN-*) plus
  priority (@P0/@P1/@P2) and category (@smoke).

  Mixed test-types from the RTM (UI/API, UI/A11Y) are covered here from the
  UI angle only; the API/A11Y angles are owned by separate features.

  Credentials and per-tier emails are resolved at runtime from the
  environment (test/resources/env/.env.<TEST_ENV>). The `{NAME}` tokens
  inside Examples tables are expanded by the step layer; literal secrets
  never live in the feature.

  # ─── FR-LOGIN-001 ─ Page loads ──────────────────────────────────────────────
  @FR-LOGIN-001 @P0 @smoke
  Scenario: GET /login returns 200 and renders email + password + Sign-In
    Given the login page responds with HTTP 200
    When I open the login page
    Then the login form is visible

  # ─── FR-LOGIN-002 ─ Valid login → /account (+ TIER-LOGIN-001..004) ──────────
  # Points are mutable across runs (loyalty deltas, seed changes); the
  # expected value is fetched from the auth API at assertion time rather
  # than hard-coded in the Examples table.
  @FR-LOGIN-002 @TIER-LOGIN-001 @TIER-LOGIN-002 @TIER-LOGIN-003 @TIER-LOGIN-004 @P0 @smoke
  Scenario Outline: Valid credentials authenticate the <tier> user and redirect to /account
    Given I open the login page
    When I sign in as the "<tier>" test user
    Then the URL path is "/account"
    And the account page shows the "<tier>" tier
    And the account page shows the current points for the "<tier>" user

    Examples:
      | tier     |
      | bronze   |
      | silver   |
      | gold     |
      | platinum |

  # ─── FR-LOGIN-003 ─ Wrong password ──────────────────────────────────────────
  @FR-LOGIN-003 @P0
  Scenario: Wrong password for an existing email shows an error and stays on /login
    Given I open the login page
    When I sign in with email "{LOGIN_BRONZE_EMAIL}" and password "{LOGIN_WRONG_PASSWORD}"
    Then the login error "Invalid email or password" is visible
    And the URL path is "/login"

  # ─── FR-LOGIN-004 ─ Unknown email ───────────────────────────────────────────
  @FR-LOGIN-004 @P1
  Scenario: Unknown email shows a generic auth error and stays on /login
    Given I open the login page
    When I sign in with email "{LOGIN_UNKNOWN_EMAIL}" and password "{LOGIN_VALID_PASSWORD}"
    Then the login error "Invalid email or password" is visible
    And the URL path is "/login"

  # ─── FR-LOGIN-005 ─ Empty fields ────────────────────────────────────────────
  @FR-LOGIN-005 @P1
  Scenario Outline: Submitting with empty <field> is prevented by the browser
    Given I open the login page
    When I fill the login form with email "<email>" and password "<password>"
    And I click the Sign In button
    Then I remain on the login page
    And the "<invalidField>" input is reported invalid by the browser

    Examples:
      | field    | email                | password               | invalidField |
      | email    |                      | {LOGIN_VALID_PASSWORD} | email        |
      | password | {LOGIN_BRONZE_EMAIL} |                        | password     |
      | both     |                      |                        | email        |

  # ─── FR-LOGIN-007 ─ Password is masked ─────────────────────────────────────
  @FR-LOGIN-007 @P1
  Scenario: Password input is of type=password
    Given I open the login page
    Then the password input has type "password"

  # ─── FR-LOGIN-008 ─ Back to menu ───────────────────────────────────────────
  @FR-LOGIN-008 @P2
  Scenario: ← Back to menu returns to the home page without authenticating
    Given I open the login page
    When I click the Back to menu button
    Then the URL path is "/"
    And the header "Sign In" link is visible

  # ─── FR-LOGIN-009 ─ Header after login ─────────────────────────────────────
  @FR-LOGIN-009 @P1
  Scenario: After login, header Sign In is replaced by the tier badge on /
    Given I open the login page
    When I sign in as the "gold" test user
    And I open the home page after login
    Then the header "Sign In" link is not visible
    And the header tier badge is shown

  # ─── FR-LOGIN-010 ─ Session persists across reloads ────────────────────────
  @FR-LOGIN-010 @P1
  Scenario: Authenticated session survives a reload
    Given I open the login page
    When I sign in as the "silver" test user
    Then the URL path is "/account"
    When I reload the current page
    Then the URL path is "/account"
    And the account page shows the "silver" tier

  # ─── FR-LOGIN-011 ─ Already-logged-in redirect ─────────────────────────────
  @FR-LOGIN-011 @P2
  Scenario: Visiting /login while authenticated redirects to /account
    Given I open the login page
    When I sign in as the "bronze" test user
    Then the URL path is "/account"
    When I navigate to "/login"
    Then the URL path is "/account"

  # ─── FR-LOGIN-012 ─ Submit with Enter key ──────────────────────────────────
  @FR-LOGIN-012 @P2
  Scenario: Pressing Enter inside the password field submits the form
    Given I open the login page
    When I fill the login form with email "{LOGIN_BRONZE_EMAIL}" and password "{LOGIN_VALID_PASSWORD}"
    And I press "Enter" inside the password field
    Then the URL path is "/account"

  # ─── UX-LOGIN-002 ─ Loading state on Sign In ───────────────────────────────
  @UX-LOGIN-002 @P2
  Scenario: Sign In shows a disabled "Signing in..." state while the request is in flight
    Given I open the login page
    And the auth endpoint is delayed by 800 ms
    When I fill the login form with email "{LOGIN_BRONZE_EMAIL}" and password "{LOGIN_VALID_PASSWORD}"
    And I click the Sign In button
    Then the Sign In button shows "Signing in..." and is disabled
