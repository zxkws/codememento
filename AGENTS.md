# AgentDocs repository instructions

AgentDocs is an AI-native documentation infrastructure CLI. The public CLI is
`docs`, published from `@agentdocs/cli`; reusable logic lives in
`@agentdocs/core`.

## Required reading

- Architecture: `docs/architecture/overview.md`
- Product principles: `docs/product/principles.md`
- Contribution workflow: `CONTRIBUTING.md`

## Development

Use pnpm. Node.js 20 or newer is required.

```bash
pnpm install
pnpm check
```

Do not put project-specific behavior in the CLI package when it can live in
core. Keep adapter implementations deterministic and offline by default.

## Compatibility rules

- Never overwrite user-authored instruction files wholesale.
- AgentDocs-owned content must stay inside managed markers.
- `docs init` and `docs sync` must be idempotent.
- Existing documentation must be preserved unless a command explicitly moves
  an AgentDocs-managed change during archive.
- The default workflow must not require an AI API key or network access.

## Documentation

When public behavior changes, update README and relevant files under `docs/`.
Architecture-affecting decisions should get an ADR under
`docs/architecture/adr/`.

<!-- agentdocs:agents:start -->
## AgentDocs repository map

This repository uses AgentDocs. Treat repository documentation as durable
project knowledge and prefer it over assumptions from chat history.

Detected stack: JavaScript/TypeScript

### Start here

1. Read `docs/index.md`.
2. Read the documents for the area you are changing.
3. Check current source and tests before trusting historical notes.
4. For non-trivial feature work, create or update `docs/features/<feature>/`.
5. For multi-step work spanning sessions or agents, maintain a living plan under `docs/plans/active/`.

### Documentation map

- Product/domain knowledge: `docs/product/`
- Architecture: `docs/architecture/`
- Architecture decisions: `docs/architecture/adr/`
- Protocol/contracts: `docs/protocol/`
- Feature packages: `docs/features/`
- Execution plans: `docs/plans/`
- Quality/acceptance: `docs/quality/`
- Runbooks: `docs/runbooks/`
- References: `docs/references/`
- Generated docs: `docs/generated/`

Optional bounded change workspaces are created under `docs/changes/`
only when that workflow is used.

### Source of truth

When information disagrees, prefer current source and tests for implementation
facts, then explicit protocol/contract docs, accepted architecture decisions,
feature specs and active plans, and finally introductory or historical docs.
Do not preserve contradictions by copying them into new documentation.

### Completion

Before claiming completion, run repository verification, update active plans and
feature tasks, move verified completed plans to `docs/plans/completed/`, and
update durable canonical docs when described behavior changed.

Do not invent APIs, business rules, or architecture facts when repository
documentation or code can answer the question. Preserve user-authored docs and
follow more specific instructions deeper in the repository.
<!-- agentdocs:agents:end -->
