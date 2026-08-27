# ADR 0004: Make Git development workflow repository-owned

- Status: accepted
- Date: 2026-08-27

## Context

Coding agents have their own defaults for branch names, workspace switching,
and Git actions. Those defaults differ across providers and can create branches
such as `codex/*` or `claude/*`, reuse the primary worktree for unrelated tasks,
and make inconsistent assumptions about whether commit/push/merge operations
are authorized. That state is not durable repository knowledge and makes
parallel or cross-agent development unreliable.

## Decision

CodeMemento treats development workflow as repository-owned policy in
`.codememento/config.yaml`.

Repositories can define:

- base and protected branches;
- work-oriented branch patterns;
- required/preferred/off linked-worktree behavior;
- verification commands executed by `docs finish`;
- `allow | ask | forbid` guidance for commit, push, merge, and branch deletion.

CodeMemento exposes `docs workspace`, `docs start`, and `docs finish` to make the
policy executable. Branch names describe the work rather than the coding agent.

## Consequences

- Different coding agents share one deterministic branch/worktree convention.
- Parallel tasks can use isolated worktrees without switching the primary
  repository workspace.
- Existing repositories can adopt the policy incrementally because enforcement
  focuses on active work and configuration remains backward compatible with
  v0.1.
- `docs start` is a mutating Git command and therefore refuses dirty source
  worktrees and rolls back partial setup failures.
- `docs finish` validates and closes execution state but intentionally does not
  commit, push, merge, delete branches, or remove worktrees.
