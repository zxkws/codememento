import path from 'node:path';
import { doctor } from './doctor.js';
import { listDirectoryNames } from './inspect.js';
import type { CodeMementoConfig, RepositoryStatus } from './types.js';

export async function repositoryStatus(root: string, config: CodeMementoConfig): Promise<RepositoryStatus> {
  const [features, activePlans, completedPlans, activeChanges, completedChanges, health] = await Promise.all([
    listDirectoryNames(path.join(root, config.docs.features), 'directory'),
    listDirectoryNames(path.join(root, config.docs.plans, 'active'), 'file'),
    listDirectoryNames(path.join(root, config.docs.plans, 'completed'), 'file'),
    listDirectoryNames(path.join(root, config.docs.changes, 'active'), 'directory'),
    listDirectoryNames(path.join(root, config.docs.changes, 'completed'), 'directory'),
    doctor(root, config),
  ]);
  return { features, activePlans, completedPlans, activeChanges, completedChanges, health };
}
