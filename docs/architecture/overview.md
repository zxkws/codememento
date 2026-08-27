# Architecture overview

CodeMemento is a TypeScript monorepo with two publishable packages.

## Packages

### `@codememento/core`

Owns configuration, repository detection, templates, managed blocks, adapters,
read-only inspection, Feature/ExecPlan/Change lifecycle operations, ADR
creation, repository status, Git workspace inspection, development lifecycle,
diagnostics, and CI checks. Core has no interactive UI and can be embedded by
other tools.

### `@codememento/cli`

Owns the `docs` executable, argument parsing, human-readable output, and exit
codes. It delegates repository behavior to core.

## Repository model

An initialized target repository contains:

```text
AGENTS.md
.codememento/config.yaml
docs/
  index.md
  product/
  architecture/
  architecture/adr/   # default; configurable as docs.adr
  protocol/
  features/
  plans/active/
  plans/completed/
  quality/
  runbooks/
  references/
  generated/
```

Optional adapters create thin agent-specific instruction files such as
`CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md`.

## Managed content

CodeMemento never owns an entire instruction file. Each adapter writes a marked
region:

```text
<!-- codememento:<adapter>:start -->
...
<!-- codememento:<adapter>:end -->
```

`sync` replaces only that region. Text before and after it is preserved.

## Adoption and inspection

`docs inspect` is deliberately independent of CodeMemento configuration. It can
assess an existing repository before any files are written and recognizes
common AI-native documentation signals rather than only CodeMemento-generated
files.

`docs init` then adds missing foundation files and managed adapter blocks while
preserving existing documentation. If inspection classifies the repository as
mature, initialization enters adoption mode and does not add documentation
templates. Existing `docs/adr/` layouts are detected and kept instead of
creating a second ADR location.

## Knowledge and execution lifecycles

Durable Feature knowledge and temporary execution state are separate concepts.
`docs feature <name>` creates `spec.md`, `design.md`, `plan.md`, `tasks.md`, and
`decisions.md` under a long-lived feature package.

`docs plan new <name>` creates a self-contained active ExecPlan with Goal,
Status, Progress, Decisions, and Verification. `docs plan complete <name>` marks
the plan completed and moves it to historical completed plans.

## Development workspace lifecycle

Git workflow is repository-owned configuration rather than an agent default.
The policy defines base/protected branches, branch naming patterns, worktree
mode, finish verification, and permissions for commit/push/merge/delete actions.

`docs start <kind> <name>` validates a clean source worktree, resolves the base
ref, creates the configured branch/worktree, and creates execution state in the
new workspace. `docs finish` validates the current workspace, runs configured
verification, and completes its ExecPlan. It deliberately does not perform
publishing or cleanup Git actions.

Low-level Git inspection and policy matching live in `core/src/git.ts`; the
mutating start/finish lifecycle lives in `core/src/development.ts`.

## Change lifecycle

`docs new <name>` creates a structured change workspace. `docs archive <name>`
validates the configured required documents and moves the workspace from
`active` to `completed`.

## Extensibility

Adapters implement a public interface exported from core. Built-in adapters
are intentionally small so additional coding agents can be added without
changing the knowledge model.
