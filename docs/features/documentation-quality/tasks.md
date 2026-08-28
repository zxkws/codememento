# Documentation Quality: Capability checklist

- [x] New fillable canonical starter docs carry an explicit starter marker.
- [x] Legacy 0.2.x exact starter text remains detectable.
- [x] Marker examples/discussion in normal documentation do not trigger false positives.
- [x] `inspect` exposes `placeholderDocuments` and `protocolKnowledge`.
- [x] Product/Architecture/Protocol/Quality knowledge signals distinguish meaningful Markdown from starter-only content.
- [x] Protocol knowledge remains optional for repositories that have no protocol area.
- [x] `doctor/check` expose configurable `placeholder-document` diagnostics through `governance.placeholderDocs`.
- [x] Existing config version 1 files load without the new field.
- [x] CodeMemento's own Product/Protocol/Quality/index docs dogfood the non-placeholder model.
- [x] Current monorepo support and limitations are documented without claiming unimplemented Component/affected-analysis features.

Keep release-specific verification and publication history in ExecPlans and `CHANGELOG.md`, not in this durable capability checklist.
