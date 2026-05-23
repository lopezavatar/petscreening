# RTM — Weather API (`/api/weather`)

Controls and exposes the current rain status used to calculate the rain surcharge on orders. Supports computed rain (automatic), override mode (forced on/off), and clearing the override.

## Endpoint summary

| Method   | Path           | Description                                   |
|----------|----------------|-----------------------------------------------|
| `GET`    | `/api/weather` | Get current rain status and override metadata |
| `POST`   | `/api/weather` | Set or clear a rain override                  |
| `DELETE` | `/api/weather` | Clear the rain override (revert to computed)  |

**Response shape:**
```json
{
  "isRaining": boolean,
  "computed": boolean,
  "override": boolean | null,
  "hasOverride": boolean,
  "updatedAt": "ISO datetime"
}
```

---

## GET /api/weather — Read current weather state

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-WEATHER-001 | `GET /api/weather` returns `200` and a weather object. | P0 | API | `api/weather.feature` (FR-WEATHER-001) | Not Started |
| FR-WEATHER-002 | Response contains `isRaining`, `computed`, `override`, `hasOverride`, and `updatedAt`. | P0 | API | `api/weather.feature` (FR-WEATHER-002) | Not Started |
| FR-WEATHER-003 | When no override is active, `hasOverride` is `false` and `override` is `null`. | P1 | API | `api/weather.feature` (FR-WEATHER-003) | Not Started |
| FR-WEATHER-004 | `isRaining` equals `computed` when no override is set. | P1 | API | `api/weather.feature` (FR-WEATHER-004) | Not Started |
| FR-WEATHER-005 | When an override is active, `hasOverride` is `true` and `isRaining` reflects the override value, not `computed`. | P0 | API | `api/weather.feature` (FR-WEATHER-005) | Not Started |

## POST /api/weather — Set or clear override

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-WEATHER-010 | `POST /api/weather` with `{ forceRain: true }` sets `isRaining` to `true`, `override` to `true`, `hasOverride` to `true`, and returns `200`. | P0 | API | `api/weather.feature` (FR-WEATHER-010) | Not Started |
| FR-WEATHER-011 | `POST /api/weather` with `{ forceRain: false }` sets `isRaining` to `false` regardless of computed value. | P0 | API | `api/weather.feature` (FR-WEATHER-011) | Not Started |
| FR-WEATHER-012 | `POST /api/weather` with `{ forceRain: null }` clears the override and reverts `isRaining` to `computed`. | P1 | API | `api/weather.feature` (FR-WEATHER-012) | Not Started |
| FR-WEATHER-013 | After clearing via `{ forceRain: null }`, `hasOverride` is `false` and `override` is `null`. | P1 | API | `api/weather.feature` (FR-WEATHER-013) | Not Started |
| FR-WEATHER-014 | `POST /api/weather` with a missing `forceRain` field returns `400`. | P1 | API | `api/weather.feature` (FR-WEATHER-014) | Not Started |
| FR-WEATHER-015 | `POST /api/weather` with an invalid `forceRain` value (e.g. `"yes"`, `1`) returns `400`. | P1 | API | `api/weather.feature` (FR-WEATHER-015) | Not Started |
| FR-WEATHER-016 | `updatedAt` in the response reflects the time the override was applied. | P2 | API | `api/weather.feature` (FR-WEATHER-016) | Not Started |

## DELETE /api/weather — Clear override

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-WEATHER-020 | `DELETE /api/weather` returns `200` and the updated weather state with `hasOverride: false`. | P0 | API | `api/weather.feature` (FR-WEATHER-020) | Not Started |
| FR-WEATHER-021 | After `DELETE`, `isRaining` equals the `computed` value. | P0 | API | `api/weather.feature` (FR-WEATHER-021) | Not Started |
| FR-WEATHER-022 | `DELETE /api/weather` is idempotent — calling it when no override is set still returns `200`. | P2 | API | `api/weather.feature` (FR-WEATHER-022) | Not Started |

## Integration with order creation

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| FR-WEATHER-030 | When rain is forced on via `POST /api/weather`, a subsequent `POST /api/orders` with `isRaining: true` includes the rain surcharge in `billing`. | P1 | API integration | `api/weather.feature` (FR-WEATHER-030) | Not Started |
| FR-WEATHER-031 | When rain is forced off, a `POST /api/orders` with `isRaining: false` does not include a rain surcharge. | P1 | API integration | `api/weather.feature` (FR-WEATHER-031) | Not Started |

## Non-functional requirements

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| NFR-WEATHER-001 | `GET /api/weather` responds in < 200 ms p95 on local environment. | P2 | Performance | `api/weather.perf.spec` | Not Started |
| NFR-WEATHER-002 | All endpoints return `Content-Type: application/json`. | P1 | API | `api/weather.feature` | Not Started |

## Security

| ID | Description | Priority | Test type | Test Case ID(s) | Status |
|---|---|---|---|---|---|
| SEC-WEATHER-001 | `POST` and `DELETE` endpoints that modify rain state must require admin authentication in production. | P1 | Security | manual / pipeline | Not Started |
