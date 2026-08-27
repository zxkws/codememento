# Changelog

All notable user-facing changes will be documented here.

## 0.2.2 - 2026-08-27

- Fixed manual npm publication so the public CLI package depends on a real core version instead of the private `workspace:*` protocol.
- Added `pnpm pack:check` to verify packed core/CLI versions, CLI core dependency rewriting, absence of `workspace:` dependencies, and the `docs` executable before release.
- Documented that manual releases must publish pnpm-generated tarballs rather than running `npm publish` directly inside a workspace package.

## 0.2.1 - 2026-08-27

- Added `baseBranch: "@current"` for repositories whose primary worktree stays on the active development line.
- `docs start` can now branch linked worktrees from the currently checked-out development branch.
- Primary `@current` workspaces may keep an established branch name while new linked worktree branches still follow project naming policy.
- Improved AGENTS/runbook guidance for `preferred` worktrees so normal work may continue on the current development branch.

## 0.2.0 - 2026-08-27

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
