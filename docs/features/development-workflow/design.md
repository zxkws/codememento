# Development Workflow: Feature design

## Architecture

The feature is split into three layers:

- `git.ts` owns safe Git inspection, ref checks, branch rendering, branch-policy matching, and low-level Git execution.
- `development.ts` owns the start/finish lifecycle and composes Git operations with Feature/ExecPlan lifecycle operations.
- `doctor.ts` consumes Git inspection helpers to produce deterministic governance diagnostics without mutating the repository.

The CLI remains a presentation layer over these core APIs.

## Data flow

`docs start feature payment-orders` performs:

1. Load `.codememento/config.yaml` and verify the source worktree is clean.
2. Optionally fetch the configured base branch.
3. Render `feature/payment-orders` from the configured pattern.
4. Resolve `origin/<base>` or the local base branch.
5. Create a linked worktree when worktree mode is `required` or `preferred`; use a branch switch only when mode is `off`.
6. Create/reuse the durable Feature package for feature work.
7. Create an active ExecPlan and append work kind, branch, and base metadata.

`docs finish` performs:

1. Reject protected branches and required-worktree violations.
2. Run `docs check` semantics through core diagnostics.
3. Execute configured verification commands in order.
4. Infer the Plan name from the configured branch pattern unless explicitly supplied.
5. Complete/archive the Plan and run diagnostics again.

## Compatibility

Configuration format remains `version: 1`. The new `development` block and `governance.gitWorkflow` field have schema defaults so repositories initialized by CodeMemento v0.1 continue to load. Repositories can adopt stricter policies explicitly without a forced config migration.

CodeMemento does not automatically commit, push, merge, delete branches, or remove worktrees. Those actions remain governed by explicit repository/user policy.
