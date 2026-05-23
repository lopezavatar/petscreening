import {
  Before,
  After,
  Given,
  When,
  Then,
  DataTable,
  setDefaultTimeout,
  World,
} from '@cucumber/cucumber';
import {
  chromium,
  firefox,
  webkit,
  Browser,
  BrowserContext,
  Page,
  expect,
} from '@playwright/test';
import { PageFactory } from '../../utils/factories/PageFactory';
import { TrackingPage } from '../../pages/TrackingPage';
import { loginAs, type Tier } from '../../utils/auth';

setDefaultTimeout(30_000);

// ─── Types ───────────────────────────────────────────────────────────────────

interface SeedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  popularity: number;
}

interface SeedOrderItem {
  product: SeedProduct;
  quantity: number;
  unitPrice: number;
}

interface SeedBillingLineItem {
  label: string;
  amount: number;
  applies: boolean;
}

interface SeedBilling {
  lineItems: SeedBillingLineItem[];
  total: number;
  isWeekendFlat: boolean;
}

interface SeedOrder {
  orderId: string;
  items: SeedOrderItem[];
  subtotal: number;
  address: string;
  displayAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  distanceKm: number;
  billing: SeedBilling;
  tip: number;
  isRaining: boolean;
  createdAt: string;
  status: string;
  userId?: string;
}

interface TrackingWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  factory?: PageFactory;
  tracking?: TrackingPage;
  baseUrl?: string;
  /** The order seeded for the current scenario. */
  seededOrder?: SeedOrder;
  /** ETA captured mid-scenario for assertion in a later step. */
  capturedEta?: number;
  /** Console errors collected during the scenario. */
  consoleErrors?: string[];
  /** When true, the Playwright clock has been installed and the navigate step
   *  should fast-forward time to the end of the delivery simulation. */
  clockInstalled?: boolean;
  /** Total simulation duration in ms to fast-forward (set alongside clockInstalled). */
  seededOrderEtaMs?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pageOf(world: TrackingWorld): Page {
  if (!world.page) throw new Error('Page not initialised');
  return world.page;
}

function trackingPage(world: TrackingWorld): TrackingPage {
  if (!world.tracking) throw new Error('TrackingPage not initialised');
  return world.tracking;
}

function launcher(name?: string) {
  switch (name) {
    case 'firefox': return firefox;
    case 'webkit':  return webkit;
    default:        return chromium;
  }
}

