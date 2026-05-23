const path = require('path');
const ALLURE_RESULTS_DIR = path.resolve(__dirname, '../reports/allure-results');

/**
 * cucumber.js — Cucumber-JS profile configuration.
 *
 * Each profile maps to a named execution mode. Profiles are selected via:
 *   npx cucumber-js --profile <name>
 * or via the npm scripts in package.json.
 *
 * Output dirs are relative to the *project root* (one level up from test/).
 */

// AI failure analysis hook — loaded in every profile so it runs after each scenario
const AI_HOOK = 'hooks/**/*.ts';

// Browser launch/close hook — must be required BEFORE stepDefinitions so its
// Before hook registers (and runs) first. Listed by exact path; the same module
// is also matched by AI_HOOK but Node's require cache prevents duplicate load.
const BROWSER_HOOK = 'hooks/browserHook.ts';

module.exports = {
  /** Run all feature files with Chromium (default) */
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['world/**/*.ts', BROWSER_HOOK, 'stepDefinitions/**/*.ts', 'fixtures/**/*.ts', AI_HOOK],
    parallel: 3,
    format: [
      'progress',
      'allure-cucumberjs/reporter',
      'html:../reports/cucumber-report.html',
      'json:../reports/cucumber-report.json',
    ],
    formatOptions: { resultsDir: ALLURE_RESULTS_DIR },
    publishQuiet: true,
  },

  /** UI tests only */
  ui: {
    paths: ['features/ui/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['world/**/*.ts', BROWSER_HOOK, 'stepDefinitions/ui/**/*.ts', 'fixtures/**/*.ts', AI_HOOK],
    parallel: 3,
    format: [
      'progress',
      'html:../reports/cucumber-ui-report.html',
    ],
    publishQuiet: true,
  },

  /** API tests only */
  api: {
    paths: ['features/api/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['world/**/*.ts', BROWSER_HOOK, 'stepDefinitions/api/**/*.ts', 'fixtures/**/*.ts', AI_HOOK],
    parallel: 3,
    format: [
      'progress',
      'html:../reports/cucumber-api-report.html',
    ],
    publishQuiet: true,
  },

  /** Fully parallel execution — Cucumber workers */
  parallel: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['world/**/*.ts', BROWSER_HOOK, 'stepDefinitions/**/*.ts', 'fixtures/**/*.ts', AI_HOOK],
    parallel: 4,
    format: [
      'progress',
      'html:../reports/cucumber-parallel-report.html',
    ],
    publishQuiet: true,
  },

  /** Browser-specific profiles — pass BROWSER env var to playwright.config.ts */
  chromium: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['world/**/*.ts', BROWSER_HOOK, 'stepDefinitions/**/*.ts', 'fixtures/**/*.ts', AI_HOOK],
    worldParameters: { browser: 'chromium' },
    format: ['progress', 'html:../reports/cucumber-chromium-report.html'],
    publishQuiet: true,
  },

  firefox: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['world/**/*.ts', BROWSER_HOOK, 'stepDefinitions/**/*.ts', 'fixtures/**/*.ts', AI_HOOK],
    worldParameters: { browser: 'firefox' },
    format: ['progress', 'html:../reports/cucumber-firefox-report.html'],
    publishQuiet: true,
  },

  webkit: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['world/**/*.ts', BROWSER_HOOK, 'stepDefinitions/**/*.ts', 'fixtures/**/*.ts', AI_HOOK],
    worldParameters: { browser: 'webkit' },
    format: ['progress', 'html:../reports/cucumber-webkit-report.html'],
    publishQuiet: true,
  },
};
