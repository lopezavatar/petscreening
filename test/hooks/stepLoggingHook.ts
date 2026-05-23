import { BeforeStep, AfterStep, ITestStepHookParameter } from '@cucumber/cucumber';

/**
 * stepLoggingHook — logs each step before and after execution.
 *
 * Output example:
 *   [STEP] Given I am on the login page
 *   [STEP] ✓ Given I am on the login page (123ms)
 */

const stepStartTimes = new Map<string, number>();

BeforeStep(function (this: any, { pickleStep }: ITestStepHookParameter) {
  const key = pickleStep.id;
  stepStartTimes.set(key, Date.now());
  console.log(`\n[STEP] ▶ ${pickleStep.text}`);
});

AfterStep(function (this: any, { pickleStep, result }: ITestStepHookParameter) {
  const key = pickleStep.id;
  const elapsed = Date.now() - (stepStartTimes.get(key) ?? Date.now());
  stepStartTimes.delete(key);

  const statusIcon = result?.status === 'PASSED'  ? '✓'
                   : result?.status === 'FAILED'  ? '✗'
                   : result?.status === 'SKIPPED' ? '⚠'
                   : '?';

  console.log(`[STEP] ${statusIcon} ${pickleStep.text} (${elapsed}ms)`);
});
