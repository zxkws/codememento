# CodeMemento

**Durable repository memory for AI coding agents.**

CodeMemento turns repository knowledge into versioned memory that coding agents
can discover, follow, maintain, validate, and hand off across sessions. It is
offline-first, preserves existing documentation, and ships as the `docs` CLI.

```bash
npx @codememento/cli init
```

Or install it globally:

```bash
npm install -g @codememento/cli
docs init
```

## Why CodeMemento?

AI coding agents are good at reading code, but project intent is usually spread
across chats, tickets, stale READMEs, and individual memory. CodeMemento keeps the
durable part in Git and gives agents a consistent map to it.

It separates:

- **Instructions** — how an agent should work in this repository.
- **Knowledge** — product, architecture, specifications, operations, references.
- **Features** — durable spec/design/tasks/decisions for substantial behavior.
- **Execution plans** — resumable goal/progress/decisions/verification across sessions.
- **Changes** — optional bounded proposal → spec → design → tasks → verification → result history.
- **Governance** — deterministic checks for structure, lifecycle, adapters, and
  documentation links.

## Commands

```text
docs inspect              Read-only maturity assessment; works before init
docs init                 Initialize a repository without replacing existing docs
docs sync                 Synchronize coding-agent adapters
docs status               Show active work and documentation health
docs new <name>           Create an active change workspace
docs archive <name>       Validate and archive a completed change
docs feature <name>       Create durable feature knowledge (spec/design/plan/tasks/decisions)
docs plan new <name>      Create a living cross-session execution plan
docs plan complete <name> Move a verified execution plan to completed history
docs add adr <title>      Create an architecture decision record
docs doctor               Show documentation health and actionable diagnostics
docs check                CI-friendly validation with non-zero exit on errors
```

Every command supports `-C, --cwd <path>`. `inspect`, `status`, `doctor`, and
`check` support `--json` for scripts and integrations.

## Adopt an existing repository safely

Before changing an established project, inspect it:

```bash
npx @codememento/cli inspect
```

`inspect` is read-only and does not require CodeMemento to be initialized. It
recognizes common AI-native documentation signals such as `AGENTS.md`, a docs
index, product/architecture knowledge, ADRs, feature packages, active/completed
execution plans, runbooks, quality docs, generated docs, and deterministic docs
verification.

If the repository already has a mature structure, CodeMemento can be adopted
incrementally. In adoption mode, `docs init` writes CodeMemento configuration and
managed adapter regions but does **not** add documentation templates to the
existing knowledge system.

## What `docs init` creates

```text
AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
.codememento/
  config.yaml
docs/
  index.md
  product/
  architecture/
    adr/
  protocol/
  features/
  plans/
    active/
    completed/
  quality/
  runbooks/
  references/
  generated/
```

Bounded `changes/`, standalone `specs/`, and other optional paths are created
only when a repository chooses to use those workflows; they are not part of the
default documentation ceremony.

Agent-specific files are **thin adapters**. `AGENTS.md` is the canonical
repository map by default. CodeMemento does not replace entire instruction files;
it maintains only blocks marked like:

```html
<!-- codememento:claude:start -->
...managed content...
<!-- codememento:claude:end -->
```

Text outside those markers belongs to the repository owner and is preserved by
`docs sync`.

## Change workflow

```bash
docs new fence-xlsx-import
```

creates:

```text
docs/changes/active/fence-xlsx-import/
  proposal.md
  spec.md
  design.md
  tasks.md
  test.md
  result.md
```

Once implementation and documentation are complete:

```bash
docs archive fence-xlsx-import
```

The required artifacts are validated and the workspace is moved to
`docs/changes/completed/`.

## Configuration

`.codememento/config.yaml` is the machine-readable contract for the CLI:

```yaml
version: 1
canonicalInstructions: AGENTS.md

docs:
  root: docs
  product: docs/product
  architecture: docs/architecture
  adr: docs/architecture/adr
  protocol: docs/protocol
  features: docs/features
  plans: docs/plans
  quality: docs/quality
  runbooks: docs/runbooks
  changes: docs/changes
  references: docs/references
  generated: docs/generated

agents:
  agents: true
  claude: true
  copilot: true
  gemini: true
  cursor: false

changes:
  required:
    - proposal.md
    - spec.md
    - design.md
    - tasks.md
    - test.md
    - result.md

features:
  required:
    - spec.md
    - design.md
    - plan.md
    - tasks.md
    - decisions.md

plans:
  requiredHeadings:
    - Goal
    - Status
    - Progress
    - Decisions
    - Verification

governance:
  missingStructure: warn
  brokenLinks: warn
  missingChangeDocs: error
  missingFeatureDocs: error
  staleAdapters: warn
  activePlanShape: error
  completedPlanInActive: error
  retiredPaths: warn

retiredPaths: []
```

## CI

The simplest CI gate is:

```bash
npx @codememento/cli check
```

`docs check` exits non-zero when diagnostics configured as errors are found.

## Offline first

`init`, `sync`, lifecycle commands, `doctor`, and `check` do not require an AI
provider, API key, or network access. Optional AI-assisted analysis can be added
later without making the deterministic core dependent on an external model.

## Development

```bash
pnpm install
pnpm check
```

The workspace contains:

- `@codememento/core` — reusable repository model and governance engine.
- `@codememento/cli` — the `docs` executable and terminal UX.

See [CONTRIBUTING.md](CONTRIBUTING.md) and
[architecture overview](docs/architecture/overview.md).

## License

MIT
