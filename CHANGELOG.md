# Changelog

All notable user-facing changes will be documented here.

## 0.2.0 - Unreleased

- Added project-owned Git development workflow configuration.
- Added branch naming patterns, protected branches, worktree policy, and Git action permissions.
- Added `docs workspace`, `docs start <kind> <name>`, and `docs finish [plan]`.
- Added deterministic Git workflow diagnostics for protected-branch work, agent-owned branch names, and required worktrees.
- Added generated development runbooks and AGENTS guidance so coding agents follow repository rules instead of provider defaults.
- Kept v0.1 configuration compatible by applying development workflow defaults when the new section is absent.

## 0.1.0 - 2026-08-27

- Added `@codememento/core` and the `@codememento/cli` `docs` executable.
- Added read-only repository maturity inspection and JSON output.
- Added safe, idempotent initialization with mature-repository adoption mode.
- Added managed Codex/AGENTS, Claude, Copilot, Gemini, and optional Cursor adapters.
- Added durable Feature, living ExecPlan, bounded Change, and ADR workflows.
- Added `status`, `doctor`, and CI-friendly `check` commands.
- Added configurable documentation paths, ADR-path adoption, retired-path checks,
  relative-link validation, and Unicode artifact names.
- Added offline-first package, test, CI, and npm release scaffolding.
