import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type AccountSubRoute = 'profile' | 'orders' | 'rewards';
export type RewardName =
  | 'Free Delivery'
  | '$5 Off Order'
  | '$10 Off Order'
  | 'Free Signature Pie'
  | 'Double Points Pass'
  | 'Priority Delivery';

const SIDEBAR_NAV_LABEL: Record<AccountSubRoute, RegExp> = {
  profile: /^Profile$/,
  orders: /^Order History$/,
  rewards: /^Rewards$/,
};

const ROUTE_PATH: Record<AccountSubRoute, string> = {
  profile: '/account',
  orders: '/account/orders',
  rewards: '/account/rewards',
};

/**
 * AccountPage — POM for the authenticated `/account*` shell + sub-routes.
 *
 * Selectors validated against the live DOM via Playwright MCP. App ships
 * no `data-testid`s, so we rely on roles + accessible names + stable text.
 */
export class AccountPage extends BasePage {
  /** Default landing for the page object — the Profile sub-route. */
  get pageUrl(): string {
    return ROUTE_PATH.profile;
  }

  pathFor(route: AccountSubRoute): string {
    return ROUTE_PATH[route];
  }

  async goTo(route: AccountSubRoute): Promise<void> {
    await this.navigateTo(ROUTE_PATH[route]);
  }

  async assertPageLoaded(): Promise<void> {
    await expect(this.profileHeading).toBeVisible({ timeout: 15_000 });
  }

  async assertSubRouteLoaded(route: AccountSubRoute): Promise<void> {
    await expect(this.headingFor(route)).toBeVisible({ timeout: 15_000 });
  }

