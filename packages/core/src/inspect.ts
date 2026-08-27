import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { configExists } from './config.js';
import { detectRepository } from './detect.js';
import { exists } from './fs.js';
import type { InspectionResult } from './types.js';

async function existing(root: string, candidates: string[]): Promise<string[]> {
  const result: string[] = [];
  for (const candidate of candidates) {
    if (await exists(path.join(root, candidate))) result.push(candidate);
  }
  return result;
}

async function findVerificationFiles(root: string): Promise<string[]> {
  const candidates = [
    'scripts/check-docs.py',
    'scripts/check-docs.ts',
    'scripts/check-docs.js',
    'scripts/verify.sh',
    '.github/workflows/docs.yml',
    '.github/workflows/ci.yml',
  ];
  const result = await existing(root, candidates);
  const packageJson = path.join(root, 'package.json');
  if (await exists(packageJson)) {
    try {
      const parsed = JSON.parse(await readFile(packageJson, 'utf8')) as { scripts?: Record<string, string> };
      if (Object.entries(parsed.scripts ?? {}).some(([name, value]) => /docs|codememento/i.test(`${name} ${value}`))) {
        result.push('package.json#scripts');
      }
    } catch {
      // Inspection is best-effort and remains useful even with malformed manifests.
    }
  }
  return [...new Set(result)];
}

export async function inspectRepository(root: string): Promise<InspectionResult> {
  const detection = await detectRepository(root);
  const instructionFiles = await existing(root, [
    'AGENTS.md',
    'CLAUDE.md',
    'GEMINI.md',
    '.github/copilot-instructions.md',
    '.cursor/rules',
  ]);
  const documentationPaths = await existing(root, [
    'docs/index.md',
    'docs/product',
    'docs/architecture',
    'docs/protocol',
    'docs/adr',
    'docs/architecture/adr',
    'docs/features',
    'docs/plans',
    'docs/plans/active',
    'docs/plans/completed',
    'docs/runbooks',
    'docs/quality',
    'docs/references',
    'docs/generated',
  ]);
  const verificationFiles = await findVerificationFiles(root);
  const has = (candidate: string) => documentationPaths.includes(candidate);
  const signals = {
    canonicalAgentMap: instructionFiles.includes('AGENTS.md'),
    docsIndex: has('docs/index.md'),
    productKnowledge: has('docs/product'),
    architectureKnowledge: has('docs/architecture'),
    decisions: has('docs/adr') || has('docs/architecture/adr'),
    features: has('docs/features'),
    executionPlans: has('docs/plans') && has('docs/plans/active') && has('docs/plans/completed'),
    runbooks: has('docs/runbooks'),
    quality: has('docs/quality'),
    generatedDocs: has('docs/generated'),
    docsVerification: verificationFiles.length > 0,
  };
  const signalValues = Object.values(signals);
  const score = Math.round((signalValues.filter(Boolean).length / signalValues.length) * 100);
  const maturity: InspectionResult['maturity'] = score >= 80 ? 'mature' : score >= 45 ? 'structured' : 'minimal';
  const recommendations: string[] = [];
  if (!signals.canonicalAgentMap) recommendations.push('Add a short AGENTS.md as the canonical agent navigation layer.');
  if (!signals.docsIndex) recommendations.push('Add docs/index.md as the repository knowledge entry point.');
  if (!signals.architectureKnowledge) recommendations.push('Document current architecture and system boundaries under docs/architecture/.');
  if (!signals.decisions) recommendations.push('Add ADRs for durable cross-cutting technical decisions.');
  if (!signals.features) recommendations.push('Use feature packages for substantial durable product behavior.');
  if (!signals.executionPlans) recommendations.push('Use active/completed execution plans for resumable multi-session work.');
  if (!signals.docsVerification) recommendations.push('Add deterministic documentation checks to CI or the repository verify script.');

  return {
    initialized: await configExists(root),
    detection,
    instructionFiles,
    documentationPaths,
    verificationFiles,
    signals,
    score,
    maturity,
    recommendations,
  };
}

export async function listDirectoryNames(directory: string, kind: 'file' | 'directory'): Promise<string[]> {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => kind === 'file' ? entry.isFile() : entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== 'README.md')
    .sort();
}
