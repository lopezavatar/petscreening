# RTM — Users API (`/api/users`)

Full CRUD surface for registered users plus a dedicated points-adjustment endpoint. Tier is recalculated automatically whenever points change.

## Endpoint summary

| Method   | Path                        | Description                         |
|----------|-----------------------------|-------------------------------------|
| `GET`    | `/api/users`                | List all users (filterable)         |
| `POST`   | `/api/users`                | Create a new user                   |
| `GET`    | `/api/users/:userId`        | Get a single user                   |
| `PATCH`  | `/api/users/:userId`        | Partially update a user             |
| `DELETE` | `/api/users/:userId`        | Delete a user                       |
| `POST`   | `/api/users/:userId/points` | Adjust loyalty points for a user    |

**Tier thresholds (inferred from seed data):**

| Tier     | Points range |
|----------|-------------|
| Bronze   | 0 – 499     |
| Silver   | 500 – 1 499 |
| Gold     | 1 500 – 3 999 |
| Platinum | 4 000+      |

---

## GET /api/users — List users

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-USERS-001 | `GET /api/users` returns `200` and an array of user objects. | P0 | API | `api/users.feature` (FR-USERS-001) | Not Started |
| FR-USERS-002 | Response does **not** include the `password` field by default. | P0 | API | `api/users.feature` (FR-USERS-002) | Not Started |
| FR-USERS-003 | Each user object contains `id`, `email`, `name`, `tier`, `points`, and `joinedAt`. | P0 | API | `api/users.feature` (FR-USERS-003) | Not Started |
| FR-USERS-004 | `?tier=silver` returns only users with tier `"silver"`. | P1 | API | `api/users.feature` (FR-USERS-004 outline) | Not Started |
| FR-USERS-005 | All four tier values (`bronze`, `silver`, `gold`, `platinum`) are filterable via `?tier=`. | P1 | API | `api/users.feature` (FR-USERS-004 outline) | Not Started |
| FR-USERS-006 | `?email=test.com` performs a partial match and returns users whose email contains the substring. | P2 | API | `api/users.feature` (FR-USERS-006) | Not Started |
| FR-USERS-007 | `?includePassword=true` includes the `password` field in every user object. | P2 | API | `api/users.feature` (FR-USERS-007) | Not Started |

## POST /api/users — Create user

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-USERS-010 | `POST /api/users` with `email`, `password`, and `name` returns `201` and the created user (no password). | P0 | API | `api/users.feature` (FR-USERS-010) | Not Started |
| FR-USERS-011 | `points` defaults to `0` and `tier` to `"bronze"` when not provided. | P1 | API | `api/users.feature` (FR-USERS-011) | Not Started |
| FR-USERS-012 | `POST /api/users` with missing `email` returns `400`. | P0 | API | `api/users.feature` (FR-USERS-012 outline) | Not Started |
| FR-USERS-013 | `POST /api/users` with missing `password` returns `400`. | P0 | API | `api/users.feature` (FR-USERS-012 outline) | Not Started |
| FR-USERS-014 | `POST /api/users` with missing `name` returns `400`. | P0 | API | `api/users.feature` (FR-USERS-012 outline) | Not Started |
| FR-USERS-015 | `POST /api/users` with an already-registered email returns `409`. | P1 | API | `api/users.feature` (FR-USERS-015) | Not Started |
| FR-USERS-016 | Created user is persisted and retrievable via `GET /api/users/:userId`. | P0 | API | `api/users.feature` (FR-USERS-016) | Not Started |
| FR-USERS-017 | Response for user creation does not include the `password` field. | P0 | API | `api/users.feature` (FR-USERS-017) | Not Started |

## GET /api/users/:userId — Get single user

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-USERS-020 | `GET /api/users/:userId` with a valid ID returns `200` and the user object (no password by default). | P0 | API | `api/users.feature` (FR-USERS-020) | Not Started |
| FR-USERS-021 | `GET /api/users/:userId?includePassword=true` includes the `password` field. | P2 | API | `api/users.feature` (FR-USERS-021) | Not Started |
| FR-USERS-022 | `GET /api/users/:userId` with a non-existent ID returns `404`. | P0 | API | `api/users.feature` (FR-USERS-022) | Not Started |

