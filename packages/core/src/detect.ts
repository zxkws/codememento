import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RepositoryDetection } from './types.js';

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function detectRepository(root: string): Promise<RepositoryDetection> {
  const languages = new Set<string>();
  const frameworks = new Set<string>();
  const packageManagers = new Set<string>();
  let packageWorkspaces = false;

  if (await exists(path.join(root, 'package.json'))) {
    languages.add('JavaScript/TypeScript');
    try {
      const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        packageManager?: string;
        workspaces?: unknown;
      };
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.vue) frameworks.add('Vue');
      if (deps.react) frameworks.add('React');
      if (deps.next) frameworks.add('Next.js');
      if (deps.express) frameworks.add('Express');
      if (deps.nestjs || deps['@nestjs/core']) frameworks.add('NestJS');
      packageWorkspaces = Boolean(pkg.workspaces);
      const declaredManager = pkg.packageManager?.split('@')[0];
      if (declaredManager && ['pnpm', 'npm', 'yarn', 'bun'].includes(declaredManager)) packageManagers.add(declaredManager);
    } catch {
      // Detection is advisory. A malformed package manifest should not make
      // read-only inspection or documentation initialization unusable.
    }
  }
  if (await exists(path.join(root, 'pnpm-lock.yaml'))) packageManagers.add('pnpm');
  if (await exists(path.join(root, 'yarn.lock'))) packageManagers.add('yarn');
  if (await exists(path.join(root, 'package-lock.json'))) packageManagers.add('npm');
  if (await exists(path.join(root, 'pyproject.toml')) || await exists(path.join(root, 'requirements.txt'))) languages.add('Python');
  if (await exists(path.join(root, 'pom.xml')) || await exists(path.join(root, 'build.gradle')) || await exists(path.join(root, 'build.gradle.kts'))) {
    languages.add('Java/Kotlin');
  }
  if (await exists(path.join(root, 'go.mod'))) languages.add('Go');
  if (await exists(path.join(root, 'Cargo.toml'))) languages.add('Rust');

  const monorepo = packageWorkspaces || await exists(path.join(root, 'pnpm-workspace.yaml')) || await exists(path.join(root, 'lerna.json'));
  return {
    languages: [...languages],
    frameworks: [...frameworks],
    packageManagers: [...packageManagers],
    monorepo,
  };
}
