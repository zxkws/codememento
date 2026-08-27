#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { Command } from 'commander';
import pc from 'picocolors';
import {
  archiveChange,
  checkRepository,
  completePlan,
  configExists,
  createAdr,
  createChange,
  createFeature,
  createPlan,
  doctor,
  inspectRepository,
  initRepository,
  loadConfig,
  repositoryStatus,
  syncAdapters,
} from '@codememento/core';

const program = new Command();

program
  .name('docs')
  .description('AI-native repository documentation infrastructure')
  .version('0.1.0');

function rootFrom(options: { cwd?: string }): string {
  return path.resolve(process.cwd(), options.cwd ?? '.');
}

async function requireConfig(root: string) {
  if (!(await configExists(root))) throw new Error('CodeMemento is not initialized. Run `docs init` first.');
  return loadConfig(root);
}

function printError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(pc.red(`Error: ${message}`));
  process.exit(1);
}

function addCwd(command: Command): Command {
  return command.option('-C, --cwd <path>', 'run as if CodeMemento was started in this directory');
}

addCwd(program.command('inspect').description('inspect an existing repository without modifying it'))
  .option('--json', 'print machine-readable JSON')
  .action(async (options) => {
    try {
      const root = rootFrom(options);
      const result = await inspectRepository(root);
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      console.log(pc.bold(`Documentation maturity: ${result.maturity} (${result.score}/100)`));
      console.log(`CodeMemento initialized: ${result.initialized ? 'yes' : 'no'}`);
      const stack = [...result.detection.languages, ...result.detection.frameworks].join(', ') || 'unknown stack';
      console.log(`Detected: ${stack}${result.detection.monorepo ? ' (monorepo)' : ''}`);
      if (result.instructionFiles.length) console.log(`Instructions: ${result.instructionFiles.join(', ')}`);
      if (result.verificationFiles.length) console.log(`Docs verification: ${result.verificationFiles.join(', ')}`);
      if (result.recommendations.length) {
        console.log(pc.bold('Recommendations'));
        for (const recommendation of result.recommendations) console.log(`${pc.yellow('!')} ${recommendation}`);
      } else {
        console.log(pc.green('✓ Repository already has a mature AI-native documentation foundation.'));
      }
    } catch (error) {
      printError(error);
    }
  });

addCwd(program.command('init').description('initialize CodeMemento in a repository'))
  .action(async (options) => {
    try {
      const root = rootFrom(options);
      const result = await initRepository(root);
      console.log(pc.bold('CodeMemento initialized'));
      const stack = [...result.detection.languages, ...result.detection.frameworks].join(', ') || 'unknown stack';
      console.log(`Detected: ${stack}${result.detection.monorepo ? ' (monorepo)' : ''}`);
      if (result.adoptedExisting) console.log(pc.green('✓ Mature existing documentation detected; adopted without adding documentation templates.'));
      for (const file of result.created) console.log(`${pc.green('+')} ${file}`);
      for (const file of result.updated) console.log(`${pc.cyan('~')} ${file}`);
      if (result.preserved.length) console.log(pc.dim(`Preserved ${result.preserved.length} existing files/managed regions.`));
    } catch (error) {
      printError(error);
    }
  });

addCwd(program.command('sync').description('synchronize enabled coding-agent adapters'))
  .action(async (options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await syncAdapters(root, config);
      for (const file of result.updated) console.log(`${pc.cyan('~')} ${file}`);
      if (!result.updated.length) console.log(pc.green('All adapters are synchronized.'));
    } catch (error) {
      printError(error);
    }
  });

addCwd(program.command('new <name>').description('create a bounded change workspace'))
  .action(async (name, options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await createChange(root, config, name);
      console.log(`${pc.green('+')} Created ${result.path}`);
      for (const file of result.files) console.log(`  ${file}`);
    } catch (error) {
      printError(error);
    }
  });

