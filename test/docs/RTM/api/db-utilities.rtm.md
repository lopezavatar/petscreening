# RTM — Database Utilities API (`/api/db`, `/api/seed`)

Developer and test-automation endpoints for inspecting, clearing, and resetting the database to its initial seed state.

> ⚠️ These endpoints are **not** for production use. They must be restricted to development and test environments only.

## Endpoint summary

| Method   | Path        | Description                               |
|----------|-------------|-------------------------------------------|
| `GET`    | `/api/db`   | Return the full raw database contents     |
| `DELETE` | `/api/db`   | Clear the entire database                 |
| `POST`   | `/api/seed` | Reset the database to initial seed data   |

---

## GET /api/db — Read full database

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-DB-001 | `GET /api/db` returns `200` and a JSON object containing all entities. | P0 | API | `api/db-utilities.feature` (FR-DB-001) | Not Started |
| FR-DB-002 | Response object includes `users`, `products`, `orders`, and `promoCodes` keys. | P0 | API | `api/db-utilities.feature` (FR-DB-002) | Not Started |
| FR-DB-003 | Each key is an array (empty or populated) of its respective entity objects. | P1 | API | `api/db-utilities.feature` (FR-DB-003) | Not Started |
| FR-DB-004 | After seeding, `GET /api/db` reflects the freshly seeded data counts. | P1 | API | `api/db-utilities.feature` (FR-DB-004) | Not Started |

## DELETE /api/db — Clear database

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-DB-010 | `DELETE /api/db` returns `200` and `{ success: true, message: "Database cleared..." }`. | P0 | API | `api/db-utilities.feature` (FR-DB-010) | Not Started |
| FR-DB-011 | After `DELETE /api/db`, `GET /api/db` returns empty arrays for all entity keys. | P0 | API | `api/db-utilities.feature` (FR-DB-011) | Not Started |
| FR-DB-012 | After `DELETE /api/db`, `GET /api/products` returns an empty array `[]`. | P1 | API | `api/db-utilities.feature` (FR-DB-012) | Not Started |
| FR-DB-013 | After `DELETE /api/db`, `GET /api/orders` returns an empty array `[]`. | P1 | API | `api/db-utilities.feature` (FR-DB-013) | Not Started |
| FR-DB-014 | After `DELETE /api/db`, `GET /api/users` returns an empty array `[]`. | P1 | API | `api/db-utilities.feature` (FR-DB-014) | Not Started |
| FR-DB-015 | After `DELETE /api/db`, `GET /api/promo-codes` returns an empty array `[]`. | P1 | API | `api/db-utilities.feature` (FR-DB-015) | Not Started |
| FR-DB-016 | `DELETE /api/db` is idempotent — calling it on an already-empty database still returns `200`. | P2 | API | `api/db-utilities.feature` (FR-DB-016) | Not Started |

## POST /api/seed — Reset to initial seed data

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-DB-020 | `POST /api/seed` returns `200` and `{ success: true, message, seededAt, counts }`. | P0 | API | `api/db-utilities.feature` (FR-DB-020) | Not Started |
| FR-DB-021 | `counts` in the response includes `users`, `products`, `orders`, and `promoCodes` with their seeded totals. | P0 | API | `api/db-utilities.feature` (FR-DB-021) | Not Started |
| FR-DB-022 | After `POST /api/seed`, `counts.users` equals `5`. | P1 | API | `api/db-utilities.feature` (FR-DB-022) | Not Started |
| FR-DB-023 | After `POST /api/seed`, `counts.products` equals `12`. | P1 | API | `api/db-utilities.feature` (FR-DB-023) | Not Started |
| FR-DB-024 | After `POST /api/seed`, `counts.orders` equals `20`. | P1 | API | `api/db-utilities.feature` (FR-DB-024) | Not Started |
| FR-DB-025 | After `POST /api/seed`, `counts.promoCodes` equals `6`. | P1 | API | `api/db-utilities.feature` (FR-DB-025) | Not Started |
| FR-DB-026 | `POST /api/seed` is idempotent — seeding an already-seeded database replaces existing data with the canonical seed set. | P1 | API | `api/db-utilities.feature` (FR-DB-026) | Not Started |
| FR-DB-027 | `seededAt` in the response is a valid ISO 8601 datetime reflecting when the seed ran. | P2 | API | `api/db-utilities.feature` (FR-DB-027) | Not Started |
| FR-DB-028 | After `POST /api/seed`, all five seeded users can authenticate via `POST /api/auth` with `password123`. | P1 | API integration | `api/db-utilities.feature` (FR-DB-028) | Not Started |
| FR-DB-029 | After `POST /api/seed`, seeded promo code `SAVE10` is retrievable via `GET /api/promo-codes/save10`. | P1 | API integration | `api/db-utilities.feature` (FR-DB-029) | Not Started |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-DB-001 | `POST /api/seed` completes in < 2 000 ms on local environment. | P2 | Performance | `api/db-utilities.perf.spec` | Not Started |
| NFR-DB-002 | All endpoints return `Content-Type: application/json`. | P1 | API | `api/db-utilities.feature` | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-DB-001 | `GET /api/db`, `DELETE /api/db`, and `POST /api/seed` must be **blocked or restricted** in any non-development environment. | P0 | Security | manual / pipeline | Not Started |
| SEC-DB-002 | These endpoints must not be reachable in production (firewall / env-guard). | P0 | Security | manual / pipeline | Not Started |
| SEC-DB-003 | `GET /api/db` response may include hashed passwords — it must not be exposed publicly. | P0 | Security | manual | Not Started |
