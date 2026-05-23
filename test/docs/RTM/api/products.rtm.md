# RTM — Products API (`/api/products`)

Full CRUD surface for the pie product catalogue. Supports filtering and sorting on `GET /api/products`.

## Endpoint summary

| Method   | Path                       | Description                  |
|----------|----------------------------|------------------------------|
| `GET`    | `/api/products`            | List all products (filterable) |
| `POST`   | `/api/products`            | Create a new product         |
| `GET`    | `/api/products/:productId` | Get a single product         |
| `PATCH`  | `/api/products/:productId` | Partially update a product   |
| `DELETE` | `/api/products/:productId` | Delete a product             |

---

## GET /api/products — List products

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PRODUCTS-001 | `GET /api/products` returns `200` and an array of product objects. | P0 | API | `api/products.feature` (FR-PRODUCTS-001) | Not Started |
| FR-PRODUCTS-002 | Each product object contains `id`, `name`, `description`, `price`, `image`, `category`, `available`, and `popularity`. | P0 | API | `api/products.feature` (FR-PRODUCTS-002) | Not Started |
| FR-PRODUCTS-003 | `?category=fruit` returns only products whose `category` is `"fruit"`. | P1 | API | `api/products.feature` (FR-PRODUCTS-003 outline) | Implemented |
| FR-PRODUCTS-004 | `?category=cream` returns only cream products; `?category=savory` only savory; `?category=seasonal` only seasonal. | P1 | API | `api/products.feature` (FR-PRODUCTS-003 outline) | Implemented |
| FR-PRODUCTS-005 | `?available=true` returns only products where `available` is `true`. | P1 | API | `api/products.feature` (FR-PRODUCTS-005) | Implemented |
| FR-PRODUCTS-006 | `?available=false` returns only products where `available` is `false`. | P1 | API | `api/products.feature` (FR-PRODUCTS-006) | Implemented |
| FR-PRODUCTS-007 | `?minPrice=10` returns only products with `price >= 10`. | P1 | API | `api/products.feature` (FR-PRODUCTS-007) | Implemented — test asserts via snapshot, not literal |
| FR-PRODUCTS-008 | `?maxPrice=15` returns only products with `price <= 15`. | P1 | API | `api/products.feature` (FR-PRODUCTS-008) | Implemented — test asserts via snapshot, not literal |
| FR-PRODUCTS-009 | `?minPrice=10&maxPrice=20` returns only products within that price range. | P1 | API | `api/products.feature` (FR-PRODUCTS-009) | Implemented — test asserts via snapshot, not literal |
| FR-PRODUCTS-010 | `?sortBy=price&sortOrder=asc` returns products sorted by price ascending. | P1 | API | `api/products.feature` (FR-PRODUCTS-010) | Implemented |
| FR-PRODUCTS-011 | `?sortBy=price&sortOrder=desc` returns products sorted by price descending. | P1 | API | `api/products.feature` (FR-PRODUCTS-011) | Implemented |
| FR-PRODUCTS-012 | `?sortBy=name` returns products sorted alphabetically by name. | P2 | API | `api/products.feature` (FR-PRODUCTS-012) | Not Started |
| FR-PRODUCTS-013 | `?sortBy=popularity&sortOrder=desc` returns products sorted by popularity descending. | P2 | API | `api/products.feature` (FR-PRODUCTS-013) | Not Started |
| FR-PRODUCTS-014 | Combined filters (e.g. `?category=fruit&available=true&sortBy=price`) work together correctly. | P1 | API | `api/products.feature` (FR-PRODUCTS-014) | Implemented |

