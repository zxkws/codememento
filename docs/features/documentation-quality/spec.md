# Documentation Quality: Feature specification

## What

CodeMemento distinguishes **documentation structure** from **repository-specific knowledge**. Canonical fillable starter documents are not treated as mature merely because the file exists.

New fillable starter docs carry `<!-- codememento:starter -->`. Legacy 0.2.x starter text is recognized by exact content so existing repositories receive the same diagnosis without migration.

`docs inspect` exposes `placeholderDocuments`, adds a `protocolKnowledge` signal, and bases product/architecture/protocol/quality knowledge signals on meaningful Markdown rather than directory presence alone.

`docs doctor` emits `placeholder-document` according to `governance.placeholderDocs`.

## Why

A repository with empty starter Product/Protocol/Quality files previously scored 100/100 and could be labeled `mature`. That made structural completeness look like useful agent memory and undermined CodeMemento's own promise that repository knowledge is durable and trustworthy.

## Acceptance criteria

- Fresh CodeMemento starters are explicitly marked.
- Legacy exact starter docs are detected without fuzzy keyword matching.
- User-authored non-starter content is not falsely classified because it happens to discuss documentation templates.
- Product, architecture, protocol, and quality knowledge signals require meaningful Markdown.
- `inspect --json` reports placeholder paths and `protocolKnowledge`.
- `doctor` reports configurable placeholder diagnostics.
- Old config version 1 files without `placeholderDocs` continue loading with a default severity.
- CodeMemento's own canonical docs contain no starter placeholders and dogfood to 100/100.
