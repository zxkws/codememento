# development-workflow

## Goal

Ship CodeMemento v0.2 development-workflow governance so coding agents use repository-owned branch/worktree rules instead of provider defaults.

## Status

Completed.

## Progress

- Moved this work to linked worktree `/Users/q/workspace/projects/.worktrees/codememento/feature-development-workflow` on `feature/development-workflow`.
- Added development configuration, Git action policies, Git helpers, start/finish lifecycle, doctor diagnostics, CLI commands, and generated guidance.
- Added seven development-workflow integration tests; core suite is currently 20/20 passing after final review additions.
- Dogfooded required-worktree policy on CodeMemento itself; `docs workspace` reports the linked `feature/development-workflow` workspace and `doctor` reports 100/100.
- Applied the v0.2 policy to `fgi-frontend` with `release` as base and required worktrees; local v0.2 correctly reports `branch-name-policy` and `worktree-required` for its existing active `codex/*` primary-worktree state.
- Packed `@codememento/core@0.2.0` and `@codememento/cli@0.2.0`, installed them into a fresh Git repository, and completed `init → commit → start feature → linked worktree → workspace → finish → check` successfully.
- Final source review tightened remote branch collision checks to happen after fetch and made `docs finish` enforce branch naming independently of diagnostic severity.

## Decisions

- Public default worktree mode is `preferred`; CodeMemento itself and internal projects can configure `required`.
- Default base branch is `main`; established projects explicitly set their actual integration branch.
- `finish` does not perform commit/push/merge/delete/cleanup actions.
- Config remains version 1 with defaults for v0.1 compatibility.

## Verification

- `pnpm typecheck` passed after the core/CLI API implementation.
- `pnpm check` passed with CLI smoke reporting `0.2.0`.
- Packed-package end-to-end smoke passed from installed tarballs.
- `fgi-frontend` v0.2 local doctor produced the two expected policy errors for the legacy active workspace, proving the new enforcement is effective.

## Workspace

- Kind: `feature`
- Branch: `feature/development-workflow`
- Base: `main`
