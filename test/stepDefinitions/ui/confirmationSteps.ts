import { Before, Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { ConfirmationPage } from '../../pages/ConfirmationPage';
import { AccountPage } from '../../pages/AccountPage';
import { loginAs, TIER_USER_POINTS, type Tier } from '../../utils/auth';
import { CustomWorld } from '../../world/CustomWorld';

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
  loyaltyDiscount?: number;
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
  pointsEarned?: number;
}

interface ConfirmationWorld extends CustomWorld {
  confirmation?: ConfirmationPage;
  /** Seeded order stored on World for cross-step assertions. */
  seededOrder?: SeedOrder;
  /** Initial points of the logged-in user (used by TIER-CONF-003). */
  initialPoints?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pageOf(world: ConfirmationWorld): Page {
  if (!world.page) throw new Error('Page not initialised');
  return world.page;
}

function confirmationPage(world: ConfirmationWorld): ConfirmationPage {
  if (!world.confirmation) throw new Error('ConfirmationPage not initialised');
  return world.confirmation;
}

/** A minimal synthetic product for order seeding. */
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

/** Minimal billing object with a 5.0 km base delivery line. */
function defaultBilling(): SeedBilling {
  return {
    lineItems: [
      { label: 'Base delivery (5.0 km, within 10 km)', amount: 10.00, applies: true },
    ],
    total: 10.00,
    isWeekendFlat: false,
  };
}

/** Build a minimal order, merging the supplied overrides. */
function buildOrder(overrides: Partial<SeedOrder> = {}): SeedOrder {
  const defaultProduct = syntheticProduct('Test Pie');
  const defaultItems: SeedOrderItem[] = [
    { product: defaultProduct, quantity: 1, unitPrice: defaultProduct.price },
  ];
  return {
    orderId: 'PITS-20260522-TEST',
    items: defaultItems,
    subtotal: 22.00,
    address: '123 Main St, Los Angeles, CA',
    displayAddress: '123 Main St, Los Angeles, CA',
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

/** Seed `pits_order` in sessionStorage (page must already be on a same-origin URL). */
async function seedOrder(world: ConfirmationWorld, order: SeedOrder): Promise<void> {
  world.seededOrder = order;
  await pageOf(world).evaluate(
    (json) => sessionStorage.setItem('pits_order', json),
    JSON.stringify(order),
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────────
// Shared browser launch/close lives in hooks/browserHook.ts. Here we build the
// ConfirmationPage and land on home so sessionStorage is same-origin before seeding.

Before({ tags: '@confirmation' }, async function (this: ConfirmationWorld) {
  this.confirmation = this.factory!.create('confirmation');
  await this.page!.goto(this.baseUrl + '/', { waitUntil: 'networkidle' });
});

// ─── Given (Arrange) ────────────────────────────────────────────────────────

Given(/^I navigate directly to \/confirmation with no active order$/, async function (this: ConfirmationWorld) {
  // Explicitly ensure no pits_order key is present.
  await pageOf(this).evaluate(() => sessionStorage.removeItem('pits_order'));
  await pageOf(this).goto(this.baseUrl! + '/confirmation', { waitUntil: 'networkidle' });
});

Given('the confirmation is seeded with a completed order', async function (this: ConfirmationWorld) {
  await seedOrder(this, buildOrder());
});

Given(
  'the confirmation is seeded with order ID {string}',
  async function (this: ConfirmationWorld, orderId: string) {
    await seedOrder(this, buildOrder({ orderId }));
  },
);

Given(
  'the confirmation is seeded with 2 units of {string}',
  async function (this: ConfirmationWorld, productName: string) {
    const product = syntheticProduct(productName);
    const items: SeedOrderItem[] = [{ product, quantity: 2, unitPrice: product.price }];
    await seedOrder(this, buildOrder({ items, subtotal: product.price * 2 }));
  },
);

Given(
  'the confirmation is seeded with 1 unit of {string} and 2 units of {string}',
  async function (this: ConfirmationWorld, name1: string, name2: string) {
    const p1 = syntheticProduct(name1);
    const p2 = syntheticProduct(name2);
    const items: SeedOrderItem[] = [
      { product: p1, quantity: 1, unitPrice: p1.price },
      { product: p2, quantity: 2, unitPrice: p2.price },
    ];
    const subtotal = p1.price + p2.price * 2;
    await seedOrder(this, buildOrder({ items, subtotal }));
  },
);

Given(
  'the confirmation is seeded with display address {string}',
  async function (this: ConfirmationWorld, displayAddress: string) {
    await seedOrder(this, buildOrder({ displayAddress }));
  },
);

Given(
  'the confirmation is seeded with distance {float} km',
  async function (this: ConfirmationWorld, km: number) {
    const billing: SeedBilling = {
      lineItems: [
        { label: `Base delivery (${km.toFixed(1)} km, within 10 km)`, amount: 10.00, applies: true },
      ],
      total: 10.00,
      isWeekendFlat: false,
    };
    await seedOrder(this, buildOrder({ distanceKm: km, billing }));
  },
);

Given(
  'the confirmation is seeded with a billing for a {string} user with no loyalty discount',
  async function (this: ConfirmationWorld, _tier: string) {
    // guest / bronze: billing has no loyalty discount line.
    await seedOrder(this, buildOrder({ billing: defaultBilling() }));
  },
);

Given(
  'the confirmation is seeded with a billing for a {string} user with a {string}% loyalty discount',
  async function (this: ConfirmationWorld, tier: string, discountStr: string) {
    const discount = parseInt(discountStr, 10);
    const base = 10.00;
    const discountAmount = parseFloat((base * discount / 100).toFixed(2));
    const finalTotal = parseFloat((base - discountAmount).toFixed(2));
    const label = `${tier} member discount (${discount}%)`;

    const billing: SeedBilling = {
      lineItems: [
        { label: 'Base delivery (5.0 km, within 10 km)', amount: base, applies: true },
        { label, amount: -discountAmount, applies: true },
      ],
      total: finalTotal,
      isWeekendFlat: false,
      loyaltyDiscount: discountAmount,
    };
    await seedOrder(this, buildOrder({ billing }));
  },
);

Given(
  'I am logged in as a {string} tier user',
  async function (this: ConfirmationWorld, tier: string) {
    this.initialPoints = TIER_USER_POINTS[tier as Tier];
    await loginAs(pageOf(this), tier as Tier, this.baseUrl!);
  },
);

Given(
  'the confirmation is seeded with an order earning {int} points for that user',
  async function (this: ConfirmationWorld, pointsEarned: number) {
    // Simulate what checkout.handleOrder() does: update pits_auth points in sessionStorage,
    // then store the order with pointsEarned.
    const initialPoints = this.initialPoints ?? 0;
    const updatedPoints = initialPoints + pointsEarned;

    await pageOf(this).evaluate(
      ([points, earned]) => {
        // Update pits_auth to reflect the post-checkout points balance.
        const stored = sessionStorage.getItem('pits_auth');
        if (stored) {
          const auth = JSON.parse(stored);
          auth.points = points;
          sessionStorage.setItem('pits_auth', JSON.stringify(auth));
        }
        // Store the order with pointsEarned (as checkout would).
        const order = {
          orderId: 'PITS-20260522-EARN',
          items: [{
            product: { id: 'syn-earn', name: 'Test Pie', description: '', price: 22.00, image: '/icon-pie.svg', category: 'fruit', available: true, popularity: 70 },
            quantity: 1,
            unitPrice: 22.00,
          }],
          subtotal: 22.00,
          address: '123 Main St, Los Angeles, CA',
          displayAddress: '123 Main St, Los Angeles, CA',
          deliveryDate: '2026-05-26',
          deliveryTime: '14:00',
          distanceKm: 5.0,
          billing: {
            lineItems: [{ label: 'Base delivery (5.0 km, within 10 km)', amount: 10.00, applies: true }],
            total: 10.00,
            isWeekendFlat: false,
          },
          tip: 0,
          isRaining: false,
          createdAt: new Date().toISOString(),
          status: 'pending',
          pointsEarned: earned,
        };
        sessionStorage.setItem('pits_order', JSON.stringify(order));
      },
      [updatedPoints, pointsEarned] as [number, number],
    );
  },
);

// ─── When (Act) ──────────────────────────────────────────────────────────────

When('I am on the confirmation page', async function (this: ConfirmationWorld) {
  await pageOf(this).goto(this.baseUrl! + '/confirmation', { waitUntil: 'networkidle' });
  await confirmationPage(this).assertPageLoaded();
});

When('I refresh the confirmation page', async function (this: ConfirmationWorld) {
  await pageOf(this).reload({ waitUntil: 'networkidle' });
  await confirmationPage(this).assertPageLoaded();
});

When('I navigate to the account rewards page', async function (this: ConfirmationWorld) {
  // Capture the current pits_auth (which may have updated points after order seeding)
  // and re-register it as an init script so it survives the upcoming navigation.
  const currentAuth = await pageOf(this).evaluate(() => sessionStorage.getItem('pits_auth'));
  if (currentAuth) {
    await pageOf(this).addInitScript((data) => {
      try { window.sessionStorage.setItem('pits_auth', data); } catch { /* ignore */ }
    }, currentAuth);
  }
  await pageOf(this).goto(this.baseUrl! + '/account/rewards', { waitUntil: 'networkidle' });
  const account = new AccountPage(pageOf(this));
  await expect(account.rewardsCatalogHeading).toBeVisible({ timeout: 15_000 });
});

// ─── Then (Assert) ───────────────────────────────────────────────────────────

Then('the confirmation page shows order ID {string}', async function (this: ConfirmationWorld, orderId: string) {
  await expect(confirmationPage(this).orderIdText).toHaveText(orderId);
});

Then('the item summary shows {string}', async function (this: ConfirmationWorld, expectedText: string) {
  await expect(confirmationPage(this).itemSummaryText).toHaveText(expectedText);
});

Then(
  'the {string} field shows {string}',
  async function (this: ConfirmationWorld, fieldName: string, expectedValue: string) {
    const co = confirmationPage(this);
    let locator;
    switch (fieldName) {
      case 'Delivery to': locator = co.deliveryToValue; break;
      case 'Distance':    locator = co.distanceValue;   break;
      case 'Scheduled':   locator = co.scheduledValue;  break;
      default:
        throw new Error(`Unknown confirmation field: "${fieldName}"`);
    }
    await expect(locator).toHaveText(expectedValue);
  },
);

Then(
  'the order summary contains a line item mentioning {string}',
  async function (this: ConfirmationWorld, fragment: string) {
    await expect(confirmationPage(this).summaryLineLabel(new RegExp(fragment)).first()).toBeVisible();
  },
);

Then('no member discount line is visible in the order summary', async function (this: ConfirmationWorld) {
  await expect(confirmationPage(this).memberDiscountLine).not.toBeVisible();
});

Then(
  'the order summary shows a {string} member discount of {string}%',
  async function (this: ConfirmationWorld, tier: string, discount: string) {
    const pattern = new RegExp(`${tier} member discount \\(${discount}%\\)`, 'i');
    await expect(confirmationPage(this).summaryLineLabel(pattern)).toBeVisible();
  },
);

Then(
  'my points balance has increased by {int} points from the initial balance',
  async function (this: ConfirmationWorld, pointsEarned: number) {
    const expectedPoints = (this.initialPoints ?? 0) + pointsEarned;
    const account = new AccountPage(pageOf(this));
    await expect(account.pointsAvailableHeader).toBeVisible({ timeout: 10_000 });
    const text = await account.pointsAvailableHeader.textContent();
    const match = text?.match(/^([\d,]+) points available$/);
    const displayed = parseInt((match?.[1] ?? '0').replace(/,/g, ''), 10);
    expect(displayed).toBe(expectedPoints);
  },
);
