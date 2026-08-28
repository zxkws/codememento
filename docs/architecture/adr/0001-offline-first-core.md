# ADR 0001: Keep the core offline-first

- Status: accepted
- Date: 2026-08-26

## Context

Repository documentation is often used in private codebases where sending code
or metadata to an external model is undesirable or prohibited. Initialization,
governance, and CI also need deterministic behavior.

## Decision

Core CodeMemento commands do not require an AI provider, API key, account, or
network access. Future AI-assisted analysis must be an optional enhancement
layer.

## Consequences

- `init`, `sync`, lifecycle commands, `doctor`, and `check` are deterministic.
- CodeMemento can be adopted in private repositories with a smaller trust
  surface.
- Deep semantic code/document drift detection is not part of the offline core;
  it can be added later through optional integrations.


## Clarification (2026-08-28)

The offline-first decision is about avoiding a mandatory hosted AI/service dependency for repository knowledge governance. Development-workspace behavior added later is intentionally Git-aware: commands such as `docs start` require Git and may fetch a configured remote when repository policy enables `fetchBeforeStart`. This does not change the rule that CodeMemento requires no AI provider, API key, or hosted CodeMemento service.
