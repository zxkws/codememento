# Contributing to CodeMemento

Thanks for helping make repositories easier for coding agents and humans to
understand.

## Local development

```bash
pnpm install
pnpm check
```

Useful focused commands:

```bash
pnpm --filter @codememento/core test
pnpm --filter @codememento/cli build
node packages/cli/dist/cli.js --help
```

## Design rules

1. Preserve user-authored files and content.
2. Prefer deterministic, offline behavior for core commands.
3. Keep adapters small. Agent-specific syntax belongs in adapters, not in the
   repository knowledge model.
4. Keep configuration machine-readable and versioned.
5. Every filesystem mutation should be safe to run twice.
6. Add tests for changes to initialization, managed blocks, lifecycle, or
   diagnostics.

## Pull requests

Explain the user-visible behavior, compatibility impact, and verification
performed. Update docs for public behavior changes.

## Manual releases

Run `pnpm check` first. Never run `npm publish` directly from
`packages/core` or `packages/cli`: the source CLI manifest intentionally uses
the pnpm-only `workspace:*` protocol for its core dependency.

For a manual release, create pnpm-normalized tarballs and publish those:

```bash
PACK_DIR=$(mktemp -d)
pnpm --filter @codememento/core pack --pack-destination "$PACK_DIR"
pnpm --filter @codememento/cli pack --pack-destination "$PACK_DIR"

npm publish "$PACK_DIR"/codememento-core-*.tgz --access public
# Wait until the core version is readable from the public registry.
npm publish "$PACK_DIR"/codememento-cli-*.tgz --access public
```

`pnpm pack:check` verifies that packed manifests contain no `workspace:`
dependencies and that the CLI points at the matching published core version.
