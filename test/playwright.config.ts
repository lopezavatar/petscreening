import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment-specific variables from test/resources/env/
const ENV = process.env.TEST_ENV ?? 'dev';
dotenv.config({ path: path.resolve(__dirname, `resources/env/.env.${ENV}`) });

/**
 * playwright.config.ts
 *
 * This config is used when running Playwright directly (e.g. for individual
 * spec validation). For full BDD execution, Cucumber orchestrates test runs
 * via cucumber.js profiles and calls Playwright APIs through custom fixtures.
 *
 * Reports and artifacts are always written to ../reports/ (project root).
 */
export default defineConfig({
  // ─── Global test settings ────────────────────────────────────────────────
  testDir: './',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // ─── Parallel execution ───────────────────────────────────────────────────
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 1 : 0,

  // ─── Output directories (relative to this config file → inside test/) ────
  outputDir: '../reports/test-results',

  // ─── Reporters ────────────────────────────────────────────────────────────
  reporter: [
    ['list'],
    ['html', { outputFolder: '../reports/playwright-html', open: 'never' }],
    ['json', { outputFile: '../reports/playwright-results.json' }],
  ],

  // ─── Shared browser settings ──────────────────────────────────────────────
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    headless: process.env.PWHEADLESS !== 'false',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  // ─── Projects — one per target browser ───────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports (optional — uncomment to enable)
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
});