  // ─── Top bar ──────────────────────────────────────────────────────────────
  get backToMenuButton(): Locator {
    return this.page.getByRole('button', { name: /Back to menu/i });
  }
  get logo(): Locator {
    return this.page.getByRole('img', { name: 'Pie In The Sky' });
  }

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  /** Sidebar nav element (a single <nav> in the page). */
  get sidebarNav(): Locator {
    return this.page.getByRole('navigation');
  }
  sidebarLink(route: AccountSubRoute): Locator {
    return this.sidebarNav.getByRole('link', { name: SIDEBAR_NAV_LABEL[route] });
  }
  /** User card paragraphs (name = first <p>, email = second <p>). */
  get sidebarUserName(): Locator {
    return this.sidebarNav.locator('xpath=preceding-sibling::*[1]').locator('p').first();
  }
  get sidebarUserEmail(): Locator {
    return this.sidebarNav.locator('xpath=preceding-sibling::*[1]').locator('p').nth(1);
  }
  /** Compact tier badge in sidebar (text is lowercase, CSS uppercases visually). */
  get sidebarTierBadge(): Locator {
    return this.sidebarNav
      .locator('xpath=preceding-sibling::*[1]')
      .getByText(/^(bronze|silver|gold|platinum)$/);
  }
  /** Compact points pill in sidebar ("N pts" / "1,234 pts"). */
  get sidebarPointsBadge(): Locator {
    return this.sidebarNav
      .locator('xpath=preceding-sibling::*[1]')
      .getByText(/^[\d,]+ pts$/);
  }
  get signOutButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign Out' });
  }

  // ─── Headings ─────────────────────────────────────────────────────────────
  get profileHeading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'My Profile' });
  }
  get ordersHeading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Order History' });
  }
  get rewardsHeading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Rewards' });
  }
  headingFor(route: AccountSubRoute): Locator {
    return route === 'profile'
      ? this.profileHeading
      : route === 'orders'
      ? this.ordersHeading
      : this.rewardsHeading;
  }

  // ─── Profile: tier card ───────────────────────────────────────────────────
  /** Big tier label inside the tier card ("bronze"|...). */
  get tierCardLabel(): Locator {
    return this.profileHeading
      .locator('xpath=following-sibling::*[1]')
      .getByText(/^(bronze|silver|gold|platinum)$/);
  }
  /** Discount text inside the tier card ("X% discount" or "No discount"). */
  get tierCardDiscount(): Locator {
    return this.profileHeading
      .locator('xpath=following-sibling::*[1]')
      .getByText(/^(\d+% discount|No discount)$/);
  }
  /** Big points number ("2,100"). */
  get tierCardPoints(): Locator {
    return this.profileHeading
      .locator('xpath=following-sibling::*[1]')
      .locator('p')
      .filter({ hasText: /^[\d,]+$/ })
      .first();
  }
  /** "Progress to {tier}" label. */
  get progressLabel(): Locator {
    return this.page.getByText(/^Progress to (bronze|silver|gold|platinum)$/);
  }
  /** Top-tier indicator shown for platinum. */
  get progressTopTier(): Locator {
    return this.page.getByText(/highest tier/i);
  }

  // ─── Profile: account details ─────────────────────────────────────────────
  accountDetailValue(label: 'Name' | 'Email' | 'Member since'): Locator {
    return this.page.getByText(label, { exact: true }).locator('xpath=following-sibling::*[1]');
  }

  // ─── Profile: quick actions ───────────────────────────────────────────────
  get viewOrdersQuickAction(): Locator {
    return this.page.getByRole('button', { name: /^View Orders/ });
  }
  get rewardsQuickAction(): Locator {
    return this.page.getByRole('button', { name: /^Rewards Redeem your points/ });
  }

  // ─── Orders ───────────────────────────────────────────────────────────────
  get ordersFiltersToggle(): Locator {
    return this.page.getByRole('button', { name: /^Filters/ });
  }
  get ordersCounter(): Locator {
    return this.page.getByText(/^\d+ (order|orders)$/);
  }
  get sortByDateButton(): Locator {
    return this.page.getByRole('button', { name: /^Date( ↓| ↑)?$/ });
  }
  get sortByTotalButton(): Locator {
    return this.page.getByRole('button', { name: /^Total( ↓| ↑)?$/ });
  }
  /** All visible order ID labels (one per row currently rendered). */
  get orderIdCells(): Locator {
    return this.page.getByText(/^PIE-[A-Z0-9]{6}$/);
  }
  /** Date cells next to each order row (format `MMM d, yyyy`). */
  get orderDateCells(): Locator {
    return this.page.getByText(
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4}$/,
    );
  }
  /** Status badges. */
  get orderStatusBadges(): Locator {
    return this.page.getByText(/^(Pending|In Transit|Delivered|Cancelled)$/);
  }
  /** Total cells (`$NNN.NN`). */
  get orderTotalCells(): Locator {
    return this.page.getByText(/^\$\d+\.\d{2}$/);
  }
  /** Filter controls — only present when filters panel is open. */
  get statusFilterSelect(): Locator {
    return this.page.locator('select').first();
  }
  get minTotalInput(): Locator {
    return this.page.getByPlaceholder('Min');
  }
  get maxTotalInput(): Locator {
    return this.page.getByPlaceholder('Max');
  }
  // Pagination
  get prevPageButton(): Locator {
    return this.page.getByRole('button', { name: 'Previous page' });
  }
  get nextPageButton(): Locator {
    return this.page.getByRole('button', { name: 'Next page' });
  }
  pageNumberButton(n: number): Locator {
    return this.page.getByRole('button', { name: `Page ${n}` });
  }
  /** Empty-state message. */
  get ordersEmptyState(): Locator {
    return this.page.getByText(/No orders found/i);
  }

  // ─── Rewards ──────────────────────────────────────────────────────────────
  get rewardsCatalogHeading(): Locator {
    return this.page.getByRole('heading', { level: 2, name: 'Rewards Catalog' });
  }
  get pointsAvailableHeader(): Locator {
    return this.page.getByText(/^[\d,]+ points available$/);
  }
  get pointsActivityHeading(): Locator {
    return this.page.getByRole('heading', { level: 2, name: 'Points Activity' });
  }
  /** Each reward card anchored by its name paragraph. */
  rewardCard(name: RewardName): Locator {
    return this.page.getByText(name, { exact: true }).locator('xpath=ancestor::*[3]');
  }
  rewardRedeemButton(name: RewardName): Locator {
    return this.rewardCard(name).getByRole('button', { name: 'Redeem' });
  }
  rewardInsufficientText(name: RewardName): Locator {
    return this.rewardCard(name).getByText(/^You need [\d,]+ more points$/);
  }
  /** All rendered reward cards (filter by visible "pts" cost paragraph). */
  get allRewardCostLabels(): Locator {
    return this.rewardsCatalogHeading
      .locator('xpath=ancestor::*[1]/following-sibling::*[1]')
      .getByText(/^[\d,]+ pts$/);
  }
  /** All Points Activity rows (each row holds `+N pts` or `-N pts`). */
  get activityDeltaCells(): Locator {
    return this.page.getByText(/^[+\-][\d,]+ pts$/);
  }
}