## PATCH /api/users/:userId — Update user

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-USERS-030 | `PATCH /api/users/:userId` with a valid ID updates the supplied fields and returns `200` (no password). | P0 | API | `api/users.feature` (FR-USERS-030) | Not Started |
| FR-USERS-031 | Updating `points` recalculates and updates `tier` automatically. | P0 | API | `api/users.feature` (FR-USERS-031) | Not Started |
| FR-USERS-032 | Updating `email` to one already in use returns `409`. | P1 | API | `api/users.feature` (FR-USERS-032) | Not Started |
| FR-USERS-033 | `PATCH /api/users/:userId` with a non-existent ID returns `404`. | P0 | API | `api/users.feature` (FR-USERS-033) | Not Started |
| FR-USERS-034 | Fields not included in the PATCH body remain unchanged. | P1 | API | `api/users.feature` (FR-USERS-034) | Not Started |

## DELETE /api/users/:userId — Delete user

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-USERS-040 | `DELETE /api/users/:userId` with a valid ID returns `200` and `{ success: true, deleted: {...} }`. | P0 | API | `api/users.feature` (FR-USERS-040) | Not Started |
| FR-USERS-041 | Deleted user is no longer retrievable via `GET /api/users/:userId` (returns `404`). | P0 | API | `api/users.feature` (FR-USERS-041) | Not Started |
| FR-USERS-042 | `DELETE /api/users/:userId` with a non-existent ID returns `404`. | P0 | API | `api/users.feature` (FR-USERS-042) | Not Started |

## POST /api/users/:userId/points — Adjust loyalty points

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-USERS-050 | `POST /api/users/:userId/points` with `{ delta: 100 }` adds 100 points and returns `200` with `{ user, change }`. | P0 | API | `api/users.feature` (FR-USERS-050) | Not Started |
| FR-USERS-051 | `{ delta: -50 }` subtracts 50 points from the current balance. | P1 | API | `api/users.feature` (FR-USERS-051) | Not Started |
| FR-USERS-052 | `{ absolute: 5000 }` sets points to exactly `5000` regardless of previous value. | P1 | API | `api/users.feature` (FR-USERS-052) | Not Started |
| FR-USERS-053 | The `change` object in the response includes `previousPoints`, `newPoints`, `delta`, `previousTier`, `newTier`, and `tierChanged`. | P1 | API | `api/users.feature` (FR-USERS-053) | Not Started |
| FR-USERS-054 | When a points adjustment crosses a tier threshold, `tierChanged` is `true` and `newTier` reflects the new tier. | P0 | API | `api/users.feature` (FR-USERS-054 outline) | Not Started |
| FR-USERS-055 | `POST /api/users/:userId/points` with neither `delta` nor `absolute` returns `400`. | P1 | API | `api/users.feature` (FR-USERS-055) | Not Started |
| FR-USERS-056 | `POST /api/users/:userId/points` with a non-existent user ID returns `404`. | P0 | API | `api/users.feature` (FR-USERS-056) | Not Started |

## Tier transition scenarios

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| TIER-USERS-001 | Adding enough points to cross from `bronze` → `silver` sets `tier` to `"silver"` and `tierChanged: true`. | P1 | API | `api/users.feature` (FR-USERS-054 outline) | Not Started |
| TIER-USERS-002 | Adding enough points to cross from `silver` → `gold` sets `tier` to `"gold"` and `tierChanged: true`. | P1 | API | `api/users.feature` (FR-USERS-054 outline) | Not Started |
| TIER-USERS-003 | Adding enough points to cross from `gold` → `platinum` sets `tier` to `"platinum"` and `tierChanged: true`. | P1 | API | `api/users.feature` (FR-USERS-054 outline) | Not Started |
| TIER-USERS-004 | A points adjustment that stays within the same tier sets `tierChanged: false`. | P1 | API | `api/users.feature` (FR-USERS-054 outline) | Not Started |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-USERS-001 | `GET /api/users` responds in < 300 ms p95 on local environment. | P2 | Performance | `api/users.perf.spec` | Not Started |
| NFR-USERS-002 | All endpoints return `Content-Type: application/json`. | P1 | API | `api/users.feature` | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-USERS-001 | `password` is never returned in any list or single-user response unless `?includePassword=true` is explicitly passed (dev/test only). | P0 | Security / API | `api/users.feature` (FR-USERS-002) | Not Started |
| SEC-USERS-002 | The `?includePassword=true` parameter must be restricted to admin/test roles in production. | P0 | Security | manual / pipeline | Not Started |
| SEC-USERS-003 | `PATCH` and `DELETE` on user resources must require authentication and ownership or admin role in production. | P1 | Security | manual / pipeline | Not Started |
| SEC-USERS-004 | Passwords must be hashed before storage; plaintext passwords must not be stored. | P0 | Security | manual / code review | Not Started |
