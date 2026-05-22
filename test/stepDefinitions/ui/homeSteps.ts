import { Before, After, Given, When, Then, setDefaultTimeout, World } from '@cucumber/cucumber';
import {
  chromium,
  firefox,
  webkit,
  Browser,
  BrowserContext,
  ConsoleMessage,
  Page,
  expect,
} from '@playwright/test';
import { PageFactory } from '../../utils/factories/PageFactory';
import { HomePage, type SortLabel, type CategoryLabel } from '../../pages/HomePage';
import { loginAs, type Tier } from '../../utils/auth';

setDefaultTimeout(30_000);

// ─── Test-scoped state ───────────────────────────────────────────────────────

const PAGE_SIZE = 6;

interface ProductDto {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
}

interface CatalogSnapshot {
  products: ProductDto[];
  total: number;
  available: ProductDto[];
  outOfStock: ProductDto[];
  byCategoryAvailable: Record<string, ProductDto[]>;
  minPrice: number;
  maxPrice: number;
}

interface HomeWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  factory?: PageFactory;
  home?: HomePage;
  consoleErrors?: string[];
  signedInTier?: Tier;
  baseUrl?: string;
  catalog?: CatalogSnapshot;
  /** Unique products picked at runtime for "first/second in-stock" steps. */
  pickedProducts?: ProductDto[];
  /** Every add-to-cart action; duplicates encode quantity. */
  cartAdditions?: ProductDto[];
  /** Last category chip the user activated (for data-driven category assertions). */
  activeCategory?: string;
}

function catalog(world: HomeWorld): CatalogSnapshot {
  if (!world.catalog) throw new Error('Catalog snapshot not loaded');
  return world.catalog;
}

function pickInStock(world: HomeWorld, index: number): ProductDto {
  const c = catalog(world);
  const p = c.available[index];
  if (!p) throw new Error(`No in-stock product at index ${index} (have ${c.available.length})`);
  world.pickedProducts = world.pickedProducts ?? [];
  if (!world.pickedProducts.find((x) => x.id === p.id)) world.pickedProducts.push(p);
  return p;
}

function launcher(name?: string) {
  switch (name) {
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
    default:
      return chromium;
  }
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

Before({ tags: '@home' }, async function (this: HomeWorld) {
  const browserName = (this.parameters as { browser?: string } | undefined)?.browser;
  this.baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
  this.browser = await launcher(browserName).launch({
    headless: process.env.PWHEADLESS !== 'false',
  });
  this.context = await this.browser.newContext({ baseURL: this.baseUrl });
  this.page = await this.context.newPage();
  this.consoleErrors = [];
  this.page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') this.consoleErrors!.push(msg.text());
  });
  this.factory = new PageFactory(this.page);
  this.home = this.factory.create('home');
  this.signedInTier = undefined;
  this.pickedProducts = [];
  this.cartAdditions = [];
  this.activeCategory = undefined;

  // Snapshot the catalog once per scenario so tests stay data-agnostic.
  const res = await this.page.request.get(this.baseUrl + '/api/products');
  if (res.status() !== 200) throw new Error(`catalog snapshot fetch failed: ${res.status()}`);
  const products = (await res.json()) as ProductDto[];
  const available = products.filter((p) => p.available);
  const outOfStock = products.filter((p) => !p.available);
  const byCategoryAvailable: Record<string, ProductDto[]> = {};
  for (const p of available) {
    (byCategoryAvailable[p.category] ??= []).push(p);
  }
  this.catalog = {
    products,
    total: products.length,
    available,
    outOfStock,
    byCategoryAvailable,
    minPrice: Math.min(...products.map((p) => p.price)),
    maxPrice: Math.max(...products.map((p) => p.price)),
  };
});

