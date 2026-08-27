import path from 'node:path';
import { configExists, loadConfig, writeDefaultConfig } from './config.js';
import { detectRepository } from './detect.js';
import { docFiles } from './templates.js';
import { exists, writeText } from './fs.js';
import { inspectRepository } from './inspect.js';
import { syncAdapters } from './sync.js';
import type { InitResult } from './types.js';

export async function initRepository(root: string): Promise<InitResult> {
  const detection = await detectRepository(root);
  const inspection = await inspectRepository(root);
  const adoptedExisting = !inspection.initialized && inspection.maturity === 'mature' && inspection.signals.docsIndex;
  const result: InitResult = { created: [], updated: [], preserved: [], detection, adoptedExisting };

  if (!(await configExists(root))) {
    await writeDefaultConfig(root, { adoptExisting: adoptedExisting });
    result.created.push('.codememento/config.yaml');
  } else {
    result.preserved.push('.codememento/config.yaml');
  }

  const config = await loadConfig(root);
  if (!adoptedExisting) {
    for (const [relative, content] of Object.entries(docFiles(config))) {
      const target = path.join(root, relative);
      if (await exists(target)) {
        result.preserved.push(relative);
      } else {
        await writeText(target, content);
        result.created.push(relative);
      }
    }
  }

  const sync = await syncAdapters(root, config);
  result.updated.push(...sync.updated);
  result.preserved.push(...sync.unchanged);
  return result;
}
