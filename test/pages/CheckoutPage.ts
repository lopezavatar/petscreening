import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type DistanceTab = 'Address' | 'Slider' | 'Manual';
export type TipPreset = 15 | 18 | 20 | 25;

/**
 * CheckoutPage — POM for `/checkout`.
 *
 * Selector strategy: roles + accessible names + placeholders.
 * `<label>`s in the source are not associated to inputs via htmlFor, so
 * placeholders are used for the Payment fields (validated via Playwright MCP).
 */
export class CheckoutPage extends BasePage {
  get pageUrl(): string {
    return '/checkout';
  }

  // ─── Header ─────────────────────────────────────────────────────────────
  get heading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Checkout' });
  }
  get backButton(): Locator {
    return this.page.getByRole('button', { name: '← Back' });
  }

  // ─── Cart summary ───────────────────────────────────────────────────────
  get yourOrderHeader(): Locator {
    return this.page.getByText(/^Your Order \(\d+ (item|items)\)$/);
  }
  /** Per-line item row anchored on the product name paragraph. */
  cartLine(productName: string): Locator {
    return this.page.getByText(productName, { exact: true }).locator('..').locator('..');
  }
  increaseQtyButton(productName: string): Locator {
    return this.cartLine(productName).getByRole('button', { name: '+' });
  }
  removeItemButton(productName: string): Locator {
    return this.cartLine(productName).getByRole('button', { name: 'Remove' });
  }
  cartLineQty(productName: string): Locator {
    // Quantity span sits between the − and + buttons; pick the span with width-6 text.
    return this.cartLine(productName).locator('span').first();
  }
  cartLinePrice(productName: string): Locator {
    return this.cartLine(productName).locator('p').last();
  }
  /** Subtotal row inside the cart summary block. */
  get cartSubtotalAmount(): Locator {
    return this.page
      .getByText('Subtotal', { exact: true })
      .locator('..')
      .getByText(/^\$\d+(\.\d{2})?$/);
  }

  // ─── Distance / location ────────────────────────────────────────────────
  distanceTabButton(tab: DistanceTab): Locator {
    return this.page.getByRole('button', { name: tab, exact: true });
  }
  get addressInput(): Locator {
    return this.page.getByPlaceholder('Enter your address');
  }
  get lookUpButton(): Locator {
    return this.page.getByRole('button', { name: /^(Look up|Looking up\.\.\.)$/ });
  }
  /** Error paragraph rendered by useGeocoding (sibling of the address row). */
  get addressErrorMessage(): Locator {
    return this.page
      .getByText(
        /^(Please enter an address|Could not find that address\. Try a more specific location\.|Something went wrong looking up that address\. Try again\.)$/,
      )
      .first();
  }
  get distanceSlider(): Locator {
    return this.page.getByRole('slider');
  }
  /** Slider label such as "$10 base (within 10km)" or "$25 base (long-range, > 10km)". */
  get sliderRateLabel(): Locator {
    return this.page.getByText(/\$\d+ base/);
  }
  get manualDistanceInput(): Locator {
    return this.page.getByPlaceholder(/distance|km/i);
  }

  // ─── Date / time ────────────────────────────────────────────────────────
  get dateInput(): Locator {
    return this.page.locator('input[type="date"]');
  }
  get timeInput(): Locator {
    return this.page.locator('input[type="time"]');
  }
  get dateErrorMessage(): Locator {
    return this.page.getByText('This date is in the past. Delivery not available.');
  }
  get timeOutOfHoursMessage(): Locator {
    return this.page.getByText(/^Outside delivery hours \(\d+ (AM|PM) - \d+ (AM|PM)\)$/);
  }
  /** "Weekend rate applies" badge in the date/time block. */
  get weekendBadge(): Locator {
    return this.page.getByText('Weekend rate applies');
  }

  // ─── Weather toggle ─────────────────────────────────────────────────────
  get weatherClearButton(): Locator {
    return this.page.getByRole('button', { name: '☀️ Clear' });
  }
  get weatherRainButton(): Locator {
    return this.page.getByRole('button', { name: '🌧️ Raining' });
  }

  // ─── Promo code ─────────────────────────────────────────────────────────
  get promoInput(): Locator {
    return this.page.getByPlaceholder('Enter code');
  }
  get promoApplyButton(): Locator {
    return this.page.getByRole('button', { name: 'Apply', exact: true });
  }
  /** Applied-promo container (success state). */
  get appliedPromoBox(): Locator {
    return this.page.locator('text=/^✓ /').locator('..').locator('..');
  }
  get appliedPromoRemoveButton(): Locator {
    return this.appliedPromoBox.getByRole('button', { name: 'Remove' });
  }
  get promoErrorMessage(): Locator {
    // ValidationError renders the message text; match against known wording.
    return this.page
      .getByText(
        /^(Please enter a promo code|Invalid promo code|Minimum order \$\d+ required.*|This code expired on .+)$/,
      )
      .first();
  }

  // ─── Tip ────────────────────────────────────────────────────────────────
  tipPresetButton(pct: TipPreset): Locator {
    return this.page.getByRole('button', { name: `${pct}%`, exact: true });
  }
  get tipCustomButton(): Locator {
    return this.page.getByRole('button', { name: 'Custom', exact: true });
  }
  get tipNoneButton(): Locator {
    return this.page.getByRole('button', { name: 'No tip', exact: true });
  }
  get tipCustomInput(): Locator {
    return this.page.getByPlaceholder('0.00');
  }
  get tipErrorMessage(): Locator {
    return this.page
      .getByText(
        /^(Tip cannot be negative|Maximum tip is \$\d+|Please enter a valid amount)$/,
      )
      .first();
  }

  // ─── Order summary ──────────────────────────────────────────────────────
  /** "Order Summary" container (the billing breakdown card). */
  get summaryCard(): Locator {
    return this.page.getByText('Order Summary', { exact: true }).locator('..');
  }
  /** A single leaf row inside the summary card (label span + amount span). */
  summaryRow(labelRegex: RegExp): Locator {
    return this.summaryCard
      .locator('div:has(> span.font-medium)')
      .filter({ hasText: labelRegex });
  }
  summaryLineAmount(labelRegex: RegExp): Locator {
    return this.summaryRow(labelRegex).locator('span.font-medium');
  }
  /** "Total" big amount in the summary footer. */
  get summaryTotal(): Locator {
    return this.summaryCard.getByText(/^\$\d+\.\d{2}$/).last();
  }

  // ─── Payment ────────────────────────────────────────────────────────────
  get cardholderInput(): Locator {
    return this.page.getByPlaceholder('J. Doe');
  }
  get cardNumberInput(): Locator {
    return this.page.getByPlaceholder('4242 4242 4242 4242');
  }
  get expiryInput(): Locator {
    return this.page.getByPlaceholder('MM / YY');
  }
  get cvvInput(): Locator {
    return this.page.getByPlaceholder('123', { exact: true });
  }

  // ─── Place order ────────────────────────────────────────────────────────
  get placeOrderButton(): Locator {
    return this.page.getByRole('button', { name: 'PLACE ORDER' });
  }

  // ─── Contract ───────────────────────────────────────────────────────────
  async assertPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  // ─── High-level actions ─────────────────────────────────────────────────
  async selectDistanceTab(tab: DistanceTab): Promise<void> {
    await this.distanceTabButton(tab).click();
  }

  async setSliderDistance(km: number): Promise<void> {
    await this.selectDistanceTab('Slider');
    await this.distanceSlider.fill(String(km));
  }

  async lookUpAddress(address: string): Promise<void> {
    await this.selectDistanceTab('Address');
    await this.addressInput.fill(address);
    await this.lookUpButton.click();
  }

  async setDate(yyyyMmDd: string): Promise<void> {
    await this.dateInput.fill(yyyyMmDd);
  }

  async setTime(hhMm: string): Promise<void> {
    await this.timeInput.fill(hhMm);
  }

  async applyPromo(code: string): Promise<void> {
    await this.promoInput.fill(code);
    await this.promoApplyButton.click();
  }

  async fillPayment(): Promise<void> {
    await this.cardholderInput.fill('J. Doe');
    await this.cardNumberInput.fill('4242424242424242');
    await this.expiryInput.fill('1230');
    await this.cvvInput.fill('123');
  }
}
