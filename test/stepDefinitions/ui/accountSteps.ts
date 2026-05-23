import { Before, Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { AccountPage, type AccountSubRoute, type RewardName } from '../../pages/AccountPage';
import { loginAs, clearSessionState, forgetSession, TIER_USER_IDS, type Tier } from '../../utils/auth';
import { CustomWorld } from '../../world/CustomWorld';

// ─── Spec-derived constants ────────────────────────────────────────────────
// Source: src/lib/loyalty.ts → TIER_CONFIG.
const TIER_DISCOUNT: Record<Tier, number> = { bronze: 0, silver: 5, gold: 10, platinum: 15 };
const TIER_THRESHOLDS = { bronze: 0, silver: 500, gold: 1500, platinum: 3000 } as const;
const NEXT_TIER: Record<Tier, Tier | null> = {
  bronze: 'silver',
  silver: 'gold',
  gold: 'platinum',
  platinum: null,
};
// Source: src/lib/rewards.ts → REWARDS_CATALOG.
const REWARDS_COUNT = 6;
// Source: src/lib/mockOrders.ts → ORDERS_PER_PAGE.
const ORDERS_PER_PAGE = 10;
const ALLOWED_STATUSES = new Set(['Pending', 'In Transit', 'Delivered', 'Cancelled']);
const ALL_REWARDS: RewardName[] = [
  'Free Delivery',
  '$5 Off Order',
  '$10 Off Order',
  'Free Signature Pie',
  'Double Points Pass',
  'Priority Delivery',
];

// ─── Snapshots ─────────────────────────────────────────────────────────────
interface UserSnapshot {
  id: string;
  email: string;
  name: string;
  tier: Tier;
  points: number;
  joinedAt: string;
}

interface OrderSnapshot {
  orderId: string;
  status: string;
  createdAt: string;
  total: number;
}

interface AccountWorld extends CustomWorld {
  account?: AccountPage;
  signedInTier?: Tier;
  userSnapshot?: UserSnapshot;
  ordersSnapshot?: OrderSnapshot[];
}

function pageOf(w: AccountWorld): Page {
  if (!w.page) throw new Error('Page not initialised');
  return w.page;
}
function account(w: AccountWorld): AccountPage {
  if (!w.account) throw new Error('AccountPage not initialised; missing @account tag?');
  return w.account;
}
function userSnap(w: AccountWorld): UserSnapshot {
  if (!w.userSnapshot) throw new Error('User snapshot not loaded; sign in first');
  return w.userSnapshot;
}

function monthYear(joinedAt: string): string {
  return new Date(joinedAt).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

async function fetchUserSnapshot(w: AccountWorld, tier: Tier): Promise<void> {
  const res = await pageOf(w).request.get(`${w.baseUrl}/api/users/${TIER_USER_IDS[tier]}`);
  expect(res.status(), `GET /api/users/${TIER_USER_IDS[tier]} failed`).toBe(200);
  w.userSnapshot = (await res.json()) as UserSnapshot;
  w.userSnapshot.tier = tier;
}

async function fetchOrdersSnapshot(w: AccountWorld): Promise<void> {
  const id = userSnap(w).id;
  const res = await pageOf(w).request.get(`${w.baseUrl}/api/orders?userId=${id}`);
  expect(res.status()).toBe(200);
  w.ordersSnapshot = (await res.json()) as OrderSnapshot[];
}

// ─── Hooks ─────────────────────────────────────────────────────────────────
// Shared browser launch/close lives in hooks/browserHook.ts. This hook only
// wires the AccountPage (not produced by PageFactory) and clears per-scenario state.

Before({ tags: '@account' }, async function (this: AccountWorld) {
  this.account = new AccountPage(this.page!);
  this.signedInTier = undefined;
  this.userSnapshot = undefined;
  this.ordersSnapshot = undefined;
});

// ─── Given (Arrange) ───────────────────────────────────────────────────────

Given(/^I am signed into the account area as a "(bronze|silver|gold|platinum)" user$/, async function (
  this: AccountWorld,
  tier: string,
) {
  this.signedInTier = tier as Tier;
  await loginAs(pageOf(this), this.signedInTier, this.baseUrl!);
  await fetchUserSnapshot(this, this.signedInTier);
});

Given('I am not signed in', async function (this: AccountWorld) {
  await pageOf(this).goto(this.baseUrl!);
  await clearSessionState(pageOf(this));
});

Given(/^I open the (profile|orders|rewards) page$/, async function (
  this: AccountWorld,
  route: AccountSubRoute,
) {
  await account(this).goTo(route);
  await account(this).assertSubRouteLoaded(route);
  if (route === 'orders') await fetchOrdersSnapshot(this);
});

Given('I open the Orders page filters panel', async function (this: AccountWorld) {
  await account(this).ordersFiltersToggle.click();
});

Given('I open the URL {string}', async function (this: AccountWorld, path: string) {
  await pageOf(this).goto(this.baseUrl + path);
});

// ─── When (Act) ────────────────────────────────────────────────────────────

When(/^I click the "(Profile|Order History|Rewards)" sidebar link$/, async function (
  this: AccountWorld,
  label: string,
) {
  const map: Record<string, AccountSubRoute> = {
    Profile: 'profile',
    'Order History': 'orders',
    Rewards: 'rewards',
  };
  await account(this).sidebarLink(map[label]).click();
  await pageOf(this).waitForLoadState('networkidle');
});

When('I click Sign Out', async function (this: AccountWorld) {
  await account(this).signOutButton.click();
  await forgetSession(pageOf(this));
});

When('I click Back to menu', async function (this: AccountWorld) {
  await account(this).backToMenuButton.click();
  await pageOf(this).waitForLoadState('networkidle');
});

When('I click the View Orders quick action', async function (this: AccountWorld) {
  await account(this).viewOrdersQuickAction.click();
  await pageOf(this).waitForLoadState('networkidle');
});

When('I click the Rewards quick action', async function (this: AccountWorld) {
  await account(this).rewardsQuickAction.click();
  await pageOf(this).waitForLoadState('networkidle');
});

When('I sort orders by Total', async function (this: AccountWorld) {
  await account(this).sortByTotalButton.click();
});

When('I toggle sort by Total again', async function (this: AccountWorld) {
  await account(this).sortByTotalButton.click();
});

When('I open the orders filters panel', async function (this: AccountWorld) {
  await account(this).ordersFiltersToggle.click();
});

When('I go to the next page', async function (this: AccountWorld) {
  await account(this).nextPageButton.click();
});

When(/^I click Redeem for "(.+)"$/, async function (this: AccountWorld, name: string) {
  await account(this).rewardRedeemButton(name as RewardName).click();
});

// ─── Then (Assert) ─────────────────────────────────────────────────────────

Then(/^I should be redirected to "(.+)"$/, async function (this: AccountWorld, path: string) {
  await expect(pageOf(this)).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}(\\?|#|$)`), {
    timeout: 10_000,
  });
});

