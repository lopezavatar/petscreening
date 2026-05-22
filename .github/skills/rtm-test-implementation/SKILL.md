---
name: rtm-test-implementation
description: >
  Expert QA Automation Engineer skill. Implements robust automated test cases from a Requirements
  Traceability Matrix (RTM). Triggers: "implement RTM tests", "create tests from RTM", "automate
  requirements", "generate feature file from RTM", "implement test cases", "write tests for FR",
  "implement UI tests", "implement API tests", "add accessibility tests", "add smoke tests",
  "generate step definitions from RTM", "add Playwright tests", "RTM traceability", "BDD from
  requirements", "implement Cucumber scenarios". Produces Gherkin feature files, step definitions,
  Page Objects, and fixtures using Playwright + TypeScript + Cucumber, with zero code duplication,
  RTM tag traceability, and MCP-validated locators.
argument-hint: 'Reference an RTM file and optionally specify test types (e.g. "implement FR-HOME-001 UI smoke tests from home.rtm.md")'
user-invocable: true
---

# RTM Test Implementation — Expert QA Automation Engineer

## When to Use
- Implementing automated tests for requirements listed in a `.rtm.md` file
- Generating Gherkin feature files mapped to specific RTM requirement IDs
- Creating or extending Page Objects, step definitions, or fixtures for UI tests
- Implementing API test cases from RTM security or functional requirements
- Adding accessibility, performance, or visual regression tests from RTM entries
- When the user references an RTM and asks to "implement", "create", or "automate" tests

## Execution Flow

Follow **all six steps in order**. Do not skip or reorder steps.

---

### Step 1 — Input Validation & Test Type Selection

1. Identify the referenced RTM file (e.g., `test/docs/RTM/home.rtm.md`).
2. Parse the requirement IDs and their `Test type` column (UI, API, A11Y, Performance, Visual, Security, etc.).
3. **If the user has NOT specified which test types to implement:**
   - STOP. Do not generate any code.
   - List the test types present in the RTM (e.g., UI smoke, UI regression, API, A11Y, Visual regression, Performance).
   - Ask the user to select which ones to implement before proceeding.
4. **If the user HAS specified test types**, proceed to Step 2.

---

### Step 2 — MCP Locator Validation

Before writing any POM selector or step definition:

1. Use the available Playwright MCP tools to navigate to the relevant page(s) in the running application.
2. Take a snapshot (`mcp_playwright_browser_snapshot`) to inspect the live DOM.
3. Locate and confirm every `data-testid`, ARIA role, or CSS selector you plan to use.
4. Record confirmed locators. **Never hallucinate or assume locators** — only use what MCP has confirmed.
5. If the application is not running, note which locators could not be validated and flag them as `// TODO: validate with MCP`.

---

### Step 3 — Codebase Scan for Reuse

Before creating any new file:

1. Scan `test/pages/` for existing Page Object methods that match the needed interactions.
2. Scan `test/stepDefinitions/` for step definitions with matching Gherkin text patterns.
3. Scan `test/fixtures/` for existing auth state or context fixtures.
4. Scan `test/utils/` for reusable API clients, builders, or helpers.

**Rules:**
- If a reusable equivalent exists → adapt it (add optional parameters, generalize the locator, overload the method). Never duplicate it.
- If you modify an existing function → identify all files that import it and update those references in the same response.
- Only create a new file if no reusable code exists.

---

### Step 4 — Gherkin Feature File Generation

For each selected RTM requirement:

1. Create (or update) the `.feature` file at the path specified in `Test Case ID(s)` column of the RTM, under `test/features/ui/` or `test/features/api/`.
2. Tag every scenario with:
   - The RTM requirement ID: `@FR-HOME-001` (or `@TIER-HOME-001`, `@NFR-HOME-001`, etc.)
   - The test type: `@smoke`, `@regression`, `@api`, `@a11y`, `@visual`, `@security`, etc.
   - The priority: `@P0`, `@P1`, `@P2`, or `@P3`.
