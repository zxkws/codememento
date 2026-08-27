# Development Workflow: Feature decisions

## 2026-08-27 — Branch names describe work, not agents

Default patterns use `feature/`, `fix/`, `refactor/`, `docs/`, and `chore/`. Provider-owned prefixes such as `codex/` and `claude/` are intentionally excluded because work belongs to the repository and should remain transferable between agents.

## 2026-08-27 — Worktree policy has three modes

`required` makes linked worktrees an enforceable rule, `preferred` makes `docs start` use worktrees without diagnosing manual primary-worktree development as an error, and `off` supports repositories that intentionally use a single working tree.

## 2026-08-27 — Git publishing actions remain explicit

`docs finish` validates and closes execution state but never commits, pushes, merges, deletes branches, or removes worktrees. Repository configuration records `allow | ask | forbid` guidance for those actions so coding agents do not invent their own permission model.

## 2026-08-27 — Keep config version 1 backward compatible

The new development fields are additive and have defaults. A v0.1 repository can load under v0.2 without rewriting its configuration before the user chooses a stricter project-specific policy.

## 2026-08-27 — Support a current development line as the worktree base

Some repositories intentionally keep the primary worktree on an active development branch and only merge that line into the release branch when shipping. For these repositories, `baseBranch: "@current"` means `docs start` derives isolated worktrees from the current checked-out development branch. The primary development line is exempt from new-branch naming enforcement, while protected branches and newly-created linked worktree branches remain governed.
