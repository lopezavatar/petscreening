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
import { LoginPage } from '../../pages/LoginPage';

setDefaultTimeout(30_000);

interface LoginWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  factory?: PageFactory;
  login?: LoginPage;
  baseUrl?: string;
  consoleErrors?: string[];
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

function loginPage(w: LoginWorld): LoginPage {
  if (!w.login) throw new Error('LoginPage not initialised; missing @login tag?');
  return w.login;
}
function pageOf(w: LoginWorld): Page {
  if (!w.page) throw new Error('Page not initialised');
  return w.page;
}

// ─── Env resolution ─────────────────────────────────────────────────────────

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * Replace `{ENV_VAR}` tokens in a Gherkin value with the corresponding
 * environment variable. Empty strings and plain literals pass through.
 * Throws if a referenced var is missing so the test fails loudly instead
 * of silently asserting against "undefined".
 */
function resolveEnv(value: string): string {
  return value.replace(/\{([A-Z0-9_]+)\}/g, (_match, name: string) => {
    const v = process.env[name];
    if (v === undefined) {
      throw new Error(
        `Missing required env var "${name}". Add it to test/resources/env/.env.<env>.`
      );
    }
    return v;
  });
}

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var "${name}".`);
  return v;
}

function emailForTier(tier: Tier): string {
  return requiredEnv(`LOGIN_${tier.toUpperCase()}_EMAIL`);
}

function validPassword(): string {
  return requiredEnv('LOGIN_VALID_PASSWORD');
}

/** Fetch the live user record (incl. current points) via the auth API. */
async function fetchUserForTier(world: LoginWorld, tier: Tier) {
  const res = await pageOf(world).request.post(world.baseUrl! + '/api/auth', {
    data: { email: emailForTier(tier), password: validPassword() },
  });
  if (res.status() !== 200) {
    throw new Error(`auth snapshot fetch failed for ${tier}: ${res.status()}`);
  }
  const body = (await res.json()) as { user: { tier: string; points: number } };
  return body.user;
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

Before({ tags: '@login' }, async function (this: LoginWorld) {
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
  this.login = this.factory.create('login');
});

After({ tags: '@login' }, async function (this: LoginWorld) {
  await this.page?.close().catch(() => undefined);
  await this.context?.close().catch(() => undefined);
  await this.browser?.close().catch(() => undefined);
  this.factory?.reset();
});

// ─── Given (Arrange) ────────────────────────────────────────────────────────

Given('the login page responds with HTTP 200', async function (this: LoginWorld) {
  const res = await pageOf(this).request.get(this.baseUrl! + '/login');
  expect(res.status()).toBe(200);
});

Given('I open the login page', async function (this: LoginWorld) {
  await loginPage(this).navigateTo(loginPage(this).pageUrl);
  await loginPage(this).assertPageLoaded();
});

Given('the auth endpoint is delayed by {int} ms', async function (this: LoginWorld, ms: number) {
  await pageOf(this).route('**/api/auth', async (route) => {
    await new Promise((r) => setTimeout(r, ms));
    await route.continue();
  });
});

// ─── When (Act) ─────────────────────────────────────────────────────────────

When(
  'I fill the login form with email {string} and password {string}',
  async function (this: LoginWorld, email: string, password: string) {
    await loginPage(this).fillCredentials(resolveEnv(email), resolveEnv(password));
  }
);

When('I click the Sign In button', async function (this: LoginWorld) {
  await loginPage(this).signInButton.click();
});

When(
  'I sign in with email {string} and password {string}',
  async function (this: LoginWorld, email: string, password: string) {
    await loginPage(this).login(resolveEnv(email), resolveEnv(password));
  }
);

When(
  'I sign in as the {string} test user',
  async function (this: LoginWorld, tier: string) {
    await loginPage(this).login(emailForTier(tier as Tier), validPassword());
  }
);

When('I click the Back to menu button', async function (this: LoginWorld) {
  await loginPage(this).clickBackToMenu();
});

When('I open the home page after login', async function (this: LoginWorld) {
  await pageOf(this).goto(this.baseUrl! + '/');
  await pageOf(this).waitForLoadState('networkidle');
});

When('I reload the current page', async function (this: LoginWorld) {
  await pageOf(this).reload();
  await pageOf(this).waitForLoadState('networkidle');
});

When('I navigate to {string}', async function (this: LoginWorld, path: string) {
  await pageOf(this).goto(this.baseUrl! + path);
});

When('I press {string} inside the password field', async function (this: LoginWorld, key: string) {
  await loginPage(this).passwordInput.press(key);
});

// ─── Then (Assert) ──────────────────────────────────────────────────────────

Then('the login form is visible', async function (this: LoginWorld) {
  const p = loginPage(this);
  await expect(p.welcomeHeading).toBeVisible();
  await expect(p.emailInput).toBeVisible();
  await expect(p.passwordInput).toBeVisible();
  await expect(p.signInButton).toBeVisible();
});

Then('the login error {string} is visible', async function (this: LoginWorld, text: string) {
  await expect(pageOf(this).getByText(text, { exact: true })).toBeVisible();
});

Then('I remain on the login page', async function (this: LoginWorld) {
  expect(new URL(pageOf(this).url()).pathname).toBe('/login');
});

Then(
  'the {string} input is reported invalid by the browser',
  async function (this: LoginWorld, field: 'email' | 'password') {
    const validity = await pageOf(this).locator(`#${field}`).evaluate(
      (el) => (el as HTMLInputElement).validity.valid
    );
    expect(validity).toBe(false);
  }
);

Then('the password input has type {string}', async function (this: LoginWorld, type: string) {
  await expect(loginPage(this).passwordInput).toHaveAttribute('type', type);
});

Then('the header {string} link is visible', async function (this: LoginWorld, label: string) {
  await expect(pageOf(this).getByRole('link', { name: label })).toBeVisible();
});

Then('the header tier badge is shown', async function (this: LoginWorld) {
  const badge = pageOf(this)
    .getByRole('button')
    .filter({ hasText: /(Bronze|Silver|Gold|Platinum)/i })
    .first();
  await expect(badge).toBeVisible();
});

Then(
  'the account page shows the {string} tier',
  async function (this: LoginWorld, tier: string) {
    // /account renders both a tier chip (lowercase text "bronze") and the
    // points line "<n> pts" inside the user card. The chip is the most
    // stable surface for tier identification.
    await expect(
      pageOf(this).getByText(tier, { exact: true }).first()
    ).toBeVisible();
  }
);

Then(
  'the account page shows {int} points',
  async function (this: LoginWorld, points: number) {
    // /account formats points with en-US grouping ("2,100 pts").
    const formatted = points.toLocaleString('en-US');
    await expect(
      pageOf(this).getByText(`${formatted} pts`, { exact: true }).first()
    ).toBeVisible();
  }
);

Then(
  'the account page shows the current points for the {string} user',
  async function (this: LoginWorld, tier: string) {
    // Points are mutable across runs (loyalty deltas, manual edits, seed
    // changes). Re-derive the expected value from the API snapshot taken
    // right now, then assert the formatted value is rendered on /account.
    const live = await fetchUserForTier(this, tier as Tier);
    expect(live.tier.toLowerCase()).toBe(tier.toLowerCase());
    const formatted = live.points.toLocaleString('en-US');
    await expect(
      pageOf(this).getByText(`${formatted} pts`, { exact: true }).first()
    ).toBeVisible();
  }
);

Then(
  'the Sign In button shows {string} and is disabled',
  async function (this: LoginWorld, label: string) {
    const btn = pageOf(this).getByRole('button', { name: label });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  }
);