3. Follow Gherkin best practices:
   - Use `Background:` for shared preconditions within a feature.
   - Use `Scenario Outline:` + `Examples:` for data-driven cases.
   - Keep steps declarative and business-readable. No implementation details in Gherkin.

**Example:**
```gherkin
@FR-HOME-001 @smoke @P0
Scenario: Catalog page loads successfully
  Given I am on the home page
  Then the page should return HTTP 200
  And the product catalog grid should be visible
```

---

### Step 5 — Code Generation

#### 5a. Page Object (POM) — `test/pages/<FeaturePage>.ts`
- Extend `BasePage`.
- Define all confirmed locators as `readonly` properties using `data-testid` or ARIA roles.
- Expose high-level action methods (e.g., `addToCart(pieName: string)`).
- No assertions inside page objects — assertions belong in step definitions.

#### 5b. Step Definitions — `test/stepDefinitions/ui/<feature>Steps.ts`
- Follow **AAA (Arrange-Act-Assert)**:
  - `Given` → Arrange preconditions via fixtures or navigation.
  - `When` → Act using POM methods.
  - `Then` → Assert using Playwright `expect`.
- Import and use the World context / custom fixtures for page injection.
- Map each step string to the corresponding Gherkin text exactly.

#### 5c. Fixtures — `test/fixtures/customFixtures.ts`
- **Never use the UI login flow** for non-login tests.
- For authenticated tests, load pre-saved `storageState` or inject tokens via the API.
- Add a new named fixture for each distinct user role (e.g., `bronzeUser`, `goldUser`).
- Use `scope: 'test'` for isolation; `scope: 'worker'` only for expensive shared setup.

#### 5d. API Tests — `test/stepDefinitions/api/<feature>Steps.ts`
- Use `ApiClient` from `test/utils/apiClient.ts`.
- Use builders from `test/utils/builders/` for request payloads.
- Assert HTTP status codes and response schemas.

---

### Step 6 — RTM Status Update

After generating the code, update the `Status` column of the referenced RTM for each implemented requirement:
- Change `Not Started` → `Implemented` (or `In Progress` if only partially done).

---

## Folder Structure Reference

```
test/
├── features/
│   ├── ui/<page>/<requirement>.feature
│   └── api/<page>/<requirement>.feature
├── stepDefinitions/
│   ├── ui/<feature>Steps.ts
│   └── api/<feature>Steps.ts
├── pages/
│   ├── BasePage.ts
│   └── <FeaturePage>.ts
├── fixtures/
│   └── customFixtures.ts
└── utils/
    ├── apiClient.ts
    ├── builders/
    └── factories/
```

## Key Design Patterns

| Pattern | Location | Rule |
|---------|----------|------|
| POM | `test/pages/` | Locators + actions only; no assertions |
| AAA | `test/stepDefinitions/` | Given=Arrange, When=Act, Then=Assert |
| Fixtures | `test/fixtures/` | Auth state injection; never UI login for non-login tests |
| Builder | `test/utils/builders/` | Fluent API for payloads/test data |
| Factory | `test/utils/factories/` | Dynamic page/client instantiation |

## RTM Tag Convention

| Tag | Meaning |
|-----|---------|
| `@FR-HOME-001` | Functional requirement ID from RTM |
| `@TIER-HOME-001` | Tier-specific requirement |
| `@NFR-HOME-001` | Non-functional requirement |
| `@A11Y-HOME-001` | Accessibility requirement |
| `@SEC-HOME-001` | Security requirement |
| `@smoke` | P0 smoke test |
| `@regression` | Full regression suite |
| `@api` | API-layer test |
| `@a11y` | Accessibility test |
| `@P0` / `@P1` / `@P2` / `@P3` | Priority level |

## Critical Rules (Never Violate)

1. **No UI login for non-login tests.** Use storageState fixtures.
2. **No hallucinated locators.** Validate every selector with Playwright MCP before use.
3. **No code duplication.** Scan before creating; adapt before duplicating.
4. **Always update dependents.** If you modify a shared function, update all callers.
5. **RTM tags on every scenario.** Every `.feature` scenario must have its RTM ID tag.
6. **Update RTM status.** Mark requirements as Implemented after generating their tests.
