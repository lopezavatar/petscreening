# QA Automation — Test Execution Guide

This folder contains the Playwright + TypeScript + Cucumber BDD test automation framework for Pie in the Sky.

The current automation framework was partially developed with the help of AI.
My process to develop this application was:

Initially I did some exploratory testing on the application to understand how it works, which modules are available and which apis exits.

Afterwords I created a skill to generate the initial set up of the repository with the structure I normally use for my automation framework,
I selected the design patterns I normally used taking into consideration the framework that I usually create then I checked that the framework and tools selected matched my expectation.

After that I started doing a list of the functionalities I encountered during my exploratory testing. I passed my .txt draft to an AI and asked it to generate a requirement tracebility matrix with them and asked it to validate it using AI and to expand on it if necesary. 

Once the RTM was created I started developing another skill to develop the tests using AI from the previously created RTM this helped me accelerate a process that manually would have take me longer. After that it was a back and forth process of checking the implementations the AI was doing and checking that the code made sense and was implemented in a good way in several cases I had to manually modify steps or parts of the code that were a bit redundat.

After that I started adding modules that were needed such as session storage, logging, reporting, etc.

For APIs I followed a similar process.

As an extra I added an interesting agent that works as a hook after failing scenrarios and does an analysis on the and checks if the test failed due to an actual error or because of my test, if it is an actual issue it will create an issue in my project with the bug.

For unit and integration testing I used Vitest and although I encourage developers to get involved specially with unit tests since they are the ones who know the logic of the functions they create I am able to implement them and understand their behaviour.

As a conclusion I hope you find this approach interesting and as it might seem that AI did most of it I believe that as with every technology the important part is to know how to use and having the capacity of rational to understand what it is actually doing and be the gatekeeper by challanging and complimenting what is generated with the knowledge aquired through the years.

In any case I would like to hear your feedback and if you have any doubts you can reach out through Remotely or @ cristian.lopam@aol.com

---

## Prerequisites

```bash
# Install dependencies (also installs Playwright browsers via postinstall)
cd test
npm install
```

Make sure the application is running locally before executing UI tests:

```bash
# From the project root
npm run dev   # starts Next.js on http://localhost:3000
```

---

## UI Tests

UI tests are located in `features/ui/` and exercise the application through a real browser (Chromium by default).

```bash
# Run all UI tests (headless)
npm run test:ui

# Run all UI tests in a visible browser window
npm run test:headed

# Run UI tests filtered by tag
npx cucumber-js --profile ui --tags "@smoke"
npx cucumber-js --profile ui --tags "@tracking and not @known-bug"
```

### Browser-specific runs

```bash
npm run test:chromium   # Chromium
npm run test:firefox    # Firefox
npm run test:webkit     # WebKit / Safari
```

### Reports

After each UI run an HTML report is generated at:

```
reports/cucumber-ui-report.html
```

---

## API Tests

API tests are located in `features/api/` and interact directly with the application's API endpoints without a browser.

```bash
# Run all API tests
npm run test:api

# Run API tests filtered by tag
npx cucumber-js --profile api --tags "@products"
```

### Reports

After each API run an HTML report is generated at:

```
reports/cucumber-api-report.html
```

---

## All Tests (UI + API)

```bash
# Run every feature file with the default profile (Chromium, 3 parallel workers)
npm run test

# Run all tests with higher parallelism (4 workers)
npm run test:parallel
```

Combined reports are written to:

```
reports/cucumber-report.html
reports/cucumber-report.json
```

---

## Allure Reports

Allure results are collected automatically on every run. To generate and open the interactive report:

```bash
npm run report:allure
```

> The `pretest` hook cleans previous Allure results before each run to avoid stale data.

---

## Unit & Integration Tests

Unit and integration tests live in the **project root** (`src/`) and are powered by [Vitest](https://vitest.dev/). They do **not** require the application to be running.

```bash
# From the project root (not the test/ folder)
cd ..

# Run all unit and integration tests once
npm test

# Run in watch mode (re-runs on file change)
npm run test:watch
```

Test files follow the pattern `src/**/*.test.ts` / `src/**/*.test.tsx`.

| File | Type | What it covers |
|---|---|---|
| `src/lib/__tests__/loyalty.test.ts` | Unit | Loyalty tier logic, points calculation, discounts |
| `src/lib/__tests__/integration.test.ts` | Integration | Billing + loyalty + promo codes + rewards end-to-end |

---

## Environment Configuration

Environment variables are loaded from `test/resources/env/`. Copy the appropriate file and adjust values as needed:

```
test/resources/env/.env.dev     ← default local environment
test/resources/env/.env.staging
test/resources/env/.env.prod
```

Override the active environment at runtime:

```bash
TEST_ENV=staging npm run test:ui
```

---

## AI-Assisted Failure Analysis

When the `AI_ISSUE_CREATION` flag is set, failed scenarios are analysed automatically and GitHub issues can be created:

```bash
npm run test:ai       # all tests with AI analysis
npm run test:ai:ui    # UI tests with AI analysis
npm run test:ai:api   # API tests with AI analysis
```
