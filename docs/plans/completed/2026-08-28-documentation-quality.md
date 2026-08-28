# documentation-quality

## Goal

Make CodeMemento itself a credible best-practice example: canonical docs must explain the current product clearly to a new agent, and deterministic health/maturity checks must stop treating untouched starter files as mature repository knowledge.

## Status

Completed.

## Progress

- [x] Review AGENTS, README, docs index, Product/Architecture/Protocol/Quality, Features, runbooks, ADRs, and package docs as a first-time agent.
- [x] Reproduce `doctor`/`inspect` reporting 100/100 while Product/Protocol/Quality remain starter text.
- [x] Implement deterministic starter recognition and initial regression test.
- [x] Replace canonical Product/Protocol/Quality docs and redesign docs navigation.
- [x] Refresh stale durable Feature plan/task documents.
- [x] Document current monorepo support and limitations.
- [x] Complete config/README/package version/release notes and full regression.
- [x] Dogfood the built CLI against this repository and verify no starter diagnostics remain.
- Release/publish is authorized and will run after this verified feature branch is merged to `main`; public-registry results belong to release verification rather than blocking the implementation ExecPlan.

## Decisions

- Treat this as a public behavior change and target v0.3.0 rather than a documentation-only patch.
- New starter docs use an explicit marker; old 0.2.x exact starters remain detectable.
- Do not implement the future monorepo Component/affected-analysis model in this change; document current support honestly.

## Verification

- Core typecheck passed after the initial implementation.
- Core tests: 23/23 passed after adding the starter-document regression.
- `pnpm check`: passed with 24/24 core tests, typecheck/build, packed-package validation, and CLI smoke `0.3.0`.
- Self dogfood: `inspect` = 100/100 mature, `placeholderDocuments=[]`, `protocolKnowledge=true`, recommendations empty; `doctor` = 100/100 with no diagnostics; `check` passed.
- Fresh-repository smoke: `inspect` = 64/100 structured with the four canonical starter paths and no Product/Architecture/Protocol/Quality knowledge credit; `doctor` produced four placeholder diagnostics and score 80/100.
- Marker false-positive regression: prose/code examples that discuss `<!-- codememento:starter -->` do not count as starter files.
- Mature adoption regression: a mature repository without a Protocol area remains eligible for mature adoption because Protocol knowledge is optional when that area does not exist.
- Public npm verification will run after merge/tag as release verification.
