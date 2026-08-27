import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function readTextIfExists(file: string): Promise<string> {
  if (!(await exists(file))) return '';
  return readFile(file, 'utf8');
}

export async function writeText(file: string, content: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
}

