# @codememento/cli

The command-line interface for **CodeMemento**, durable repository memory for
AI coding agents.

```bash
npx @codememento/cli inspect
npx @codememento/cli init
```

After a global install, the executable is `docs`:

```bash
npm install -g @codememento/cli
docs status
docs doctor
docs check
```

Project-owned development workflow:

```bash
docs workspace
docs start feature payment-orders
docs finish
```

`docs start` applies repository branch/worktree policy and creates an ExecPlan;
`docs finish` verifies and completes the Plan without committing, pushing,
merging, deleting branches, or removing worktrees.

The CLI preserves user-authored documentation, uses managed regions for
agent-specific instruction files, identifies untouched canonical starter docs,
works offline-first, and delegates repository behavior to `@codememento/core`.

See the CodeMemento repository README for the complete command and configuration
reference.
