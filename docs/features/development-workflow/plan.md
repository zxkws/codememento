# Development Workflow: Implementation plan

## Current implementation layers

1. `config.ts` / `types.ts` define development base, protected branches, branch patterns, worktree mode, Git-action guidance, and finish commands with backward-compatible defaults.
2. `git.ts` performs low-level workspace/ref inspection and policy matching.
3. `development.ts` owns mutating `start`/`finish` lifecycle, rollback behavior, `@current` base resolution, Feature creation, and ExecPlan workspace metadata.
4. `doctor.ts` diagnoses protected-branch work, branch-policy violations, and required-worktree violations.
5. CLI commands expose `workspace`, `start`, and `finish`; generated AGENTS/runbook content tells agents how to apply repository policy.
6. Real temporary Git repositories validate branch/worktree behavior in tests.

## Maintenance strategy

- Keep fixed-base and `@current` semantics explicitly tested.
- Treat destructive or publishing Git actions separately from `finish`; do not silently expand `finish` into commit/push/merge/cleanup.
- Keep repository-specific synchronization/shipping conventions in repository-authored AGENTS/runbooks rather than trying to encode every Git-flow variant into generic defaults.
- When adding new workflow policy, update config defaults, generated guidance, diagnostics, tests, README/protocol docs, and backward-compatibility coverage together.

## Risks

- Git commands mutate workspace state; start operations must fail safely and roll back partially created branches/worktrees when later setup fails.
- Worktree roots may be outside the repository and must not be treated as repository documentation paths.
- A fixed default branch cannot represent every team; repositories must be able to express their real development line without CodeMemento forcing Git Flow.
- Agent guidance is advisory unless backed by diagnostics/lifecycle commands, so important rules should be executable where practical.
