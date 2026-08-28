# Development Workflow: Capability checklist

- [x] Repository-owned development base and protected-branch policy.
- [x] Work-oriented branch patterns independent of agent/provider names.
- [x] `required | preferred | off` linked-worktree policy.
- [x] Fixed development base and `baseBranch: "@current"` support.
- [x] `docs workspace` read-only workspace/policy inspection.
- [x] `docs start` branch/worktree/Feature/ExecPlan lifecycle with dirty-source rejection and rollback.
- [x] `docs finish` CodeMemento/project verification and ExecPlan completion without implicit publish/cleanup Git actions.
- [x] Git workflow diagnostics for protected branches, branch naming, and required worktrees.
- [x] Generated AGENTS/runbook guidance and backward-compatible v1 config defaults.
- [x] Real Git integration tests for fixed-base, `@current`, required/preferred worktree, and finish behavior.

Future work belongs here only while it represents an accepted current capability requirement. Version-specific release work belongs in an ExecPlan/changelog instead of this durable checklist.
