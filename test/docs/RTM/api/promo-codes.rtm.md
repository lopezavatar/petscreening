# RTM — Promo Codes API (`/api/promo-codes`)

Full CRUD surface for promotional discount codes. Supports percentage discounts, fixed-amount discounts, and free-delivery codes.

## Endpoint summary

| Method   | Path                       | Description                      |
|----------|----------------------------|----------------------------------|
| `GET`    | `/api/promo-codes`         | List all promo codes (filterable)|
| `POST`   | `/api/promo-codes`         | Create a new promo code          |
| `GET`    | `/api/promo-codes/:code`   | Get a single promo code          |
| `PATCH`  | `/api/promo-codes/:code`   | Partially update a promo code    |
| `DELETE` | `/api/promo-codes/:code`   | Delete a promo code              |

**Code lookup:** case-insensitive (e.g. `save10` matches `SAVE10`).

---

## GET /api/promo-codes — List promo codes

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PROMO-001 | `GET /api/promo-codes` returns `200` and an array of promo code objects. | P0 | API | `api/promo-codes.feature` (FR-PROMO-001) | Not Started |
| FR-PROMO-002 | Each promo code object contains `code`, `type`, `value`, `description`, `usageCount`, `active`, and optional `minOrderAmount`, `maxDiscount`, `expiresAt`, `maxUses`. | P0 | API | `api/promo-codes.feature` (FR-PROMO-002) | Not Started |
| FR-PROMO-003 | `?active=true` returns only promo codes where `active` is `true`. | P1 | API | `api/promo-codes.feature` (FR-PROMO-003) | Not Started |
| FR-PROMO-004 | `?active=false` returns only inactive promo codes. | P1 | API | `api/promo-codes.feature` (FR-PROMO-004) | Not Started |
| FR-PROMO-005 | `?type=percentage` returns only percentage-type promo codes. | P1 | API | `api/promo-codes.feature` (FR-PROMO-005 outline) | Not Started |
| FR-PROMO-006 | All three type values (`percentage`, `fixed`, `free_delivery`) are filterable via `?type=`. | P1 | API | `api/promo-codes.feature` (FR-PROMO-005 outline) | Not Started |
| FR-PROMO-007 | Combined filters (e.g. `?active=true&type=fixed`) work together correctly. | P1 | API | `api/promo-codes.feature` (FR-PROMO-007) | Not Started |

## POST /api/promo-codes — Create promo code

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PROMO-010 | `POST /api/promo-codes` with `code`, `type`, and `description` returns `201` and the created promo code. | P0 | API | `api/promo-codes.feature` (FR-PROMO-010) | Not Started |
| FR-PROMO-011 | `code` is stored uppercase regardless of the case supplied in the request. | P1 | API | `api/promo-codes.feature` (FR-PROMO-011) | Not Started |
| FR-PROMO-012 | Created promo code is persisted and retrievable via `GET /api/promo-codes/:code`. | P0 | API | `api/promo-codes.feature` (FR-PROMO-012) | Not Started |
| FR-PROMO-013 | `POST /api/promo-codes` with missing `code` returns `400`. | P0 | API | `api/promo-codes.feature` (FR-PROMO-013 outline) | Not Started |
| FR-PROMO-014 | `POST /api/promo-codes` with missing `type` returns `400`. | P0 | API | `api/promo-codes.feature` (FR-PROMO-013 outline) | Not Started |
| FR-PROMO-015 | `POST /api/promo-codes` with missing `description` returns `400`. | P0 | API | `api/promo-codes.feature` (FR-PROMO-013 outline) | Not Started |
| FR-PROMO-016 | `POST /api/promo-codes` with an invalid `type` value returns `400`. | P1 | API | `api/promo-codes.feature` (FR-PROMO-016) | Not Started |
| FR-PROMO-017 | `POST /api/promo-codes` with a `code` that already exists returns `409`. | P1 | API | `api/promo-codes.feature` (FR-PROMO-017) | Not Started |
| FR-PROMO-018 | Optional fields (`value`, `minOrderAmount`, `maxDiscount`, `expiresAt`, `maxUses`) are stored when provided. | P1 | API | `api/promo-codes.feature` (FR-PROMO-018) | Not Started |
| FR-PROMO-019 | New promo code defaults to `active: true` and `usageCount: 0`. | P1 | API | `api/promo-codes.feature` (FR-PROMO-019) | Not Started |

