# Feature packages

Use Feature packages for non-trivial durable capabilities. Small fixes do not need empty feature packages.

Recommended files:

- `spec.md` — current observable behavior, why it exists, and acceptance criteria.
- `design.md` — current implementation boundaries/data flow/compatibility intent.
- `decisions.md` — current feature-local decisions and rationale; promote repository-wide decisions to ADRs.
- `plan.md` — current implementation/maintenance strategy for the capability.
- `tasks.md` — current capability/maintenance checklist, not release notes.

`spec.md`, `design.md`, and `decisions.md` are canonical current Feature truth. Keep `plan.md` and `tasks.md` aligned with the current capability rather than freezing version-specific release work there. Version-specific execution evidence belongs in active/completed ExecPlans and the changelog.
