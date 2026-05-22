---
name: playwright-cucumber-framework
description: >
  Use this skill to scaffold, configure, or extend a Playwright + TypeScript + Cucumber (Gherkin)
  test automation framework. Triggers: "create test framework", "add BDD tests", "scaffold Playwright
  Cucumber", "set up QA automation", "add feature files", "implement Page Object Model", "add step
  definitions", "configure Allure reports", "parallel test execution", "API testing with Playwright".
  Includes Page Object Model (POM), Factory pattern, Builder pattern, AAA step definitions, custom
  Playwright fixtures, and multi-browser parallel execution.
argument-hint: 'Describe what to add/modify (e.g. "add login feature", "add API step definitions")'
user-invocable: true
---

# Playwright + TypeScript + Cucumber QA Automation Framework

## When to Use
- Scaffolding a new BDD test automation framework from scratch
- Adding UI or API feature files and step definitions
- Implementing or extending Page Objects, Builders, Factories, or Fixtures
- Configuring multi-browser parallel execution or Allure/HTML reports
- Applying POM, Factory, Builder, or AAA patterns to existing test code

## Framework Directory Tree

```
<project-root>/
├── test/                        ← ALL test code lives here
│   ├── package.json             ← isolated test dependencies
│   ├── tsconfig.json
│   ├── playwright.config.ts
│   ├── cucumber.js              ← Cucumber profile routing
│   ├── features/
│   │   ├── ui/                  ← .feature files for UI tests
│   │   └── api/                 ← .feature files for API tests
│   ├── stepDefinitions/
│   │   ├── ui/
│   │   └── api/
│   ├── pages/                   ← Page Object Model (POM)
│   │   ├── BasePage.ts
│   │   └── <FeaturePage>.ts
│   ├── fixtures/
│   │   └── customFixtures.ts    ← Playwright custom fixtures / DI
│   ├── resources/
│   │   ├── testData/            ← JSON/CSV static test data
│   │   ├── env/                 ← .env.dev, .env.staging, .env.prod
│   │   ├── mocks/               ← mock API payloads
│   │   └── downloads/           ← runtime downloaded files (gitignored)
│   └── utils/
│       ├── apiClient.ts         ← typed Playwright APIRequestContext wrapper
│       ├── builders/            ← Builder pattern for test data / payloads
│       └── factories/           ← Factory pattern for page/client instantiation
├── docs/                        ← framework documentation
└── reports/                     ← HTML / Allure reports (gitignored)
```

## Procedure

### 1. Scaffold a New Framework
1. Read `./assets/package.json.tpl`, `./assets/playwright.config.ts.tpl`, and `./assets/cucumber.js.tpl`.
2. Copy templates to `test/` and fill in project-specific values (baseURL, env vars).
3. Run `cd test && npm install` to install isolated dependencies.
4. Verify installation with `npx playwright install`.

### 2. Add a New Feature (UI)
1. Create `test/features/ui/<feature>.feature` with Gherkin scenarios.
2. Create `test/pages/<FeaturePage>.ts` extending `BasePage`.
3. Register the page in `test/utils/factories/PageFactory.ts`.
4. Create `test/stepDefinitions/ui/<feature>Steps.ts` following AAA structure:
   - **Arrange**: set up preconditions in `Given` steps via fixtures or builders
   - **Act**: perform interactions in `When` steps via page objects
   - **Assert**: verify outcomes in `Then` steps

### 3. Add a New Feature (API)
1. Create `test/features/api/<feature>.feature`.
2. Add builder in `test/utils/builders/<Payload>Builder.ts` for request construction.
3. Create `test/stepDefinitions/api/<feature>Steps.ts` using `ApiClient`.

### 4. Add or Extend a Builder
- Builders use a fluent interface: `new UserBuilder().withName('Alice').withRole('admin').build()`.
- Each builder lives in `test/utils/builders/`.
- Builders must produce plain objects (or typed interfaces from `test/resources/testData/`).

### 5. Add or Extend a Fixture
- Custom fixtures extend Playwright's `test` object in `test/fixtures/customFixtures.ts`.
- Use `scope: 'test'` for per-test isolation; `scope: 'worker'` for shared state.
- Always `use(...)` the fixture value and clean up with `finally`.

### 6. Run Tests
```bash
# All tests (parallel, all browsers)
cd test && npm test

# UI tests only
cd test && npm run test:ui

# API tests only
cd test && npm run test:api

# Specific browser
cd test && npx cucumber-js --profile chromium
```

## Key Design Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| POM | `test/pages/` | Encapsulate UI selectors and interactions |
| Factory | `test/utils/factories/PageFactory.ts` | Instantiate page objects by name/type |
| Builder | `test/utils/builders/` | Construct complex test data or API payloads fluently |
| AAA | `test/stepDefinitions/` | Arrange, Act, Assert in each step method |
| Fixtures | `test/fixtures/customFixtures.ts` | DI for browser context, auth state, API clients |

## Configuration Reference

- `playwright.config.ts`: browsers, baseURL, parallel workers, output to `../reports/`
- `cucumber.js`: named profiles per browser (chromium, firefox, webkit)
- `test/resources/env/.env.example`: document all required environment variables

## Assets

Templates and boilerplate are in `./assets/` relative to this SKILL.md.
