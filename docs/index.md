# Project knowledge

This is the durable project knowledge entry point for humans and coding agents.

## Authority

When information conflicts, prefer:

1. Current executable source and automated tests for implementation facts.
2. Explicit protocol and contract documentation for external behavior.
3. Architecture docs and accepted ADRs for intended architecture.
4. Feature specifications and active execution plans for intended changes.
5. Introductory and historical material.

Do not preserve contradictions by copying them forward. Fix the canonical source or document why the difference exists.

## Documentation map

- [Product](product/overview.md)
- [Architecture](architecture/overview.md)
- [Protocol](protocol/README.md)
- [Features](features/README.md)
- [Execution plans](plans/README.md)
- [Quality](quality/README.md)
- [Runbooks](runbooks/README.md)
- [References](references/README.md)
- [Generated](generated/README.md)

Optional bounded change workspaces are created under `changes/` when that
workflow is used; they are not required for every repository or task.
