import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { BUILTIN_ADAPTERS } from './adapters.js';
import { detectRepository } from './detect.js';
import { exists, readTextIfExists } from './fs.js';
import { branchMatchesPolicy, gitRefExists, inspectGitWorkspace } from './git.js';
import { renderManagedBlock } from './managed-block.js';
import { isStarterPlaceholderFile } from './placeholders.js';
import type { CodeMementoConfig, Diagnostic, DoctorResult, Severity } from './types.js';

function governanceSeverity(value: 'off' | 'warn' | 'error'): Severity | undefined {
  if (value === 'off') return undefined;
  return value === 'error' ? 'error' : 'warning';
}

async function findMarkdownFiles(dir: string): Promise<string[]> {
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await findMarkdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(full);
  }
  return result;
}

async function checkLinks(root: string, docsRoot: string, severity: Severity): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const files = await findMarkdownFiles(path.join(root, docsRoot));
  const linkRegex = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    for (const match of raw.matchAll(linkRegex)) {
      const rawHref = match[1]!.trim();
      let href = rawHref;
      if (href.startsWith('<') && href.includes('>')) {
        href = href.slice(1, href.indexOf('>'));
      } else {
        const destination = href.match(/^(\S+)(?:\s+["'(].*)?$/);
        if (destination) href = destination[1]!;
      }
      if (/^(https?:|mailto:|#)/i.test(href)) continue;
      let clean = href.split('#')[0]!.split('?')[0]!;
      if (!clean) continue;
      try {
        clean = decodeURIComponent(clean);
      } catch {
        diagnostics.push({ code: 'invalid-link', severity, message: `Invalid encoded documentation link: ${rawHref}`, path: path.relative(root, file) });
        continue;
      }
      const target = path.resolve(path.dirname(file), clean);
      const relativeToRoot = path.relative(root, target);
      if (relativeToRoot === '..' || relativeToRoot.startsWith(`..${path.sep}`) || path.isAbsolute(relativeToRoot)) {
        diagnostics.push({ code: 'escaping-link', severity, message: `Documentation link escapes repository: ${rawHref}`, path: path.relative(root, file) });
      } else if (!(await exists(target))) {
        diagnostics.push({ code: 'broken-link', severity, message: `Broken documentation link: ${rawHref}`, path: path.relative(root, file) });
      }
    }
  }
  return diagnostics;
}

async function checkActivePlans(root: string, config: CodeMementoConfig): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const shapeSeverity = governanceSeverity(config.governance.activePlanShape);
  const completedSeverity = governanceSeverity(config.governance.completedPlanInActive);
  if (!shapeSeverity && !completedSeverity) return diagnostics;

  const activeDir = path.join(root, config.docs.plans, 'active');
  if (!(await exists(activeDir))) return diagnostics;
  const entries = await readdir(activeDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'README.md') continue;
    const file = path.join(activeDir, entry.name);
    const raw = await readFile(file, 'utf8');
    const headings = new Set([...raw.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((match) => match[1]!.trim().toLowerCase()));
    if (shapeSeverity) {
      for (const required of config.plans.requiredHeadings) {
        if (!headings.has(required.toLowerCase())) {
          diagnostics.push({ code: 'active-plan-heading', severity: shapeSeverity, message: `Active plan is missing heading: ${required}`, path: path.relative(root, file) });
        }
      }
    }
    if (completedSeverity) {
      const lines = raw.split(/\r?\n/);
      const statusHeadingIndex = lines.findIndex((line) => /^##\s+Status\s*$/i.test(line.trim()));
      let statusBody = '';
      if (statusHeadingIndex >= 0) {
        const body: string[] = [];
        for (let index = statusHeadingIndex + 1; index < lines.length; index += 1) {
          const line = lines[index]!;
          if (/^##\s+/.test(line)) break;
          body.push(line);
        }
        statusBody = body.join('\n');
      }
      if (/\b(completed|done|finished)\b/i.test(statusBody)) {
        diagnostics.push({ code: 'completed-plan-active', severity: completedSeverity, message: `Completed plan must move to ${path.join(config.docs.plans, 'completed')}/`, path: path.relative(root, file) });
      }
    }
  }
  return diagnostics;
}

async function checkRetiredPaths(root: string, config: CodeMementoConfig): Promise<Diagnostic[]> {
  const severity = governanceSeverity(config.governance.retiredPaths);
  if (!severity || config.retiredPaths.length === 0) return [];
  const diagnostics: Diagnostic[] = [];
  const docs = await findMarkdownFiles(path.join(root, config.docs.root));
  const completedPlans = path.resolve(root, config.docs.plans, 'completed');
  for (const file of docs) {
    const resolved = path.resolve(file);
    if (resolved.startsWith(`${completedPlans}${path.sep}`)) continue;
    const raw = await readFile(file, 'utf8');
    for (const marker of config.retiredPaths) {
      if (raw.includes(marker)) diagnostics.push({ code: 'retired-path', severity, message: `Current documentation references retired path: ${marker}`, path: path.relative(root, file) });
    }
  }
  return diagnostics;
}


async function checkPlaceholderDocuments(root: string, config: CodeMementoConfig): Promise<Diagnostic[]> {
  const severity = governanceSeverity(config.governance.placeholderDocs);
  if (!severity) return [];
  const candidates = [
    path.join(config.docs.product, 'overview.md'),
    path.join(config.docs.architecture, 'overview.md'),
    path.join(config.docs.protocol, 'README.md'),
    path.join(config.docs.quality, 'README.md'),
  ];
  const diagnostics: Diagnostic[] = [];
  for (const candidate of candidates) {
    const file = path.join(root, candidate);
    if (await isStarterPlaceholderFile(file)) {
      diagnostics.push({
        code: 'placeholder-document',
        severity,
        message: 'Canonical documentation still contains CodeMemento starter content; replace it with repository-specific knowledge and remove the starter marker.',
        path: candidate,
      });
    }
  }
  return diagnostics;
}

async function hasActiveExecutionPlan(root: string, config: CodeMementoConfig): Promise<boolean> {
  const activeDir = path.join(root, config.docs.plans, 'active');
  if (!(await exists(activeDir))) return false;
  const entries = await readdir(activeDir, { withFileTypes: true });
  return entries.some((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md');
}

async function checkGitWorkflow(root: string, config: CodeMementoConfig): Promise<Diagnostic[]> {
  const severity = governanceSeverity(config.governance.gitWorkflow);
  if (!severity) return [];

  const diagnostics: Diagnostic[] = [];
  const workspace = await inspectGitWorkspace(root);
  if (!workspace.repository) return diagnostics;

  const { remote, baseBranch, branch, protectedBranches, worktree } = config.development.git;
  const currentBase = baseBranch === '@current';
  const baseExists = currentBase
    ? Boolean(workspace.branch)
    : await gitRefExists(root, `refs/heads/${baseBranch}`)
      || await gitRefExists(root, `refs/remotes/${remote}/${baseBranch}`);
  if (!baseExists) {
    diagnostics.push({
      code: 'git-base-branch',
      severity,
      message: currentBase
        ? 'Configured base branch @current requires a checked-out branch.'
        : `Configured base branch is not available locally or on ${remote}: ${baseBranch}`,
    });
  }

  const activeWork = workspace.dirty || await hasActiveExecutionPlan(root, config);
  if (!activeWork || !workspace.branch) return diagnostics;

  if (branch.required && protectedBranches.includes(workspace.branch)) {
    diagnostics.push({
      code: 'protected-branch-work',
      severity,
      message: `Active work must not be performed directly on protected branch: ${workspace.branch}`,
    });
    return diagnostics;
  }

  const primaryCurrentBase = currentBase && !workspace.linkedWorktree;
  if (branch.required && !primaryCurrentBase && !branchMatchesPolicy(config, workspace.branch)) {
    diagnostics.push({
      code: 'branch-name-policy',
      severity,
      message: `Current branch does not match configured project branch patterns: ${workspace.branch}`,
    });
  }

  if (worktree.mode === 'required' && !workspace.linkedWorktree) {
    diagnostics.push({
      code: 'worktree-required',
      severity,
      message: 'Active development must use a linked Git worktree in this project.',
    });
  }
  return diagnostics;
}

export async function doctor(root: string, config: CodeMementoConfig): Promise<DoctorResult> {
  const diagnostics: Diagnostic[] = [];

  for (const required of [config.canonicalInstructions, path.join(config.docs.root, 'index.md')]) {
    if (!(await exists(path.join(root, required)))) diagnostics.push({ code: 'missing-structure', severity: 'error', message: `Missing required CodeMemento path: ${required}`, path: required });
  }

  const structureSeverity = governanceSeverity(config.governance.missingStructure);
  for (const required of [
    config.docs.product,
    config.docs.architecture,
    config.docs.adr,
    config.docs.protocol,
    config.docs.features,
    config.docs.plans,
    config.docs.quality,
    config.docs.runbooks,
    config.docs.references,
    config.docs.generated,
  ]) {
    if (structureSeverity && !(await exists(path.join(root, required)))) diagnostics.push({ code: 'missing-structure', severity: structureSeverity, message: `Configured documentation path is missing: ${required}`, path: required });
  }

  const changeSeverity = governanceSeverity(config.governance.missingChangeDocs);
  if (changeSeverity) {
    const activeDir = path.join(root, config.docs.changes, 'active');
    if (await exists(activeDir)) {
      const entries = await readdir(activeDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        for (const required of config.changes.required) {
          const target = path.join(activeDir, entry.name, required);
          if (!(await exists(target))) diagnostics.push({ code: 'missing-change-doc', severity: changeSeverity, message: `Active change ${entry.name} is missing ${required}`, path: path.relative(root, target) });
        }
      }
    }
  }

  const featureSeverity = governanceSeverity(config.governance.missingFeatureDocs);
  if (featureSeverity) {
    const featuresDir = path.join(root, config.docs.features);
    if (await exists(featuresDir)) {
      const entries = await readdir(featuresDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        for (const required of config.features.required) {
          const target = path.join(featuresDir, entry.name, required);
          if (!(await exists(target))) diagnostics.push({ code: 'missing-feature-doc', severity: featureSeverity, message: `Feature ${entry.name} is missing ${required}`, path: path.relative(root, target) });
        }
      }
    }
  }

  const adapterSeverity = governanceSeverity(config.governance.staleAdapters);
  if (adapterSeverity) {
    const detection = await detectRepository(root);
    for (const adapter of BUILTIN_ADAPTERS) {
      if (!config.agents[adapter.name]) continue;
      const target = path.join(root, adapter.path);
      const current = await readTextIfExists(target);
      const expected = renderManagedBlock(adapter.name, adapter.content(config, detection));
      if (!current.includes(expected)) diagnostics.push({ code: 'stale-adapter', severity: adapterSeverity, message: `Agent adapter is missing or stale: ${adapter.name}`, path: adapter.path });
    }
  }

  const linkSeverity = governanceSeverity(config.governance.brokenLinks);
  if (linkSeverity) diagnostics.push(...await checkLinks(root, config.docs.root, linkSeverity));
  diagnostics.push(...await checkActivePlans(root, config));
  diagnostics.push(...await checkRetiredPaths(root, config));
  diagnostics.push(...await checkPlaceholderDocuments(root, config));
  diagnostics.push(...await checkGitWorkflow(root, config));

  const errors = diagnostics.filter((item) => item.severity === 'error').length;
  const warnings = diagnostics.filter((item) => item.severity === 'warning').length;
  const score = Math.max(0, 100 - errors * 20 - warnings * 5);
  return { diagnostics, score };
}

export async function checkRepository(root: string, config: CodeMementoConfig): Promise<DoctorResult> {
  return doctor(root, config);
}
