import { Page } from '@playwright/test';
import { BasePage } from '../../pages/BasePage';
import { HomePage } from '../../pages/HomePage';

/**
 * PageType — union of all registered page keys.
 * Add new pages here as the project grows.
 */
export type PageType = 'home';

/**
 * PageFactory — Factory pattern for page object instantiation.
 *
 * Centralises creation so step definitions never import page classes directly.
 * This makes it trivial to swap implementations (e.g. mobile vs desktop POMs)
 * by changing only this file.
 *
 * Usage in step definitions:
 *   const homePage = factory.create('home');
 *   await homePage.navigateTo(homePage.pageUrl);
 */
export class PageFactory {
  private readonly page: Page;

  /** Cache: reuse the same instance per page type within a test */
  private readonly cache = new Map<PageType, BasePage>();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Returns a (cached) page object for the given key.
   * Instantiates on first call, then returns the same instance.
   */
  create(type: 'home'): HomePage;
  create(type: PageType): BasePage;
  create(type: PageType): BasePage {
    if (this.cache.has(type)) {
      return this.cache.get(type)!;
    }

    const instance = this.instantiate(type);
    this.cache.set(type, instance);
    return instance;
  }

  /** Clear cache between test scenarios when needed */
  reset(): void {
    this.cache.clear();
  }

  // ─── Private factory switch ───────────────────────────────────────────────

  private instantiate(type: PageType): BasePage {
    switch (type) {
      case 'home':
        return new HomePage(this.page);
      default:
        throw new Error(`PageFactory: unknown page type "${type}"`);
    }
  }
}
