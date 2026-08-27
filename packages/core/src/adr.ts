import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { CodeMementoConfig, ChangeResult } from './types.js';
import { exists, writeText } from './fs.js';
import { slugify } from './naming.js';

export async function createAdr(root: string, config: CodeMementoConfig, title: string): Promise<ChangeResult> {
  const adrDir = path.join(root, config.docs.adr);
  const entries = await readdir(adrDir).catch(() => []);
  const numbers = entries.map((entry) => Number.parseInt(entry.slice(0, 4), 10)).filter(Number.isFinite);
  const next = Math.max(0, ...numbers) + 1;
  const slug = slugify(title, 'ADR title');
  const filename = `${String(next).padStart(4, '0')}-${slug}.md`;
  const relative = path.join(config.docs.adr, filename);
  const target = path.join(root, relative);
  if (await exists(target)) throw new Error(`ADR already exists: ${relative}`);
  const date = new Date().toISOString().slice(0, 10);
  await writeText(target, `# ADR ${String(next).padStart(4, '0')}: ${title.trim()}\n\n- Status: proposed\n- Date: ${date}\n\n## Context\n\nDescribe the forces and constraints behind this decision.\n\n## Decision\n\nDescribe the decision.\n\n## Consequences\n\nDescribe positive, negative, and neutral consequences.\n`);
  return { name: slug, path: relative, files: [relative] };
}
