# @agentdocs/cli

The command-line interface for **AgentDocs**, AI-native documentation
infrastructure for source repositories.

```bash
npx @agentdocs/cli inspect
npx @agentdocs/cli init
```

After a global install, the executable is `docs`:

```bash
npm install -g @agentdocs/cli
docs status
docs doctor
docs check
```

The CLI preserves user-authored documentation, uses managed regions for
agent-specific instruction files, works offline by default, and delegates
repository behavior to `@agentdocs/core`.

See the AgentDocs repository README for the complete command and configuration
reference.
