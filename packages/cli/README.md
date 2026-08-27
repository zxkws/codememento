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

The CLI preserves user-authored documentation, uses managed regions for
agent-specific instruction files, works offline by default, and delegates
repository behavior to `@codememento/core`.

See the CodeMemento repository README for the complete command and configuration
reference.
