import path from 'node:path';
import type { CodeMementoConfig, RepositoryDetection } from './types.js';

function titleCase(name: string): string {
  return name.split('-').map((part) => part ? `${part[0]!.toUpperCase()}${part.slice(1)}` : part).join(' ');
}

function developmentBaseLabel(config: CodeMementoConfig): string {
  return config.development.git.baseBranch === '@current'
    ? 'the current checked-out development branch (`@current`)'
    : `\`${config.development.git.baseBranch}\``;
}

function worktreeInstruction(config: CodeMementoConfig): string {
  const mode = config.development.git.worktree.mode;
  if (mode === 'required') {
    return 'Worktree policy: `required`. Before non-trivial implementation, use `docs start <kind> <name>` unless you are already in the compliant linked worktree for that task.';
  }
  if (mode === 'preferred') {
    return 'Worktree policy: `preferred`. Normal work may continue on the current development branch; use `docs start <kind> <name>` when isolation or parallel work is useful.';
  }
  return 'Worktree policy: `off`. Continue in the current Git worktree and follow the configured branch policy.';
}

export function agentsContent(config: CodeMementoConfig, detection: RepositoryDetection): string {
  const stack = [...detection.languages, ...detection.frameworks].join(', ') || 'Unknown / mixed stack';
  return `## CodeMemento repository map

This repository uses CodeMemento. Treat repository documentation as durable
project knowledge and prefer it over assumptions from chat history.

Detected stack: ${stack}

### Start here

1. Read \`${path.posix.join(config.docs.root, 'index.md')}\`.
2. Read the documents for the area you are changing.
3. Check current source and tests before trusting historical notes.
4. For non-trivial feature work, create or update \`${config.docs.features}/<feature>/\`.
5. For multi-step work spanning sessions or agents, maintain a living plan under \`${path.posix.join(config.docs.plans, 'active')}/\`.

### Development workflow

- Development base: ${developmentBaseLabel(config)}; protected branches: ${config.development.git.protectedBranches.map((item) => `\`${item}\``).join(', ') || 'none'}.
- Branch names describe the work, never the agent. Do not invent \`codex/*\`, \`claude/*\`, or similar agent-owned prefixes for new branches.
- ${worktreeInstruction(config)}
- Read \`${path.posix.join(config.docs.runbooks, 'development.md')}\` before manually creating branches or worktrees.
- Git actions: commit=\`${config.development.git.actions.commit}\`, push=\`${config.development.git.actions.push}\`, merge=\`${config.development.git.actions.merge}\`, deleteBranch=\`${config.development.git.actions.deleteBranch}\`. \`ask\` means an explicit user/project instruction is required for that action.

### Documentation map

- Product/domain knowledge: \`${config.docs.product}/\`
- Architecture: \`${config.docs.architecture}/\`
- Architecture decisions: \`${config.docs.adr}/\`
- Protocol/contracts: \`${config.docs.protocol}/\`
- Feature packages: \`${config.docs.features}/\`
- Execution plans: \`${config.docs.plans}/\`
- Quality/acceptance: \`${config.docs.quality}/\`
- Runbooks: \`${config.docs.runbooks}/\`
- References: \`${config.docs.references}/\`
- Generated docs: \`${config.docs.generated}/\`

Optional bounded change workspaces are created under \`${config.docs.changes}/\`
only when that workflow is used.

### Source of truth

When information disagrees, prefer current source and tests for implementation
facts, then explicit protocol/contract docs, accepted architecture decisions,
feature specs and active plans, and finally introductory or historical docs.
Do not preserve contradictions by copying them into new documentation.

### Completion

Before claiming completion, run repository verification, update active plans and
feature tasks, move verified completed plans to \`${path.posix.join(config.docs.plans, 'completed')}/\`, and
update durable canonical docs when described behavior changed.

Do not invent APIs, business rules, or architecture facts when repository
documentation or code can answer the question. Preserve user-authored docs and
follow more specific instructions deeper in the repository.`;
}

