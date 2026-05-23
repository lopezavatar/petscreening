import {
  Before,
  After,
  When,
  Then,
  setDefaultTimeout,
  World,
} from '@cucumber/cucumber';
import { request, APIRequestContext, APIResponse, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import { ApiClient } from '../../utils/apiClient';

const ENV = process.env.TEST_ENV ?? 'dev';
dotenv.config({ path: path.resolve(__dirname, `../../resources/env/.env.${ENV}`) });

setDefaultTimeout(30_000);

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ProductsWorld extends World {
  apiRequestCtx?: APIRequestContext;
  apiClient?: ApiClient;
  lastResponse?: APIResponse;
  lastProducts?: ProductDto[];
  /** Full catalog fetched once per scenario in the Before hook. */
  catalogSnapshot?: ProductDto[];
  /** Price threshold used by the current minPrice filter test. */
  appliedMinPrice?: number;
  /** Price threshold used by the current maxPrice filter test. */
  appliedMaxPrice?: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

Before({ tags: '@api' }, async function (this: ProductsWorld) {
  this.apiRequestCtx = await request.newContext({ baseURL: BASE_URL });
  this.apiClient = new ApiClient(this.apiRequestCtx);

  // Fetch catalog snapshot once so data-driven steps can derive thresholds
  // without making extra network calls inside individual step definitions.
  const snapshotRes = await this.apiRequestCtx.get('/api/products');
  if (!snapshotRes.ok()) {
    throw new Error(
      `Catalog snapshot fetch failed: ${snapshotRes.status()} ${snapshotRes.statusText()}`,
    );
  }
  this.catalogSnapshot = (await snapshotRes.json()) as ProductDto[];
});

After({ tags: '@api' }, async function (this: ProductsWorld) {
  await this.apiRequestCtx?.dispose();
});

// ─── When steps ───────────────────────────────────────────────────────────────

When('I request GET \\/api\\/products', async function (this: ProductsWorld) {
  this.lastResponse = await this.apiClient!.getRaw('/api/products');
  this.lastProducts = (await this.lastResponse.json()) as ProductDto[];
});

When(
  'I request GET \\/api\\/products with category filter {string}',
  async function (this: ProductsWorld, category: string) {
    this.lastResponse = await this.apiClient!.getRaw('/api/products', { category });
    this.lastProducts = (await this.lastResponse.json()) as ProductDto[];
  },
);

When(
  'I request GET \\/api\\/products with available filter {string}',
  async function (this: ProductsWorld, available: string) {
    this.lastResponse = await this.apiClient!.getRaw('/api/products', { available });
    this.lastProducts = (await this.lastResponse.json()) as ProductDto[];
  },
);

When(
  'I request GET \\/api\\/products with a minPrice threshold picked from the catalog',
  async function (this: ProductsWorld) {
    const sorted = [...this.catalogSnapshot!].sort((a, b) => a.price - b.price);
    // Median price — guarantees at least half the catalog is returned.
    this.appliedMinPrice = sorted[Math.floor(sorted.length / 2)].price;
    this.lastResponse = await this.apiClient!.getRaw('/api/products', {
      minPrice: String(this.appliedMinPrice),
    });
    this.lastProducts = (await this.lastResponse.json()) as ProductDto[];
  },
);

When(
  'I request GET \\/api\\/products with a maxPrice threshold picked from the catalog',
  async function (this: ProductsWorld) {
    const sorted = [...this.catalogSnapshot!].sort((a, b) => a.price - b.price);
    // 75th-percentile price — guarantees at least 75% of the catalog is returned.
    this.appliedMaxPrice = sorted[Math.floor(sorted.length * 0.75)].price;
    this.lastResponse = await this.apiClient!.getRaw('/api/products', {
      maxPrice: String(this.appliedMaxPrice),
    });
    this.lastProducts = (await this.lastResponse.json()) as ProductDto[];
  },
);

When(
  'I request GET \\/api\\/products with a price range picked from the catalog',
  async function (this: ProductsWorld) {
    const sorted = [...this.catalogSnapshot!].sort((a, b) => a.price - b.price);
    // Q1 to Q3 interquartile range — always yields a non-empty result set.
    this.appliedMinPrice = sorted[Math.floor(sorted.length * 0.25)].price;
    this.appliedMaxPrice = sorted[Math.floor(sorted.length * 0.75)].price;
    this.lastResponse = await this.apiClient!.getRaw('/api/products', {
      minPrice: String(this.appliedMinPrice),
      maxPrice: String(this.appliedMaxPrice),
    });
    this.lastProducts = (await this.lastResponse.json()) as ProductDto[];
  },
);

When(
  'I request GET \\/api\\/products sorted by {string} in {string} order',
  async function (this: ProductsWorld, sortBy: string, sortOrder: string) {
    this.lastResponse = await this.apiClient!.getRaw('/api/products', { sortBy, sortOrder });
    this.lastProducts = (await this.lastResponse.json()) as ProductDto[];
  },
);

When(
  'I request GET \\/api\\/products with category {string}, available {string}, sorted by {string}',
  async function (this: ProductsWorld, category: string, available: string, sortBy: string) {
    this.lastResponse = await this.apiClient!.getRaw('/api/products', {
      category,
      available,
      sortBy,
    });
    this.lastProducts = (await this.lastResponse.json()) as ProductDto[];
  },
);

// ─── Then steps ───────────────────────────────────────────────────────────────

Then('the response status is {int}', function (this: ProductsWorld, expected: number) {
  expect(this.lastResponse!.status()).toBe(expected);
});

Then(
  'the Content-Type header contains {string}',
  function (this: ProductsWorld, fragment: string) {
    const ct = this.lastResponse!.headers()['content-type'] ?? '';
    expect(ct).toContain(fragment);
  },
);

Then('the response body is a non-empty array of products', function (this: ProductsWorld) {
  expect(Array.isArray(this.lastProducts)).toBe(true);
  expect(this.lastProducts!.length).toBeGreaterThan(0);
});

Then(
  'every product in the array conforms to the product schema',
  function (this: ProductsWorld) {
    const validCategories = ['fruit', 'cream', 'savory', 'seasonal'];

    for (const p of this.lastProducts!) {
      // Required fields present
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('description');
      expect(p).toHaveProperty('price');
      expect(p).toHaveProperty('image');
      expect(p).toHaveProperty('category');
      expect(p).toHaveProperty('available');
      expect(p).toHaveProperty('popularity');

      // id — non-empty string
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);

      // name — non-empty string
      expect(typeof p.name).toBe('string');
      expect(p.name.length).toBeGreaterThan(0);

      // description — non-empty string
      expect(typeof p.description).toBe('string');
      expect(p.description.length).toBeGreaterThan(0);

      // price — positive number
      expect(typeof p.price).toBe('number');
      expect(p.price).toBeGreaterThan(0);

      // image — non-empty string
      expect(typeof p.image).toBe('string');
      expect(p.image.length).toBeGreaterThan(0);

      // category — one of the four valid values
      expect(validCategories).toContain(p.category);

      // available — boolean
      expect(typeof p.available).toBe('boolean');

      // popularity — number in [0, 100]
      expect(typeof p.popularity).toBe('number');
      expect(p.popularity).toBeGreaterThanOrEqual(0);
      expect(p.popularity).toBeLessThanOrEqual(100);
    }
  },
);

Then(
  'the response contains at least {int} products',
  function (this: ProductsWorld, count: number) {
    expect(this.lastProducts!.length).toBeGreaterThanOrEqual(count);
  },
);

Then('products from all four categories are present', function (this: ProductsWorld) {
  const categories = new Set(this.lastProducts!.map((p) => p.category));
  // spec: the four valid categories are fruit, cream, savory, seasonal
  expect(categories.has('fruit')).toBe(true);
  expect(categories.has('cream')).toBe(true);
  expect(categories.has('savory')).toBe(true);
  expect(categories.has('seasonal')).toBe(true);
});

Then(
  'every returned product has category {string}',
  function (this: ProductsWorld, expected: string) {
    expect(this.lastProducts!.length).toBeGreaterThan(0);
    for (const p of this.lastProducts!) {
      expect(p.category).toBe(expected);
    }
  },
);

Then('at least one product is returned', function (this: ProductsWorld) {
  expect(this.lastProducts!.length).toBeGreaterThan(0);
});

Then(
  'every returned product has available equal to {word}',
  function (this: ProductsWorld, availableStr: string) {
    const expected = availableStr === 'true';
    expect(this.lastProducts!.length).toBeGreaterThan(0);
    for (const p of this.lastProducts!) {
      expect(p.available).toBe(expected);
    }
  },
);

Then(
  'every returned product has price at or above the applied minPrice threshold',
  function (this: ProductsWorld) {
    expect(this.lastProducts!.length).toBeGreaterThan(0);
    for (const p of this.lastProducts!) {
      expect(p.price).toBeGreaterThanOrEqual(this.appliedMinPrice!);
    }
  },
);

Then(
  'every returned product has price at or below the applied maxPrice threshold',
  function (this: ProductsWorld) {
    expect(this.lastProducts!.length).toBeGreaterThan(0);
    for (const p of this.lastProducts!) {
      expect(p.price).toBeLessThanOrEqual(this.appliedMaxPrice!);
    }
  },
);

Then(
  'every returned product has price within the applied price range',
  function (this: ProductsWorld) {
    expect(this.lastProducts!.length).toBeGreaterThan(0);
    for (const p of this.lastProducts!) {
      expect(p.price).toBeGreaterThanOrEqual(this.appliedMinPrice!);
      expect(p.price).toBeLessThanOrEqual(this.appliedMaxPrice!);
    }
  },
);

Then(
  'the products are sorted by price in ascending order',
  function (this: ProductsWorld) {
    const prices = this.lastProducts!.map((p) => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  },
);

Then(
  'the products are sorted by price in descending order',
  function (this: ProductsWorld) {
    const prices = this.lastProducts!.map((p) => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  },
);
