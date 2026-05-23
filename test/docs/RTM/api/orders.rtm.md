# RTM — Orders API (`/api/orders`)

Full CRUD surface for pie delivery orders. Supports filtering, sorting, and status transitions.

## Endpoint summary

| Method   | Path                    | Description                  |
|----------|-------------------------|------------------------------|
| `GET`    | `/api/orders`           | List all orders (filterable) |
| `POST`   | `/api/orders`           | Create a new order           |
| `GET`    | `/api/orders/:orderId`  | Get a single order           |
| `PATCH`  | `/api/orders/:orderId`  | Partially update an order    |
| `DELETE` | `/api/orders/:orderId`  | Delete an order              |

**Order ID format:** `PIE-XXXXXX`

---

## GET /api/orders — List orders

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-ORDERS-001 | `GET /api/orders` returns `200` and an array of order objects. | P0 | API | `api/orders.feature` (FR-ORDERS-001) | Not Started |
| FR-ORDERS-002 | Each order object contains `orderId`, `items`, `subtotal`, `billing`, `status`, `createdAt`, `address`, `distanceKm`, `tip`, `isRaining`, `deliveryDate`, and `deliveryTime`. | P0 | API | `api/orders.feature` (FR-ORDERS-002) | Not Started |
| FR-ORDERS-003 | `?userId=<id>` returns only orders belonging to that user. | P1 | API | `api/orders.feature` (FR-ORDERS-003) | Not Started |
| FR-ORDERS-004 | `?status=pending` returns only orders with status `"pending"`. | P1 | API | `api/orders.feature` (FR-ORDERS-004 outline) | Not Started |
| FR-ORDERS-005 | All four status values (`pending`, `in_transit`, `delivered`, `cancelled`) are filterable via `?status=`. | P1 | API | `api/orders.feature` (FR-ORDERS-004 outline) | Not Started |
| FR-ORDERS-006 | `?orderId=PIE` performs a partial match and returns orders whose ID contains the substring. | P2 | API | `api/orders.feature` (FR-ORDERS-006) | Not Started |
| FR-ORDERS-007 | `?minTotal=50` returns only orders with `billing.total >= 50`. | P1 | API | `api/orders.feature` (FR-ORDERS-007) | Not Started |
| FR-ORDERS-008 | `?maxTotal=30` returns only orders with `billing.total <= 30`. | P1 | API | `api/orders.feature` (FR-ORDERS-008) | Not Started |
| FR-ORDERS-009 | `?fromDate=<ISO>` returns only orders created on or after that date. | P1 | API | `api/orders.feature` (FR-ORDERS-009) | Not Started |
| FR-ORDERS-010 | `?toDate=<ISO>` returns only orders created on or before that date. | P1 | API | `api/orders.feature` (FR-ORDERS-010) | Not Started |
| FR-ORDERS-011 | `?sortBy=total&sortOrder=asc` returns orders sorted by total ascending. | P2 | API | `api/orders.feature` (FR-ORDERS-011) | Not Started |
| FR-ORDERS-012 | `?sortBy=createdAt&sortOrder=desc` returns orders sorted by creation date descending (default). | P1 | API | `api/orders.feature` (FR-ORDERS-012) | Not Started |
| FR-ORDERS-013 | `?sortBy=status` returns orders sorted alphabetically by status. | P2 | API | `api/orders.feature` (FR-ORDERS-013) | Not Started |
| FR-ORDERS-014 | Combined filters (e.g. `?userId=user-001&status=delivered`) work together correctly. | P1 | API | `api/orders.feature` (FR-ORDERS-014) | Not Started |

