import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { PageFactory } from '../utils/factories/PageFactory';

/**
 * CustomWorld — shared per-scenario state for all UI step definitions.
 *
 * Lifecycle (see hooks/browserHook.ts):
 *   Before  → launches browser, creates context/page, attaches console listener,
 *             builds a PageFactory and wires baseUrl.
 *   After   → closes page/context/browser and resets the factory cache.
 *
 * Domain step files extend this type locally for scenario-specific state
 * (e.g. `interface TrackingWorld extends CustomWorld { seededOrder?: ... }`).
 */
export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  factory?: PageFactory;
  baseUrl?: string;
  consoleErrors: string[] = [];

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
