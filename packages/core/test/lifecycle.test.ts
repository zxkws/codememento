import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  archiveChange,
  completePlan,
  createChange,
  createFeature,
  createPlan,
  doctor,
  initRepository,
  inspectRepository,
  loadConfig,
  syncAdapters,
} from '../src/index.js';

const roots: string[] = [];

async function tempRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'agentdocs-'));
  roots.push(root);
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ dependencies: { vue: '^3.0.0' } }), 'utf8');
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('repository lifecycle', () => {
  it('initializes without replacing existing AGENTS content', async () => {
    const root = await tempRepo();
    await writeFile(path.join(root, 'AGENTS.md'), '# Existing\n\nKeep me.\n', 'utf8');
    const result = await initRepository(root);
    const agents = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
    expect(result.detection.frameworks).toContain('Vue');
    expect(agents).toContain('Keep me.');
    expect(agents).toContain('agentdocs:agents:start');
  });

  it('creates, validates, and archives a change', async () => {
    const root = await tempRepo();
    await initRepository(root);
    const config = await loadConfig(root);
    await createChange(root, config, 'Fence XLSX Import');
    const before = await doctor(root, config);
    expect(before.diagnostics.filter((item) => item.severity === 'error')).toHaveLength(0);
    const archived = await archiveChange(root, config, 'fence-xlsx-import');
    expect(archived.path).toContain(path.join('changes', 'completed', 'fence-xlsx-import'));
  });

  it('detects stale adapter content', async () => {
    const root = await tempRepo();
    await initRepository(root);
    const config = await loadConfig(root);
    await writeFile(path.join(root, 'CLAUDE.md'), '# overwritten\n', 'utf8');
    const result = await doctor(root, config);
    expect(result.diagnostics.some((item) => item.code === 'stale-adapter' && item.path === 'CLAUDE.md')).toBe(true);
    await syncAdapters(root, config);
    const fixed = await doctor(root, config);
    expect(fixed.diagnostics.some((item) => item.code === 'stale-adapter' && item.path === 'CLAUDE.md')).toBe(false);
  });

  it('validates feature packages and active plan lifecycle', async () => {
    const root = await tempRepo();
    await initRepository(root);
    const config = await loadConfig(root);
    const feature = await createFeature(root, config, 'voice session');
    await rm(path.join(root, feature.path, 'design.md'));
    const plan = await createPlan(root, config, 'protocol cleanup');
    const planPath = path.join(root, plan.path);
    await writeFile(planPath, (await readFile(planPath, 'utf8')).replace('Active.', 'Completed.'), 'utf8');

    const result = await doctor(root, config);
    expect(result.diagnostics.some((item) => item.code === 'missing-feature-doc')).toBe(true);
    expect(result.diagnostics.some((item) => item.code === 'completed-plan-active')).toBe(true);
  });

  it('marks an execution plan completed when moving it to history', async () => {
    const root = await tempRepo();
    await initRepository(root);
    const config = await loadConfig(root);
    const plan = await createPlan(root, config, 'resume safe work');
    const completed = await completePlan(root, config, plan.name);
    const content = await readFile(path.join(root, completed.path), 'utf8');
    expect(content).toMatch(/## Status\s+Completed\./);
  });

  it('inspects a mature existing documentation system without initialization', async () => {
    const root = await tempRepo();
    for (const dir of [
      'docs/product',
      'docs/architecture',
      'docs/adr',
      'docs/features',
      'docs/plans/active',
      'docs/plans/completed',
      'docs/runbooks',
      'docs/quality',
      'docs/generated',
      'scripts',
    ]) await mkdir(path.join(root, dir), { recursive: true });
    await writeFile(path.join(root, 'AGENTS.md'), '# Agent map\n', 'utf8');
    await writeFile(path.join(root, 'docs/index.md'), '# Docs\n', 'utf8');
    await writeFile(path.join(root, 'scripts/check-docs.py'), '# check\n', 'utf8');
    const result = await inspectRepository(root);
    expect(result.initialized).toBe(false);
    expect(result.maturity).toBe('mature');
    expect(result.score).toBeGreaterThanOrEqual(80);

    const initialized = await initRepository(root);
    const config = await loadConfig(root);
    expect(initialized.adoptedExisting).toBe(true);
    expect(config.docs.adr).toBe('docs/adr');
    expect(config.governance.missingStructure).toBe('off');
    await expect(readFile(path.join(root, 'docs/product/overview.md'), 'utf8')).rejects.toThrow();
    const health = await doctor(root, config);
    expect(health.diagnostics).toHaveLength(0);
  });

  it('respects customized documentation paths on repeated initialization', async () => {
    const root = await tempRepo();
    await initRepository(root);
    const configPath = path.join(root, '.agentdocs', 'config.yaml');
    const raw = await readFile(configPath, 'utf8');
    await writeFile(configPath, raw.replaceAll('docs/', 'knowledge/').replace('root: docs\n', 'root: knowledge\n'), 'utf8');

    await initRepository(root);
    expect(await readFile(path.join(root, 'knowledge', 'index.md'), 'utf8')).toContain('# Project knowledge');
    const agents = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
    expect(agents).toContain('knowledge/index.md');
  });

  it('rejects configuration paths that escape the repository', async () => {
    const root = await tempRepo();
    await initRepository(root);
    const configPath = path.join(root, '.agentdocs', 'config.yaml');
    const raw = await readFile(configPath, 'utf8');
    await writeFile(configPath, raw.replace('root: docs\n', 'root: ../outside\n'), 'utf8');
    await expect(loadConfig(root)).rejects.toThrow(/repository-relative path/);
  });

  it('supports Unicode names for repository artifacts', async () => {
    const root = await tempRepo();
    await initRepository(root);
    const config = await loadConfig(root);
    const feature = await createFeature(root, config, '支付订单');
    const plan = await createPlan(root, config, '协议重构');
    expect(feature.path).toContain('支付订单');
    expect(plan.path).toContain('协议重构');
  });

  it('keeps inspection usable when package.json is malformed', async () => {
    const root = await tempRepo();
    await writeFile(path.join(root, 'package.json'), '{not-json', 'utf8');
    const result = await inspectRepository(root);
    expect(result.detection.languages).toContain('JavaScript/TypeScript');
  });
});
