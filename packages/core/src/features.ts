import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { CodeMementoConfig, ChangeResult } from './types.js';
import { exists, writeText } from './fs.js';
import { slugify } from './naming.js';
import { featureTemplates } from './templates.js';

export async function createFeature(root: string, config: CodeMementoConfig, input: string): Promise<ChangeResult> {
  const name = slugify(input, 'Feature name');
  const relativeDir = path.join(config.docs.features, name);
  const targetDir = path.join(root, relativeDir);
  if (await exists(targetDir)) throw new Error(`Feature already exists: ${name}`);
  await mkdir(targetDir, { recursive: true });
  const files: string[] = [];
  for (const [filename, content] of Object.entries(featureTemplates(name))) {
    await writeText(path.join(targetDir, filename), content);
    files.push(path.join(relativeDir, filename));
  }
  return { name, path: relativeDir, files };
}
