import { mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import type { CodeMementoConfig, ChangeResult } from './types.js';
import { changeTemplates } from './templates.js';
import { exists, writeText } from './fs.js';
import { slugify } from './naming.js';

export async function createChange(root: string, config: CodeMementoConfig, input: string): Promise<ChangeResult> {
  const name = slugify(input, 'Change name');
  const relativeDir = path.join(config.docs.changes, 'active', name);
  const targetDir = path.join(root, relativeDir);
  if (await exists(targetDir)) throw new Error(`Active change already exists: ${name}`);
  await mkdir(targetDir, { recursive: true });
  const files: string[] = [];
  for (const [filename, content] of Object.entries(changeTemplates(name))) {
    await writeText(path.join(targetDir, filename), content);
    files.push(path.join(relativeDir, filename));
  }
  return { name, path: relativeDir, files };
}

export async function archiveChange(root: string, config: CodeMementoConfig, input: string): Promise<ChangeResult> {
  const name = slugify(input, 'Change name');
  const activeRelative = path.join(config.docs.changes, 'active', name);
  const completedRelative = path.join(config.docs.changes, 'completed', name);
  const active = path.join(root, activeRelative);
  const completed = path.join(root, completedRelative);
  if (!(await exists(active))) throw new Error(`Active change not found: ${name}`);
  if (await exists(completed)) throw new Error(`Completed change already exists: ${name}`);

  const current = new Set(await readdir(active));
  const missing = config.changes.required.filter((file) => !current.has(file));
  if (missing.length) throw new Error(`Cannot archive ${name}; missing required files: ${missing.join(', ')}`);

  await mkdir(path.dirname(completed), { recursive: true });
  await rename(active, completed);
  return {
    name,
    path: completedRelative,
    files: config.changes.required.map((file) => path.join(completedRelative, file)),
  };
}
