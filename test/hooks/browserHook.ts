import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, ConsoleMessage } from '@playwright/test';
import { PageFactory } from '../utils/factories/PageFactory';
import { CustomWorld } from '../world/CustomWorld';

setDefaultTimeout(30_000);

/**
 * Tag expression matching every UI feature in the project. API features
 * are excluded so they don't pay the cost of launching a browser.
 * Keep in sync with the top-level tags in features/ui/**.
 */
const UI_TAGS =
  '@home or @login or @checkout or @confirmation or @tracking or @account';

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

// Run before any domain-specific Before hook so step files can assume
// `this.page`, `this.factory`, `this.baseUrl` are ready. Ordering is
// guaranteed by listing this directory BEFORE stepDefinitions/ in cucumber.js.
Before({ tags: UI_TAGS }, async function (this: CustomWorld) {
  const browserName = (this.parameters as { browser?: string } | undefined)?.browser;
  this.baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
  this.browser = await launcher(browserName).launch({
    headless: process.env.PWHEADLESS !== 'false',
  });
  this.context = await this.browser.newContext({ baseURL: this.baseUrl });
  this.page = await this.context.newPage();
  this.consoleErrors = [];
  this.page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') this.consoleErrors.push(msg.text());
  });
  this.factory = new PageFactory(this.page);
});

// Run last so any domain After hook that still needs the page can do its work.
After({ tags: UI_TAGS }, async function (this: CustomWorld) {
  await this.page?.close().catch(() => undefined);
  await this.context?.close().catch(() => undefined);
  await this.browser?.close().catch(() => undefined);
  this.factory?.reset();
});
