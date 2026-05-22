import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortLabel =
  | 'Popularity'
  | 'Name: A-Z'
  | 'Name: Z-A'
  | 'Price: Low to High'
  | 'Price: High to Low';

export type CategoryLabel = 'All' | 'Fruit' | 'Cream' | 'Savory' | 'Seasonal';

/**
 * HomePage — POM for `/` (catalog landing).
 *
 * Selector strategy: roles + accessible names (validated via Playwright MCP
 * against the running app — no `data-testid` attributes exist in source).
 */
export class HomePage extends BasePage {
  get pageUrl(): string {
    return '/';
  }

  // ─── Header ───────────────────────────────────────────────────────────────
  get logo(): Locator {
    return this.page.getByRole('link', { name: 'Pie In The Sky' });
  }
  get signInLink(): Locator {
    return this.page.getByRole('link', { name: 'Sign In' });
  }
  /** Tier badge button (authenticated). Renders tier initial + first name (CSS uppercases the initial). */
  get tierBadgeButton(): Locator {
    return this.page.getByRole('button').filter({ hasText: /(Bronze|Silver|Gold|Platinum)/i }).first();
  }
  get cartShortcut(): Locator {
    // Cart shortcut is the link to /checkout in the header (only when itemCount > 0).
    return this.page.locator('a[href="/checkout"]').first();
  }
  get cartShortcutCount(): Locator {
    return this.cartShortcut.locator('span').first();
  }

  // ─── Hero ─────────────────────────────────────────────────────────────────
  get heroHeading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Fresh Pies, Delivered by Drone' });
  }

  // ─── Toolbar ──────────────────────────────────────────────────────────────
  get filtersToggle(): Locator {
    return this.page.getByRole('button', { name: /^Filters/ });
  }
  /** "N pies" / "1 pie" counter next to filters toggle. */
  get pieCounter(): Locator {
    return this.page.getByText(/^\d+ (pie|pies)$/);
  }
  get sortDropdownButton(): Locator {
    // Single button whose visible text is one of the sort labels.
    return this.page
      .getByRole('button', {
        name: /^(Popularity|Name: A-Z|Name: Z-A|Price: Low to High|Price: High to Low)$/,
      })
      .first();
  }

  // ─── Filter panel ─────────────────────────────────────────────────────────
  categoryChip(label: CategoryLabel): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^${label}$`) });
  }
  get minPriceInput(): Locator {
    return this.page.getByPlaceholder('Min');
  }
  get maxPriceInput(): Locator {
    return this.page.getByPlaceholder('Max');
  }
  get inStockToggle(): Locator {
    return this.page.getByRole('switch');
  }
  get clearFiltersButton(): Locator {
    return this.page.getByRole('button', { name: 'Clear All Filters' });
  }

  // ─── Product grid ─────────────────────────────────────────────────────────
  /** Each card is rendered as an h3 by PieCard; use it as a card anchor. */
  get productCards(): Locator {
    return this.page.getByRole('heading', { level: 3 });
  }
  productCard(name: string): Locator {
    return this.page.getByRole('heading', { level: 3, name }).locator('..').locator('..');
  }
  addButtonFor(name: string): Locator {
    return this.productCard(name).getByRole('button', { name: 'Add' });
  }
  get noResultsMessage(): Locator {
    return this.page.getByText('No pies match your filters');
  }

  // ─── Pagination ───────────────────────────────────────────────────────────
  get previousPageButton(): Locator {
    return this.page.getByRole('button', { name: 'Previous page' });
  }
  get nextPageButton(): Locator {
    return this.page.getByRole('button', { name: 'Next page' });
  }
  pageButton(n: number): Locator {
    return this.page.getByRole('button', { name: `Page ${n}` });
  }

  // ─── Sticky cart drawer ───────────────────────────────────────────────────
  /** Items-in-cart line in the sticky drawer (matches "1 item in cart" / "N items in cart"). */
  get cartDrawerItemsText(): Locator {
    return this.page.getByText(/^\d+ (item|items) in cart$/);
  }
  /** Subtotal — the $XX.XX line inside the cart drawer (paragraph). */
  get cartDrawerSubtotal(): Locator {
    return this.cartDrawerItemsText.locator('..').locator('p').nth(1);
  }
  get cartDrawerCheckoutButton(): Locator {
    return this.page.getByRole('button', { name: 'Checkout' });
  }

  // ─── High-level contract ──────────────────────────────────────────────────
  async assertPageLoaded(): Promise<void> {
    await expect(this.heroHeading).toBeVisible();
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  async openFiltersPanel(): Promise<void> {
    if (!(await this.inStockToggle.isVisible().catch(() => false))) {
      await this.filtersToggle.click();
      await expect(this.inStockToggle).toBeVisible();
    }
  }

  async selectSort(label: SortLabel): Promise<void> {
    await this.sortDropdownButton.click();
    await this.page.getByRole('button', { name: label }).click();
  }

  async addProductToCart(name: string): Promise<void> {
    await this.addButtonFor(name).click();
  }

  async getVisibleProductNames(): Promise<string[]> {
    return (await this.productCards.allTextContents()).map((t) => t.trim());
  }

  async getVisibleProductPrices(): Promise<number[]> {
    const priceTexts = await this.page
      .locator('main')
      .locator('text=/^\\$\\d+(\\.\\d{2})?$/')
      .allTextContents();
    return priceTexts.map((t) => parseFloat(t.replace('$', '')));
  }

  async getPieCounterValue(): Promise<number> {
    const text = (await this.pieCounter.textContent()) ?? '';
    return parseInt(text, 10);
  }
}
