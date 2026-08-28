# @codememento/core

Reusable core library for **CodeMemento**.

It provides deterministic repository inspection, initialization, managed
instruction adapters, Feature/ExecPlan/Change lifecycles, ADR creation,
starter/placeholder-aware documentation diagnostics, CI-friendly validation, and project-owned Git
development workflow primitives for branch naming, linked worktrees, and
start/finish lifecycle checks.

The core is offline-first and contains no interactive terminal UI, so it can be
embedded by IDE integrations, automation, or other developer tools. Git workspace
features are Git-aware and may fetch only when repository policy explicitly enables it.