## GET /api/promo-codes/:code — Get single promo code

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PROMO-020 | `GET /api/promo-codes/:code` with a valid code returns `200` and the promo code object. | P0 | API | `api/promo-codes.feature` (FR-PROMO-020) | Not Started |
| FR-PROMO-021 | Lookup is case-insensitive (e.g. `GET /api/promo-codes/save10` matches `SAVE10`). | P1 | API | `api/promo-codes.feature` (FR-PROMO-021) | Not Started |
| FR-PROMO-022 | `GET /api/promo-codes/:code` with a non-existent code returns `404`. | P0 | API | `api/promo-codes.feature` (FR-PROMO-022) | Not Started |

## PATCH /api/promo-codes/:code — Update promo code

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PROMO-030 | `PATCH /api/promo-codes/:code` with a valid code and partial body returns `200` and the updated promo code. | P0 | API | `api/promo-codes.feature` (FR-PROMO-030) | Not Started |
| FR-PROMO-031 | Setting `active: false` deactivates the promo code. | P1 | API | `api/promo-codes.feature` (FR-PROMO-031) | Not Started |
| FR-PROMO-032 | Setting `active: true` reactivates a previously deactivated code. | P1 | API | `api/promo-codes.feature` (FR-PROMO-032) | Not Started |
| FR-PROMO-033 | Updating `type` to an invalid value returns `400`. | P1 | API | `api/promo-codes.feature` (FR-PROMO-033) | Not Started |
| FR-PROMO-034 | `usageCount` can be overridden directly via PATCH. | P2 | API | `api/promo-codes.feature` (FR-PROMO-034) | Not Started |
| FR-PROMO-035 | `PATCH /api/promo-codes/:code` with a non-existent code returns `404`. | P0 | API | `api/promo-codes.feature` (FR-PROMO-035) | Not Started |
| FR-PROMO-036 | Fields not included in the PATCH body remain unchanged. | P1 | API | `api/promo-codes.feature` (FR-PROMO-036) | Not Started |

## DELETE /api/promo-codes/:code — Delete promo code

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PROMO-040 | `DELETE /api/promo-codes/:code` with a valid code returns `200` and `{ success: true, deleted: {...} }`. | P0 | API | `api/promo-codes.feature` (FR-PROMO-040) | Not Started |
| FR-PROMO-041 | Deleted promo code is no longer retrievable via `GET /api/promo-codes/:code` (returns `404`). | P0 | API | `api/promo-codes.feature` (FR-PROMO-041) | Not Started |
| FR-PROMO-042 | `DELETE /api/promo-codes/:code` with a non-existent code returns `404`. | P0 | API | `api/promo-codes.feature` (FR-PROMO-042) | Not Started |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-PROMO-001 | `GET /api/promo-codes` responds in < 300 ms p95 on local environment. | P2 | Performance | `api/promo-codes.perf.spec` | Not Started |
| NFR-PROMO-002 | All endpoints return `Content-Type: application/json`. | P1 | API | `api/promo-codes.feature` | Not Started |
| NFR-PROMO-003 | Seeded database contains at least 6 promo codes covering all three types. | P1 | API | `api/promo-codes.feature` (NFR-PROMO-003) | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-PROMO-001 | `POST`, `PATCH`, and `DELETE` endpoints must require admin authentication in production. | P1 | Security | manual / pipeline | Not Started |
| SEC-PROMO-002 | Expired promo codes (`expiresAt` in the past) should not be applicable to new orders even if `active` is `true`. | P1 | Security / Business Logic | `api/promo-codes.feature` (SEC-PROMO-002) | Not Started |
| SEC-PROMO-003 | Codes that have reached `maxUses` should not be applicable to new orders. | P1 | Business Logic | `api/promo-codes.feature` (SEC-PROMO-003) | Not Started |
