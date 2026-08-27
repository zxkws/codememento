# Development Workflow: Feature specification

## What

CodeMemento owns repository development-workflow policy in addition to documentation policy. A repository can define its base branch, protected branches, branch naming patterns, linked-worktree policy, verification commands, and permissions for destructive or publishing Git actions.

The CLI provides:

- `docs workspace` to inspect the current Git workspace and effective policy.
- `docs start <kind> <name>` to create a policy-compliant branch, worktree, durable Feature package when applicable, and active ExecPlan.
- `docs finish [plan]` to run CodeMemento checks, configured project verification, and complete the matching ExecPlan.

Supported work kinds are `feature`, `fix`, `refactor`, `docs`, and `chore`.

## Why

Without repository-owned rules, different coding agents fall back to provider defaults such as `codex/*` or `claude/*`, switch branches in the primary worktree, and make inconsistent assumptions about commit/push/merge permissions. This makes parallel AI development fragile and ties repository state to a particular agent.

## Acceptance criteria

- Branch names are rendered from project configuration and describe the work rather than the agent.
- `docs start` refuses to run from a dirty source worktree.
- Required/preferred worktree modes create linked Git worktrees under the configured root; `off` uses the current worktree.
- Feature starts create durable feature docs when absent and always create an active ExecPlan with branch/base metadata.
- `docs doctor` can diagnose active work on protected branches, non-standard branch names, and required-worktree violations.
- `docs finish` refuses protected branches, enforces required worktrees, runs CodeMemento checks and configured verification commands, and completes the active plan.
- `docs finish` never commits, pushes, merges, removes a worktree, or deletes a branch.
- Git action permissions are rendered into agent instructions and the development runbook.
- v0.1 configuration remains loadable without manual migration.
