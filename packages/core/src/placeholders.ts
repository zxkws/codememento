import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { exists } from './fs.js';

export const STARTER_MARKER = '<!-- codememento:starter -->';

const LEGACY_STARTER_DOCUMENTS = new Set([
  '# Product overview\n\nDescribe the product, users, domain vocabulary, and durable business rules here.',
  '# Architecture overview\n\nDescribe system boundaries, major components, data flow, and important constraints here.\n\nArchitecture decisions belong in `adr/`.',
  '# Protocol and contracts\n\nKeep wire formats, API contracts, message schemas, and externally observable protocol rules here.',
  '# Quality\n\nTesting strategy, acceptance rules, real-device checks, performance criteria, and quality gates belong here.',
]);

const SCAFFOLD_ONLY_DOCUMENTS = new Set([
  '# Architecture decision records\n\nAdd immutable decision records for significant architectural choices.',
]);

function normalize(raw: string): string {
  return raw.replace(/\r\n/g, '\n').trim();
}

export function isStarterPlaceholderContent(raw: string): boolean {
  const normalized = normalize(raw);
  const lines = normalized.split('\n');
  const markerIndex = lines.findIndex((line) => line.trim() === STARTER_MARKER);
  const markerIsStarterMetadata = markerIndex >= 0 && markerIndex <= 3;
  return markerIsStarterMetadata || LEGACY_STARTER_DOCUMENTS.has(normalized);
}

function isScaffoldOnlyContent(raw: string): boolean {
  const normalized = normalize(raw);
  return isStarterPlaceholderContent(raw) || SCAFFOLD_ONLY_DOCUMENTS.has(normalized);
}

export async function isStarterPlaceholderFile(file: string): Promise<boolean> {
  if (!(await exists(file))) return false;
  return isStarterPlaceholderContent(await readFile(file, 'utf8'));
}

export async function hasMeaningfulMarkdown(dir: string): Promise<boolean> {
  if (!(await exists(dir))) return false;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (await hasMeaningfulMarkdown(full)) return true;
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const raw = await readFile(full, 'utf8');
    if (!isScaffoldOnlyContent(raw)) return true;
  }
  return false;
}
