import { Page, Locator } from '@playwright/test';

/**
 * BasePage — root of the Page Object Model hierarchy.
 *
 * Every concrete page class must extend BasePage. It centralises:
 * - Navigation helpers
 * - Shared wait strategies
 * - Logging / error context
 *
 * AAA note: Page Objects encapsulate the *Act* layer.
 * They expose high-level action methods (clickLogin, fillSearch…)
 * not raw Playwright calls, so step definitions stay readable.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Shared interaction helpers ───────────────────────────────────────────

  protected async clickElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  protected async fillField(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  protected async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) ?? '';
  }

  // ─── Abstract contract ────────────────────────────────────────────────────

  /**
   * Each page must declare the URL segment it represents.
   * Used by PageFactory to validate navigation state.
   */
  abstract get pageUrl(): string;

  /**
   * Assert that the page is fully loaded and the correct one is displayed.
   * Called automatically by PageFactory after instantiation.
   */
  abstract assertPageLoaded(): Promise<void>;
}
