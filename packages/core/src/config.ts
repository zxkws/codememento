import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'zod';
import type { AgentDocsConfig } from './types.js';

const repoPath = z.string().min(1).refine((value) => {
  if (path.isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value)) return false;
  return !value.split(/[\\/]+/).some((segment) => segment === '..');
}, 'must be a repository-relative path without parent traversal');

const artifactFile = z.string().min(1).refine(
  (value) => !/[\\/]/.test(value) && value !== '.' && value !== '..',
  'must be a file name, not a path',
);

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
  governance: z.object({
    missingStructure: z.enum(['off', 'warn', 'error']).default('warn'),
    brokenLinks: z.enum(['off', 'warn', 'error']),
    missingChangeDocs: z.enum(['off', 'warn', 'error']),
    missingFeatureDocs: z.enum(['off', 'warn', 'error']),
    staleAdapters: z.enum(['off', 'warn', 'error']),
    activePlanShape: z.enum(['off', 'warn', 'error']),
    completedPlanInActive: z.enum(['off', 'warn', 'error']),
    retiredPaths: z.enum(['off', 'warn', 'error']),
  }),
  retiredPaths: z.array(z.string()),
});

export const DEFAULT_CONFIG: AgentDocsConfig = {
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
  governance: {
    missingStructure: 'warn',
    brokenLinks: 'warn',
    missingChangeDocs: 'error',
    missingFeatureDocs: 'error',
    staleAdapters: 'warn',
    activePlanShape: 'error',
    completedPlanInActive: 'error',
    retiredPaths: 'warn',
  },
  retiredPaths: [],
};

export function configPath(root: string): string {
  return path.join(root, '.agentdocs', 'config.yaml');
}

export async function defaultConfigFor(root: string, options: { adoptExisting?: boolean } = {}): Promise<AgentDocsConfig> {
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

export async function loadConfig(root: string): Promise<AgentDocsConfig> {
  const raw = await readFile(configPath(root), 'utf8');
  return configSchema.parse(YAML.parse(raw)) as AgentDocsConfig;
}
