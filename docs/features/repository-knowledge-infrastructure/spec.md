# Repository Knowledge Infrastructure: Feature specification

## What

CodeMemento installs and governs an AI-native documentation foundation in an
existing or new source repository. It must make durable repository knowledge
discoverable by coding agents without making chat history the source of truth.

The core experience is:

1. Inspect an existing repository without modifying it.
2. Initialize a documentation foundation while preserving existing files.
3. Keep a short canonical agent map and thin tool-specific adapters.
4. Maintain durable feature knowledge separately from resumable execution
   plans and bounded change history.
5. Validate documentation structure and lifecycle deterministically in CI.

## Why

Coding agents lose conversational context, switch between tools, and often
encounter stale or duplicated project instructions. Repository-native Markdown
is versionable, diffable, reviewable, searchable, and available to every agent.

## Acceptance criteria

- `docs inspect` performs a read-only maturity assessment before adoption.
- `docs init` is idempotent and does not overwrite user-authored content.
- Managed instruction blocks can be synchronized independently.
- `docs feature` creates durable feature documentation.
- `docs plan new/complete` supports cross-session living plans and verified history.
- `docs new/archive` supports bounded change workspaces when useful.
- `docs doctor` reports actionable diagnostics.
- `docs check` is CI-friendly and exits non-zero on configured errors.
- The default core requires no AI provider, API key, or network access.
