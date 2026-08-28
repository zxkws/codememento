import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import YAML from 'yaml';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createPlan,
  doctor,
  finishDevelopmentWork,
  initRepository,
  inspectGitWorkspace,
  loadConfig,
  startDevelopmentWork,
} from '../src/index.js';

const execFileAsync = promisify(execFile);
const roots: string[] = [];

async function git(root: string, args: string[]): Promise<void> {
  await execFileAsync('git', args, { cwd: root, encoding: 'utf8' });
}

async function gitRepo(): Promise<{ parent: string; root: string }> {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'codememento-git-'));
  roots.push(parent);
  const root = path.join(parent, 'repo');
  await mkdir(root, { recursive: true });
  await git(root, ['init', '-b', 'main']);
  await git(root, ['config', 'user.name', 'CodeMemento Test']);
  await git(root, ['config', 'user.email', 'codememento@example.invalid']);
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'fixture', private: true }), 'utf8');
  await initRepository(root);
  await git(root, ['add', '.']);
  await git(root, ['commit', '-m', 'initial']);
  return { parent, root };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('development workflow', () => {
  it('loads v0.1 configuration with v0.2 development defaults', async () => {
    const { root } = await gitRepo();
    const configPath = path.join(root, '.codememento', 'config.yaml');
    const parsed = YAML.parse(await readFile(configPath, 'utf8')) as Record<string, unknown>;
    delete parsed.development;
    const governance = parsed.governance as Record<string, unknown>;
    delete governance.gitWorkflow;
    delete governance.placeholderDocs;
    await writeFile(configPath, YAML.stringify(parsed), 'utf8');

    const config = await loadConfig(root);
    expect(config.development.git.baseBranch).toBe('main');
    expect(config.development.git.worktree.mode).toBe('preferred');
    expect(config.development.git.actions.push).toBe('ask');
    expect(config.governance.gitWorkflow).toBe('warn');
  });

  it('uses the current checked-out development branch when baseBranch is @current', async () => {
    const { root } = await gitRepo();
    await git(root, ['switch', '-c', 'codex/current-line']);
    await writeFile(path.join(root, 'current-line.txt'), 'current branch content', 'utf8');
    await git(root, ['add', 'current-line.txt']);
    await git(root, ['commit', '-m', 'current line']);

    const config = await loadConfig(root);
    config.development.git.baseBranch = '@current';
    config.development.git.fetchBeforeStart = false;
    config.development.git.worktree.mode = 'preferred';

    const started = await startDevelopmentWork(root, config, 'feature', 'parallel task');
    expect(started.baseRef).toBe('codex/current-line');
    await expect(readFile(path.join(started.worktree, 'current-line.txt'), 'utf8')).resolves.toBe('current branch content');
  });

  it('allows the primary current development branch while still treating protected branches as protected', async () => {
    const { root } = await gitRepo();
    await git(root, ['switch', '-c', 'codex/current-line']);
    const config = await loadConfig(root);
    config.development.git.baseBranch = '@current';
    config.development.git.worktree.mode = 'preferred';
    config.governance.gitWorkflow = 'error';
    await createPlan(root, config, 'current line work');

    const health = await doctor(root, config);
    expect(health.diagnostics.some((item) => item.code === 'branch-name-policy')).toBe(false);
    const finished = await finishDevelopmentWork(root, config, 'current line work');
    expect(finished.branch).toBe('codex/current-line');
  });

  it('creates a standard branch, linked worktree, feature, and execution plan', async () => {
    const { root } = await gitRepo();
    const config = await loadConfig(root);
    config.development.git.fetchBeforeStart = false;
    config.development.git.worktree.mode = 'required';

    const started = await startDevelopmentWork(root, config, 'feature', 'payment orders');
    expect(started.branch).toBe('feature/payment-orders');
    expect(started.baseRef).toBe('main');
    expect(started.feature).toBe(path.join('docs', 'features', 'payment-orders'));

    const workspace = await inspectGitWorkspace(started.worktree);
    expect(workspace.branch).toBe('feature/payment-orders');
    expect(workspace.linkedWorktree).toBe(true);
    await expect(readFile(path.join(started.worktree, started.plan), 'utf8')).resolves.toContain('Branch: `feature/payment-orders`');

    const health = await doctor(started.worktree, config);
    expect(health.diagnostics.filter((item) => item.severity === 'error')).toHaveLength(0);
  });

  it('finishes work by running verification and completing the branch plan', async () => {
    const { root } = await gitRepo();
    const config = await loadConfig(root);
    config.development.git.fetchBeforeStart = false;
    config.development.git.worktree.mode = 'required';
    config.development.finish.commands = ['node -e "require(\'node:fs\').accessSync(\'package.json\')"'];

    const started = await startDevelopmentWork(root, config, 'fix', 'pagination bug');
    const finished = await finishDevelopmentWork(started.worktree, config);
    expect(finished.branch).toBe('fix/pagination-bug');
    expect(finished.commands).toEqual(config.development.finish.commands);
    expect(finished.plan).toContain(path.join('docs', 'plans', 'completed'));
    await expect(readFile(path.join(started.worktree, finished.plan!), 'utf8')).resolves.toMatch(/## Status\s+Completed\./);
  });

  it('diagnoses active work on a protected branch', async () => {
    const { root } = await gitRepo();
    const config = await loadConfig(root);
    config.governance.gitWorkflow = 'error';
    await createPlan(root, config, 'unsafe main work');

    const health = await doctor(root, config);
    expect(health.diagnostics.some((item) => item.code === 'protected-branch-work' && item.severity === 'error')).toBe(true);
  });

  it('diagnoses agent-owned branch names and missing required worktrees', async () => {
    const { root } = await gitRepo();
    const config = await loadConfig(root);
    config.governance.gitWorkflow = 'error';
    config.development.git.worktree.mode = 'required';
    await git(root, ['switch', '-c', 'codex/my-task']);
    await createPlan(root, config, 'my task');

    const health = await doctor(root, config);
    expect(health.diagnostics.some((item) => item.code === 'branch-name-policy')).toBe(true);
    expect(health.diagnostics.some((item) => item.code === 'worktree-required')).toBe(true);
  });

  it('refuses to start new work from a dirty source worktree', async () => {
    const { root } = await gitRepo();
    const config = await loadConfig(root);
    config.development.git.fetchBeforeStart = false;
    await writeFile(path.join(root, 'uncommitted.txt'), 'dirty', 'utf8');

    await expect(startDevelopmentWork(root, config, 'feature', 'unsafe start')).rejects.toThrow(/must be clean/);
  });

  it('refuses to finish an agent-owned branch even when workflow diagnostics are disabled', async () => {
    const { root } = await gitRepo();
    const config = await loadConfig(root);
    config.governance.gitWorkflow = 'off';
    config.development.git.worktree.mode = 'preferred';
    await git(root, ['switch', '-c', 'codex/my-task']);
    await createPlan(root, config, 'my task');

    await expect(finishDevelopmentWork(root, config, 'my task')).rejects.toThrow(/does not match configured project branch patterns/);
  });
});
