# Quality and release gates

A change is not complete because it builds locally or because `docs doctor` reports a high structural score. CodeMemento validates source behavior, real Git workflows, packed package contents, and its own documentation system.

## Standard repository gate

Run:

```bash
pnpm check
```

The root `check` pipeline runs, in order:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`
5. `pnpm pack:check`
6. package-level smoke commands

A release candidate must pass the entire gate from a clean worktree.

## Test expectations

Core lifecycle behavior is exercised with filesystem and real temporary Git repositories rather than only mocks. Changes to initialization, managed blocks, Feature/Plan/Change lifecycle, inspection, documentation diagnostics, or Git development workflow require regression coverage.

Important invariants include:

- user-authored instruction content is preserved;
- `init`/`sync` remain idempotent;
- dirty or protected Git states are rejected where policy requires;
- branch/worktree setup rolls back partial creation failures;
- placeholder starter docs do not receive mature-knowledge credit;
- old v1 config files remain loadable when new additive config fields are introduced.

## Documentation dogfooding

Before claiming the repository is documentation-healthy, run the built CLI against CodeMemento itself:

```bash
node packages/cli/dist/cli.js inspect
node packages/cli/dist/cli.js doctor
node packages/cli/dist/cli.js check
```

For this repository, canonical docs should not contain starter markers or legacy exact starter content. `doctor` should be 100/100 with no diagnostics before release.

## Package/release integrity

`pnpm pack:check` validates the **actual tarballs**, not only source manifests. It verifies:

- packed core and CLI versions match source package versions;
- the packed CLI depends on the matching concrete `@codememento/core` version;
- no `workspace:` dependency leaks into a public package;
- the `docs` bin entry survives packing;
- built CLI output reports the same version as the package manifest, preventing stale ignored `dist/` artifacts from being published.

Manual release procedure is documented in `CONTRIBUTING.md`. Publish pnpm-generated tarballs; do not run `npm publish` directly inside workspace package directories.

## Public-registry smoke

After npm security scanning exposes a release, verify the public artifact rather than trusting the publish response alone:

```bash
npm view @codememento/core@<version> version
npm view @codememento/cli@<version> dependencies bin
npx --yes @codememento/cli@<version> --version
```

The final `npx` version must exactly match the released version. For major workflow changes, also run a fresh-repository lifecycle smoke (`init` and the relevant commands) from the public package.

## CI

`.github/workflows/ci.yml` runs repository verification for pushes/tags. `.github/workflows/release.yml` is the trusted-publishing path; it must not bypass the same quality gate.