## POST /api/orders — Create order

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-ORDERS-020 | `POST /api/orders` with a valid `items` array returns `201` and the full order object. | P0 | API | `api/orders.feature` (FR-ORDERS-020) | Not Started |
| FR-ORDERS-021 | `orderId` in the response matches the format `PIE-XXXXXX`. | P0 | API | `api/orders.feature` (FR-ORDERS-021) | Not Started |
| FR-ORDERS-022 | Order is persisted and retrievable via `GET /api/orders/:orderId`. | P0 | API | `api/orders.feature` (FR-ORDERS-022) | Not Started |
| FR-ORDERS-023 | `POST /api/orders` with an empty `items` array returns `400`. | P0 | API | `api/orders.feature` (FR-ORDERS-023) | Not Started |
| FR-ORDERS-024 | `POST /api/orders` with a missing `items` field returns `400`. | P0 | API | `api/orders.feature` (FR-ORDERS-024) | Not Started |
| FR-ORDERS-025 | `POST /api/orders` referencing an unknown `productId` returns `400`. | P0 | API | `api/orders.feature` (FR-ORDERS-025) | Not Started |
| FR-ORDERS-026 | `isRaining: true` applies the rain surcharge in `billing`. | P1 | API | `api/orders.feature` (FR-ORDERS-026) | Not Started |
| FR-ORDERS-027 | `isWeekend: true` applies the weekend surcharge in `billing`. | P1 | API | `api/orders.feature` (FR-ORDERS-027) | Not Started |
| FR-ORDERS-028 | `tip` amount is included in the order and reflected in `billing`. | P1 | API | `api/orders.feature` (FR-ORDERS-028) | Not Started |
| FR-ORDERS-029 | When `userId` is provided the order is linked to that user and `pointsEarned` is calculated. | P1 | API | `api/orders.feature` (FR-ORDERS-029) | Not Started |
| FR-ORDERS-030 | Default status for a new order is `"pending"`. | P0 | API | `api/orders.feature` (FR-ORDERS-030) | Not Started |
| FR-ORDERS-031 | `deliveryDate` defaults to today's date when not provided. | P2 | API | `api/orders.feature` (FR-ORDERS-031) | Not Started |
| FR-ORDERS-032 | `deliveryTime` defaults to `"12:00"` when not provided. | P2 | API | `api/orders.feature` (FR-ORDERS-032) | Not Started |
| FR-ORDERS-033 | `distanceKm` defaults to `5.0` when not provided. | P2 | API | `api/orders.feature` (FR-ORDERS-033) | Not Started |
| FR-ORDERS-034 | `deliveryInstructions` is stored and returned when provided. | P2 | API | `api/orders.feature` (FR-ORDERS-034) | Not Started |

## GET /api/orders/:orderId — Get single order

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-ORDERS-040 | `GET /api/orders/:orderId` with a valid ID returns `200` and the order object. | P0 | API | `api/orders.feature` (FR-ORDERS-040) | Not Started |
| FR-ORDERS-041 | `GET /api/orders/:orderId` with a non-existent ID returns `404`. | P0 | API | `api/orders.feature` (FR-ORDERS-041) | Not Started |

## PATCH /api/orders/:orderId — Update order

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-ORDERS-050 | `PATCH /api/orders/:orderId` with a valid ID and allowed fields returns `200` and the updated order. | P0 | API | `api/orders.feature` (FR-ORDERS-050) | Not Started |
| FR-ORDERS-051 | Status can be updated to `in_transit`, `delivered`, or `cancelled`. | P0 | API | `api/orders.feature` (FR-ORDERS-051 outline) | Not Started |
| FR-ORDERS-052 | Updating `status` to an invalid value returns `400`. | P1 | API | `api/orders.feature` (FR-ORDERS-052) | Not Started |
| FR-ORDERS-053 | `deliveryDate`, `deliveryTime`, `deliveryInstructions`, and `tip` can each be updated independently. | P1 | API | `api/orders.feature` (FR-ORDERS-053 outline) | Not Started |
| FR-ORDERS-054 | `PATCH /api/orders/:orderId` with a non-existent ID returns `404`. | P0 | API | `api/orders.feature` (FR-ORDERS-054) | Not Started |
| FR-ORDERS-055 | Fields not included in the PATCH body remain unchanged. | P1 | API | `api/orders.feature` (FR-ORDERS-055) | Not Started |

## DELETE /api/orders/:orderId — Delete order

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-ORDERS-060 | `DELETE /api/orders/:orderId` with a valid ID returns `200` and `{ success: true, deleted: {...} }`. | P0 | API | `api/orders.feature` (FR-ORDERS-060) | Not Started |
| FR-ORDERS-061 | Deleted order is no longer retrievable via `GET /api/orders/:orderId` (returns `404`). | P0 | API | `api/orders.feature` (FR-ORDERS-061) | Not Started |
| FR-ORDERS-062 | `DELETE /api/orders/:orderId` with a non-existent ID returns `404`. | P0 | API | `api/orders.feature` (FR-ORDERS-062) | Not Started |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-ORDERS-001 | `POST /api/orders` responds in < 500 ms p95 on local environment. | P2 | Performance | `api/orders.perf.spec` | Not Started |
| NFR-ORDERS-002 | All endpoints return `Content-Type: application/json`. | P1 | API | `api/orders.feature` | Not Started |
| NFR-ORDERS-003 | Seeded database contains at least 20 orders across different statuses and users. | P1 | API | `api/orders.feature` (NFR-ORDERS-003) | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-ORDERS-001 | Users should only be able to read and modify their own orders; accessing another user's order should return `403`. | P1 | Security | `api/orders.security.spec` | Not Started |
| SEC-ORDERS-002 | `DELETE` and `PATCH` endpoints should require authentication in production. | P1 | Security | manual / pipeline | Not Started |
