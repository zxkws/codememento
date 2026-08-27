# Repository Knowledge Infrastructure: Feature decisions

## 2026-08-26 — AGENTS.md is a map, not the knowledge store

Durable knowledge belongs under `docs/`; the canonical agent file routes agents
to relevant material.

## 2026-08-26 — Preserve user files with managed blocks

CodeMemento synchronizes only marked regions and never replaces an existing
instruction file wholesale.

## 2026-08-27 — Separate Feature knowledge from ExecPlan state

Features describe durable behavior and design. ExecPlans describe resumable
current progress, decisions, and verification. Their lifetimes differ, so they
must remain separate concepts.

## 2026-08-27 — Inspect before adoption

Existing repositories can already have mature documentation. `docs inspect`
therefore works without `.codememento/config.yaml` and performs no writes.
