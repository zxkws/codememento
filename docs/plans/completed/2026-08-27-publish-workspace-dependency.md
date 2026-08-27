# publish-workspace-dependency

## Goal

Prevent public CLI releases from leaking the pnpm-only `workspace:*` dependency protocol, and publish a corrected 0.2.2 release after the broken 0.2.1 CLI manifest.

## Status

Completed.

## Progress

- [x] Confirm public `@codememento/cli@0.2.1` contains `@codememento/core: workspace:*` and fails npm/npx installation.
- [x] Confirm public 0.2.0 was healthy because it had been published from a pnpm-generated tarball.
- [x] Add `pnpm pack:check` to inspect the actual packed core/CLI manifests.
- [x] Validate matching core/CLI versions, rewritten core dependency, absence of `workspace:` protocols, and the `docs` bin.
- [x] Document the safe manual `pnpm pack -> npm publish <tgz>` release procedure.
- [x] Bump core/CLI to 0.2.2.
- [x] Run the complete repository check including the new packed-package gate.
- [x] Finish and archive this plan before release.

## Decisions

- Keep `workspace:*` in the source monorepo because pnpm uses it correctly during development; validate and publish pnpm-normalized tarballs instead of weakening workspace linkage.
- The GitHub release workflow remains on `pnpm publish`, which already performs workspace dependency rewriting.
- Manual releases must never call `npm publish` directly inside `packages/core` or `packages/cli`.

## Verification

- `pnpm check`: passed.
- Core tests: 22/22 passed.
- `pnpm pack:check`: `Packed package check passed for 0.2.2.`
- CLI smoke: `0.2.2`.

## Workspace

- Kind: `fix`
- Branch: `fix/publish-workspace-dependency`
- Base: `origin/main`
