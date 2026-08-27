# Development Workflow: Feature decisions

## 2026-08-27 — Branch names describe work, not agents

Default patterns use `feature/`, `fix/`, `refactor/`, `docs/`, and `chore/`. Provider-owned prefixes such as `codex/` and `claude/` are intentionally excluded because work belongs to the repository and should remain transferable between agents.

## 2026-08-27 — Worktree policy has three modes

`required` makes linked worktrees an enforceable rule, `preferred` makes `docs start` use worktrees without diagnosing manual primary-worktree development as an error, and `off` supports repositories that intentionally use a single working tree.

## 2026-08-27 — Git publishing actions remain explicit

`docs finish` validates and closes execution state but never commits, pushes, merges, deletes branches, or removes worktrees. Repository configuration records `allow | ask | forbid` guidance for those actions so coding agents do not invent their own permission model.

## 2026-08-27 — Keep config version 1 backward compatible

The new development fields are additive and have defaults. A v0.1 repository can load under v0.2 without rewriting its configuration before the user chooses a stricter project-specific policy.
