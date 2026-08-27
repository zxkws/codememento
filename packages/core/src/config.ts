import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'zod';
import type { CodeMementoConfig } from './types.js';

const repoPath = z.string().min(1).refine((value) => {
  if (path.isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value)) return false;
  return !value.split(/[\\/]+/).some((segment) => segment === '..');
}, 'must be a repository-relative path without parent traversal');

const artifactFile = z.string().min(1).refine(
  (value) => !/[\\/]/.test(value) && value !== '.' && value !== '..',
  'must be a file name, not a path',
);

const branchPattern = z.string().min(1).refine(
  (value) => value.includes('{slug}'),
  'must contain the {slug} placeholder',
);

const gitActionPolicy = z.enum(['allow', 'ask', 'forbid']);

const DEFAULT_DEVELOPMENT: CodeMementoConfig['development'] = {
  git: {
    remote: 'origin',
    baseBranch: 'main',
    protectedBranches: ['main', 'master', 'release', 'development'],
    fetchBeforeStart: true,
    branch: {
      required: true,
      patterns: {
        feature: 'feature/{slug}',
        fix: 'fix/{slug}',
        refactor: 'refactor/{slug}',
        docs: 'docs/{slug}',
        chore: 'chore/{slug}',
      },
    },
    worktree: {
      mode: 'preferred',
      root: '../.worktrees',
    },
    actions: {
      commit: 'ask',
      push: 'ask',
      merge: 'ask',
      deleteBranch: 'ask',
    },
  },
  finish: {
    commands: [],
    completePlan: true,
  },
};

const configSchema = z.object({
  version: z.literal(1),
  canonicalInstructions: repoPath,
  docs: z.object({
    root: repoPath,
    product: repoPath,
    architecture: repoPath,
    adr: repoPath.default('docs/architecture/adr'),
    protocol: repoPath,
    features: repoPath,
    plans: repoPath,
    quality: repoPath,
    runbooks: repoPath,
    changes: repoPath,
    references: repoPath,
    generated: repoPath,
  }),
  agents: z.object({
    agents: z.boolean(),
    claude: z.boolean(),
    copilot: z.boolean(),
    gemini: z.boolean(),
    cursor: z.boolean(),
  }),
  changes: z.object({ required: z.array(artifactFile).min(1) }),
  features: z.object({ required: z.array(artifactFile).min(1) }),
  plans: z.object({ requiredHeadings: z.array(z.string().min(1)).min(1) }),
  development: z.object({
    git: z.object({
      remote: z.string().min(1),
      baseBranch: z.string().min(1),
      protectedBranches: z.array(z.string().min(1)),
      fetchBeforeStart: z.boolean(),
      branch: z.object({
        required: z.boolean(),
        patterns: z.object({
          feature: branchPattern,
          fix: branchPattern,
          refactor: branchPattern,
          docs: branchPattern,
          chore: branchPattern,
        }),
      }),
      worktree: z.object({
        mode: z.enum(['required', 'preferred', 'off']),
        root: z.string().min(1),
      }),
      actions: z.object({
        commit: gitActionPolicy,
        push: gitActionPolicy,
        merge: gitActionPolicy,
        deleteBranch: gitActionPolicy,
      }),
    }),
    finish: z.object({
      commands: z.array(z.string().min(1)),
      completePlan: z.boolean(),
    }),
  }).default(DEFAULT_DEVELOPMENT),
  governance: z.object({
    missingStructure: z.enum(['off', 'warn', 'error']).default('warn'),
    brokenLinks: z.enum(['off', 'warn', 'error']),
    missingChangeDocs: z.enum(['off', 'warn', 'error']),
    missingFeatureDocs: z.enum(['off', 'warn', 'error']),
    staleAdapters: z.enum(['off', 'warn', 'error']),
    activePlanShape: z.enum(['off', 'warn', 'error']),
    completedPlanInActive: z.enum(['off', 'warn', 'error']),
    retiredPaths: z.enum(['off', 'warn', 'error']),
    gitWorkflow: z.enum(['off', 'warn', 'error']).default('warn'),
  }),
  retiredPaths: z.array(z.string()),
});

export const DEFAULT_CONFIG: CodeMementoConfig = {
  version: 1,
  canonicalInstructions: 'AGENTS.md',
  docs: {
    root: 'docs',
    product: 'docs/product',
    architecture: 'docs/architecture',
    adr: 'docs/architecture/adr',
    protocol: 'docs/protocol',
    features: 'docs/features',
    plans: 'docs/plans',
    quality: 'docs/quality',
    runbooks: 'docs/runbooks',
    changes: 'docs/changes',
    references: 'docs/references',
    generated: 'docs/generated',
  },
  agents: {
    agents: true,
    claude: true,
    copilot: true,
    gemini: true,
    cursor: false,
  },
  changes: {
    required: ['proposal.md', 'spec.md', 'design.md', 'tasks.md', 'test.md', 'result.md'],
  },
  features: {
    required: ['spec.md', 'design.md', 'plan.md', 'tasks.md', 'decisions.md'],
  },
  plans: {
    requiredHeadings: ['Goal', 'Status', 'Progress', 'Decisions', 'Verification'],
  },
  development: structuredClone(DEFAULT_DEVELOPMENT),
  governance: {
    missingStructure: 'warn',
    brokenLinks: 'warn',
    missingChangeDocs: 'error',
    missingFeatureDocs: 'error',
    staleAdapters: 'warn',
    activePlanShape: 'error',
    completedPlanInActive: 'error',
    retiredPaths: 'warn',
    gitWorkflow: 'warn',
  },
  retiredPaths: [],
};

export function configPath(root: string): string {
  return path.join(root, '.codememento', 'config.yaml');
}

export async function defaultConfigFor(root: string, options: { adoptExisting?: boolean } = {}): Promise<CodeMementoConfig> {
  const config = structuredClone(DEFAULT_CONFIG);
  if (options.adoptExisting) config.governance.missingStructure = 'off';
  const legacyAdr = path.join(root, 'docs', 'adr');
  const nestedAdr = path.join(root, 'docs', 'architecture', 'adr');
  try {
    await access(legacyAdr);
    try {
      await access(nestedAdr);
    } catch {
      config.docs.adr = 'docs/adr';
    }
  } catch {
    // Use the default nested ADR location when no established convention exists.
  }
  return config;
}

export async function configExists(root: string): Promise<boolean> {
  try {
    await access(configPath(root));
    return true;
  } catch {
    return false;
  }
}

export async function writeDefaultConfig(root: string, options: { adoptExisting?: boolean } = {}): Promise<void> {
  const file = configPath(root);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, YAML.stringify(await defaultConfigFor(root, options)), 'utf8');
}

export async function loadConfig(root: string): Promise<CodeMementoConfig> {
  const raw = await readFile(configPath(root), 'utf8');
  return configSchema.parse(YAML.parse(raw)) as CodeMementoConfig;
}
