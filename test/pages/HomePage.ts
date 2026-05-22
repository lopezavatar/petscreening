import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage — Page Object for the application home / catalogue page.
 *
 * Encapsulates all selectors and interactions for this page.
 * Step definitions call these high-level methods; they never use
 * raw Playwright selectors directly.
 */
export class HomePage extends BasePage {
  // ─── Locators (private, lazy) ─────────────────────────────────────────────
  private get searchInput(): Locator {
    return this.page.getByRole('searchbox', { name: /search/i });
  }

  private get searchButton(): Locator {
    return this.page.getByRole('button', { name: /search/i });
  }

  private get productCards(): Locator {
    return this.page.locator('[data-testid="product-card"]');
  }

  private get pageHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  // ─── Page contract ────────────────────────────────────────────────────────

  get pageUrl(): string {
    return '/';
  }

  async assertPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
  }

  // ─── Actions (Act layer) ──────────────────────────────────────────────────

  async searchForProduct(query: string): Promise<void> {
    await this.fillField(this.searchInput, query);
    await this.clickElement(this.searchButton);
    await this.waitForPageLoad();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async selectProductByName(name: string): Promise<void> {
    await this.page
      .locator('[data-testid="product-card"]', { hasText: name })
      .first()
      .click();
    await this.waitForPageLoad();
  }

  // ─── Assertions (Assert layer helpers) ───────────────────────────────────

  async assertProductVisible(name: string): Promise<void> {
    await expect(
      this.page.locator('[data-testid="product-card"]', { hasText: name }).first()
    ).toBeVisible();
  }

  async assertSearchResultsNotEmpty(): Promise<void> {
    const count = await this.getProductCount();
    expect(count).toBeGreaterThan(0);
  }
}