export function docFiles(config: CodeMementoConfig): Record<string, string> {
  const join = path.posix.join;
  const indexPath = join(config.docs.root, 'index.md');
  const productOverview = join(config.docs.product, 'overview.md');
  const architectureOverview = join(config.docs.architecture, 'overview.md');
  const adrReadme = join(config.docs.adr, 'README.md');
  const protocolReadme = join(config.docs.protocol, 'README.md');
  const featuresReadme = join(config.docs.features, 'README.md');
  const plansReadme = join(config.docs.plans, 'README.md');
  const activePlansReadme = join(config.docs.plans, 'active', 'README.md');
  const completedPlansReadme = join(config.docs.plans, 'completed', 'README.md');
  const qualityReadme = join(config.docs.quality, 'README.md');
  const runbooksReadme = join(config.docs.runbooks, 'README.md');
  const developmentRunbook = join(config.docs.runbooks, 'development.md');
  const referencesReadme = join(config.docs.references, 'README.md');
  const generatedReadme = join(config.docs.generated, 'README.md');
  const rel = (target: string) => path.posix.relative(config.docs.root, target);

  return {
    [indexPath]: `# Project knowledge

This is the durable project knowledge entry point for humans and coding agents.

## Authority

When information conflicts, prefer:

1. Current executable source and automated tests for implementation facts.
2. Explicit protocol and contract documentation for external behavior.
3. Architecture docs and accepted ADRs for intended architecture.
4. Feature specifications and active execution plans for intended changes.
5. Introductory and historical material.

Do not preserve contradictions by copying them forward. Fix the canonical source or document why the difference exists.

## Documentation map

- [Product](${rel(productOverview)})
- [Architecture](${rel(architectureOverview)})
- [Protocol](${rel(protocolReadme)})
- [Features](${rel(featuresReadme)})
- [Execution plans](${rel(plansReadme)})
- [Quality](${rel(qualityReadme)})
- [Runbooks](${rel(runbooksReadme)})
- [References](${rel(referencesReadme)})
- [Generated](${rel(generatedReadme)})
`,
    [productOverview]: '# Product overview\n\nDescribe the product, users, domain vocabulary, and durable business rules here.\n',
    [architectureOverview]: '# Architecture overview\n\nDescribe system boundaries, major components, data flow, and important constraints here.\n\nArchitecture decisions belong in `adr/`.\n',
    [adrReadme]: '# Architecture decision records\n\nAdd immutable decision records for significant architectural choices.\n',
    [protocolReadme]: '# Protocol and contracts\n\nKeep wire formats, API contracts, message schemas, and externally observable protocol rules here.\n',
    [featuresReadme]: '# Feature packages\n\nFor non-trivial features, keep durable feature knowledge together. Recommended files: `spec.md` (what/why/acceptance), `design.md` (how), `plan.md` (implementation strategy), `tasks.md` (trackable work), and `decisions.md` (feature-local decisions). Small fixes do not need empty feature packages.\n',
    [plansReadme]: '# Execution plans\n\nUse self-contained living plans for complex work that may span sessions or agents. Active plans live in `active/`; completed and verified plans move to `completed/`. Default required headings are Goal, Status, Progress, Decisions, and Verification.\n',
    [activePlansReadme]: '# Active execution plans\n\nKeep only ongoing plans here. Move completed and verified plans to `../completed/`.\n',
    [completedPlansReadme]: '# Completed execution plans\n\nHistorical verified plans live here. They are evidence, not necessarily current truth.\n',
    [qualityReadme]: '# Quality\n\nTesting strategy, acceptance rules, real-device checks, performance criteria, and quality gates belong here.\n',
    [runbooksReadme]: `# Runbooks\n\nKeep repeatable development, deployment, troubleshooting, recovery, and operational procedures here once those procedures are actually decided.\n\n- [Development workflow](${path.posix.basename(developmentRunbook)})\n`,
    [developmentRunbook]: `# Development workflow\n\nThis repository uses project-owned Git rules. Coding agents must not substitute their own branch naming or workspace conventions.\n\n## Branch policy\n\n- Development base: ${developmentBaseLabel(config)}.\n- Protected branches: ${config.development.git.protectedBranches.map((item) => `\`${item}\``).join(', ') || 'none'}.\n- Feature: \`${config.development.git.branch.patterns.feature}\`\n- Fix: \`${config.development.git.branch.patterns.fix}\`\n- Refactor: \`${config.development.git.branch.patterns.refactor}\`\n- Docs: \`${config.development.git.branch.patterns.docs}\`\n- Chore: \`${config.development.git.branch.patterns.chore}\`\n\nBranch names describe the work, not the coding agent. Avoid agent-specific prefixes such as \`codex/\` or \`claude/\`.\n\n## Worktrees\n\nWorktree mode is \`${config.development.git.worktree.mode}\`. The configured root is \`${config.development.git.worktree.root}\`.\n\n${worktreeInstruction(config)}\n\nWhen a separate worktree is appropriate, prefer the repository command instead of manually switching branches:\n\n\`\`\`bash\ndocs start feature my-feature\ndocs start fix pagination-bug\n\`\`\`\n\n\`docs start\` verifies a clean source worktree, resolves the configured development base (including \`@current\` when selected), creates a project-standard branch, creates a linked worktree when enabled, and creates an active ExecPlan. Feature work also creates the durable Feature package when it does not already exist.\n\n## Finishing\n\nConfigured verification commands:\n${config.development.finish.commands.length ? config.development.finish.commands.map((command) => `- \`${command}\``).join('\n') : '- No extra commands configured; `docs finish` still runs CodeMemento checks.'}\n\nRun \`docs finish\` from the active development workspace. It validates CodeMemento, runs the configured verification commands, and completes the matching ExecPlan. It does **not** commit, push, merge, delete branches, or remove worktrees.\n\n## Git action permissions\n\n- Commit: \`${config.development.git.actions.commit}\`\n- Push: \`${config.development.git.actions.push}\`\n- Merge: \`${config.development.git.actions.merge}\`\n- Delete branch: \`${config.development.git.actions.deleteBranch}\`\n\n\`ask\` means the action requires explicit user/project authorization. \`forbid\` means do not perform it.\n`,
    [referencesReadme]: '# References\n\nExternal material, compatibility notes, schemas, migration maps, and factual references belong here.\n',
    [generatedReadme]: '# Generated documentation\n\nGenerated material belongs here and is never more authoritative than source code, tests, or human-reviewed canonical documentation.\n',
  };
}