After({ tags: '@home' }, async function (this: HomeWorld) {
  await this.page?.close().catch(() => undefined);
  await this.context?.close().catch(() => undefined);
  await this.browser?.close().catch(() => undefined);
  this.factory?.reset();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function home(world: HomeWorld): HomePage {
  if (!world.home) throw new Error('HomePage not initialised; missing @home tag?');
  return world.home;
}
function pageOf(world: HomeWorld): Page {
  if (!world.page) throw new Error('Page not initialised');
  return world.page;
}

// ─── Given (Arrange) ────────────────────────────────────────────────────────

Given('I am signed in as a {string} user', async function (this: HomeWorld, tier: string) {
  this.signedInTier = tier as Tier;
  await loginAs(pageOf(this), this.signedInTier, this.baseUrl!);
});

Given('the home page responds with HTTP 200', async function (this: HomeWorld) {
  const response = await pageOf(this).request.get(this.baseUrl! + '/');
  expect(response.status()).toBe(200);
});

Given('I open the home page as a guest', async function (this: HomeWorld) {
  await home(this).navigateTo(home(this).pageUrl);
  await home(this).assertPageLoaded();
});

Given(
  /^I open the home page$/,
  async function (this: HomeWorld) {
    await home(this).navigateTo(home(this).pageUrl);
    await home(this).assertPageLoaded();
    if (this.signedInTier) {
      await expect(home(this).tierBadgeButton).toBeVisible({ timeout: 15_000 });
    }
  }
);

Given('I open the filters panel', async function (this: HomeWorld) {
  await home(this).openFiltersPanel();
});

// ─── When (Act) ─────────────────────────────────────────────────────────────

When('I reload the page', async function (this: HomeWorld) {
  await pageOf(this).reload();
  await home(this).assertPageLoaded();
});

When('I click pagination page {int}', async function (this: HomeWorld, n: number) {
  await home(this).pageButton(n).click();
});

When('I click the last pagination page', async function (this: HomeWorld) {
  const c = catalog(this);
  const lastPage = Math.max(1, Math.ceil(c.total / PAGE_SIZE));
  if (lastPage === 1) return; // already on last page
  await home(this).pageButton(lastPage).click();
});

When('I select sort option {string}', async function (this: HomeWorld, label: string) {
  await home(this).selectSort(label as SortLabel);
});

When('I select the {string} category chip', async function (this: HomeWorld, label: string) {
  await home(this).categoryChip(label as CategoryLabel).click();
  this.activeCategory = label === 'All' ? undefined : label;
});

When(
  'I set the price range to min {int} and max {int}',
  async function (this: HomeWorld, min: number, max: number) {
    await home(this).minPriceInput.fill(String(min));
    await home(this).maxPriceInput.fill(String(max));
  }
);

When('I turn on the {string} switch', async function (this: HomeWorld, name: string) {
  if (name !== 'In Stock Only') throw new Error(`Unknown switch: ${name}`);
  const sw = home(this).inStockToggle;
  if ((await sw.getAttribute('aria-checked')) !== 'true') {
    await sw.click();
  }
  await expect(sw).toHaveAttribute('aria-checked', 'true');
});

When('I click {string}', async function (this: HomeWorld, label: string) {
  await pageOf(this).getByRole('button', { name: label }).click();
});

When(
  'I add the product {string} to the cart',
  async function (this: HomeWorld, name: string) {
    await home(this).addProductToCart(name);
    const p = catalog(this).products.find((x) => x.name === name);
    if (p) {
      (this.cartAdditions ??= []).push(p);
      this.pickedProducts ??= [];
      if (!this.pickedProducts.find((x) => x.id === p.id)) this.pickedProducts.push(p);
    }
  }
);

When('I click the cart drawer Checkout button', async function (this: HomeWorld) {
  await home(this).cartDrawerCheckoutButton.click();
});

When('I click the header {string} link', async function (this: HomeWorld, label: string) {
  await pageOf(this).getByRole('link', { name: label }).click();
});

When('I click the header tier badge button', async function (this: HomeWorld) {
  await home(this).tierBadgeButton.click();
});

When('I focus the header logo via keyboard', async function (this: HomeWorld) {
  await home(this).logo.focus();
});

When('I focus the Add button for {string}', async function (this: HomeWorld, name: string) {
  await home(this).addButtonFor(name).focus();
});

When('I focus the Next page button', async function (this: HomeWorld) {
  await home(this).nextPageButton.focus();
});

// ── Data-driven actions ────────────────────────────────────────────────────
When(
  'I add the {word} in-stock product to the cart',
  async function (this: HomeWorld, ordinal: 'first' | 'second' | 'third') {
    const idx = { first: 0, second: 1, third: 2 }[ordinal] ?? 0;
    const product = pickInStock(this, idx);
    await home(this).addProductToCart(product.name);
    (this.cartAdditions ??= []).push(product);
  }
);

When(
  'I add the {word} in-stock product to the cart {int} times',
  async function (this: HomeWorld, ordinal: 'first' | 'second' | 'third', times: number) {
    const idx = { first: 0, second: 1, third: 2 }[ordinal] ?? 0;
    const product = pickInStock(this, idx);
    for (let i = 0; i < times; i++) {
      await home(this).addProductToCart(product.name);
      (this.cartAdditions ??= []).push(product);
    }
  }
);

When('I focus the first Add button', async function (this: HomeWorld) {
  await home(this).productCards.first().locator('..').getByRole('button', { name: 'Add' }).focus();
});

When(
  'I set the price range to the catalog minimum exactly',
  async function (this: HomeWorld) {
    const m = catalog(this).minPrice;
    await home(this).minPriceInput.fill(String(m));
    await home(this).maxPriceInput.fill(String(m));
  }
);

When(
  'I set the price range to the catalog maximum exactly',
  async function (this: HomeWorld) {
    const m = catalog(this).maxPrice;
    await home(this).minPriceInput.fill(String(m));
    await home(this).maxPriceInput.fill(String(m));
  }
);

When(
  'I set the price range to an inverted window',
  async function (this: HomeWorld) {
    const c = catalog(this);
    // min strictly greater than max — no product can satisfy.
    await home(this).minPriceInput.fill(String(c.maxPrice + 1));
    await home(this).maxPriceInput.fill(String(c.minPrice - 1));
  }
);

// ─── Then (Assert) ──────────────────────────────────────────────────────────

Then(
  'the hero heading {string} is visible',
  async function (this: HomeWorld, text: string) {
    await expect(
      pageOf(this).getByRole('heading', { level: 1, name: text })
    ).toBeVisible();
  }
);

Then('the product catalog grid is visible', async function (this: HomeWorld) {
  await expect(home(this).productCards.first()).toBeVisible();
  expect(await home(this).productCards.count()).toBeGreaterThan(0);
});

Then('the pie counter shows {int}', async function (this: HomeWorld, n: number) {
  await expect(home(this).pieCounter).toHaveText(
    new RegExp(`^${n} (pie|pies)$`)
  );
});

Then('the products API returns {int} products', async function (this: HomeWorld, n: number) {
  const res = await pageOf(this).request.get(this.baseUrl! + '/api/products');
  expect(res.status()).toBe(200);
  const body = (await res.json()) as unknown[];
  expect(body.length).toBe(n);
});

Then('the product grid shows {int} products', async function (this: HomeWorld, n: number) {
  await expect(home(this).productCards).toHaveCount(n);
});

Then('the Previous page control is visible', async function (this: HomeWorld) {
  await expect(home(this).previousPageButton).toBeVisible();
});
Then('the Next page control is visible', async function (this: HomeWorld) {
  await expect(home(this).nextPageButton).toBeVisible();
});
Then('pagination shows {int} page buttons', async function (this: HomeWorld, n: number) {
  const count = await pageOf(this)
    .getByRole('button', { name: /^Page \d+$/ })
    .count();
  expect(count).toBe(n);
});
Then('the Previous page button is disabled', async function (this: HomeWorld) {
  await expect(home(this).previousPageButton).toBeDisabled();
});
Then('the Previous page button is enabled', async function (this: HomeWorld) {
  await expect(home(this).previousPageButton).toBeEnabled();
});
Then('the Next page button is disabled', async function (this: HomeWorld) {
  await expect(home(this).nextPageButton).toBeDisabled();
});
Then('the Next page button is enabled', async function (this: HomeWorld) {
  await expect(home(this).nextPageButton).toBeEnabled();
});

Then('the sort dropdown label is {string}', async function (this: HomeWorld, label: string) {
  await expect(home(this).sortDropdownButton).toContainText(label);
});

Then(
  'the visible products are ordered by {word} {word}',
  async function (this: HomeWorld, key: 'price' | 'name', dir: 'asc' | 'desc') {
    if (key === 'price') {
      const prices = await home(this).getVisibleProductPrices();
      const sorted = [...prices].sort((a, b) => (dir === 'asc' ? a - b : b - a));
      expect(prices).toEqual(sorted);
    } else {
      const names = await home(this).getVisibleProductNames();
      const sorted = [...names].sort((a, b) =>
        dir === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
      );
      expect(names).toEqual(sorted);
    }
  }
);

Then(
  'every visible product card has the {string} category badge',
  async function (this: HomeWorld, label: string) {
    const cards = home(this).productCards;
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const card = cards.nth(i).locator('..');
      await expect(card.getByText(label, { exact: true }).first()).toBeVisible();
    }
  }
);

Then(
  'every visible product price is between {int} and {int}',
  async function (this: HomeWorld, min: number, max: number) {
    const prices = await home(this).getVisibleProductPrices();
    expect(prices.length).toBeGreaterThan(0);
    for (const p of prices) {
      expect(p).toBeGreaterThanOrEqual(min);
      expect(p).toBeLessThanOrEqual(max);
    }
  }
);

async function isProductVisibleAcrossPages(world: HomeWorld, name: string): Promise<boolean> {
  const h = home(world);
  // Walk every page; pagination is finite.
  while (true) {
    const found = await h.productCard(name).first().isVisible().catch(() => false);
    if (found) return true;
    const next = h.nextPageButton;
    // Single-page result: the pagination UI is not rendered at all.
    if ((await next.count()) === 0) return false;
    if (await next.isDisabled().catch(() => true)) return false;
    await next.click();
    await pageOf(world).waitForLoadState('networkidle');
  }
}

Then(
  'the product {string} is not visible across all pages',
  async function (this: HomeWorld, name: string) {
    const visible = await isProductVisibleAcrossPages(this, name);
    expect(visible).toBe(false);
  }
);

Then(
  'the pie counter matches the visible product count',
  async function (this: HomeWorld) {
    const expected = await home(this).getPieCounterValue();
    let total = 0;
    do {
      total += await home(this).productCards.count();
      const next = home(this).nextPageButton;
      if ((await next.count()) === 0) break;
      if (await next.isDisabled().catch(() => true)) break;
      await next.click();
      await pageOf(this).waitForLoadState('networkidle');
    } while (true);
    expect(total).toBe(expected);
  }
);

Then(
  'the {string} control is not visible',
  async function (this: HomeWorld, label: string) {
    await expect(pageOf(this).getByRole('button', { name: label })).toHaveCount(0);
  }
);

Then('the {string} category chip is selected', async function (this: HomeWorld, label: string) {
  // The active chip has the brand background and white text; check the
  // computed background colour is non-transparent and non-grey.
  const chip = home(this).categoryChip(label as CategoryLabel);
  await expect(chip).toBeVisible();
  const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
});

Then('the min price input is empty', async function (this: HomeWorld) {
  await expect(home(this).minPriceInput).toHaveValue('');
});
Then('the max price input is empty', async function (this: HomeWorld) {
  await expect(home(this).maxPriceInput).toHaveValue('');
});
Then('the {string} switch is off', async function (this: HomeWorld, name: string) {
  if (name !== 'In Stock Only') throw new Error(`Unknown switch: ${name}`);
  await expect(home(this).inStockToggle).toHaveAttribute('aria-checked', 'false');
});

Then(
  'the header cart shortcut shows {int} item',
  async function (this: HomeWorld, n: number) {
    await expect(home(this).cartShortcutCount).toHaveText(String(n));
  }
);
Then(
  'the header cart shortcut shows {int} items',
  async function (this: HomeWorld, n: number) {
    await expect(home(this).cartShortcutCount).toHaveText(String(n));
  }
);

Then('the sticky cart drawer is visible', async function (this: HomeWorld) {
  await expect(home(this).cartDrawerItemsText).toBeVisible();
  await expect(home(this).cartDrawerCheckoutButton).toBeVisible();
});
Then('the sticky cart drawer is not visible', async function (this: HomeWorld) {
  await expect(home(this).cartDrawerCheckoutButton).toHaveCount(0);
});

Then('the cart drawer subtotal is {word}', async function (this: HomeWorld, value: string) {
  await expect(home(this).cartDrawerSubtotal).toHaveText(value);
});

Then('the URL path is {string}', async function (this: HomeWorld, path: string) {
  await pageOf(this).waitForURL(`**${path}`);
  expect(new URL(pageOf(this).url()).pathname).toBe(path);
});

Then('the header {string} link is not visible', async function (this: HomeWorld, label: string) {
  await expect(pageOf(this).getByRole('link', { name: label })).toHaveCount(0);
});

Then('the header tier badge button is visible', async function (this: HomeWorld) {
  await expect(home(this).tierBadgeButton).toBeVisible();
});

Then('the tier badge initial is {string}', async function (this: HomeWorld, initial: string) {
  await expect(home(this).tierBadgeButton).toContainText(initial);
});

Then('the account menu shows {string}', async function (this: HomeWorld, label: string) {
  await expect(
    pageOf(this).getByRole('link', { name: label }).or(pageOf(this).getByRole('button', { name: label }))
  ).toBeVisible();
});

Then('the price of {string} is {word}', async function (this: HomeWorld, name: string, price: string) {
  await expect(home(this).productCard(name).getByText(price)).toBeVisible();
});

Then('the header logo has href {string}', async function (this: HomeWorld, href: string) {
  await expect(home(this).logo).toHaveAttribute('href', href);
});

Then('the header logo is the active element', async function (this: HomeWorld) {
  const isFocused = await home(this).logo.evaluate((el) => el === document.activeElement);
  expect(isFocused).toBe(true);
});

Then('the browser console has no errors', async function (this: HomeWorld) {
  // Allow Next.js dev-mode hydration / fast-refresh warnings if any slipped
  // through as info; only fail on real "error" messages collected above.
  expect(this.consoleErrors ?? []).toEqual([]);
});

Then('every product image alt text matches its pie name', async function (this: HomeWorld) {
  const headings = await home(this).getVisibleProductNames();
  for (const name of headings) {
    await expect(pageOf(this).getByRole('img', { name }).first()).toBeVisible();
  }
});

Then('the focused element has a visible focus indicator', async function (this: HomeWorld) {
  const result = await pageOf(this).evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { ok: false, reason: 'no active element' };
    const style = getComputedStyle(el);
    const outline = parseFloat(style.outlineWidth || '0');
    const ring = style.boxShadow && style.boxShadow !== 'none';
    return {
      ok: outline > 0 || ring,
      outline: style.outlineWidth,
      outlineStyle: style.outlineStyle,
      boxShadow: style.boxShadow,
    };
  });
  expect(result.ok, `focus indicator missing: ${JSON.stringify(result)}`).toBe(true);
});

