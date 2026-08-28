# Architecture overview

CodeMemento is a TypeScript pnpm monorepo with two publishable packages.

## Packages

### `@codememento/core`

Owns configuration, repository detection, templates, starter/placeholder recognition, managed blocks, adapters, read-only inspection, Feature/ExecPlan/Change lifecycle operations, ADR creation, repository status, Git workspace inspection, development lifecycle, diagnostics, and CI checks. Core has no interactive terminal UI and can be embedded by other tools.

### `@codememento/cli`

Owns the `docs` executable, argument parsing, human/JSON output, and process exit codes. It delegates repository semantics to core.

See [monorepo support](monorepo.md) for how this repository shape maps to target monorepos.

## Target repository model

An initialized target repository normally contains one root knowledge system:

```text
AGENTS.md
.codememento/config.yaml
docs/
  index.md
  product/
  architecture/
    adr/
  protocol/
  features/
  plans/active/
  plans/completed/
  quality/
  runbooks/
  references/
  generated/
```

Optional adapters create thin instruction files such as `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md`.

## Managed content

CodeMemento never owns an entire instruction file. Each adapter writes a marked region:

```text
<!-- codememento:<adapter>:start -->
...
<!-- codememento:<adapter>:end -->
```

`sync` replaces only that region. Text before and after it is preserved. Corrupt/partial markers are rejected rather than guessed.

## Inspection and documentation quality

`docs inspect` is independent of CodeMemento configuration and can assess an existing repository before files are written. It looks for common AI-native documentation signals and verification tooling.

Structural presence is not enough for fillable canonical knowledge. Product, architecture, protocol, and quality starter documents are recognized by an explicit `<!-- codememento:starter -->` marker; legacy 0.2.x starter documents are recognized by exact content. Starter-only docs are surfaced through `placeholderDocuments`, do not receive the same knowledge signal as repository-specific content, and produce recommendations.

`docs doctor` applies configured repository rules. `governance.placeholderDocs` controls the severity of `placeholder-document` diagnostics for canonical starter docs.

`docs init` adds missing foundation files and managed adapter blocks while preserving existing documentation. If pre-init inspection classifies an existing repository as mature, initialization enters adoption mode and does not inject documentation templates. Existing `docs/adr/` layouts are detected and kept instead of forcing a second ADR location.

## Knowledge and execution lifecycles

Durable Feature knowledge and temporary execution state are separate:

- `docs feature <name>` creates durable `spec.md`, `design.md`, `plan.md`, `tasks.md`, and `decisions.md`.
- `docs plan new <name>` creates an active ExecPlan with Goal, Status, Progress, Decisions, and Verification.
- `docs plan complete <name>` marks a verified plan complete and moves it to historical completed plans.
- `docs new/archive` provides an optional bounded Change lifecycle for repositories that want proposal/spec/design/tasks/test/result history.

Feature `spec/design/decisions` are current durable capability truth. Feature `plan/tasks` should be maintained as the current implementation/maintenance view, not frozen release notes; release-specific execution evidence belongs in completed ExecPlans and the changelog.

## Development workspace lifecycle

Git workflow is repository-owned configuration rather than an agent default. Policy defines development base, protected branches, branch naming, worktree mode, finish verification, and commit/push/merge/delete guidance.

`docs start <kind> <name>` validates a clean source worktree, resolves the configured base (fixed branch or `@current`), creates the configured branch/worktree, and creates execution state. `docs finish` validates the current workspace, runs configured verification, and completes its ExecPlan. It deliberately does not commit, push, merge, delete branches, or remove worktrees.

Low-level Git inspection/policy matching lives in `core/src/git.ts`; mutating start/finish lifecycle lives in `core/src/development.ts`.

## Offline-first boundary

Repository/document knowledge operations do not require an AI provider or API key. Many operations work without Git or a network. Development-workspace commands are intentionally Git-aware, and a fixed-base `docs start` may fetch its configured remote when `fetchBeforeStart` is enabled. Offline-first therefore means the core product does not depend on a hosted model/service, not that every optional Git workflow is network-free.

## Extensibility

Adapters implement a public interface exported from core. Built-in adapters remain intentionally thin so new coding-agent surfaces can be added without changing the repository knowledge model.
