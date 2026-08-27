# Product principles

AgentDocs makes repository knowledge durable across coding agents.

## Principles

1. **Repository state beats chat history.** Durable knowledge belongs in the
   repository, not only in an agent conversation.
2. **AGENTS.md is a router, not an encyclopedia.** It should point agents to
   deeper product, architecture, specification, operational, and reference
   documentation.
3. **One source of truth, thin adapters.** Agent-specific files should route to
   the canonical repository instructions instead of duplicating all rules.
4. **Preserve existing projects.** Initialization is additive and managed
   blocks are updateable without erasing user content.
5. **Offline first.** Core documentation governance works without an AI API or
   network access.
6. **Docs are testable infrastructure.** Broken links, missing lifecycle files,
   stale adapters, and policy violations should be detectable in CI.
