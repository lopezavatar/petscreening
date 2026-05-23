import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * TrackingPage — POM for `/tracking/{orderId}`.
 *
 * Covers two states:
 *  - Found: order exists in sessionStorage for the given orderId.
 *  - Not-found: no matching order → "Order not found" panel.
 *
 * Selectors validated against the live DOM via Playwright MCP snapshot.
 * App ships no data-testids; selectors use roles + accessible names + stable text.
 *
 * AAA note: page-contract assertions only (`assertPageLoaded`, `assertNotFoundLoaded`).
 * Business acceptance assertions belong in step definitions.
 */
export class TrackingPage extends BasePage {
  get pageUrl(): string {
    return '/tracking';
  }

  trackingUrlFor(orderId: string): string {
    return `/tracking/${orderId}`;
  }

  async assertPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  async assertNotFoundLoaded(): Promise<void> {
    await expect(this.notFoundMessage).toBeVisible({ timeout: 10_000 });
  }

  // ─── Found state ─────────────────────────────────────────────────────────

  /** H1 "Track Your Order" */
  get heading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Track Your Order' });
  }

  /** The order-ID monospace text inside the badge (e.g. "PITS-20260522-T3ST") */
  get orderIdBadge(): Locator {
    return this.page.getByText(/^PITS-\d{8}-[A-Z0-9]{4}$/);
  }

  /** "← Back to menu" button */
  get backToMenuButton(): Locator {
    return this.page.getByRole('button', { name: '← Back to menu' });
  }

  /** "X km remaining" text in the map area */
  get kmRemainingText(): Locator {
    return this.page.getByText(/\d+(\.\d+)?\s*km remaining/);
  }

  /** "Estimated arrival" label paragraph */
  get estimatedArrivalLabel(): Locator {
    return this.page.getByText('Estimated arrival', { exact: true });
  }

  /**
   * ETA value paragraph (e.g. "10 min" or "Now").
   * Validated locator: paragraph directly after the "Estimated arrival" paragraph.
   */
  get etaValue(): Locator {
    return this.page.getByText(/^\d+ min$|^Now$/);
  }

  /**
   * Progress percentage display (e.g. "0%", "42%").
   * Located in the left-side of the flex row below the progress bar.
   */
  get progressPercentageText(): Locator {
    return this.page.getByText(/^\d+%$/);
  }

  /**
   * Status label displayed in the progress bar row (right side, e.g. "Preparing").
   * This is distinct from the timeline step labels.
   */
  get progressStatusLabel(): Locator {
    // The status label sits in the flex row alongside the progress percentage.
    // Both share the same parent generic element; the status label is the last span.
    return this.page
      .getByText(/^\d+%$/)
      .locator('xpath=..')
      .locator('span')
      .last();
  }

  /**
   * All status step labels rendered in the timeline
   * ("Preparing", "Dispatched", "In Flight", "Arriving", "Delivered").
   */
  get timelineStatusLabels(): Locator {
    return this.page.getByText(
      /^(Preparing|Dispatched|In Flight|Arriving|Delivered)$/,
    );
  }

  /** A specific timeline status step by its label text. */
  timelineStep(label: 'Preparing' | 'Dispatched' | 'In Flight' | 'Arriving' | 'Delivered'): Locator {
    return this.page.getByText(label, { exact: true }).first();
  }

  /** "Order Summary" section heading (h2) */
  get orderSummaryHeading(): Locator {
    return this.page.getByRole('heading', { level: 2, name: 'Order Summary' });
  }

  /**
   * Returns the locator for an order line item matching the given product name
   * and quantity pattern (e.g. "Cherry Pie × 2").
   */
  orderLineItem(productName: string, quantity: number): Locator {
    return this.page.getByText(`${productName} × ${quantity}`, { exact: true });
  }

  /** "Delivery to" label in the order summary footer */
  get deliveryToLabel(): Locator {
    return this.page.getByText('Delivery to', { exact: true });
  }

  /** "Need help with your order?" disclosure button */
  get helpButton(): Locator {
    return this.page.getByRole('button', { name: 'Need help with your order?' });
  }

  // ─── Not-found state ─────────────────────────────────────────────────────

  /** "Order not found" paragraph (not-found state) */
  get notFoundMessage(): Locator {
    return this.page.getByText('Order not found', { exact: true });
  }

  /** "Return to menu" button (not-found state) */
  get returnToMenuButton(): Locator {
    return this.page.getByRole('button', { name: 'Return to menu' });
  }
}