addCwd(program.command('archive <name>').description('archive a completed change workspace'))
  .action(async (name, options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await archiveChange(root, config, name);
      console.log(`${pc.green('✓')} Archived to ${result.path}`);
    } catch (error) {
      printError(error);
    }
  });

addCwd(program.command('feature <name>').description('create durable feature documentation'))
  .action(async (name, options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await createFeature(root, config, name);
      console.log(`${pc.green('+')} Created ${result.path}`);
      for (const file of result.files) console.log(`  ${file}`);
    } catch (error) {
      printError(error);
    }
  });

const plan = program.command('plan').description('manage cross-session execution plans');
addCwd(plan.command('new <name>').description('create an active living execution plan'))
  .action(async (name, options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await createPlan(root, config, name);
      console.log(`${pc.green('+')} ${result.path}`);
    } catch (error) {
      printError(error);
    }
  });

addCwd(plan.command('complete <name>').description('move a verified active plan to completed'))
  .action(async (name, options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await completePlan(root, config, name);
      console.log(`${pc.green('✓')} ${result.path}`);
    } catch (error) {
      printError(error);
    }
  });

const add = program.command('add').description('add a documentation artifact');
addCwd(add.command('adr <title>').description('create the next architecture decision record'))
  .action(async (title, options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await createAdr(root, config, title);
      console.log(`${pc.green('+')} ${result.path}`);
    } catch (error) {
      printError(error);
    }
  });

addCwd(program.command('status').description('show active documentation work and repository health'))
  .option('--json', 'print machine-readable JSON')
  .action(async (options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await repositoryStatus(root, config);
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      console.log(pc.bold(`Documentation health: ${result.health.score}/100`));
      console.log(`Features: ${result.features.length}`);
      console.log(`Active plans: ${result.activePlans.length}${result.activePlans.length ? ` — ${result.activePlans.join(', ')}` : ''}`);
      console.log(`Active changes: ${result.activeChanges.length}${result.activeChanges.length ? ` — ${result.activeChanges.join(', ')}` : ''}`);
      console.log(`Completed plans: ${result.completedPlans.length}`);
      console.log(`Completed changes: ${result.completedChanges.length}`);
    } catch (error) {
      printError(error);
    }
  });

addCwd(program.command('doctor').description('diagnose repository documentation health'))
  .option('--json', 'print machine-readable JSON')
  .action(async (options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await doctor(root, config);
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      console.log(pc.bold(`Documentation health: ${result.score}/100`));
      if (!result.diagnostics.length) {
        console.log(pc.green('✓ No issues found.'));
        return;
      }
      for (const item of result.diagnostics) {
        const mark = item.severity === 'error' ? pc.red('✗') : item.severity === 'warning' ? pc.yellow('!') : pc.blue('i');
        console.log(`${mark} ${item.message}${item.path ? pc.dim(` (${item.path})`) : ''}`);
      }
    } catch (error) {
      printError(error);
    }
  });

addCwd(program.command('check').description('CI-friendly validation; exits non-zero on errors'))
  .option('--json', 'print machine-readable JSON')
  .action(async (options) => {
    try {
      const root = rootFrom(options);
      const config = await requireConfig(root);
      const result = await checkRepository(root, config);
      const errors = result.diagnostics.filter((item) => item.severity === 'error');
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        if (errors.length) process.exitCode = 1;
        return;
      }
      for (const item of result.diagnostics) {
        const mark = item.severity === 'error' ? pc.red('✗') : pc.yellow('!');
        console.log(`${mark} ${item.message}${item.path ? pc.dim(` (${item.path})`) : ''}`);
      }
      if (errors.length) {
        console.error(pc.red(`CodeMemento check failed with ${errors.length} error(s).`));
        process.exitCode = 1;
      } else {
        console.log(pc.green('CodeMemento check passed.'));
      }
    } catch (error) {
      printError(error);
    }
  });

await program.parseAsync(process.argv);
