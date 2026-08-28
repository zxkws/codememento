# Protocol and contracts

CodeMemento has no network wire protocol of its own today. This directory records the **externally observable contracts** that integrations and target repositories may rely on.

## CLI contract

The public executable is `docs` from `@codememento/cli`.

Important command families are:

- discovery/adoption: `inspect`, `init`, `sync`;
- repository health: `status`, `doctor`, `check`;
- durable knowledge: `feature`, `add adr`;
- execution state: `plan new`, `plan complete`, optional `new/archive` Change lifecycle;
- development workspace: `workspace`, `start`, `finish`.

`inspect`, `status`, `doctor`, and `check` expose `--json`. JSON fields are part of the integration surface and changes should be treated as public API changes. Human-readable wording may evolve more freely than machine-readable keys and exit behavior.

`docs check` is CI-oriented: configured error diagnostics cause a non-zero exit. Warnings do not fail the command unless repository configuration promotes that rule to `error`.

## Configuration contract

`.codememento/config.yaml` is the machine-readable repository policy. Current config version is `1`.

It controls:

- canonical instruction and documentation paths;
- enabled agent adapters;
- required Feature/Change/ExecPlan structure;
- Git development base, protected branches, branch patterns, worktree policy, and action permissions;
- finish verification commands;
- governance severities, including placeholder-document diagnostics.

New additive fields should have defaults so older v1 configs remain loadable. A breaking config-shape change requires an explicit migration/versioning decision rather than silently reinterpreting existing repositories.

## Managed instruction blocks

CodeMemento owns only marked regions inside agent instruction files:

```html
<!-- codememento:<adapter>:start -->
...CodeMemento-managed content...
<!-- codememento:<adapter>:end -->
```

Text outside a managed region is user-owned and must be preserved. Partial/corrupt markers are errors; commands must not guess where user content ends.

## Starter-document contract

New canonical fillable documents use:

```html
<!-- codememento:starter -->
```

The marker means the file still contains starter content rather than repository-specific knowledge. `doctor` may report it according to `governance.placeholderDocs`, and `inspect` must not treat starter-only content as mature knowledge. When the repository replaces the starter with real content, it removes the marker.

Legacy 0.2.x starter text without the marker is recognized by exact content for backward compatibility.

## Filesystem lifecycle contract

- `init` and `sync` are idempotent and preserve user-authored content.
- Feature packages are long-lived knowledge under `docs/features/<name>/`.
- active ExecPlans live under `docs/plans/active/`; verified completed plans move to `docs/plans/completed/`.
- optional Changes move from `docs/changes/active/` to `docs/changes/completed/` only after required artifacts validate.
- `finish` validates and closes execution state but does not commit, push, merge, delete branches, or remove worktrees.

## Package contract

`@codememento/core` contains reusable deterministic behavior. `@codememento/cli` owns terminal argument parsing/output and depends on the matching published core version. Packed release manifests must not expose the pnpm-only `workspace:*` protocol.
