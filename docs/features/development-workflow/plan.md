# Development Workflow: Implementation plan

## Phases

1. Extend configuration/types with Git, branch, worktree, action, and finish policies.
2. Implement real Git workspace inspection and start/finish lifecycle APIs.
3. Add deterministic doctor/check diagnostics.
4. Add CLI commands and generated AGENTS/runbook guidance.
5. Add real Git integration tests and backward-compatibility tests.
6. Dogfood on CodeMemento itself and `fgi-frontend`.
7. Prepare v0.2.0 release artifacts after validation.

## Risks

- Git commands mutate workspace state; start operations must fail safely and roll back partially created branches/worktrees when document creation fails.
- Worktree roots may be outside the repository; they must be treated as user-configured filesystem locations rather than repository documentation paths.
- Generic defaults cannot know every team's integration branch; `main` is a safe public default while established projects should explicitly set their base branch.
- Verification commands execute repository-controlled shell commands only when the user explicitly invokes `docs finish`.
