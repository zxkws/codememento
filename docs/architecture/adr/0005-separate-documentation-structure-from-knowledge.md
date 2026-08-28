# ADR 0005: Treat documentation structure and repository knowledge separately

- Status: accepted
- Date: 2026-08-28

## Context

Before v0.3, inspection largely scored documentation maturity from path presence. A repository could keep untouched CodeMemento starter files such as `docs/product/overview.md` and `docs/quality/README.md` yet still receive mature/100-style results. CodeMemento itself exposed this problem while dogfooding: the directory structure was complete, but several canonical files still contained only initialization guidance.

A deterministic checker also must avoid the opposite failure: fuzzy placeholder heuristics can incorrectly flag real documentation that merely discusses templates or shows the starter marker as an example.

## Decision

CodeMemento separates **structure signals** from **knowledge-bearing canonical content**.

- New fillable canonical starter files carry an explicit `<!-- codememento:starter -->` marker near the beginning of the document.
- Legacy 0.2.x starter files are recognized by exact normalized content.
- Product, architecture, protocol, and quality inspection signals require meaningful Markdown rather than directory presence alone.
- `inspect` exposes placeholder paths and recommendations.
- `doctor/check` expose configurable `placeholder-document` diagnostics through `governance.placeholderDocs`.
- Marker recognition is positional/exact enough that prose or code examples discussing the marker are not treated as starter files.

## Consequences

- Fresh structure can score lower until a repository replaces starters with real knowledge; this is intentional.
- Older v1 configuration remains valid because the new governance field has a default.
- CodeMemento gains a deterministic quality floor without claiming semantic code/doc consistency.
- Semantic staleness or contradiction detection remains a separate future concern and may require optional higher-level analysis.
