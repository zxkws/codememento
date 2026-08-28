# Product overview

## What CodeMemento is

CodeMemento is **durable repository memory for AI coding agents**. It keeps project knowledge, working rules, durable feature intent, execution state, and development-workflow policy in versioned repository files so different coding agents can inherit the same context without depending on a previous chat session.

The public CLI is `docs`, published by `@codememento/cli`; reusable behavior lives in `@codememento/core`.

## Users

Primary users are software teams that use one or more coding agents such as Codex, Claude, Copilot, Gemini, or similar tools and want those agents to work from repository-owned context rather than provider-specific defaults or conversation memory.

The repository owner remains authoritative. CodeMemento organizes, preserves, and validates repository knowledge; it does not replace human review or make product decisions on its own.

## Problems it solves

- Agent conversations are temporary and do not form a reliable project memory.
- Different agents invent different branch names, worktree habits, and Git-action assumptions.
- Product intent, architecture, contracts, runbooks, and acceptance criteria drift across chats, READMEs, tickets, and source code.
- Large handoff files become difficult to navigate and create competing sources of truth.
- Documentation can exist structurally while still being empty, stale, or only starter text.

## Core concepts

- **Instructions** — `AGENTS.md` is the canonical short router for how agents work in the repository. Tool-specific files are thin managed adapters.
- **Knowledge** — durable product, architecture, protocol, quality, runbook, reference, and generated documentation under the configured docs root.
- **Feature** — long-lived capability knowledge: observable behavior, design, decisions, and a maintainable implementation/task view.
- **ExecPlan** — resumable execution state for multi-step or cross-session work. Active plans are current work; completed plans are historical evidence.
- **Change** — optional bounded proposal/spec/design/tasks/test/result workspace for repositories that need a formal change lifecycle.
- **ADR** — durable cross-cutting architecture decisions.
- **Development workspace** — repository-owned branch/worktree/start/finish policy so agents do not substitute provider defaults.
- **Governance** — deterministic diagnostics for structure, links, lifecycle, adapters, Git workflow, and starter/placeholder canonical docs.

## Scope

CodeMemento is repository-local. One initialized Git repository has one canonical CodeMemento knowledge system by default, including monorepos. Git branches and worktrees operate at repository scope, which lets a single task span multiple apps/packages without splitting its execution state across repositories.

CodeMemento is offline-first for repository/document governance. Git-dependent development-workflow commands require a Git repository, and a configured `docs start` may fetch a remote base. Core documentation lifecycles do not require an AI provider or API key.

## Non-goals

CodeMemento is not:

- a coding agent or autonomous implementation engine;
- a replacement for Git, issue trackers, CI, or project management;
- a personal knowledge-management system or company-wide cross-repository knowledge graph;
- a semantic guarantee that documentation and code always agree;
- a reason to create documentation ceremony for trivial fixes.

The deterministic core should make repository truth easier to find and easier to validate. Optional semantic/AI-assisted analysis can be added later without making the basic workflow depend on an external model.
