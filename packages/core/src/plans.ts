import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { AgentDocsConfig, ChangeResult } from './types.js';
import { exists, writeText } from './fs.js';
import { slugify } from './naming.js';
import { planTemplate } from './templates.js';

export async function createPlan(root: string, config: AgentDocsConfig, input: string): Promise<ChangeResult> {
  const name = slugify(input, 'Plan name');
  const filename = `${new Date().toISOString().slice(0, 10)}-${name}.md`;
  const relative = path.join(config.docs.plans, 'active', filename);
  const target = path.join(root, relative);
  if (await exists(target)) throw new Error(`Active plan already exists: ${filename}`);
  await writeText(target, planTemplate(input.trim()));
  return { name, path: relative, files: [relative] };
}

export async function completePlan(root: string, config: AgentDocsConfig, filenameOrName: string): Promise<ChangeResult> {
  const activeDir = path.join(root, config.docs.plans, 'active');
  const completedDir = path.join(root, config.docs.plans, 'completed');
  const candidates = [filenameOrName, `${filenameOrName}.md`];
  let sourceName: string | undefined;
  for (const candidate of candidates) {
    if (await exists(path.join(activeDir, candidate))) {
      sourceName = candidate;
      break;
    }
  }
  if (!sourceName) {
    const slug = slugify(filenameOrName, 'Plan name');
    const { readdir } = await import('node:fs/promises');
    const entries = await readdir(activeDir).catch(() => []);
    sourceName = entries.find((entry) => entry.endsWith(`-${slug}.md`));
  }
  if (!sourceName) throw new Error(`Active plan not found: ${filenameOrName}`);

  await mkdir(completedDir, { recursive: true });
  const source = path.join(activeDir, sourceName);
  const target = path.join(completedDir, sourceName);
  if (await exists(target)) throw new Error(`Completed plan already exists: ${sourceName}`);
  const raw = await readFile(source, 'utf8');
  const lines = raw.split(/\r?\n/);
  const statusIndex = lines.findIndex((line) => /^##\s+Status\s*$/i.test(line.trim()));
  if (statusIndex >= 0) {
    let bodyStart = statusIndex + 1;
    while (bodyStart < lines.length && lines[bodyStart]!.trim() === '') bodyStart += 1;
    let bodyEnd = bodyStart;
    while (bodyEnd < lines.length && !/^##\s+/.test(lines[bodyEnd]!)) bodyEnd += 1;
    lines.splice(bodyStart, Math.max(0, bodyEnd - bodyStart), 'Completed.', '');
    await writeFile(source, lines.join('\n'), 'utf8');
  }
  await rename(source, target);
  const relative = path.join(config.docs.plans, 'completed', sourceName);
  return { name: sourceName.replace(/\.md$/, ''), path: relative, files: [relative] };
}
