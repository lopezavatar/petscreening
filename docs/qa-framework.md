# QA Automation Framework

Playwright · TypeScript · Cucumber (Gherkin) · Allure Reports

## Quick Start

```bash
# 1. Install test dependencies (isolated from main app)
cd test
npm install

# 2. Install Playwright browsers
npx playwright install

# 3. Copy and fill env vars
cp resources/env/.env.example resources/env/.env.dev

# 4. Run all tests (Chromium, headless)
npm test

# 5. Run UI tests only
npm run test:ui

# 6. Run API tests only
npm run test:api

# 7. Generate Allure report
npm run report:allure
```

## Directory Structure

```
test/
├── package.json             isolated test dependencies
├── tsconfig.json
├── playwright.config.ts     browser config, output dirs, parallelism
├── cucumber.js              named Cucumber profiles per browser/scope
├── features/
│   ├── ui/                  Gherkin feature files for UI flows
│   └── api/                 Gherkin feature files for API flows
├── stepDefinitions/
│   ├── ui/                  step implementations for UI features
│   └── api/                 step implementations for API features
├── pages/
│   ├── BasePage.ts          abstract root of POM hierarchy
│   └── *.ts                 concrete page objects
├── fixtures/
│   └── customFixtures.ts    Playwright fixtures + DI
├── resources/
│   ├── testData/            static JSON/CSV test data
│   ├── env/                 .env.* environment files
│   ├── mocks/               mock API response payloads
│   └── downloads/           runtime file downloads (git-ignored)
└── utils/
    ├── apiClient.ts         typed Playwright API client
    ├── builders/            Builder pattern (UserBuilder, OrderBuilder…)
    └── factories/           Factory pattern (PageFactory…)

docs/                        this documentation
reports/                     generated HTML/Allure reports (git-ignored)
```

## Design Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **POM** | `test/pages/` | Isolates selectors; step defs stay readable |
| **Factory** | `test/utils/factories/` | Single place to instantiate page objects |
| **Builder** | `test/utils/builders/` | Fluent, readable test data construction |
| **AAA** | `test/stepDefinitions/` | `Given`=Arrange, `When`=Act, `Then`=Assert |
| **Fixtures** | `test/fixtures/` | Dependency injection; clean setup/teardown |

## Adding a New Feature

1. Write `test/features/ui/<name>.feature` with Gherkin scenarios.
2. Create `test/pages/<Name>Page.ts` extending `BasePage`.
3. Register it in `test/utils/factories/PageFactory.ts`.
4. Add step defs in `test/stepDefinitions/ui/<name>Steps.ts`.

## Execution Profiles

| Command | Profile | Browsers |
|---------|---------|----------|
| `npm test` | default | Chromium |
| `npm run test:ui` | ui | Chromium |
| `npm run test:api` | api | Chromium (no browser) |
| `npm run test:parallel` | parallel | Chromium (4 workers) |
| `npx cucumber-js --profile firefox` | firefox | Firefox |
| `npx cucumber-js --profile webkit` | webkit | WebKit/Safari |

## Reports

After a test run, reports are written to `../reports/`:

- `reports/cucumber-report.html` — default HTML report
- `reports/allure-results/` — raw Allure data; run `npm run report:allure` to render
- `reports/playwright-html/` — Playwright HTML report (direct Playwright runs)
- `reports/test-results/` — screenshots, videos, traces on failure
