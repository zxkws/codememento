# Documentation Quality: Implementation plan

## Phases

1. Add explicit/legacy starter recognition in core.
2. Make inspection knowledge signals content-aware for canonical knowledge areas.
3. Add configurable placeholder diagnostics to doctor/check.
4. Mark future generated starter docs explicitly.
5. Add regression tests for fresh starters, mature adoption, and backward-compatible config loading.
6. Replace CodeMemento's own starter docs with canonical product/protocol/quality knowledge and improve internal navigation.
7. Document current monorepo support and limitations without promising unimplemented component/affected-analysis features.
8. Run dogfood, package, and public-registry release verification.

## Risks

- Overly broad placeholder detection could flag legitimate user documentation. Mitigation: explicit marker plus exact legacy matches only.
- Tightening maturity semantics may lower scores for repositories that previously appeared mature. This is intentional when they contain only starter knowledge, but recommendations must explain the gap.
- Inspection must remain useful for non-CodeMemento mature repositories with custom file names/content under the standard documentation areas.
