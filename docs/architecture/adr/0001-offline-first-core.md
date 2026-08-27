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