## POST /api/products — Create product

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PRODUCTS-020 | `POST /api/products` with all required fields (`name`, `description`, `price`, `category`) returns `201` and the created product. | P0 | API | `api/products.feature` (FR-PRODUCTS-020) | Not Started |
| FR-PRODUCTS-021 | Created product is persisted and retrievable via `GET /api/products/:productId`. | P0 | API | `api/products.feature` (FR-PRODUCTS-021) | Not Started |
| FR-PRODUCTS-022 | `available` defaults to `true` when not provided. | P1 | API | `api/products.feature` (FR-PRODUCTS-022) | Not Started |
| FR-PRODUCTS-023 | `popularity` defaults to `50` when not provided. | P1 | API | `api/products.feature` (FR-PRODUCTS-023) | Not Started |
| FR-PRODUCTS-024 | `image` defaults to `/icon-pie.svg` when not provided. | P2 | API | `api/products.feature` (FR-PRODUCTS-024) | Not Started |
| FR-PRODUCTS-025 | A custom `id` is used when supplied; otherwise an ID is auto-generated. | P1 | API | `api/products.feature` (FR-PRODUCTS-025) | Not Started |
| FR-PRODUCTS-026 | `POST /api/products` with missing `name` returns `400`. | P0 | API | `api/products.feature` (FR-PRODUCTS-026 outline) | Not Started |
| FR-PRODUCTS-027 | `POST /api/products` with missing `description` returns `400`. | P0 | API | `api/products.feature` (FR-PRODUCTS-026 outline) | Not Started |
| FR-PRODUCTS-028 | `POST /api/products` with missing `price` returns `400`. | P0 | API | `api/products.feature` (FR-PRODUCTS-026 outline) | Not Started |
| FR-PRODUCTS-029 | `POST /api/products` with missing `category` returns `400`. | P0 | API | `api/products.feature` (FR-PRODUCTS-026 outline) | Not Started |
| FR-PRODUCTS-030 | `POST /api/products` with a duplicate `id` returns `409`. | P1 | API | `api/products.feature` (FR-PRODUCTS-030) | Not Started |
| FR-PRODUCTS-031 | `category` must be one of `fruit`, `cream`, `savory`, `seasonal`; invalid values return `400`. | P1 | API | `api/products.feature` (FR-PRODUCTS-031) | Not Started |

## GET /api/products/:productId — Get single product

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PRODUCTS-040 | `GET /api/products/:productId` with a valid ID returns `200` and the product object. | P0 | API | `api/products.feature` (FR-PRODUCTS-040) | Not Started |
| FR-PRODUCTS-041 | `GET /api/products/:productId` with a non-existent ID returns `404`. | P0 | API | `api/products.feature` (FR-PRODUCTS-041) | Not Started |

## PATCH /api/products/:productId — Update product

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PRODUCTS-050 | `PATCH /api/products/:productId` with a valid ID and a partial body updates only the supplied fields and returns `200`. | P0 | API | `api/products.feature` (FR-PRODUCTS-050) | Not Started |
| FR-PRODUCTS-051 | Updating `price` reflects the new value on subsequent `GET`. | P1 | API | `api/products.feature` (FR-PRODUCTS-051) | Not Started |
| FR-PRODUCTS-052 | Setting `available: false` marks the product as unavailable. | P1 | API | `api/products.feature` (FR-PRODUCTS-052) | Not Started |
| FR-PRODUCTS-053 | `PATCH /api/products/:productId` with a non-existent ID returns `404`. | P0 | API | `api/products.feature` (FR-PRODUCTS-053) | Not Started |
| FR-PRODUCTS-054 | Fields not included in the PATCH body remain unchanged. | P1 | API | `api/products.feature` (FR-PRODUCTS-054) | Not Started |

## DELETE /api/products/:productId — Delete product

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-PRODUCTS-060 | `DELETE /api/products/:productId` with a valid ID returns `200` and `{ success: true, deleted: {...} }`. | P0 | API | `api/products.feature` (FR-PRODUCTS-060) | Not Started |
| FR-PRODUCTS-061 | Deleted product is no longer retrievable via `GET /api/products/:productId` (returns `404`). | P0 | API | `api/products.feature` (FR-PRODUCTS-061) | Not Started |
| FR-PRODUCTS-062 | `DELETE /api/products/:productId` with a non-existent ID returns `404`. | P0 | API | `api/products.feature` (FR-PRODUCTS-062) | Not Started |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-PRODUCTS-001 | `GET /api/products` responds in < 300 ms p95 on local environment. | P2 | Performance | `api/products.perf.spec` | Not Started |
| NFR-PRODUCTS-002 | All endpoints return `Content-Type: application/json`. | P1 | API | `api/products.feature` | Implemented |
| NFR-PRODUCTS-003 | Seeded database contains at least 12 products across all four categories. | P1 | API | `api/products.feature` (NFR-PRODUCTS-003) | Implemented |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-PRODUCTS-001 | `POST`, `PATCH`, and `DELETE` endpoints should be protected against unauthenticated access in production. | P1 | Security | manual / pipeline | Not Started |
| SEC-PRODUCTS-002 | Input fields (`name`, `description`) are stored and returned as-is without executing injected scripts (XSS). | P1 | Security | `api/products.security.spec` | Not Started |
