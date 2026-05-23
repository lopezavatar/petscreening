import { After, ITestCaseHookParameter } from '@cucumber/cucumber';
import * as path from 'path';
import { analyzeFailure } from '../utils/aiAnalyzer';
import { createOrFindIssue } from '../utils/githubIssueCreator';

/**
 * failureAnalysisHook — runs after every scenario.
 *
 * When a scenario fails AND the AI_ISSUE_CREATION env var is set to "true",
 * this hook:
 *   1. Collects the failure context (error, stack trace, scenario metadata).
 *   2. Sends it to the GitHub Models API (GPT-4o-mini) for root-cause analysis.
 *   3. If the AI classifies it as a real application bug (confidence ≥ medium),
 *      creates (or finds an existing) GitHub issue in lopezavatar/petscreening.
 *   4. Attaches the issue URL to the Cucumber report via this.attach().
 *
 * Required env vars (set in resources/env/.env.*):
 *   GITHUB_TOKEN        — GitHub PAT with repo scope (also used for GitHub Models)
 *   AI_ISSUE_CREATION   — set to "true" to enable (off by default)
 *
 * Optional env vars:
 *   GITHUB_OWNER        — defaults to "lopezavatar"
 *   GITHUB_REPO         — defaults to "petscreening"
 *   AI_MODEL            — defaults to "gpt-4o-mini"
 */
After(async function (this: any, { result, pickle, gherkinDocument }: ITestCaseHookParameter) {
  // Only process failed scenarios
  if (result?.status !== 'FAILED') return;

  // Feature flag — opt-in to avoid creating issues on every developer run
  if (process.env.AI_ISSUE_CREATION !== 'true') return;

  const rawMessage   = result.message ?? 'Unknown error';
  const errorMessage = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);

  // Split error message from stack trace (stack trace starts with first "    at ")
  const stackStart  = errorMessage.indexOf('\n    at ');
  const errorBody   = stackStart !== -1 ? errorMessage.substring(0, stackStart) : errorMessage;
  const stackTrace  = stackStart !== -1 ? errorMessage.substring(stackStart)   : '';

  const featureFile = gherkinDocument?.uri
    ? path.basename(gherkinDocument.uri)
    : 'unknown.feature';

  const tags = pickle.tags.map((t) => t.name);

  console.log(`\n[AI Analysis] Failure detected in: "${pickle.name}" — analysing...`);

  // ── 1. AI root-cause analysis ──────────────────────────────────────────────
  let analysis;
  try {
    analysis = await analyzeFailure({
      scenarioName: pickle.name,
      featureFile,
      tags,
      errorMessage: errorBody.trim(),
      stackTrace: stackTrace.trim(),
    });
  } catch (err) {
    console.error('[AI Analysis] Unexpected error during analysis:', err);
    return;
  }

  if (!analysis) {
    console.log('[AI Analysis] No analysis returned (API unavailable or token missing).');
    return;
  }

  console.log(`[AI Analysis] Root cause : ${analysis.rootCause}`);
  console.log(`[AI Analysis] Is bug     : ${analysis.isBug}  (confidence: ${analysis.confidence}, severity: ${analysis.severity})`);

  // ── 2. GitHub issue creation ───────────────────────────────────────────────
  if (!analysis.isBug || analysis.confidence === 'low') {
    console.log('[AI Analysis] Classified as non-bug or low confidence — no issue created.');
    return;
  }

  // Build label list, avoiding duplicates
  const baseLabels   = ['bug', 'automated-test', analysis.severity];
  const extraLabels  = analysis.labels.filter((l) => !baseLabels.includes(l.toLowerCase()));
  const labelsToApply = [...new Set([...baseLabels, ...extraLabels])];

  const issue = await createOrFindIssue({
    title:  analysis.issueTitle,
    body:   analysis.issueBody,
    labels: labelsToApply,
  });

  if (issue) {
    const statusText = issue.isDuplicate ? 'Existing issue' : 'New issue created';
    console.log(`[GitHub Issues] ${statusText}: ${issue.url}`);

    // Attach to Cucumber / Allure report
    if (typeof this.attach === 'function') {
      await this.attach(
        `${statusText}: ${issue.url}`,
        'text/plain',
      );
    }
  }
});
