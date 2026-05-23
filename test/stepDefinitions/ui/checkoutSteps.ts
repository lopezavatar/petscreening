import { Before, Given, When, Then } from '@cucumber/cucumber';
import { Page, expect, Route } from '@playwright/test';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { loginAs, type Tier } from '../../utils/auth';
import { CustomWorld } from '../../world/CustomWorld';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  popularity: number;
}

interface CartItem {
  product: ProductDto;
  quantity: number;
}

interface CheckoutWorld extends CustomWorld {
  checkout?: CheckoutPage;
  /** Full product catalog snapshot from /api/products. */
  catalog?: ProductDto[];
  /** Subtotal of the seeded cart in dollars (sum of price × qty). */
  cartSubtotal?: number;
  /** Names of products currently in the cart (in seed order). */
  cartProductNames?: string[];
  /** Captured delivery cost baseline for FREEDELIVERY scenario. */
  baselineDeliveryCost?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pageOf(world: CheckoutWorld): Page {
  if (!world.page) throw new Error('Page not initialised');
  return world.page;
}

function checkoutPage(world: CheckoutWorld): CheckoutPage {
  if (!world.checkout) throw new Error('CheckoutPage not initialised');
  return world.checkout;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Date string for the next Monday strictly after today (local time). */
function nextMondayString(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0); // avoid DST edge
  const dow = d.getDay(); // 0=Sun .. 6=Sat
  const add = ((1 - dow + 7) % 7) || 7;
  d.setDate(d.getDate() + add);
  return isoDate(d);
}

/** Date string for the next Saturday strictly after today. */
function nextSaturdayString(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const dow = d.getDay();
  const add = ((6 - dow + 7) % 7) || 7;
  d.setDate(d.getDate() + add);
  return isoDate(d);
}

function yesterdayString(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return isoDate(d);
}

/** Seed a cart in sessionStorage and open /checkout via the cart drawer to
 *  avoid the empty-cart redirect race. */
async function seedCartAndOpenCheckout(
  world: CheckoutWorld,
  items: CartItem[],
): Promise<void> {
  const page = pageOf(world);
  await page.goto(world.baseUrl! + '/', { waitUntil: 'networkidle' });
  await page.evaluate((cartJson) => {
    sessionStorage.setItem('pits_cart', cartJson);
  }, JSON.stringify({ items }));
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.waitForURL('**/checkout');
  await checkoutPage(world).assertPageLoaded();
  world.cartSubtotal = items.reduce(
    (sum, it) => sum + it.product.price * it.quantity,
    0,
  );
  world.cartProductNames = items.map((it) => it.product.name);
}

function cheapestInStock(world: CheckoutWorld): ProductDto {
  const c = world.catalog;
  if (!c) throw new Error('Catalog not snapshot');
  const available = c.filter((p) => p.available);
  return [...available].sort((a, b) => a.price - b.price)[0];
}

function nthDistinctInStock(world: CheckoutWorld, n: number): ProductDto {
  const c = world.catalog;
  if (!c) throw new Error('Catalog not snapshot');
  const available = c.filter((p) => p.available);
  return available[n];
}

function syntheticProduct(priceUsd: number, idSuffix: string): ProductDto {
  return {
    id: `synthetic-${idSuffix}`,
    name: `Synthetic Item ${idSuffix}`,
    description: 'Test fixture',
    price: priceUsd,
    image: '/icon-pie.svg',
    category: 'fruit',
    available: true,
    popularity: 50,
  };
}

// ─── Hooks ──────────────────────────────────────────────────────────────────
// Shared browser launch/close lives in hooks/browserHook.ts. This hook only
// builds the CheckoutPage and snapshots the catalog once per scenario.

Before({ tags: '@checkout' }, async function (this: CheckoutWorld) {
  this.checkout = this.factory!.create('checkout');
  const res = await this.page!.request.get(this.baseUrl + '/api/products');
  if (res.status() !== 200) throw new Error(`catalog snapshot failed: ${res.status()}`);
  this.catalog = (await res.json()) as ProductDto[];
});

// ─── Given (Arrange) ────────────────────────────────────────────────────────

Given('I navigate directly to \\/checkout with no cart', async function (this: CheckoutWorld) {
  const page = pageOf(this);
  await page.goto(this.baseUrl! + '/checkout', { waitUntil: 'networkidle' });
});

Given(
  'I open checkout with 1 of the cheapest in-stock product',
  async function (this: CheckoutWorld) {
    const product = cheapestInStock(this);
    await seedCartAndOpenCheckout(this, [{ product, quantity: 1 }]);
  },
);

Given(
  'I open checkout with 2 different in-stock products',
  async function (this: CheckoutWorld) {
    const a = nthDistinctInStock(this, 0);
    const b = nthDistinctInStock(this, 1);
    await seedCartAndOpenCheckout(this, [
      { product: a, quantity: 1 },
      { product: b, quantity: 1 },
    ]);
  },
);

Given(
  'I open checkout with a synthetic ${float} cart',
  async function (this: CheckoutWorld, amount: number) {
    const product = syntheticProduct(amount, String(amount).replace('.', '-'));
    await seedCartAndOpenCheckout(this, [{ product, quantity: 1 }]);
  },
);

Given(
  'I open checkout as a guest with 1 of the cheapest in-stock product',
  async function (this: CheckoutWorld) {
    const product = cheapestInStock(this);
    await seedCartAndOpenCheckout(this, [{ product, quantity: 1 }]);
  },
);

Given(
  'I open checkout as a {string} tier user with 1 of the cheapest in-stock product',
  async function (this: CheckoutWorld, tier: string) {
    await loginAs(pageOf(this), tier as Tier, this.baseUrl!);
    const product = cheapestInStock(this);
    await seedCartAndOpenCheckout(this, [{ product, quantity: 1 }]);
  },
);

Given(
  'the geocoding API is mocked to return a location {int} km from the kitchen',
  async function (this: CheckoutWorld, km: number) {
    // 1 degree latitude ≈ 111 km
    const deltaLat = km / 111;
    const lat = 34.0407 + deltaLat;
    const lon = -118.2468;
    await pageOf(this).route('**/nominatim.openstreetmap.org/**', (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { lat: String(lat), lon: String(lon), display_name: 'Mocked Address, Los Angeles, CA' },
        ]),
      }),
    );
  },
);

