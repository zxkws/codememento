import { execFile } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function run(command, args) {
  const result = await execFileAsync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  return result.stdout.trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function dependencyValues(manifest) {
  return [
    ...Object.values(manifest.dependencies ?? {}),
    ...Object.values(manifest.optionalDependencies ?? {}),
    ...Object.values(manifest.peerDependencies ?? {}),
  ];
}

async function readPackedManifest(tarball) {
  const raw = await run('tar', ['-xOf', tarball, 'package/package.json']);
  return JSON.parse(raw);
}

const temp = await mkdtemp(path.join(os.tmpdir(), 'codememento-pack-check-'));
try {
  const sourceCore = JSON.parse(await readFile(path.join(root, 'packages/core/package.json'), 'utf8'));
  const sourceCli = JSON.parse(await readFile(path.join(root, 'packages/cli/package.json'), 'utf8'));
  const builtCliVersion = await run('node', ['packages/cli/dist/cli.js', '--version']);
  assert(
    builtCliVersion === sourceCli.version,
    `Built CLI version is stale: package.json=${sourceCli.version}, dist=${builtCliVersion || 'missing'}`,
  );

  await run('pnpm', ['--filter', '@codememento/core', 'pack', '--pack-destination', temp]);
  await run('pnpm', ['--filter', '@codememento/cli', 'pack', '--pack-destination', temp]);

  const files = await readdir(temp);
  const coreFile = files.find((name) => name.includes('codememento-core-'));
  const cliFile = files.find((name) => name.includes('codememento-cli-'));
  assert(coreFile, 'Packed core tarball was not created.');
  assert(cliFile, 'Packed CLI tarball was not created.');
  const coreTarball = path.join(temp, coreFile);
  const cliTarball = path.join(temp, cliFile);

  const core = await readPackedManifest(coreTarball);
  const cli = await readPackedManifest(cliTarball);
  assert(core.version === sourceCore.version, `Packed core version is stale: source=${sourceCore.version}, packed=${core.version}`);
  assert(cli.version === sourceCli.version, `Packed CLI version is stale: source=${sourceCli.version}, packed=${cli.version}`);
  assert(core.version === cli.version, `Packed versions differ: core=${core.version}, cli=${cli.version}`);
  assert(
    cli.dependencies?.['@codememento/core'] === core.version,
    `Packed CLI must depend on @codememento/core@${core.version}; got ${cli.dependencies?.['@codememento/core'] ?? 'missing'}`,
  );

  for (const [name, manifest] of [['core', core], ['cli', cli]]) {
    const workspaceDependency = dependencyValues(manifest).find((value) => String(value).startsWith('workspace:'));
    assert(!workspaceDependency, `Packed ${name} manifest still contains workspace protocol: ${workspaceDependency}`);
  }

  const docsBin = typeof cli.bin === 'string' ? cli.bin : cli.bin?.docs;
  assert(docsBin === './dist/cli.js' || docsBin === 'dist/cli.js', `Packed CLI is missing the docs bin: ${docsBin ?? 'missing'}`);

  process.stdout.write(`Packed package check passed for ${core.version}.\n`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
