# ADR 0003: Adopt mature repositories without template injection

- Status: accepted
- Date: 2026-08-27

## Context

Existing repositories may already have a coherent AI-native documentation
system with their own canonical files, ADR location, runbooks, quality docs,
and verification scripts. Injecting empty CodeMemento templates into such a
repository would create duplicate concepts and reduce trust in the existing
system.

## Decision

CodeMemento performs read-only inspection before first initialization. If the
repository is classified as mature and has a documentation index, first-time
`docs init` enters adoption mode: it writes CodeMemento configuration and managed
agent adapter regions but does not add documentation templates.

Adoption mode also sets `governance.missingStructure` to `off`: an established
repository is governed according to the structures it already uses rather than
being warned for not containing every CodeMemento default category.

The default configuration also preserves an established `docs/adr/` location
when present instead of creating `docs/architecture/adr/` alongside it.

## Consequences

- Mature repositories can adopt CodeMemento without directory churn or empty
  duplicate documentation.
- New and lightly documented repositories still receive the complete core
  foundation.
- Re-running `init` after CodeMemento is already configured follows that
  configuration, so changing configured paths can intentionally bootstrap the
  new locations.
- Inspection maturity becomes part of adoption behavior and therefore requires
  regression tests whenever its signals or thresholds change.
