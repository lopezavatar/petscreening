import { Octokit } from '@octokit/rest';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IssuePayload {
  title: string;
  body: string;
  labels: string[];
}

export interface IssueResult {
  number: number;
  url: string;
  isDuplicate: boolean;
}

// ─── Label colour map ─────────────────────────────────────────────────────────

const LABEL_COLORS: Record<string, string> = {
  'bug': 'd73a4a',
  'automated-test': '0075ca',
  'critical': 'b60205',
  'high': 'e4e669',
  'medium': 'fef2c0',
  'low': 'cfd3d7',
  'ui': 'bfd4f2',
  'api': 'd4c5f9',
  'regression': 'ee0701',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates labels that do not yet exist in the repository.
 * Silently skips labels that already exist or cannot be created.
 */
async function ensureLabels(
  octokit: Octokit,
  owner: string,
  repo: string,
  labels: string[],
): Promise<void> {
  for (const label of labels) {
    try {
      await octokit.issues.getLabel({ owner, repo, name: label });
    } catch {
      try {
        await octokit.issues.createLabel({
          owner,
          repo,
          name: label,
          color: LABEL_COLORS[label.toLowerCase()] ?? 'ededed',
        });
      } catch {
        // Label already created by a concurrent run or permission denied — ignore
      }
    }
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Creates a GitHub issue for the given payload.
 *
 * Before creating, searches open issues for an exact title match to avoid
 * duplicates across re-runs. Returns the existing issue if one is found.
 *
 * Requires environment variables:
 *   GITHUB_TOKEN  — personal access token with `repo` scope
 *   GITHUB_OWNER  — repository owner  (default: lopezavatar)
 *   GITHUB_REPO   — repository name   (default: petscreening)
 */
export async function createOrFindIssue(payload: IssuePayload): Promise<IssueResult | null> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER ?? 'lopezavatar';
  const repo  = process.env.GITHUB_REPO  ?? 'petscreening';

  if (!token) {
    console.warn('[GitHub Issues] GITHUB_TOKEN not set — skipping issue creation.');
    return null;
  }

  const octokit = new Octokit({ auth: token });

  // ── Deduplication: search by title ────────────────────────────────────────
  try {
    const titleFragment = payload.title.substring(0, 60).replace(/[^\w\s-]/g, '');
    const { data: searchData } = await octokit.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} is:issue is:open "${titleFragment}" in:title`,
      per_page: 10,
    });

    const duplicate = searchData.items.find(
      (issue) => issue.title.toLowerCase() === payload.title.toLowerCase(),
    );

    if (duplicate) {
      console.log(`[GitHub Issues] Duplicate found — #${duplicate.number}: ${duplicate.html_url}`);
      return { number: duplicate.number, url: duplicate.html_url, isDuplicate: true };
    }
  } catch (err) {
    // Search API failure is non-fatal — proceed to creation
    console.warn('[GitHub Issues] Could not search for duplicates:', (err as Error).message);
  }

  // ── Create new issue ───────────────────────────────────────────────────────
  try {
    await ensureLabels(octokit, owner, repo, payload.labels);

    const { data } = await octokit.issues.create({
      owner,
      repo,
      title: payload.title,
      body: payload.body,
      labels: payload.labels,
    });

    console.log(`[GitHub Issues] Created #${data.number}: ${data.html_url}`);
    return { number: data.number, url: data.html_url, isDuplicate: false };
  } catch (err) {
    console.error('[GitHub Issues] Error creating issue:', err);
    return null;
  }
}
