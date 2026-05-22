# Requirements Traceability Matrix (RTM)

This folder contains one RTM per public page of the Pie In The Sky web application.
Each RTM links business/functional/non-functional requirements to test cases so QA
can verify coverage, traceability and gaps.

## Scope

| RTM file | Route | Auth required |
|---|---|---|
| [home.rtm.md](home.rtm.md) | `/` | No (guest + authenticated) |
| [login.rtm.md](login.rtm.md) | `/login` | No |
| [checkout.rtm.md](checkout.rtm.md) | `/checkout` | No (cart must be non-empty) |
| [confirmation.rtm.md](confirmation.rtm.md) | `/confirmation` | No (last order must exist in session) |
| [tracking.rtm.md](tracking.rtm.md) | `/tracking/{orderId}` | No |
| [account.rtm.md](account.rtm.md) | `/account`, `/account/orders`, `/account/rewards` | Yes |

## Test users (loyalty tiers)

| Email | Tier | Points | Delivery discount |
|---|---|---:|---:|
| bronze@test.com | Bronze | 150 | 0 % |
| silver@test.com | Silver | 820 | 5 % |
| gold@test.com | Gold | 2,100 | 10 % |
| platinum@test.com | Platinum | 4,500 | 15 % |

Password for all: `password123`.

## Requirement ID conventions

| Prefix | Meaning |
|---|---|
| `FR-`   | Functional requirement |
| `NFR-`  | Non-functional requirement (performance, reliability, security, compatibility) |
| `UX-`   | UX / visual / design system compliance |
| `A11Y-` | Accessibility (WCAG 2.1 AA) |
| `TIER-` | Loyalty-tier specific behavior |
| `SEC-`  | Security / authorization |
| `BUG-`  | Known intentional defect in the codebase (regression candidate) |

## Priority levels

`P0` blocker · `P1` critical · `P2` major · `P3` minor.

## Status values

`Not Started` · `Drafted` · `Automated` · `Passed` · `Failed` · `Blocked`.

## How to update

1. When a new feature ships, add a row in the relevant RTM with a stable ID.
2. When a new automated scenario is added under `test/features/**`, fill the
   *Test Case ID(s)* column with the Gherkin scenario name or feature file path.
3. Keep the *Status* column in sync with the latest CI run.
