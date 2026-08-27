# Development workflow

This repository uses project-owned Git rules. Coding agents must not substitute their own branch naming or workspace conventions.

## Branch policy

- Base branch: `main`.
- Protected branches: `main`, `release`.
- Feature: `feature/{slug}`
- Fix: `fix/{slug}`
- Refactor: `refactor/{slug}`
- Docs: `docs/{slug}`
- Chore: `chore/{slug}`

Branch names describe the work, not the coding agent. Avoid agent-specific prefixes such as `codex/` or `claude/`.

## Worktrees

Worktree mode is `required`. The configured root is `../.worktrees`.

For a new unit of work, prefer the repository command instead of manually switching branches:

```bash
docs start feature my-feature
docs start fix pagination-bug
```

`docs start` verifies a clean source worktree, resolves the configured base branch, creates a project-standard branch, creates a linked worktree when enabled, and creates an active ExecPlan. Feature work also creates the durable Feature package when it does not already exist.

## Finishing

Configured verification commands:
- `pnpm check`

Run `docs finish` from the development worktree. It validates CodeMemento, runs the configured verification commands, and completes the matching ExecPlan. It does **not** commit, push, merge, delete branches, or remove worktrees.

## Git action permissions

- Commit: `ask`
- Push: `ask`
- Merge: `ask`
- Delete branch: `ask`

`ask` means the action requires explicit user/project authorization. `forbid` means do not perform it.
