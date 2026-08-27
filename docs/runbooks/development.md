# Development workflow

This repository uses project-owned Git rules. Coding agents must not substitute their own branch naming or workspace conventions.

## Branch policy

- Development base: `main`.
- Protected branches: `main`, `release`.
- Feature: `feature/{slug}`
- Fix: `fix/{slug}`
- Refactor: `refactor/{slug}`
- Docs: `docs/{slug}`
- Chore: `chore/{slug}`

Branch names describe the work, not the coding agent. Avoid agent-specific prefixes such as `codex/` or `claude/`.

## Worktrees

Worktree mode is `required`. The configured root is `../.worktrees`.

Worktree policy is `required`. Before non-trivial implementation, use `docs start <kind> <name>` unless you are already in the compliant linked worktree for that task.

When a separate worktree is appropriate, prefer the repository command instead of manually switching branches:

```bash
docs start feature my-feature
docs start fix pagination-bug
```

`docs start` verifies a clean source worktree, resolves the configured development base (including `@current` when selected), creates a project-standard branch, creates a linked worktree when enabled, and creates an active ExecPlan. Feature work also creates the durable Feature package when it does not already exist.

## Finishing

Configured verification commands:
- `pnpm check`

Run `docs finish` from the active development workspace. It validates CodeMemento, runs the configured verification commands, and completes the matching ExecPlan. It does **not** commit, push, merge, delete branches, or remove worktrees.

## Git action permissions

- Commit: `ask`
- Push: `ask`
- Merge: `ask`
- Delete branch: `ask`

`ask` means the action requires explicit user/project authorization. `forbid` means do not perform it.