export function changeTemplates(name: string): Record<string, string> {
  const title = titleCase(name);
  return {
    'proposal.md': `# ${title}: Proposal\n\n## Why\n\nDescribe the problem and why it matters.\n\n## What changes\n\nDescribe the intended outcome.\n\n## Impact\n\nList affected users, systems, APIs, data, or operations.\n`,
    'spec.md': `# ${title}: Specification\n\n## Requirements\n\nDefine observable behavior and acceptance criteria.\n\n## Non-goals\n\nState what this change intentionally does not solve.\n`,
    'design.md': `# ${title}: Design\n\n## Approach\n\nDescribe implementation strategy, boundaries, data flow, and compatibility.\n\n## Risks\n\nList important risks and mitigations.\n`,
    'tasks.md': `# ${title}: Tasks\n\n- [ ] Confirm requirements\n- [ ] Implement\n- [ ] Verify\n- [ ] Update durable documentation\n`,
    'test.md': `# ${title}: Verification\n\n## Automated\n\nDocument commands and expected results.\n\n## Manual\n\nDocument manual acceptance checks where needed.\n`,
    'result.md': `# ${title}: Result\n\n## Status\n\nIn progress.\n\n## Summary\n\nRecord what actually changed.\n\n## Verification\n\nRecord verification results.\n\n## Follow-ups\n\nRecord remaining work or explicitly state none.\n`,
  };
}

export function featureTemplates(name: string): Record<string, string> {
  const title = titleCase(name);
  return {
    'spec.md': `# ${title}: Feature specification\n\n## What\n\nDescribe observable feature behavior.\n\n## Why\n\nDescribe user or system value.\n\n## Acceptance criteria\n\nList concrete acceptance criteria.\n`,
    'design.md': `# ${title}: Feature design\n\n## Architecture\n\nDescribe boundaries and approach.\n\n## Data flow\n\nDescribe important flows and contracts.\n\n## Compatibility\n\nDescribe migration and compatibility constraints.\n`,
    'plan.md': `# ${title}: Implementation plan\n\n## Phases\n\nDescribe implementation phases.\n\n## Risks\n\nDescribe risks and mitigations.\n`,
    'tasks.md': `# ${title}: Tasks\n\n- [ ] Confirm spec and acceptance criteria\n- [ ] Implement\n- [ ] Verify\n- [ ] Update durable documentation\n`,
    'decisions.md': `# ${title}: Feature decisions\n\nRecord feature-local decisions and rationale here. Promote repository-wide architectural decisions to an ADR.\n`,
  };
}

export function planTemplate(title: string): string {
  return `# ${title}\n\n## Goal\n\nState the intended outcome.\n\n## Status\n\nActive.\n\n## Progress\n\nRecord completed and next steps so another agent can resume without chat history.\n\n## Decisions\n\nRecord important execution decisions and deviations.\n\n## Verification\n\nRecord checks performed and results.\n`;
}
