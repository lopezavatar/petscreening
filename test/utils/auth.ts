import type { BrowserContext, Page } from '@playwright/test';

/**
 * Map of test-user → DB id (matches seed in data/db.json).
 */
export const TIER_USER_IDS = {
  bronze: 'user-bronze',
  silver: 'user-silver',
  gold: 'user-gold',
  platinum: 'user-platinum',
} as const;

export const TIER_USER_POINTS = {
  bronze: 150,
  silver: 820,
  gold: 2100,
  platinum: 4500,
} as const;

export type Tier = keyof typeof TIER_USER_IDS;

/**
 * Inject the `pits_auth` sessionStorage payload that AuthContext expects.
 *
 * Uses `addInitScript` so the value is present BEFORE any page script runs on
 * the first navigation. This avoids a dev-mode race (React strict-mode
 * double-invoke + Next.js HMR) where the first AuthContext mount's
 * `/api/users/:id` fetch can be aborted → fetchUser returns null →
 * AuthContext removes the auth key from sessionStorage.
 */
export async function loginAs(page: Page, tier: Tier, baseUrl: string): Promise<void> {
  const payload = JSON.stringify({
    userId: TIER_USER_IDS[tier],
    points: TIER_USER_POINTS[tier],
  });
  await page.addInitScript((data) => {
    try {
      window.sessionStorage.setItem('pits_auth', data);
    } catch {
      // sessionStorage may not be available yet on about:blank — ignore.
    }
  }, payload);
  await page.goto(baseUrl + '/', { waitUntil: 'networkidle' });
}

/** Wipe persisted cart + auth state between scenarios. */
export async function clearSessionState(page: Page): Promise<void> {
  await page.evaluate(() => {
    sessionStorage.removeItem('pits_cart');
    sessionStorage.removeItem('pits_auth');
  });
}

/**
 * Counterpart to `loginAs`: clears the current auth payload AND registers a
 * fresh init script that re-clears `pits_auth` on every subsequent navigation,
 * so the seed script from `loginAs` cannot re-authenticate the page.
 */
export async function forgetSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      window.sessionStorage.removeItem('pits_auth');
    } catch {
      // ignore
    }
  });
  await page.evaluate(() => {
    try {
      sessionStorage.removeItem('pits_auth');
    } catch {
      // ignore
    }
  });
}
