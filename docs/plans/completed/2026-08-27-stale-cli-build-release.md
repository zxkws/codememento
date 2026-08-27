# stale-cli-build-release

## Goal

Prevent manual releases from packing stale ignored build output after a version bump, and publish a clean version whose public CLI reports the same version as its manifest.

## Status

Completed.

## Progress

- [x] Reproduce public `@codememento/cli@0.2.2` reporting `0.2.1` from its executable despite a correct 0.2.2 manifest.
- [x] Identify stale ignored `dist/cli.js` in the main worktree as the cause.
- [x] Extend `pack:check` to compare built CLI version with the source CLI manifest.
- [x] Compare packed core/CLI versions to their source manifests.
- [x] Bump core/CLI to 0.2.3.
- [x] Run the complete repository check and packed-package gate.
- [x] Finish and archive this plan.

## Decisions

- Keep build artifacts ignored, but require release checks to prove that the artifacts about to be packed correspond to the current source package versions.
- FGI will not be upgraded until a public `npx @codememento/cli@<version> --version` returns that exact requested version.

## Verification

- `pnpm check`: passed.
- Core tests: 22/22 passed.
- `pnpm pack:check`: `Packed package check passed for 0.2.3.`
- CLI smoke: `0.2.3`.
- Public release smoke remains the final post-publish gate before FGI adoption.

## Workspace

- Kind: `fix`
- Branch: `fix/stale-cli-build-release`
- Base: `origin/main`