Then(/^I should be on "(.+)"$/, async function (this: AccountWorld, path: string) {
  await expect(pageOf(this)).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}(\\?|#|$)`));
});

Then('the Profile heading is visible', async function (this: AccountWorld) {
  await expect(account(this).profileHeading).toBeVisible();
});
Then('the Order History heading is visible', async function (this: AccountWorld) {
  await expect(account(this).ordersHeading).toBeVisible();
});
Then('the Rewards heading is visible', async function (this: AccountWorld) {
  await expect(account(this).rewardsHeading).toBeVisible();
});

Then('the sidebar shows my name and email', async function (this: AccountWorld) {
  const u = userSnap(this);
  await expect(account(this).sidebarUserName).toHaveText(u.name);
  await expect(account(this).sidebarUserEmail).toHaveText(u.email);
});

Then('the sidebar shows my tier and points', async function (this: AccountWorld) {
  const u = userSnap(this);
  await expect(account(this).sidebarTierBadge).toHaveText(u.tier);
  await expect(account(this).sidebarPointsBadge).toHaveText(
    `${u.points.toLocaleString()} pts`,
  );
});

Then('the active sidebar link is {string}', async function (this: AccountWorld, label: string) {
  const link = account(this).sidebarNav.getByRole('link', { name: new RegExp(`^${label}$`) });
  // Active link is styled with a brand background. Detect via inline style or class.
  const bg = await link.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg, `expected ${label} to have a non-transparent background`).not.toBe(
    'rgba(0, 0, 0, 0)',
  );
});