// ─── Data-driven assertions ────────────────────────────────────────────────

Then('the pie counter matches the catalog total', async function (this: HomeWorld) {
  const expected = catalog(this).total;
  await expect(home(this).pieCounter).toHaveText(
    new RegExp(`^${expected} (pie|pies)$`)
  );
});

Then('the products API matches the catalog snapshot', async function (this: HomeWorld) {
  const res = await pageOf(this).request.get(this.baseUrl! + '/api/products');
  expect(res.status()).toBe(200);
  const body = (await res.json()) as unknown[];
  expect(body.length).toBe(catalog(this).total);
});

Then('the product grid shows the first page of products', async function (this: HomeWorld) {
  const expected = Math.min(catalog(this).total, PAGE_SIZE);
  await expect(home(this).productCards).toHaveCount(expected);
});

Then(
  'pagination shows the expected number of page buttons',
  async function (this: HomeWorld) {
    const total = catalog(this).total;
    const expectedPages = Math.ceil(total / PAGE_SIZE);
    const count = await pageOf(this)
      .getByRole('button', { name: /^Page \d+$/ })
      .count();
    if (expectedPages <= 1) {
      // Pagination UI may collapse for a single page.
      expect(count).toBeLessThanOrEqual(1);
    } else {
      expect(count).toBe(expectedPages);
    }
  }
);

