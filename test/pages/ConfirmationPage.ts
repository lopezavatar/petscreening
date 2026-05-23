import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ConfirmationPage — POM for `/confirmation`.
 *
 * Selector strategy: roles + accessible names + stable text patterns.
 * All locators validated against the live DOM via Playwright MCP.
 *
 * AAA note: business / acceptance-criteria assertions belong in step definitions.
 * Only `assertPageLoaded` (page-contract) lives here.
 */
export class ConfirmationPage extends BasePage {
  get pageUrl(): string {
    return '/confirmation';
  }

  async assertPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  // ─── Heading ─────────────────────────────────────────────────────────────

  get heading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Your pie is on its way!' });
  }

  // ─── Order ID ────────────────────────────────────────────────────────────

  /** The order ID value text (e.g. "PITS-20260522-9W76"). */
  get orderIdText(): Locator {
    return this.page.getByText(/^PITS-\d{8}-[A-Z0-9]{4}$/);
  }

  // ─── Item summary ────────────────────────────────────────────────────────

  /** Paragraph: "{N} {ProductName}, flying to you by drone." (single product)
   *  or "{N} items, flying to you by drone." (multiple products). */
  get itemSummaryText(): Locator {
    return this.page.getByText(/flying to you by drone\./);
  }

  // ─── Delivery detail rows ────────────────────────────────────────────────

  /**
   * For each "label / value" flex row in the delivery details block, returns
   * the value span (second child of the row's parent div).
   *
   * DOM structure:
   *   <div class="flex justify-between">
   *     <span>{labelText}</span>
   *     <span class="font-medium">{value}</span>
   *   </div>
   */
  private detailRowValue(labelText: string): Locator {
    return this.page
      .getByText(labelText, { exact: true })
      .locator('xpath=..')
      .locator('span')
      .last();
  }

  get deliveryToValue(): Locator {
    return this.detailRowValue('Delivery to');
  }

  get distanceValue(): Locator {
    return this.detailRowValue('Distance');
  }

  get scheduledValue(): Locator {
    return this.detailRowValue('Scheduled');
  }

  // ─── Order summary ───────────────────────────────────────────────────────

  /** Returns the label element of any summary line item matching `pattern`. */
  summaryLineLabel(pattern: string | RegExp): Locator {
    return this.page.getByText(pattern, { exact: typeof pattern === 'string' });
  }

  /** Any "member discount" line (e.g. "Silver member discount (5%)"). */
  get memberDiscountLine(): Locator {
    return this.page.getByText(/member discount/i);
  }

  /** Grand total amount (e.g. "$58.00") next to the "Total" label. */
  get totalAmount(): Locator {
    return this.page
      .getByText('Total', { exact: true })
      .locator('xpath=..')
      .getByText(/^\$[\d,]+\.\d{2}$/);
  }

  // ─── CTAs ─────────────────────────────────────────────────────────────────

  get trackOrderButton(): Locator {
    return this.page.getByRole('button', { name: 'Track Your Order' });
  }

  get placeAnotherOrderButton(): Locator {
    return this.page.getByRole('button', { name: 'Place another order' });
  }
}
