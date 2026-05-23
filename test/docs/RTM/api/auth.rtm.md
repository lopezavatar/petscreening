# RTM — Authentication API (`POST /api/auth`)

Authenticates a user by email and password. Used by the login form and any client that requires a session token.

## Endpoint summary

| Method | Path        | Description                              |
|--------|-------------|------------------------------------------|
| `POST` | `/api/auth` | Validate credentials and return user data |

**Request body:** `{ email: string, password: string }`

**Successful response (200):** `{ success: true, user: { id, email, name, tier, points, joinedAt } }`

---

## Functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-AUTH-001 | `POST /api/auth` with valid email and password returns `200` and `{ success: true, user }`. | P0 | API | `api/auth.feature` (FR-AUTH-001) | Not Started |
| FR-AUTH-002 | Response body for a successful login contains `id`, `email`, `name`, `tier`, `points`, and `joinedAt`. | P0 | API | `api/auth.feature` (FR-AUTH-002) | Not Started |
| FR-AUTH-003 | `POST /api/auth` with a valid email but wrong password returns `401`. | P0 | API | `api/auth.feature` (FR-AUTH-003) | Not Started |
| FR-AUTH-004 | `POST /api/auth` with an email that does not exist in the DB returns `401`. | P0 | API | `api/auth.feature` (FR-AUTH-004) | Not Started |
| FR-AUTH-005 | `POST /api/auth` with missing `email` field returns `400`. | P1 | API | `api/auth.feature` (FR-AUTH-005) | Not Started |
| FR-AUTH-006 | `POST /api/auth` with missing `password` field returns `400`. | P1 | API | `api/auth.feature` (FR-AUTH-006) | Not Started |
| FR-AUTH-007 | `POST /api/auth` with both fields missing returns `400`. | P1 | API | `api/auth.feature` (FR-AUTH-007) | Not Started |
| FR-AUTH-008 | Successful response does **not** include the `password` field. | P0 | API | `api/auth.feature` (FR-AUTH-008) | Not Started |
| FR-AUTH-009 | All four seeded tiers (`bronze`, `silver`, `gold`, `platinum`) authenticate successfully and return the correct tier in the response. | P1 | API | `api/auth.feature` (FR-AUTH-009 outline) | Not Started |
| FR-AUTH-010 | Email matching is case-insensitive (e.g. `BRONZE@TEST.COM` authenticates as `bronze@test.com`). | P2 | API | `api/auth.feature` (FR-AUTH-010) | Not Started |

## Tier-specific behavior

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| TIER-AUTH-001 | `bronze@test.com` / `password123` → `{ tier: "bronze", points: 150 }`. | P1 | API | `api/auth.feature` (FR-AUTH-009 outline) | Not Started |
| TIER-AUTH-002 | `silver@test.com` / `password123` → `{ tier: "silver", points: 820 }`. | P1 | API | `api/auth.feature` (FR-AUTH-009 outline) | Not Started |
| TIER-AUTH-003 | `gold@test.com` / `password123` → `{ tier: "gold", points: 2100 }`. | P1 | API | `api/auth.feature` (FR-AUTH-009 outline) | Not Started |
| TIER-AUTH-004 | `platinum@test.com` / `password123` → `{ tier: "platinum", points: 4500 }`. | P1 | API | `api/auth.feature` (FR-AUTH-009 outline) | Not Started |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-AUTH-001 | `POST /api/auth` responds in < 300 ms p95 on local environment. | P2 | Performance | `api/auth.perf.spec` | Not Started |
| NFR-AUTH-002 | Endpoint returns `Content-Type: application/json` on all responses. | P1 | API | `api/auth.feature` (NFR-AUTH-002) | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-AUTH-001 | Error message is generic ("Invalid email or password") regardless of whether the email exists, preventing user enumeration. | P0 | Security / API | `api/auth.feature` (SEC-AUTH-001) | Not Started |
| SEC-AUTH-002 | Password is never returned in any auth response (200 or error). | P0 | Security / API | `api/auth.feature` (FR-AUTH-008) | Not Started |
| SEC-AUTH-003 | Endpoint should enforce rate-limiting to prevent brute-force attacks (≤ 10 attempts / min / IP). | P1 | Security | `api/auth.rate-limit.spec` | Not Started |
| SEC-AUTH-004 | Plaintext credentials are not logged server-side. | P0 | Security | manual / log audit | Not Started |