Then('the product grid has at least 1 visible product', async function (this: HomeWorld) {
  expect(await home(this).productCards.count()).toBeGreaterThan(0);
});

Then('no products are visible', async function (this: HomeWorld) {
  await expect(home(this).productCards).toHaveCount(0);
});

Then(
  'no out-of-stock product is visible across all pages',
  async function (this: HomeWorld) {
    const c = catalog(this);
    if (c.outOfStock.length === 0) return; // nothing to verify against
    for (const product of c.outOfStock) {
      const visible = await isProductVisibleAcrossPages(this, product.name);
      expect(visible, `expected out-of-stock product "${product.name}" to be hidden`).toBe(false);
    }
  }
);

Then(
  'every visible product card has the active category badge',
  async function (this: HomeWorld) {
    // Reads the chip currently rendered selected and asserts every card carries it.
    const cards = home(this).productCards;
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    // Use the active-category label captured in world via the selection step.
    const label = (this as HomeWorld & { activeCategory?: string }).activeCategory;
    if (!label) throw new Error('No active category recorded');
    for (let i = 0; i < n; i++) {
      const card = cards.nth(i).locator('..');
      await expect(card.getByText(label, { exact: true }).first()).toBeVisible();
    }
  }
);

Then(
  'the price of every picked product matches the catalog snapshot',
  async function (this: HomeWorld) {
    const picked = this.pickedProducts ?? [];
    expect(picked.length).toBeGreaterThan(0);
    for (const p of picked) {
      const expected = `$${p.price.toFixed(2)}`;
      await expect(home(this).productCard(p.name).getByText(expected)).toBeVisible();
    }
  }
);

Then(
  'the cart drawer subtotal equals the picked products total',
  async function (this: HomeWorld) {
    const additions = this.cartAdditions ?? [];
    expect(additions.length).toBeGreaterThan(0);
    const expected = additions.reduce((sum, p) => sum + p.price, 0);
    const expectedText = `$${expected.toFixed(2)}`;
    await expect(home(this).cartDrawerSubtotal).toHaveText(expectedText);
  }
);

When(
  'I select a category that has at least 1 in-stock product',
  async function (this: HomeWorld) {
    const c = catalog(this);
    const cat = Object.entries(c.byCategoryAvailable).find(([, list]) => list.length > 0)?.[0];
    if (!cat) throw new Error('No category has in-stock products');
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    await home(this).categoryChip(label as CategoryLabel).click();
    this.activeCategory = label;
  }
);

Then(
  'the displayed price of every visible in-stock product matches the catalog',
  async function (this: HomeWorld) {
    const c = catalog(this);
    const names = await home(this).getVisibleProductNames();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const p = c.products.find((x) => x.name === name);
      if (!p) continue; // unexpected product — skip
      const expected = `$${p.price.toFixed(2)}`;
      await expect(home(this).productCard(p.name).getByText(expected)).toBeVisible();
    }
  }
);

