import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { slugify } from './naming.js';
import type { CodeMementoConfig, GitWorkspaceInfo, WorkKind } from './types.js';

const execFileAsync = promisify(execFile);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patternRegex(pattern: string): RegExp {
  const parts = pattern.split('{slug}').map(escapeRegex);
  return new RegExp(`^${parts.join('(.+)')}$`, 'u');
}

export async function runGit(root: string, args: string[]): Promise<string> {
  try {
    const result = await execFileAsync('git', args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    return result.stdout.trim();
  } catch (error) {
    const detail = error as Error & { stderr?: string; stdout?: string };
    const message = detail.stderr?.trim() || detail.stdout?.trim() || detail.message;
    throw new Error(`git ${args.join(' ')} failed: ${message}`);
  }
}

export async function tryGit(root: string, args: string[]): Promise<string | undefined> {
  try {
    return await runGit(root, args);
  } catch {
    return undefined;
  }
}

export async function gitRefExists(root: string, ref: string): Promise<boolean> {
  return (await tryGit(root, ['rev-parse', '--verify', '--quiet', ref])) !== undefined;
}

export async function inspectGitWorkspace(root: string): Promise<GitWorkspaceInfo> {
  const inside = await tryGit(root, ['rev-parse', '--is-inside-work-tree']);
  if (inside !== 'true') return { repository: false, dirty: false, linkedWorktree: false };

  const topLevel = await runGit(root, ['rev-parse', '--show-toplevel']);
  const branch = await tryGit(root, ['branch', '--show-current']);
  const status = await runGit(root, ['status', '--porcelain']);
  const gitDirRaw = await runGit(root, ['rev-parse', '--git-dir']);
  const commonDirRaw = await runGit(root, ['rev-parse', '--git-common-dir']);
  const gitDir = path.resolve(root, gitDirRaw);
  const commonDir = path.resolve(root, commonDirRaw);
  const result: GitWorkspaceInfo = {
    repository: true,
    dirty: status.length > 0,
    linkedWorktree: path.normalize(gitDir) !== path.normalize(commonDir),
    topLevel,
  };
  if (branch) result.branch = branch;
  return result;
}

export function renderBranchName(config: CodeMementoConfig, kind: WorkKind, input: string): string {
  const slug = slugify(input, 'Work name');
  return config.development.git.branch.patterns[kind].replaceAll('{slug}', slug);
}

export function workNameFromBranch(config: CodeMementoConfig, branch: string): string | undefined {
  for (const pattern of Object.values(config.development.git.branch.patterns)) {
    const match = branch.match(patternRegex(pattern));
    if (match?.[1]) return match[1];
  }
  return undefined;
}

export function branchMatchesPolicy(config: CodeMementoConfig, branch: string): boolean {
  return Object.values(config.development.git.branch.patterns).some((pattern) => patternRegex(pattern).test(branch));
}
