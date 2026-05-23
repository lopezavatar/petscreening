# RTM — Login page (`/login`)

Authentication form for all loyalty tiers. Demo accounts are listed on-screen.

## Page summary

- **← Back to menu** button (returns to `/`).
- Brand logo + H1 "Welcome Back" + supporting copy.
- Form fields: **Email** (textbox), **Password** (textbox, masked).
- **Sign In** button (submits credentials to `/api/auth/login`).
- "Test Accounts" panel listing seeded users and the shared password.

## Functional requirements

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| FR-LOGIN-001 | GET `/login` returns 200 and renders email + password inputs and Sign-In button. | P0 | Guest | UI smoke | `ui/login.feature` (FR-LOGIN-001) | Implemented |
| FR-LOGIN-002 | Submitting valid credentials authenticates the user and redirects to `/account`. | P0 | Bronze/Silver/Gold/Platinum | UI | `ui/login.feature` (FR-LOGIN-002 outline) | Implemented |
| FR-LOGIN-003 | Wrong password for an existing email shows an error and stays on `/login`. | P0 | All | UI / API | `ui/login.feature` (FR-LOGIN-003) | Implemented (UI) |
| FR-LOGIN-004 | Unknown email shows an authentication error and stays on `/login`. | P1 | Guest | UI / API | `ui/login.feature` (FR-LOGIN-004) | Implemented (UI) |
| FR-LOGIN-005 | Submitting empty Email or Password is prevented (button disabled or inline error). | P1 | Guest | UI | `ui/login.feature` (FR-LOGIN-005 outline) | Implemented |
| FR-LOGIN-006 | Email field rejects malformed addresses (e.g. `foo`, `foo@`, `foo@bar`). | P2 | Guest | UI | `ui/login.feature` (FR-LOGIN-006) | Implemented (partial — `foo@bar` accepted by HTML5, tagged `@known-bug`) |
| FR-LOGIN-007 | Password input renders as `type="password"` and masks characters. | P1 | Guest | UI | `ui/login.feature` (FR-LOGIN-007) | Implemented |
| FR-LOGIN-008 | **← Back to menu** returns to `/` without authenticating. | P2 | Guest | UI | `ui/login.feature` (FR-LOGIN-008) | Implemented |
| FR-LOGIN-009 | After a successful login the **Sign In** link in the header is replaced by the tier badge button. | P1 | Bronze/Silver/Gold/Platinum | UI | `ui/login.feature` (FR-LOGIN-009) | Implemented |
| FR-LOGIN-010 | Auth session persists across page reloads (cookie or storage). | P1 | All | UI / API | `ui/login.feature` (FR-LOGIN-010) | Implemented (UI) |
| FR-LOGIN-011 | Visiting `/login` while already authenticated redirects to `/account` (or shows logged-in state). | P2 | All | UI | `ui/login.feature` (FR-LOGIN-011) | Implemented |
| FR-LOGIN-012 | Submitting via **Enter** key in either field triggers the Sign-In action. | P2 | Guest | UI / A11Y | `ui/login.feature` (FR-LOGIN-012) | Implemented (UI) |

## Tier-specific behavior

| ID | Description | Priority | Users | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|---|
| TIER-LOGIN-001 | `bronze@test.com` logs in and lands on `/account` with tier **Bronze** and 150 pts. | P1 | Bronze | UI | `ui/login.feature` (FR-LOGIN-002 outline) | Implemented |
| TIER-LOGIN-002 | `silver@test.com` logs in with tier **Silver** and 820 pts. | P1 | Silver | UI | `ui/login.feature` (FR-LOGIN-002 outline) | Implemented |
| TIER-LOGIN-003 | `gold@test.com` logs in with tier **Gold** and 2,100 pts. | P1 | Gold | UI | `ui/login.feature` (FR-LOGIN-002 outline) | Implemented |
| TIER-LOGIN-004 | `platinum@test.com` logs in with tier **Platinum** and 4,500 pts. | P1 | Platinum | UI | `ui/login.feature` (FR-LOGIN-002 outline) | Implemented |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-LOGIN-001 | Login API responds in < 500 ms p95 on local environment. | P2 | Performance | `login/perf.spec` | Not Started |
| NFR-LOGIN-002 | Page is responsive at 320 px – 1440 px without overflow. | P1 | Responsive | `login/responsive.feature` | Not Started |
| NFR-LOGIN-003 | Page renders on Chromium, Firefox, WebKit. | P1 | Cross-browser | cucumber profiles | Not Started |

## UX / Design

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| UX-LOGIN-001 | Form uses design-system colors, spacing and button styles. | P3 | Visual | `login/visual.spec` | Not Started |
| UX-LOGIN-002 | Disabled / loading state on the **Sign In** button while the request is in flight. | P2 | UI | `ui/login.feature` (UX-LOGIN-002) | Implemented |

## Accessibility (WCAG 2.1 AA)

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| A11Y-LOGIN-001 | Email and Password inputs have programmatic labels (`<label for>` or `aria-label`). | P1 | A11Y | `login/labels.feature` | Not Started |
| A11Y-LOGIN-002 | Inputs include `autocomplete="email"` and `autocomplete="current-password"`. | P2 | A11Y | `login/autocomplete.feature` | Not Started |
| A11Y-LOGIN-003 | Errors are announced to assistive tech (`role="alert"` or `aria-live`). | P1 | A11Y | `login/error_announce.feature` | Not Started |
| A11Y-LOGIN-004 | Focus order: Back → Email → Password → Sign In. | P2 | A11Y | `login/focus_order.feature` | Not Started |
| A11Y-LOGIN-005 | Color contrast ≥ 4.5:1 for inputs, button and error text. | P1 | A11Y (axe) | `login/axe_scan.spec` | Not Started |
| A11Y-LOGIN-006 | Page passes axe-core scan with zero serious/critical violations. | P1 | A11Y (axe) | `login/axe_scan.spec` | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-LOGIN-001 | Credentials are sent over HTTPS in any non-dev environment. | P0 | Security | manual / pipeline | Not Started |
| SEC-LOGIN-002 | Server response does not disclose whether the email exists ("Invalid email or password"). | P1 | Security | `login/error_message_generic.feature` | Not Started |
| SEC-LOGIN-003 | Login endpoint enforces rate-limiting / brute-force protection (e.g. ≤ 5 attempts / min / IP). | P1 | Security / API | `login/rate_limit.feature` | Not Started |
| SEC-LOGIN-004 | Auth cookie (if used) is `HttpOnly`, `Secure` and `SameSite=Lax`. | P0 | Security | `login/cookie_flags.feature` | Not Started |
| SEC-LOGIN-005 | Login form is protected against CSRF (token or same-site cookie). | P1 | Security | `login/csrf.feature` | Not Started |
| SEC-LOGIN-006 | Plaintext passwords are never logged client- or server-side. | P0 | Security | `login/no_password_log.spec` | Not Started |
