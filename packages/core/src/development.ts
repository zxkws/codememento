import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { checkRepository } from './doctor.js';
import { exists } from './fs.js';
import { createFeature } from './features.js';
import { branchMatchesPolicy, gitRefExists, inspectGitWorkspace, renderBranchName, runGit, tryGit, workNameFromBranch } from './git.js';
import { slugify } from './naming.js';
import { completePlan, createPlan } from './plans.js';
import type { CodeMementoConfig, DevelopmentFinishResult, DevelopmentStartResult, WorkKind } from './types.js';

const execFileAsync = promisify(execFile);

async function resolveBaseRef(root: string, config: CodeMementoConfig): Promise<string> {
  const { remote, baseBranch, fetchBeforeStart } = config.development.git;
  if (baseBranch === '@current') {
    const workspace = await inspectGitWorkspace(root);
    if (!workspace.branch) throw new Error('Configured base branch @current requires a checked-out branch.');
    return workspace.branch;
  }

  const remoteExists = Boolean(await tryGit(root, ['remote', 'get-url', remote]));
  if (fetchBeforeStart && remoteExists) await runGit(root, ['fetch', remote]);

  const remoteRef = `refs/remotes/${remote}/${baseBranch}`;
  if (remoteExists && await gitRefExists(root, remoteRef)) return `${remote}/${baseBranch}`;
  if (await gitRefExists(root, `refs/heads/${baseBranch}`)) return baseBranch;
  throw new Error(`Configured base branch does not exist locally or on ${remote}: ${baseBranch}`);
}

function worktreePath(root: string, config: CodeMementoConfig, branch: string): string {
  const configured = config.development.git.worktree.root;
  const base = path.isAbsolute(configured) ? configured : path.resolve(root, configured);
  const repoName = path.basename(root);
  return path.join(base, repoName, branch.replaceAll('/', '-'));
}

async function appendWorkspaceMetadata(targetRoot: string, planPath: string, kind: WorkKind, branch: string, baseRef: string): Promise<void> {
  await appendFile(
    path.join(targetRoot, planPath),
    `\n## Workspace\n\n- Kind: \`${kind}\`\n- Branch: \`${branch}\`\n- Base: \`${baseRef}\`\n`,
    'utf8',
  );
}

async function rollbackStart(root: string, targetRoot: string, branch: string, originalBranch: string | undefined, usedWorktree: boolean): Promise<void> {
  if (usedWorktree) {
    await tryGit(root, ['worktree', 'remove', '--force', targetRoot]);
  } else if (originalBranch) {
    await tryGit(root, ['switch', originalBranch]);
  }
  await tryGit(root, ['branch', '-D', branch]);
}

export async function startDevelopmentWork(
  root: string,
  config: CodeMementoConfig,
  kind: WorkKind,
  input: string,
): Promise<DevelopmentStartResult> {
  const workspace = await inspectGitWorkspace(root);
  if (!workspace.repository) throw new Error('docs start requires a Git repository.');
  if (workspace.dirty) throw new Error('Current worktree must be clean before `docs start`. Commit, stash, or move existing changes first.');

  const branch = renderBranchName(config, kind, input);
  await runGit(root, ['check-ref-format', '--branch', branch]);
  const baseRef = await resolveBaseRef(root, config);
  if (await gitRefExists(root, `refs/heads/${branch}`)) throw new Error(`Local branch already exists: ${branch}`);
  if (await gitRefExists(root, `refs/remotes/${config.development.git.remote}/${branch}`)) throw new Error(`Remote branch already exists: ${branch}`);

  const mode = config.development.git.worktree.mode;
  const originalBranch = workspace.branch;
  if (mode === 'off' && !originalBranch) throw new Error('Worktree mode `off` cannot start from a detached HEAD.');
  const targetRoot = mode === 'off' ? root : worktreePath(root, config, branch);
  const usedWorktree = mode !== 'off';

  if (usedWorktree) {
    if (await exists(targetRoot)) throw new Error(`Worktree path already exists: ${targetRoot}`);
    await mkdir(path.dirname(targetRoot), { recursive: true });
    await runGit(root, ['worktree', 'add', '-b', branch, targetRoot, baseRef]);
  } else {
    await runGit(root, ['switch', '-c', branch, baseRef]);
  }

  try {
    let featurePath: string | undefined;
    if (kind === 'feature') {
      const featureName = slugify(input, 'Feature name');
      featurePath = path.join(config.docs.features, featureName);
      if (!(await exists(path.join(targetRoot, featurePath)))) await createFeature(targetRoot, config, input);
    }

    const plan = await createPlan(targetRoot, config, input);
    await appendWorkspaceMetadata(targetRoot, plan.path, kind, branch, baseRef);
    const result: DevelopmentStartResult = {
      kind,
      name: slugify(input, 'Work name'),
      branch,
      baseRef,
      worktree: targetRoot,
      plan: plan.path,
    };
    if (featurePath) result.feature = featurePath;
    return result;
  } catch (error) {
    await rollbackStart(root, targetRoot, branch, originalBranch, usedWorktree);
    throw error;
  }
}

async function runFinishCommand(root: string, command: string): Promise<void> {
  try {
    await execFileAsync('/bin/sh', ['-lc', command], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (error) {
    const detail = error as Error & { stderr?: string; stdout?: string };
    const message = detail.stderr?.trim() || detail.stdout?.trim() || detail.message;
    throw new Error(`Verification command failed: ${command}\n${message}`);
  }
}

export async function finishDevelopmentWork(
  root: string,
  config: CodeMementoConfig,
  planName?: string,
): Promise<DevelopmentFinishResult> {
  const workspace = await inspectGitWorkspace(root);
  if (!workspace.repository || !workspace.branch) throw new Error('docs finish requires a Git branch worktree.');
  if (config.development.git.protectedBranches.includes(workspace.branch)) {
    throw new Error(`Refusing to finish work directly on protected branch: ${workspace.branch}`);
  }
  const primaryCurrentBase = config.development.git.baseBranch === '@current' && !workspace.linkedWorktree;
  if (config.development.git.branch.required && !primaryCurrentBase && !branchMatchesPolicy(config, workspace.branch)) {
    throw new Error(`Current branch does not match configured project branch patterns: ${workspace.branch}`);
  }
  if (config.development.git.worktree.mode === 'required' && !workspace.linkedWorktree) {
    throw new Error('This project requires development in a linked Git worktree.');
  }

  const before = await checkRepository(root, config);
  const errors = before.diagnostics.filter((item) => item.severity === 'error');
  if (errors.length) throw new Error(`CodeMemento check failed with ${errors.length} error(s); fix them before finishing.`);

  const commands: string[] = [];
  for (const command of config.development.finish.commands) {
    await runFinishCommand(root, command);
    commands.push(command);
  }

  let completedPlan: string | undefined;
  if (config.development.finish.completePlan) {
    const inferred = workNameFromBranch(config, workspace.branch);
    const target = planName ?? inferred;
    if (!target) throw new Error('Could not infer the active plan from the current branch. Pass a plan name to `docs finish`.');
    completedPlan = (await completePlan(root, config, target)).path;
  }

  const after = await checkRepository(root, config);
  const afterErrors = after.diagnostics.filter((item) => item.severity === 'error');
  if (afterErrors.length) throw new Error(`CodeMemento check failed after finishing with ${afterErrors.length} error(s).`);

  const result: DevelopmentFinishResult = {
    branch: workspace.branch,
    commands,
    checksPassed: true,
  };
  if (completedPlan) result.plan = completedPlan;
  return result;
}
