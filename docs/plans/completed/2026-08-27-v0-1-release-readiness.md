# v0.1 release readiness

## Goal

Bring AgentDocs from a working prototype to a publishable, self-hosting CLI
whose core workflows are safe on existing repositories and verified from the
actual npm package artifacts.

## Status

Completed.

## Progress

- Monorepo, CLI/core boundaries, tests, CI, and release workflow exist.
- Safe initialization and managed adapters are implemented.
- Feature, ExecPlan, Change, and ADR lifecycle commands are implemented.
- Doctor/check governance is implemented.
- Read-only inspect and repository status are implemented.
- A mature real repository is recognized at 100/100 without modification.
- AgentDocs has initialized itself and passes its own `docs check`.
- Packed `@agentdocs/core` and `@agentdocs/cli` artifacts install and run in
  clean npm projects, including Unicode Feature/ExecPlan names.
- Mature-repository adoption from packed artifacts avoids template injection,
  adopts an existing `docs/adr/` location, and remains 100/100 healthy.
- Public package README/LICENSE, repository SECURITY policy, changelog, and
  release workflow are present.

## Decisions

- Keep deterministic core behavior offline-first.
- Treat Feature and ExecPlan as separate concepts.
- Keep bounded Change workspaces complementary rather than making them the only
  documentation unit.
- Prefer read-only inspection before modifying an existing mature repository.

## Verification

- `pnpm check`: passing with 13 core tests plus CLI build validation.
- `git diff --check`: passing.
- Built CLI runs `inspect`, `init`, `status`, and `check` successfully.
- Read-only inspection of the mature reference repository reports 100/100.
- Fresh-project tarball smoke test creates only the lean core documentation
  foundation; optional `changes/` is created only when used.
- Mature-repository tarball smoke test reports doctor 100/100 and check passed
  without creating missing template documents.
- npm registry lookups for `@agentdocs/cli` and `@agentdocs/core` returned 404,
  so no package currently occupies those names; publishing still requires
  control of the `@agentdocs` npm scope.
