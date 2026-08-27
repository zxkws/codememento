# current-development-base

## Goal

Support repositories whose primary worktree stays on the current development line, while optional worktrees branch from that current line instead of a fixed release branch.

## Status

Completed.

## Progress

- [x] Add `baseBranch: "@current"` resolution to `docs start`.
- [x] Exempt the primary `@current` development line from new-branch naming enforcement while retaining protected-branch checks.
- [x] Keep linked worktree branch naming enforcement intact.
- [x] Make AGENTS/runbook wording respect `required`, `preferred`, and `off` worktree modes.
- [x] Add real Git integration tests for `@current` start/finish behavior.
- [x] Update Feature/ADR/README/CHANGELOG and bump packages to 0.2.1.
- [x] Verify packed packages in a fresh repository.
- [x] Run `docs finish` and archive this plan.

## Decisions

- Reuse the existing `baseBranch` field with the explicit sentinel `@current` instead of adding another config version or parallel base-mode field.
- `@current` affects where new worktrees branch from; repository-specific rules for merging release into the current line and promoting the line back to release remain durable project policy in the repository runbook.

## Verification

- `pnpm check`: passed, including 22/22 core tests and CLI smoke `0.2.1`.
- Packed CLI/core smoke: `@current` correctly used `codex/current-line` as the base for `feature/parallel-task`; `docs sync` + `docs doctor` returned 100/100.

## Workspace

- Kind: `fix`
- Branch: `fix/current-development-base`
- Base: `origin/main`
