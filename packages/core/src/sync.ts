import path from 'node:path';
import { BUILTIN_ADAPTERS } from './adapters.js';
import { detectRepository } from './detect.js';
import { readTextIfExists, writeText } from './fs.js';
import { renderManagedBlock, upsertManagedBlock } from './managed-block.js';
import type { CodeMementoConfig, SyncResult } from './types.js';

export async function syncAdapters(root: string, config: CodeMementoConfig): Promise<SyncResult> {
  const detection = await detectRepository(root);
  const result: SyncResult = { updated: [], unchanged: [] };

  for (const adapter of BUILTIN_ADAPTERS) {
    if (!config.agents[adapter.name]) continue;
    const target = path.join(root, adapter.path);
    const current = await readTextIfExists(target);
    const content = adapter.content(config, detection);
    const next = upsertManagedBlock(current, adapter.name, content);
    const expected = renderManagedBlock(adapter.name, content);

    if (current.includes(expected) && current === next) {
      result.unchanged.push(adapter.path);
      continue;
    }
    await writeText(target, next);
    result.updated.push(adapter.path);
  }

  return result;
}
