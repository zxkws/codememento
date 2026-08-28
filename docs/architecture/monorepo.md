# Monorepo support

## Current support

CodeMemento works in monorepos today. CodeMemento itself is a pnpm monorepo with `packages/core` and `packages/cli`.

The current model is **one CodeMemento knowledge system per Git repository**:

```text
repo/
  .codememento/config.yaml
  AGENTS.md
  docs/
  apps/
  packages/
```

Do not initialize a separate `.codememento` root in every workspace package unless those directories are actually independent Git repositories with intentionally independent knowledge systems.

Git branch/worktree policy is repository-wide. This is important for cross-package changes: one feature branch/worktree and one ExecPlan can change `apps/web`, `apps/api`, `packages/sdk`, and the durable feature docs together.

`docs inspect` detects common monorepo/workspace signals and exposes `detection.monorepo`; package manager/repository detection is informational and does not change the one-repository knowledge model.

## Documentation modeling

For a large target monorepo, keep two concepts separate:

- **Feature** — what durable product/system capability exists, potentially spanning multiple packages.
- **Component** — where code lives (for example `apps/admin`, `packages/sdk`, `packages/ui`).

CodeMemento currently has a first-class Feature lifecycle but **does not yet have a first-class Component catalog command/model**. Repositories can document component architecture under their normal architecture/docs structure until that capability exists.

## Validation

CodeMemento executes repository-configured finish commands. It does not currently compute a package dependency graph or affected set itself.

Large monorepos should reuse their native tooling when full-repository validation is too expensive, for example Nx affected commands or Turborepo filters, by putting those commands in `development.finish.commands`.

## Current limitations

The following are not yet first-class CodeMemento capabilities:

- automatic app/package inventory exposed as durable Component objects;
- dependency-aware context selection for a specific workspace package;
- automatic affected-package lint/test/build planning;
- generated nested/scoped `AGENTS.md` policy per package.

These are possible future extensions. Documentation must not describe them as already implemented.
