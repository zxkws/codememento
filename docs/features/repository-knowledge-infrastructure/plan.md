# Repository Knowledge Infrastructure: Implementation plan

## Current implementation layers

1. Repository detection and pre-init `inspect` discover stack, monorepo signals, instruction files, documentation structure, knowledge maturity, starter placeholders, and verification hooks.
2. `init` creates a safe baseline or adopts a mature existing documentation system without template injection.
3. Managed-block adapters keep AGENTS/Claude/Copilot/Gemini/Cursor surfaces thin while preserving user content.
4. Feature, ExecPlan, Change, and ADR lifecycle modules own their respective repository state transitions.
5. `doctor/check` apply deterministic governance: structure, links, lifecycle shape, stale adapters, retired paths, placeholder canonical docs, and Git workflow policy.
6. Package/CLI layers expose the same deterministic model to terminal users and future integrations.

## Maintenance strategy

- Keep pre-init inspection best-effort and non-mutating even when manifests are malformed.
- Prefer exact/explicit starter recognition over fuzzy semantic guesses in the deterministic core.
- Additive config fields must have backward-compatible defaults under config version 1.
- Keep canonical current knowledge distinct from completed execution/release history.
- Preserve user-authored files and refuse ambiguous managed-marker states.

## Risks

- Structural scoring can overstate maturity if it ignores content quality; fillable starter docs must not count as real knowledge.
- Too much default ceremony can make documentation a burden; trivial fixes remain exempt from Feature/Change packages.
- Static checks cannot prove semantic code/doc consistency. Future AI-assisted analysis should remain optional rather than weakening deterministic behavior.
