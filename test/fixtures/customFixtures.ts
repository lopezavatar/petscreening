import { test as base, Browser, BrowserContext, Page, APIRequestContext, request } from '@playwright/test';
import { PageFactory } from '../utils/factories/PageFactory';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars (TEST_ENV defaults to 'dev')
const ENV = process.env.TEST_ENV ?? 'dev';
dotenv.config({ path: path.resolve(__dirname, `../resources/env/.env.${ENV}`) });

// ─── Fixture type declarations ────────────────────────────────────────────────

export type CustomFixtures = {
  /** Authenticated browser context (stores auth state per worker) */
  authenticatedContext: BrowserContext;

  /** Unauthenticated page — lightweight, no auth setup */
  guestPage: Page;

  /** Playwright APIRequestContext pointed at BASE_URL */
  apiContext: APIRequestContext;

  /** PageFactory scoped to the current test's page */
  pageFactory: PageFactory;
};

// ─── Custom fixture definitions ───────────────────────────────────────────────

/**
 * customTest — extends Playwright's base `test` with project-specific fixtures.
 *
 * Usage in step definitions:
 *   import { customTest as test } from '../fixtures/customFixtures';
 *   test('...', async ({ pageFactory, apiContext }) => { ... });
 *
 * Fixtures follow the Arrange–Act–Assert principle:
 *   - Fixture setup = Arrange
 *   - Test body = Act + Assert
 *   - Fixture teardown (after use()) = cleanup
 */
export const customTest = base.extend<CustomFixtures>({

  // ── Authenticated context ─────────────────────────────────────────────────
  authenticatedContext: async ({ browser }: { browser: Browser }, use: (ctx: BrowserContext) => Promise<void>) => {
    // ARRANGE: create a fresh browser context with stored auth state if available
    const storageStatePath = path.resolve(__dirname, '../resources/env/auth-state.json');
    let context: BrowserContext;

    try {
      context = await browser.newContext({ storageState: storageStatePath });
    } catch {
      // No saved state yet — create a plain context
      context = await browser.newContext();
    }

    await use(context);

    // Teardown
    await context.close();
  },

  // ── Guest page (no auth) ──────────────────────────────────────────────────
  guestPage: async ({ browser }: { browser: Browser }, use: (page: Page) => Promise<void>) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await use(page);

    await page.close();
    await context.close();
  },

  // ── API request context ───────────────────────────────────────────────────
  apiContext: async ({}, use: (ctx: APIRequestContext) => Promise<void>) => {
    const apiCtx = await request.newContext({
      baseURL: process.env.API_BASE_URL ?? process.env.BASE_URL ?? 'http://localhost:3000',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    await use(apiCtx);

    await apiCtx.dispose();
  },

  // ── PageFactory ───────────────────────────────────────────────────────────
  pageFactory: async ({ authenticatedContext }: { authenticatedContext: BrowserContext }, use: (factory: PageFactory) => Promise<void>) => {
    const page = await authenticatedContext.newPage();
    const factory = new PageFactory(page);

    await use(factory);

    await page.close();
  },
});

export { expect } from '@playwright/test';
