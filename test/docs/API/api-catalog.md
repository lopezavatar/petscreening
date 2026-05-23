# Pie in the Sky — API Catalog

Base URL: `http://localhost:3000/api`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Products](#2-products)
3. [Orders](#3-orders)
4. [Users](#4-users)
5. [Promo Codes](#5-promo-codes)
6. [Weather](#6-weather)
7. [Database Utilities](#7-database-utilities)

---

## 1. Authentication

### `POST /api/auth`

Authenticates a user by email and password.

**Request Body**

| Field      | Type   | Required | Description        |
|------------|--------|----------|--------------------|
| `email`    | string | ✅        | User email address |
| `password` | string | ✅        | User password      |

**Responses**

| Status | Description                                 |
|--------|---------------------------------------------|
| `200`  | Login successful. Returns `{ success, user }` |
| `400`  | Missing `email` or `password`               |
| `401`  | Invalid email or password                   |

**Example Response (200)**
```json
{
  "success": true,
  "user": {
    "id": "user-001",
    "email": "user@example.com",
    "name": "Jane Doe",
    "tier": "silver",
    "points": 350,
    "joinedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 2. Products

### `GET /api/products`

Returns a list of all products. Supports filtering and sorting via query parameters.

**Query Parameters**

| Parameter   | Type    | Description                                            |
|-------------|---------|--------------------------------------------------------|
| `category`  | string  | Filter by category: `fruit`, `cream`, `savory`, `seasonal` |
| `available` | boolean | Filter by availability (`true` / `false`)              |
| `minPrice`  | number  | Filter products with price ≥ value                     |
| `maxPrice`  | number  | Filter products with price ≤ value                     |
| `sortBy`    | string  | Sort by: `name`, `price`, `popularity`                 |
| `sortOrder` | string  | Sort direction: `asc` (default) / `desc`               |

**Responses**

| Status | Description                   |
|--------|-------------------------------|
| `200`  | Array of product objects      |

---

### `POST /api/products`

Creates a new product.

**Request Body**

| Field         | Type    | Required | Description                              |
|---------------|---------|----------|------------------------------------------|
| `name`        | string  | ✅        | Product name                             |
| `description` | string  | ✅        | Product description                      |
| `price`       | number  | ✅        | Price in USD                             |
| `category`    | string  | ✅        | `fruit`, `cream`, `savory`, or `seasonal`|
| `id`          | string  | ❌        | Custom ID (auto-generated if omitted)    |
| `image`       | string  | ❌        | Image path (defaults to `/icon-pie.svg`) |
| `available`   | boolean | ❌        | Defaults to `true`                       |
| `popularity`  | number  | ❌        | 1–100, defaults to `50`                  |

**Responses**

| Status | Description                                  |
|--------|----------------------------------------------|
| `201`  | Product created successfully                 |
| `400`  | Missing required fields                      |
| `409`  | Product ID already exists                    |

---

### `GET /api/products/:productId`

Returns a single product by ID.

**Path Parameters**

| Parameter   | Type   | Description |
|-------------|--------|-------------|
| `productId` | string | Product ID  |

**Responses**

| Status | Description          |
|--------|----------------------|
| `200`  | Product object       |
| `404`  | Product not found    |

---

### `PATCH /api/products/:productId`

Updates one or more fields of a product.

**Path Parameters**

| Parameter   | Type   | Description |
|-------------|--------|-------------|
| `productId` | string | Product ID  |

**Request Body** (all fields optional)

| Field         | Type    | Description        |
|---------------|---------|--------------------|
| `name`        | string  | Product name       |
| `description` | string  | Description        |
| `price`       | number  | Price in USD       |
| `image`       | string  | Image path         |
| `category`    | string  | Product category   |
| `available`   | boolean | Availability flag  |
| `popularity`  | number  | Popularity score   |

**Responses**

| Status | Description          |
|--------|----------------------|
| `200`  | Updated product      |
| `404`  | Product not found    |

---

### `DELETE /api/products/:productId`

Deletes a product by ID.

**Path Parameters**

| Parameter   | Type   | Description |
|-------------|--------|-------------|
| `productId` | string | Product ID  |

**Responses**

| Status | Description                       |
|--------|-----------------------------------|
| `200`  | `{ success: true, deleted: {...} }` |
| `404`  | Product not found                 |

---

## 3. Orders

### `GET /api/orders`

Returns a list of orders. Supports filtering and sorting.

**Query Parameters**

| Parameter   | Type   | Description                                                  |
|-------------|--------|--------------------------------------------------------------|
| `userId`    | string | Filter by user ID                                            |
| `status`    | string | Filter by status: `pending`, `in_transit`, `delivered`, `cancelled` |
| `orderId`   | string | Partial match on order ID                                    |
| `minTotal`  | number | Filter orders with total ≥ value                             |
| `maxTotal`  | number | Filter orders with total ≤ value                             |
| `fromDate`  | string | Filter orders created on or after date (ISO 8601)            |
| `toDate`    | string | Filter orders created on or before date (ISO 8601)           |
| `sortBy`    | string | Sort by: `createdAt` (default), `total`, `status`            |
| `sortOrder` | string | `asc` / `desc` (default: `desc`)                             |

**Responses**

| Status | Description            |
|--------|------------------------|
| `200`  | Array of order objects |

---

### `POST /api/orders`

Creates a new order.

**Request Body**

| Field                  | Type     | Required | Description                                      |
|------------------------|----------|----------|--------------------------------------------------|
| `items`                | array    | ✅        | Array of `{ productId, quantity }` objects       |
| `userId`               | string   | ❌        | Associated user ID                               |
| `address`              | string   | ❌        | Delivery address (default: `"123 Test St, ..."`) |
| `distanceKm`           | number   | ❌        | Delivery distance in km (default: `5.0`)         |
| `isRaining`            | boolean  | ❌        | Rain surcharge flag (default: `false`)           |
| `isWeekend`            | boolean  | ❌        | Weekend surcharge flag (default: `false`)        |
| `deliveryDate`         | string   | ❌        | ISO date string (defaults to today)              |
| `deliveryTime`         | string   | ❌        | Time string (default: `"12:00"`)                 |
| `deliveryInstructions` | string   | ❌        | Optional delivery instructions                   |
| `tip`                  | number   | ❌        | Tip amount in USD (default: `0`)                 |
| `status`               | string   | ❌        | Initial status (default: `"pending"`)            |

**Responses**

| Status | Description                               |
|--------|-------------------------------------------|
| `201`  | Order created, returns full order object  |
| `400`  | Missing or invalid items, unknown product |

---

### `GET /api/orders/:orderId`

Returns a single order by ID.

**Path Parameters**

| Parameter | Type   | Description               |
|-----------|--------|---------------------------|
| `orderId` | string | Order ID (e.g. `PIE-ABC123`) |

**Responses**

| Status | Description       |
|--------|-------------------|
| `200`  | Order object      |
| `404`  | Order not found   |

---

### `PATCH /api/orders/:orderId`

Updates allowed fields of an existing order.

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `orderId` | string | Order ID    |

**Request Body** (all fields optional)

| Field                  | Type   | Description                                           |
|------------------------|--------|-------------------------------------------------------|
| `status`               | string | `pending`, `in_transit`, `delivered`, `cancelled`     |
| `deliveryDate`         | string | ISO date string                                       |
| `deliveryTime`         | string | Time string                                           |
| `deliveryInstructions` | string | Delivery instructions                                 |
| `tip`                  | number | Tip amount                                            |

**Responses**

| Status | Description        |
|--------|--------------------|
| `200`  | Updated order      |
| `400`  | Invalid status     |
| `404`  | Order not found    |

---

### `DELETE /api/orders/:orderId`

Deletes an order by ID.

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `orderId` | string | Order ID    |

**Responses**

| Status | Description                         |
|--------|-------------------------------------|
| `200`  | `{ success: true, deleted: {...} }` |
| `404`  | Order not found                     |

---

## 4. Users

### `GET /api/users`

Returns a list of users.

**Query Parameters**

| Parameter         | Type    | Description                                    |
|-------------------|---------|------------------------------------------------|
| `tier`            | string  | Filter by loyalty tier: `bronze`, `silver`, `gold`, `platinum` |
| `email`           | string  | Partial match on email                         |
| `includePassword` | boolean | Include password field in response (`true` / `false`, default: `false`) |

**Responses**

| Status | Description            |
|--------|------------------------|
| `200`  | Array of user objects  |

---

### `POST /api/users`

Creates a new user.

**Request Body**

| Field      | Type   | Required | Description                          |
|------------|--------|----------|--------------------------------------|
| `email`    | string | ✅        | Unique email address                 |
| `password` | string | ✅        | User password                        |
| `name`     | string | ✅        | Display name                         |
| `points`   | number | ❌        | Initial loyalty points (default: `0`) |

**Responses**

| Status | Description                     |
|--------|---------------------------------|
| `201`  | User created (password omitted) |
| `400`  | Missing required fields         |
| `409`  | Email already exists            |

---

### `GET /api/users/:userId`

Returns a single user by ID.

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `userId`  | string | User ID     |

**Query Parameters**

| Parameter         | Type    | Description                          |
|-------------------|---------|--------------------------------------|
| `includePassword` | boolean | Include password field (`true` / `false`) |

**Responses**

| Status | Description     |
|--------|-----------------|
| `200`  | User object     |
| `404`  | User not found  |

---

### `PATCH /api/users/:userId`

Updates one or more fields of a user.

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `userId`  | string | User ID     |

**Request Body** (all fields optional)

| Field      | Type   | Description                                 |
|------------|--------|---------------------------------------------|
| `email`    | string | New unique email                            |
| `password` | string | New password                                |
| `name`     | string | Display name                                |
| `points`   | number | Loyalty points (tier is recalculated automatically) |

**Responses**

| Status | Description            |
|--------|------------------------|
| `200`  | Updated user (no password) |
| `404`  | User not found         |
| `409`  | Email already exists   |

---

### `DELETE /api/users/:userId`

Deletes a user by ID.

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `userId`  | string | User ID     |

**Responses**

| Status | Description                         |
|--------|-------------------------------------|
| `200`  | `{ success: true, deleted: {...} }` |
| `404`  | User not found                      |

---

### `POST /api/users/:userId/points`

Adjusts loyalty points for a user. Tier is recalculated automatically.

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `userId`  | string | User ID     |

**Request Body** (provide one of the two)

| Field      | Type   | Required | Description                              |
|------------|--------|----------|------------------------------------------|
| `delta`    | number | ❌        | Add/subtract points (e.g. `+100`, `-50`) |
| `absolute` | number | ❌        | Set points to an exact value             |

**Responses**

| Status | Description                                                                  |
|--------|------------------------------------------------------------------------------|
| `200`  | `{ user, change: { previousPoints, newPoints, delta, previousTier, newTier, tierChanged } }` |
| `400`  | Neither `delta` nor `absolute` provided                                      |
| `404`  | User not found                                                               |

---

## 5. Promo Codes

### `GET /api/promo-codes`

Returns a list of promo codes.

**Query Parameters**

| Parameter | Type    | Description                                       |
|-----------|---------|---------------------------------------------------|
| `active`  | boolean | Filter by active status (`true` / `false`)        |
| `type`    | string  | Filter by type: `percentage`, `fixed`, `free_delivery` |

**Responses**

| Status | Description                  |
|--------|------------------------------|
| `200`  | Array of promo code objects  |

---

### `POST /api/promo-codes`

Creates a new promo code.

**Request Body**

| Field            | Type   | Required | Description                                        |
|------------------|--------|----------|----------------------------------------------------|
| `code`           | string | ✅        | Promo code string (stored uppercase)               |
| `type`           | string | ✅        | `percentage`, `fixed`, or `free_delivery`          |
| `description`    | string | ✅        | Human-readable description                         |
| `value`          | number | ❌        | Discount value (percentage or fixed amount)        |
| `minOrderAmount` | number | ❌        | Minimum order amount to apply code                 |
| `maxDiscount`    | number | ❌        | Cap on discount amount                             |
| `expiresAt`      | string | ❌        | ISO date string for expiry                         |
| `maxUses`        | number | ❌        | Maximum number of allowed uses                     |

**Responses**

| Status | Description                   |
|--------|-------------------------------|
| `201`  | Promo code created            |
| `400`  | Missing required fields or invalid type |
| `409`  | Promo code already exists     |

---

### `GET /api/promo-codes/:code`

Returns a single promo code.

**Path Parameters**

| Parameter | Type   | Description                  |
|-----------|--------|------------------------------|
| `code`    | string | Promo code (case-insensitive) |

**Responses**

| Status | Description           |
|--------|-----------------------|
| `200`  | Promo code object     |
| `404`  | Promo code not found  |

---

### `PATCH /api/promo-codes/:code`

Updates one or more fields of a promo code.

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `code`    | string | Promo code  |

**Request Body** (all fields optional)

| Field            | Type    | Description                                   |
|------------------|---------|-----------------------------------------------|
| `type`           | string  | `percentage`, `fixed`, `free_delivery`        |
| `value`          | number  | Discount value                                |
| `minOrderAmount` | number  | Minimum order amount                          |
| `maxDiscount`    | number  | Cap on discount                               |
| `expiresAt`      | string  | ISO expiry date                               |
| `description`    | string  | Description                                   |
| `usageCount`     | number  | Override usage count                          |
| `maxUses`        | number  | Max uses                                      |
| `active`         | boolean | Activate/deactivate code                      |

**Responses**

| Status | Description           |
|--------|-----------------------|
| `200`  | Updated promo code    |
| `400`  | Invalid type value    |
| `404`  | Promo code not found  |

---

### `DELETE /api/promo-codes/:code`

Deletes a promo code.

**Path Parameters**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `code`    | string | Promo code  |

**Responses**

| Status | Description                         |
|--------|-------------------------------------|
| `200`  | `{ success: true, deleted: {...} }` |
| `404`  | Promo code not found                |

---

## 6. Weather

### `GET /api/weather`

Returns the current rain status, including computed value, any active override, and metadata.

**Responses**

| Status | Description |
|--------|-------------|
| `200`  | `{ isRaining, computed, override, hasOverride, updatedAt }` |

**Example Response (200)**
```json
{
  "isRaining": true,
  "computed": false,
  "override": true,
  "hasOverride": true,
  "updatedAt": "2026-05-23T10:00:00.000Z"
}
```

---

### `POST /api/weather`

Sets or clears a rain override.

**Request Body**

| Field       | Type             | Required | Description                                         |
|-------------|------------------|----------|-----------------------------------------------------|
| `forceRain` | boolean \| null  | ✅        | `true` = force rain, `false` = force no rain, `null` = clear override |

**Responses**

| Status | Description                              |
|--------|------------------------------------------|
| `200`  | Override applied, returns weather state  |
| `400`  | Invalid `forceRain` value                |

---

### `DELETE /api/weather`

Clears the current rain override and reverts to computed rain status.

**Responses**

| Status | Description                    |
|--------|--------------------------------|
| `200`  | Override cleared, returns weather state |

---

## 7. Database Utilities

> ⚠️ These endpoints are intended for development and test automation only.

### `GET /api/db`

Returns the full raw database contents (all users, products, orders, and promo codes).

**Responses**

| Status | Description              |
|--------|--------------------------|
| `200`  | Full database JSON object |

---

### `DELETE /api/db`

Clears the entire database. The next request will auto-seed with initial data.

**Responses**

| Status | Description                                          |
|--------|------------------------------------------------------|
| `200`  | `{ success: true, message: "Database cleared..." }` |

---

### `POST /api/seed`

Resets the database to the initial seed data.

**Responses**

| Status | Description                                                                 |
|--------|-----------------------------------------------------------------------------|
| `200`  | `{ success, message, seededAt, counts: { users, products, orders, promoCodes } }` |

**Example Response (200)**
```json
{
  "success": true,
  "message": "Database reset to initial seed data",
  "seededAt": "2026-05-23T10:00:00.000Z",
  "counts": {
    "users": 5,
    "products": 12,
    "orders": 20,
    "promoCodes": 6
  }
}
```

---

## Data Models

### Product

```ts
{
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "fruit" | "cream" | "savory" | "seasonal";
  available: boolean;
  popularity: number; // 1–100
}
```

### Order

```ts
{
  orderId: string;               // Format: "PIE-XXXXXX"
  items: OrderItem[];
  subtotal: number;
  address: string;
  displayAddress: string;
  deliveryDate: string;          // ISO date
  deliveryTime: string;
  deliveryInstructions?: string;
  distanceKm: number;
  billing: BillingResult;
  tip: number;
  isRaining: boolean;
  createdAt: string;             // ISO datetime
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  userId?: string;
  pointsEarned?: number;
}
```

### User (safe — no password)

```ts
{
  id: string;
  email: string;
  name: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  points: number;
  joinedAt: string;             // ISO datetime
}
```

### PromoCode

```ts
{
  code: string;
  type: "percentage" | "fixed" | "free_delivery";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
  description: string;
  usageCount: number;
  maxUses?: number;
  active: boolean;
}
```
