# Repository Knowledge Infrastructure: Feature design

## Architecture

The workspace has two publishable packages:

- `@codememento/core` owns repository detection, configuration, templates,
  lifecycle operations, adapters, inspection, diagnostics, and status.
- `@codememento/cli` owns the `docs` executable and terminal/JSON output.

All core behavior is deterministic and filesystem-based. The CLI delegates
repository semantics to core so IDE integrations and other tools can embed the
same behavior later.

## Data flow

CodeMemento separates repository knowledge into complementary layers:

- `AGENTS.md`: short navigation and repository operating rules.
- `docs/index.md`: project knowledge entry point and authority order.
- durable product, architecture, protocol, quality, and runbook docs.
- `docs/features/<feature>/`: durable feature knowledge.
- `docs/plans/active|completed/`: resumable execution state and history.
- ADRs: durable cross-cutting decisions.
- `docs/generated/`: regenerable, explicitly lower-authority material.

Agent-specific files are thin adapters around one canonical instruction map.
CodeMemento synchronizes only its managed marker region and preserves all other
content.

## Compatibility

- Node.js 20+.
- Works with repositories in any implementation language.
- Existing documentation and instructions are preserved.
- `docs inspect` works before initialization.
- Core operation does not require Git, a network connection, or an AI provider.
