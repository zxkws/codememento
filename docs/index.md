# CodeMemento project knowledge

This is the canonical internal knowledge entry point for humans and coding agents working on CodeMemento itself.

## Start here

Read these first when you are new to the repository:

1. [Product overview](product/overview.md) — what CodeMemento is, who it serves, its scope, and its core concepts.
2. [Product principles](product/principles.md) — durable design constraints that should survive individual implementations.
3. [Architecture overview](architecture/overview.md) — package boundaries, repository model, lifecycles, and core implementation ownership.
4. [Repository knowledge infrastructure](features/repository-knowledge-infrastructure/spec.md) — the documentation/knowledge system exposed to target repositories.
5. [Development workflow](features/development-workflow/spec.md) — repository-owned Git branch/worktree/start/finish behavior.
6. [Quality gates](quality/README.md) — what must pass before work is considered complete or publishable.

## By task

| Task | Read |
| --- | --- |
| Change `inspect`, `init`, adapters, Feature/Plan/Change lifecycle, or documentation governance | [Repository knowledge infrastructure](features/repository-knowledge-infrastructure/spec.md), its [design](features/repository-knowledge-infrastructure/design.md), and [architecture overview](architecture/overview.md) |
| Change branch policy, worktrees, `docs start`, `docs finish`, or Git diagnostics | [Development workflow](features/development-workflow/spec.md), its [design](features/development-workflow/design.md), and [development runbook](runbooks/development.md) |
| Change CLI/config/filesystem compatibility | [Protocol and contracts](protocol/README.md) |
| Change monorepo behavior or repository detection | [Monorepo support](architecture/monorepo.md) |
| Make a durable cross-cutting architecture decision | [ADRs](architecture/adr/README.md) |
| Prepare or review a release | [Quality gates](quality/README.md), [CONTRIBUTING.md](../CONTRIBUTING.md), and `CHANGELOG.md` |

## Authority and freshness

When information conflicts, prefer:

1. Current executable source and automated tests for implementation facts.
2. Explicit protocol/contract documentation for externally observable behavior.
3. Architecture docs and accepted ADRs for intended architecture.
4. Feature `spec.md`, `design.md`, and `decisions.md` for durable capability truth.
5. Active ExecPlans for work currently in progress.
6. Completed ExecPlans and changelog entries as historical evidence.

Completed plans are intentionally historical and may describe older versions. Do not copy an old implementation detail into current canonical docs without checking source and current Feature/Architecture docs.

## Full documentation map

- [Product](product/overview.md)
- [Architecture](architecture/overview.md)
- [Protocol/contracts](protocol/README.md)
- [Features](features/README.md)
- [Execution plans](plans/README.md)
- [Quality](quality/README.md)
- [Runbooks](runbooks/README.md)
- [References](references/README.md)
- [Generated](generated/README.md)

Optional bounded change workspaces live under `changes/` only when that workflow is used.