Then('the tier card discount matches my tier', async function (this: AccountWorld) {
  const u = userSnap(this);
  const expected = TIER_DISCOUNT[u.tier];
  await expect(account(this).tierCardDiscount).toHaveText(`${expected}% discount`);
});

Then('the tier card points equal my snapshot points', async function (this: AccountWorld) {
  const u = userSnap(this);
  await expect(account(this).tierCardPoints).toHaveText(u.points.toLocaleString());
});

Then('the progress label targets the next tier', async function (this: AccountWorld) {
  const u = userSnap(this);
  const next = NEXT_TIER[u.tier];
  if (!next) {
    await expect(account(this).progressTopTier).toBeVisible();
    return;
  }
  await expect(account(this).progressLabel).toHaveText(`Progress to ${next}`);
});

Then('Account Details show my name, email and join month', async function (this: AccountWorld) {
  const u = userSnap(this);
  await expect(account(this).accountDetailValue('Name')).toHaveText(u.name);
  await expect(account(this).accountDetailValue('Email')).toHaveText(u.email);
  await expect(account(this).accountDetailValue('Member since')).toHaveText(monthYear(u.joinedAt));
});

Then('the orders counter matches the API order count', async function (this: AccountWorld) {
  const count = (this.ordersSnapshot ?? []).length;
  const word = count === 1 ? 'order' : 'orders';
  await expect(account(this).ordersCounter).toHaveText(`${count} ${word}`);
});

Then(
  'each visible order row shows an id, date, status and total',
  async function (this: AccountWorld) {
    const ids = await account(this).orderIdCells.count();
    expect(ids).toBeGreaterThan(0);
    // Co-located in same row container — counts should be ≥ ids for each cell type.
    expect(await account(this).orderDateCells.count()).toBeGreaterThanOrEqual(ids);
    expect(await account(this).orderStatusBadges.count()).toBeGreaterThanOrEqual(ids);
    expect(await account(this).orderTotalCells.count()).toBeGreaterThanOrEqual(ids);
  },
);

Then('every status badge uses an allowed value', async function (this: AccountWorld) {
  const texts = await account(this).orderStatusBadges.allTextContents();
  for (const t of texts) expect(ALLOWED_STATUSES.has(t.trim())).toBe(true);
});

Then('orders are sorted by date descending', async function (this: AccountWorld) {
  const dateTexts = await account(this).orderDateCells.allTextContents();
  const dates = dateTexts.map((t) => Date.parse(t));
  for (let i = 1; i < dates.length; i++) {
    expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
  }
});

Then(/^orders are sorted by total (ascending|descending)$/, async function (
  this: AccountWorld,
  dir: string,
) {
  const totals = (await account(this).orderTotalCells.allTextContents()).map((t) =>
    parseFloat(t.replace('$', '')),
  );
  for (let i = 1; i < totals.length; i++) {
    if (dir === 'ascending') expect(totals[i - 1]).toBeLessThanOrEqual(totals[i]);
    else expect(totals[i - 1]).toBeGreaterThanOrEqual(totals[i]);
  }
});

Then('the orders filter controls are visible', async function (this: AccountWorld) {
  await expect(account(this).statusFilterSelect).toBeVisible();
  await expect(account(this).minTotalInput).toBeVisible();
  await expect(account(this).maxTotalInput).toBeVisible();
});

Then(
  'pagination splits the results correctly',
  async function (this: AccountWorld) {
    const count = (this.ordersSnapshot ?? []).length;
    const expectedPages = Math.max(1, Math.ceil(count / ORDERS_PER_PAGE));
    if (expectedPages <= 1) {
      await expect(account(this).pageNumberButton(1)).toHaveCount(0);
      return;
    }
    await expect(account(this).pageNumberButton(1)).toBeVisible();
    await expect(account(this).pageNumberButton(expectedPages)).toBeVisible();
    await expect(account(this).prevPageButton).toBeDisabled();
  },
);