Given('the geocoding API is mocked to return no results', async function (this: CheckoutWorld) {
  await pageOf(this).route('**/nominatim.openstreetmap.org/**', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
});

Given('I set the slider distance to {float}', async function (this: CheckoutWorld, km: number) {
  await checkoutPage(this).setSliderDistance(km);
});

Given('I set the delivery date to yesterday', async function (this: CheckoutWorld) {
  await checkoutPage(this).setDate(yesterdayString());
});

Given('I set the delivery date to the next Monday', async function (this: CheckoutWorld) {
  await checkoutPage(this).setDate(nextMondayString());
});

Given('I set the delivery date to the next Saturday', async function (this: CheckoutWorld) {
  await checkoutPage(this).setDate(nextSaturdayString());
});

Given('I set the delivery time to {string}', async function (this: CheckoutWorld, hhMm: string) {
  await checkoutPage(this).setTime(hhMm);
});

Given('the current delivery cost is captured as the baseline', async function (this: CheckoutWorld) {
  // Read the summary "Base delivery..." line amount; with a 5 km slider distance
  // and a weekday this should always render. Fall back to 10.00 if read fails.
  const co = checkoutPage(this);
  const amount = await co.summaryLineAmount(/Base delivery|Long-range delivery|Weekend delivery/).textContent();
  const num = parseFloat((amount ?? '0').replace('$', ''));
  this.baselineDeliveryCost = num;
});

Given(
  'I fill the cardholder, card number and CVV with valid values',
  async function (this: CheckoutWorld) {
    const co = checkoutPage(this);
    await co.cardholderInput.fill('J. Doe');
    await co.cardNumberInput.fill('4242424242424242');
    await co.cvvInput.fill('123');
  },
);

Given('I fill all payment fields with valid values', async function (this: CheckoutWorld) {
  await checkoutPage(this).fillPayment();
});

// ─── When (Act) ─────────────────────────────────────────────────────────────

When('I remove the first product line', async function (this: CheckoutWorld) {
  const first = this.cartProductNames![0];
  await checkoutPage(this).removeItemButton(first).click();
});

When('I remove the remaining product line', async function (this: CheckoutWorld) {
  const remaining = this.cartProductNames![1];
  await checkoutPage(this).removeItemButton(remaining).click();
});

When('I look up the address {string}', async function (this: CheckoutWorld, address: string) {
  await checkoutPage(this).lookUpAddress(address);
});

When('I select the {string} delivery tab', async function (this: CheckoutWorld, tab: string) {
  await checkoutPage(this).selectDistanceTab(tab as 'Address' | 'Slider' | 'Manual');
});

When('I toggle the weather to Raining', async function (this: CheckoutWorld) {
  await checkoutPage(this).weatherRainButton.click();
});

When('I apply the promo code {string}', async function (this: CheckoutWorld, code: string) {
  await checkoutPage(this).applyPromo(code);
});

When('I select the {int}% tip preset', async function (this: CheckoutWorld, pct: number) {
  await checkoutPage(this).tipPresetButton(pct as 15 | 18 | 20 | 25).click();
});

When('I select the custom tip option', async function (this: CheckoutWorld) {
  await checkoutPage(this).tipCustomButton.click();
});

When('I enter a custom tip of {string}', async function (this: CheckoutWorld, value: string) {
  const input = checkoutPage(this).tipCustomInput;
  await input.fill(value);
  await input.blur();
});

When('I type {string} into the card number field', async function (this: CheckoutWorld, value: string) {
  await checkoutPage(this).cardNumberInput.fill(value);
});

When('I type {string} into the expiry field', async function (this: CheckoutWorld, value: string) {
  await checkoutPage(this).expiryInput.fill(value);
});

When('I click PLACE ORDER', async function (this: CheckoutWorld) {
  await checkoutPage(this).placeOrderButton.click();
});

// ─── Then (Assert) ──────────────────────────────────────────────────────────

Then('I am redirected to the home page', async function (this: CheckoutWorld) {
  await pageOf(this).waitForURL(this.baseUrl! + '/');
});

Then('I am redirected to \\/confirmation', async function (this: CheckoutWorld) {
  await pageOf(this).waitForURL('**/confirmation', { timeout: 5_000 });
});

Then('the cart session storage is empty', async function (this: CheckoutWorld) {
  const stored = await pageOf(this).evaluate(() => sessionStorage.getItem('pits_cart'));
  // CartContext clears via setting an empty items array, not removeItem.
  if (stored !== null) {
    const parsed = JSON.parse(stored) as { items: unknown[] };
    expect(parsed.items.length).toBe(0);
  }
});

Then('only the second product line remains', async function (this: CheckoutWorld) {
  const removed = this.cartProductNames![0];
  const remaining = this.cartProductNames![1];
  await expect(checkoutPage(this).cartLine(remaining)).toBeVisible();
  await expect(pageOf(this).getByText(removed, { exact: true })).toHaveCount(0);
});

Then(
  'the order summary shows a {string} line for distance within 10 km',
  async function (this: CheckoutWorld, partialLabel: string) {
    await expect(
      checkoutPage(this).summaryRow(new RegExp(`^${partialLabel}.*within 10 km`)),
    ).toBeVisible();
  },
);

Then(
  'the address lookup shows the error {string}',
  async function (this: CheckoutWorld, message: string) {
    await expect(pageOf(this).getByText(message, { exact: true })).toBeVisible();
  },
);

Then('the PLACE ORDER button is disabled', async function (this: CheckoutWorld) {
  await expect(checkoutPage(this).placeOrderButton).toBeDisabled();
});

Then('the distance slider exposes a maximum of {int}', async function (this: CheckoutWorld, max: number) {
  const attr = await checkoutPage(this).distanceSlider.getAttribute('max');
  expect(Number(attr)).toBe(max);
});

Then(
  'the distance slider exposes a minimum less than or equal to {float}',
  async function (this: CheckoutWorld, min: number) {
    const attr = await checkoutPage(this).distanceSlider.getAttribute('min');
    expect(Number(attr)).toBeLessThanOrEqual(min);
  },
);

Then(
  'the slider rate label contains {string}',
  async function (this: CheckoutWorld, fragment: string) {
    await expect(pageOf(this).getByText(new RegExp(fragment.replace(/\$/g, '\\$')))).toBeVisible();
  },
);

Then(
  'the date validation error {string} is shown',
  async function (this: CheckoutWorld, msg: string) {
    await expect(pageOf(this).getByText(msg, { exact: true })).toBeVisible();
  },
);

Then('a delivery-hours error message is shown', async function (this: CheckoutWorld) {
  await expect(checkoutPage(this).timeOutOfHoursMessage).toBeVisible();
});

Then(
  'the order summary does not contain a {string} line',
  async function (this: CheckoutWorld, labelFragment: string) {
    await expect(
      checkoutPage(this).summaryRow(new RegExp(labelFragment)),
    ).toHaveCount(0);
  },
);

Then(
  'the order summary shows a {string} line of ${float}',
  async function (this: CheckoutWorld, labelFragment: string, amount: number) {
    const labelRe = new RegExp(labelFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const amountStr = `$${amount.toFixed(2)}`;
    await expect(
      checkoutPage(this).summaryRow(labelRe).locator('span.font-medium'),
    ).toHaveText(amountStr);
  },
);

Then(
  'the order summary shows a {string} line of -${float}',
  async function (this: CheckoutWorld, labelFragment: string, amount: number) {
    const labelRe = new RegExp(labelFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    // Discount lines render as either "-$X.XX" (Promo) or "$-X.XX" (loyalty).
    const amountRe = new RegExp(`^(-\\$|\\$-)${amount.toFixed(2)}$`);
    await expect(
      checkoutPage(this).summaryRow(labelRe).locator('span.font-medium'),
    ).toHaveText(amountRe);
  },
);

Then(
  'the order summary shows a {string} line equal to {int}% of the subtotal',
  async function (this: CheckoutWorld, labelFragment: string, pct: number) {
    const expectedAmount = Math.round(this.cartSubtotal! * (pct / 100) * 100) / 100;
    const labelRe = new RegExp(labelFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const amountRe = new RegExp(`^(-?\\$|\\$-?)${expectedAmount.toFixed(2)}$`);
    await expect(
      checkoutPage(this).summaryRow(labelRe).locator('span.font-medium'),
    ).toHaveText(amountRe);
  },
);

Then(
  'the promo error message contains {string}',
  async function (this: CheckoutWorld, fragment: string) {
    await expect(pageOf(this).getByText(new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeVisible();
  },
);

Then('no promo line is shown in the order summary', async function (this: CheckoutWorld) {
  await expect(checkoutPage(this).summaryRow(/^Promo: /)).toHaveCount(0);
});

Then('the promo discount equals the baseline delivery cost', async function (this: CheckoutWorld) {
  const baseline = this.baselineDeliveryCost!;
  const amountRe = new RegExp(`^(-\\$|\\$-)${baseline.toFixed(2)}$`);
  await expect(
    checkoutPage(this).summaryRow(/Promo: FREEDELIVERY/).locator('span.font-medium'),
  ).toHaveText(amountRe);
});

Then(
  'the tip error message contains {string}',
  async function (this: CheckoutWorld, fragment: string) {
    await expect(pageOf(this).getByText(new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeVisible();
  },
);

Then('the card number field value is {string}', async function (this: CheckoutWorld, expected: string) {
  await expect(checkoutPage(this).cardNumberInput).toHaveValue(expected);
});

Then('the expiry field value is {string}', async function (this: CheckoutWorld, expected: string) {
  await expect(checkoutPage(this).expiryInput).toHaveValue(expected);
});
