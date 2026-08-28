# Documentation Quality: Feature decisions

## 2026-08-28 — Prefer explicit starter markers over heuristics

New fillable canonical docs use `<!-- codememento:starter -->`. The deterministic core also recognizes exact legacy 0.2.x starter text. It does not use fuzzy keyword/semantic matching because a false positive against user-authored knowledge is worse than missing an unusual custom placeholder.

## 2026-08-28 — Structure and knowledge are separate maturity concepts

A directory may exist for lifecycle/governance reasons without containing real product or quality knowledge. Product, architecture, protocol, and quality inspection signals therefore require meaningful Markdown rather than only path presence.

## 2026-08-28 — Completed plans are history, Feature truth is current

Completed ExecPlans and changelog entries preserve version-specific execution evidence. Durable Feature `spec/design/decisions` describe current capability; Feature `plan/tasks` are maintained as the current implementation/maintenance view rather than frozen release task history.

## 2026-08-28 — Protocol knowledge is observable but not universally required

`protocolKnowledge` is exposed so repositories with an external contract area can be assessed accurately, but it is not a universal maturity-score requirement. Repositories with no protocol area should not create ceremony for a score. If a protocol area exists and is still starter-only, inspection recommends either documenting the real contract or removing the unused area.
