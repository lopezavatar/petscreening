import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage — POM for `/login`.
 *
 * Selector strategy: roles + accessible names + native ids. Validated via
 * Playwright MCP against the running app (no `data-testid` attributes).
 */
export class LoginPage extends BasePage {
  get pageUrl(): string {
    return '/login';
  }

  // ─── Header ──────────────────────────────────────────────────────────────
  get backToMenuButton(): Locator {
    return this.page.getByRole('button', { name: /Back to menu/ });
  }
  get logoImage(): Locator {
    return this.page.getByRole('img', { name: 'Pie In The Sky' });
  }

  // ─── Form ────────────────────────────────────────────────────────────────
  get welcomeHeading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Welcome Back' });
  }
  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email' });
  }
  get passwordInput(): Locator {
    return this.page.locator('#password');
  }
  get signInButton(): Locator {
    return this.page.getByRole('button', { name: /Sign In|Signing in\.\.\./ });
  }
  /** Generic auth error container (renders only after a failed submit). */
  get errorMessage(): Locator {
    return this.page.getByText('Invalid email or password');
  }

  // ─── Test-accounts panel ─────────────────────────────────────────────────
  get testAccountsHeading(): Locator {
    return this.page.getByText('Test Accounts', { exact: true });
  }

  // ─── Page contract ───────────────────────────────────────────────────────
  async assertPageLoaded(): Promise<void> {
    await expect(this.welcomeHeading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  // ─── Actions ─────────────────────────────────────────────────────────────
  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.signInButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  async clickBackToMenu(): Promise<void> {
    await this.backToMenuButton.click();
  }
}