function syntheticProduct(name: string, price = 22.00): SeedProduct {
  return {
    id: `syn-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    description: 'Synthetic test product',
    price,
    image: '/icon-pie.svg',
    category: 'fruit',
    available: true,
    popularity: 70,
  };
}

function defaultBilling(): SeedBilling {
  return {
    lineItems: [
      { label: 'Base delivery (5.0 km, within 10 km)', amount: 10.00, applies: true },
    ],
    total: 10.00,
    isWeekendFlat: false,
  };
}

function buildOrder(overrides: Partial<SeedOrder> = {}): SeedOrder {
  const defaultProduct = syntheticProduct('Test Pie');
  const defaultItems: SeedOrderItem[] = [
    { product: defaultProduct, quantity: 1, unitPrice: defaultProduct.price },
  ];
  return {
    orderId: 'PITS-20260522-T3ST',
    items: defaultItems,
    subtotal: 22.00,
    address: '456 Oak Ave, Los Angeles, CA 90001',
    displayAddress: '456 Oak Ave, Los Angeles, CA 90001',
    deliveryDate: '2026-05-26',
    deliveryTime: '14:00',
    distanceKm: 5.0,
    billing: defaultBilling(),
    tip: 0,
    isRaining: false,
    createdAt: new Date().toISOString(),
    status: 'pending',
    ...overrides,
  };
}

/**
 * Seed `pits_order` in sessionStorage.
 * The page must already be on a same-origin URL before calling this.
 */
async function seedOrder(world: TrackingWorld, order: SeedOrder): Promise<void> {
  world.seededOrder = order;
  await pageOf(world).evaluate(
    (json) => sessionStorage.setItem('pits_order', json),
    JSON.stringify(order),
  );
}

/** Parse the ETA text ("N min" or "Now") into a numeric value in minutes. */
function parseEtaMinutes(text: string): number {
  if (text.trim() === 'Now') return 0;
  const match = text.match(/^(\d+)\s*min$/);
  if (!match) throw new Error(`Unexpected ETA text: "${text}"`);
  return parseInt(match[1], 10);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

Before({ tags: '@tracking' }, async function (this: TrackingWorld) {
  const browserName = (this.parameters as { browser?: string } | undefined)?.browser;
  this.baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
  this.browser = await launcher(browserName).launch({
    headless: process.env.PWHEADLESS !== 'false',
  });
  this.context = await this.browser.newContext({ baseURL: this.baseUrl });
  this.page    = await this.context.newPage();
  this.factory = new PageFactory(this.page);
  this.tracking = this.factory.create('tracking');
  this.consoleErrors = [];

  // Collect console errors for assertions in malformed_id / no_console_errors tests.
  this.page.on('console', (msg) => {
    if (msg.type() === 'error') {
      this.consoleErrors!.push(msg.text());
    }
  });

  // Land on home first so sessionStorage is same-origin.
  await this.page.goto(this.baseUrl + '/', { waitUntil: 'networkidle' });
});

After({ tags: '@tracking' }, async function (this: TrackingWorld) {
  await this.page?.close().catch(() => undefined);
  await this.context?.close().catch(() => undefined);
  await this.browser?.close().catch(() => undefined);
  this.factory?.reset();
});

// ─── Given (Arrange) ─────────────────────────────────────────────────────────

Given('the tracking page is seeded with a valid order', async function (this: TrackingWorld) {
  await seedOrder(this, buildOrder());
});

Given(
  'the tracking page is seeded with order ID {string}',
  async function (this: TrackingWorld, orderId: string) {
    await seedOrder(this, buildOrder({ orderId }));
  },
);

Given(
  'a second order {string} is also stored',
  async function (this: TrackingWorld, orderId: string) {
    // Store a second order under a different key to simulate a non-matching order.
    // The tracking page only uses `pits_order` and checks orderId === URL segment,
    // so the second order never overrides the first.
    const second = buildOrder({ orderId });
    await pageOf(this).evaluate(
      (json) => sessionStorage.setItem('pits_order_second', json),
      JSON.stringify(second),
    );
  },
);

Given('no order is stored in the session', async function (this: TrackingWorld) {
  await pageOf(this).evaluate(() => sessionStorage.removeItem('pits_order'));
});

Given('the tracking page is seeded with an order at full progress', async function (this: TrackingWorld) {
  // Use the Playwright Clock API (available since Playwright 1.45, installed: 1.60)
  // to fast-forward browser time past the delivery simulation duration.
  // calculateETA(5.0, false) = ceil(5 + 5) = 10 min = 600,000 ms.
  // We install the clock BEFORE navigation so the setInterval inside the
  // tracking page's useEffect is controlled by Playwright from the moment it starts.
  const order = buildOrder({ distanceKm: 5.0 });
  await seedOrder(this, order);
  // 10 min simulation + 1 s buffer
  this.seededOrderEtaMs = 10 * 60 * 1_000 + 1_000;
  await pageOf(this).clock.install();
  this.clockInstalled = true;
});

Given(
  'the tracking page is seeded with {int} unit of {string} at ${float}',
  async function (this: TrackingWorld, qty: number, productName: string, price: number) {
    const product = syntheticProduct(productName, price);
    const items: SeedOrderItem[] = [{ product, quantity: qty, unitPrice: price }];
    await seedOrder(this, buildOrder({ items, subtotal: price * qty }));
  },
);

Given(
  'the tracking page is seeded with {int} units of {string} at ${float} and {int} units of {string} at ${float}',
  async function (
    this: TrackingWorld,
    qty1: number, name1: string, price1: number,
    qty2: number, name2: string, price2: number,
  ) {
    const items: SeedOrderItem[] = [
      { product: syntheticProduct(name1, price1), quantity: qty1, unitPrice: price1 },
      { product: syntheticProduct(name2, price2), quantity: qty2, unitPrice: price2 },
    ];
    await seedOrder(this, buildOrder({ items, subtotal: price1 * qty1 + price2 * qty2 }));
  },
);

Given(
  'the viewport width is {int} px',
  async function (this: TrackingWorld, width: number) {
    await this.context?.close().catch(() => undefined);
    this.context = await this.browser!.newContext({
      baseURL: this.baseUrl,
      viewport: { width, height: 768 },
    });
    this.page    = await this.context.newPage();
    this.factory = new PageFactory(this.page);
    this.tracking = this.factory.create('tracking');

    // Re-seed: same origin navigation required first.
    await this.page.goto(this.baseUrl + '/', { waitUntil: 'networkidle' });
    if (this.seededOrder) {
      await seedOrder(this, this.seededOrder);
    }
  },
);

Given(
  'I am logged in as a {string} user',
  async function (this: TrackingWorld, tier: string) {
    await loginAs(this.page!, tier as Tier, this.baseUrl!);
  },
);

Given(
  'a {string} order is seeded for that user with order ID {string}',
  async function (this: TrackingWorld, status: string, orderId: string) {
    await seedOrder(this, buildOrder({ orderId, status }));
  },
);

// ─── When (Act) ──────────────────────────────────────────────────────────────

When(
  'I navigate to the tracking page for order {string}',
  async function (this: TrackingWorld, orderId: string) {
    await pageOf(this).goto(this.baseUrl! + `/tracking/${orderId}`, {
      waitUntil: 'networkidle',
    });
  },
);

When('I navigate to the tracking page for that order', async function (this: TrackingWorld) {
  const orderId = this.seededOrder?.orderId;
  if (!orderId) throw new Error('No seeded order on world — call a Given step first');
  await pageOf(this).goto(this.baseUrl! + `/tracking/${orderId}`, {
    waitUntil: 'networkidle',
  });
  if (this.clockInstalled && this.seededOrderEtaMs) {
    // Advance the mocked browser clock past the full simulation duration.
    // This causes all pending setInterval callbacks to fire synchronously,
    // driving progress to 100% and status to "delivered".
    await pageOf(this).clock.fastForward(this.seededOrderEtaMs);
    // Wait for React to commit the final render ("Now" ETA or 100% progress).
    await pageOf(this).waitForFunction(
      () => document.body.textContent?.includes('Now') ?? false,
      { timeout: 10_000 },
    );
  }
});

When('I note the current estimated arrival time', async function (this: TrackingWorld) {
  const etaText = await trackingPage(this).etaValue.textContent();
  this.capturedEta = parseEtaMinutes(etaText ?? '');
});

When('I wait {int} seconds for delivery progress to advance', async function (this: TrackingWorld, seconds: number) {
  await pageOf(this).waitForTimeout(seconds * 1_000);
});

When('I go to the account orders page', async function (this: TrackingWorld) {
  await pageOf(this).goto(this.baseUrl! + '/account/orders', { waitUntil: 'networkidle' });
});

When(
  'I click the "Track Order" link for order {string}',
  async function (this: TrackingWorld, orderId: string) {
    // The Track Order link is expected to navigate to /tracking/{orderId}.
    // If the link does not exist, this step will fail and surface the missing feature.
    await pageOf(this).getByRole('link', { name: /track order/i }).first().click();
    await pageOf(this).waitForLoadState('networkidle');
  },
);

// ─── Then (Assert) ───────────────────────────────────────────────────────────

Then(
  'the displayed order ID is {string}',
  async function (this: TrackingWorld, orderId: string) {
    await expect(pageOf(this).getByText(orderId, { exact: true })).toBeVisible();
  },
);

Then(
  'the status label in the progress bar is {string}',
  async function (this: TrackingWorld, label: string) {
    // The status label appears in the flex row beneath the progress bar.
    // Validated DOM: a <span> sibling to the percentage span.
    await expect(pageOf(this).getByText(label, { exact: true }).first()).toBeVisible();
  },
);

Then(
  'the status label in the progress bar is one of:',
  async function (this: TrackingWorld, table: DataTable) {
    const allowed = table.raw().flat();
    const currentText = (await trackingPage(this).progressStatusLabel.textContent()) ?? '';
    expect(allowed).toContain(currentText.trim());
  },
);

Then(
  'the {string} step in the timeline is the active step',
  async function (this: TrackingWorld, stepLabel: string) {
    // The active step has a description paragraph rendered beneath its label.
    // Validated DOM: only the active step renders the description text.
    const descriptionTexts: Record<string, string> = {
      Preparing:   'Your order is being prepared in our kitchen',
      Dispatched:  'Your pie is loaded and the drone is ready for takeoff',
      'In Flight': 'Your drone is on its way to you',
      Arriving:    'Almost there! The drone is approaching your location',
      Delivered:   'Your pie has arrived! Enjoy!',
    };
    const description = descriptionTexts[stepLabel];
    if (!description) throw new Error(`Unknown step label: "${stepLabel}"`);
    await expect(pageOf(this).getByText(description, { exact: true })).toBeVisible();
  },
);

Then('the estimated arrival time has not increased', async function (this: TrackingWorld) {
  const currentText = (await trackingPage(this).etaValue.textContent()) ?? '';
  const currentEta  = parseEtaMinutes(currentText);
  expect(currentEta).toBeLessThanOrEqual(this.capturedEta!);
});

Then('the estimated arrival shows {string}', async function (this: TrackingWorld, text: string) {
  await expect(trackingPage(this).etaValue).toHaveText(text, { timeout: 30_000 });
});

Then('the progress percentage is {int}%', async function (this: TrackingWorld, expected: number) {
  const text = (await trackingPage(this).progressPercentageText.textContent()) ?? '';
  const actual = parseInt(text.replace('%', ''), 10);
  expect(actual).toBe(expected);
});

Then('the progress percentage is between {int}% and {int}%', async function (
  this: TrackingWorld,
  min: number,
  max: number,
) {
  const text = (await trackingPage(this).progressPercentageText.textContent()) ?? '';
  const actual = parseInt(text.replace('%', ''), 10);
  expect(actual).toBeGreaterThanOrEqual(min);
  expect(actual).toBeLessThanOrEqual(max);
});

Then('the Order Summary heading is visible', async function (this: TrackingWorld) {
  await expect(trackingPage(this).orderSummaryHeading).toBeVisible();
});

Then(
  'the order line item {string} is visible',
  async function (this: TrackingWorld, lineItem: string) {
    await expect(pageOf(this).getByText(lineItem, { exact: true })).toBeVisible();
  },
);

Then('the delivery destination is shown', async function (this: TrackingWorld) {
  await expect(trackingPage(this).deliveryToLabel).toBeVisible();
});

Then('the "Order not found" message is visible', async function (this: TrackingWorld) {
  await expect(trackingPage(this).notFoundMessage).toBeVisible();
});

Then('the "Return to menu" button is visible', async function (this: TrackingWorld) {
  await expect(trackingPage(this).returnToMenuButton).toBeVisible();
});

Then('the tracking layout is not rendered', async function (this: TrackingWorld) {
  await expect(trackingPage(this).heading).not.toBeVisible();
});

Then('I am on the home page', async function (this: TrackingWorld) {
  await pageOf(this).waitForURL(/\/$/, { timeout: 10_000 });
  expect(pageOf(this).url()).toMatch(/\/$/);
});

Then(
  'I am on the tracking page for order {string}',
  async function (this: TrackingWorld, orderId: string) {
    await pageOf(this).waitForURL(new RegExp(`/tracking/${orderId}`), { timeout: 10_000 });
    expect(pageOf(this).url()).toContain(`/tracking/${orderId}`);
  },
);

Then('no console error occurs', async function (this: TrackingWorld) {
  expect(this.consoleErrors).toEqual([]);
});

Then('the page has no horizontal overflow', async function (this: TrackingWorld) {
  const hasOverflow = await pageOf(this).evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasOverflow).toBe(false);
});

Then('the order summary is visible', async function (this: TrackingWorld) {
  await expect(trackingPage(this).orderSummaryHeading).toBeVisible();
});

Then('the status timeline is visible', async function (this: TrackingWorld) {
  await expect(pageOf(this).getByText('Preparing', { exact: true }).first()).toBeVisible();
});