Then('Next page becomes enabled when there is a next page', async function (this: AccountWorld) {
  const count = (this.ordersSnapshot ?? []).length;
  const expectedPages = Math.max(1, Math.ceil(count / ORDERS_PER_PAGE));
  if (expectedPages > 1) await expect(account(this).nextPageButton).toBeEnabled();
});

Then('the rewards catalog renders six items', async function (this: AccountWorld) {
  await expect(account(this).allRewardCostLabels).toHaveCount(REWARDS_COUNT);
});

Then('the points available header matches my points', async function (this: AccountWorld) {
  const u = userSnap(this);
  await expect(account(this).pointsAvailableHeader).toHaveText(
    `${u.points.toLocaleString()} points available`,
  );
});

Then('Redeem is enabled exactly for affordable rewards', async function (this: AccountWorld) {
  const u = userSnap(this);
  const costs: Record<RewardName, number> = {
    'Free Delivery': 300,
    '$5 Off Order': 500,
    '$10 Off Order': 900,
    'Free Signature Pie': 1500,
    'Double Points Pass': 750,
    'Priority Delivery': 400,
  };
  for (const name of ALL_REWARDS) {
    const affordable = u.points >= costs[name];
    if (affordable) {
      await expect(account(this).rewardRedeemButton(name)).toBeVisible();
    } else {
      await expect(account(this).rewardRedeemButton(name)).toHaveCount(0);
      await expect(account(this).rewardInsufficientText(name)).toBeVisible();
    }
  }
});

Then('Redeem is available for every reward', async function (this: AccountWorld) {
  for (const name of ALL_REWARDS) {
    await expect(account(this).rewardRedeemButton(name)).toBeVisible();
  }
});

Then('no reward Redeem button is enabled', async function (this: AccountWorld) {
  for (const name of ALL_REWARDS) {
    await expect(account(this).rewardRedeemButton(name)).toHaveCount(0);
  }
});

Then(
  /^the "(.+)" card shows "You need (\d+) more points"$/,
  async function (this: AccountWorld, name: string, amount: string) {
    await expect(account(this).rewardCard(name as RewardName)).toContainText(
      `You need ${amount} more points`,
    );
  },
);

Then('the points balance decreased by {int}', async function (this: AccountWorld, cost: number) {
  const before = userSnap(this).points;
  await expect(account(this).pointsAvailableHeader).toHaveText(
    `${(before - cost).toLocaleString()} points available`,
  );
});

Then('a new entry appears in the activity ledger', async function (this: AccountWorld) {
  const first = account(this).activityDeltaCells.first();
  await expect(first).toBeVisible();
  await expect(first).toHaveText(/^-\d+ pts$/);
});

Then('activity deltas are formatted with sign', async function (this: AccountWorld) {
  const texts = await account(this).activityDeltaCells.allTextContents();
  expect(texts.length).toBeGreaterThan(0);
  for (const t of texts) expect(t).toMatch(/^[+\-]\d{1,3}(,\d{3})*\s?pts$/);
});

Then('the tier label is {string}', async function (this: AccountWorld, label: string) {
  await expect(account(this).tierCardLabel).toHaveText(label);
});

Then('the discount text is {string}', async function (this: AccountWorld, txt: string) {
  await expect(account(this).tierCardDiscount).toHaveText(txt);
});

Then('the tier card points read {string}', async function (this: AccountWorld, n: string) {
  await expect(account(this).tierCardPoints).toHaveText(n);
});

Then(/^the tier card points are within the "(bronze|silver|gold|platinum)" tier range$/, async function (
  this: AccountWorld,
  tier: string,
) {
  const t = tier as Tier;
  const min = TIER_THRESHOLDS[t];
  const next = NEXT_TIER[t];
  const max = next ? TIER_THRESHOLDS[next] - 1 : Number.POSITIVE_INFINITY;
  const text = (await account(this).tierCardPoints.textContent()) ?? '';
  const value = Number(text.replace(/[,\s]/g, ''));
  expect(Number.isFinite(value), `tier card points not numeric: "${text}"`).toBe(true);
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
});

Then('the top-tier indicator is visible', async function (this: AccountWorld) {
  await expect(account(this).progressTopTier).toBeVisible();
});

Then('there are no console errors', async function (this: AccountWorld) {
  expect(this.consoleErrors ?? []).toEqual([]);
});
