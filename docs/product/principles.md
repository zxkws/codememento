# Product principles

CodeMemento makes repository knowledge durable across coding agents.

## Principles

1. **Repository state beats chat history.** Durable knowledge belongs in the repository, not only in an agent conversation.
2. **AGENTS.md is a router, not an encyclopedia.** It points agents to deeper product, architecture, specification, operational, and reference documentation.
3. **One source of truth, thin adapters.** Agent-specific files route to canonical repository instructions instead of duplicating all rules.
4. **Preserve existing projects.** Initialization is additive and managed blocks are updateable without erasing user content.
5. **Offline first, not Git-free.** Knowledge governance works without an AI API or network. Git workspace features may use Git and an explicitly configured fetch.
6. **Docs are testable infrastructure.** Broken links, missing lifecycle files, stale adapters, placeholder canonical docs, and policy violations should be detectable in CI.
7. **Canonical truth and historical evidence are different.** Product, architecture, current Feature specs/design/decisions, protocols, quality rules, and runbooks must describe current intent. Completed ExecPlans and changelog entries may describe older versions and must not silently become current truth.
8. **Structure alone is not maturity.** An existing file or directory does not prove useful knowledge. Starter/placeholder canonical docs must not receive the same maturity credit as repository-specific content.
9. **Repository policy beats agent defaults.** Branch/worktree conventions and Git-action permissions belong to the repository, not to Codex, Claude, or any other provider.
10. **Avoid unnecessary ceremony.** Feature packages, Change workspaces, and ExecPlans exist for durable or resumable work; small fixes should not require empty documents.
