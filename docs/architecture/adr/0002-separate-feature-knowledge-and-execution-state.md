# ADR 0002: Separate durable feature knowledge from execution state

- Status: accepted
- Date: 2026-08-27

## Context

AI-assisted projects need both long-lived knowledge about a feature and
short-lived but resumable state about ongoing work. Combining them makes old
execution details look like current product truth and makes interruption
recovery harder to reason about.

## Decision

CodeMemento models Feature documentation and ExecPlans separately.

Feature packages contain durable specification, design, implementation
strategy, tasks, and feature-local decisions. ExecPlans are living records of
goal, status, progress, decisions, and verification; they move from active to
completed history after verification.

## Consequences

- Agents can understand a feature without replaying old execution history.
- Interrupted work can resume from an active plan without chat history.
- Completed plans remain useful evidence but are explicitly historical.
- Small fixes do not need either artifact when the complexity does not justify it.
