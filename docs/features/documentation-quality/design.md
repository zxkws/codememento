# Documentation Quality: Feature design

## Architecture

`packages/core/src/placeholders.ts` owns deterministic starter recognition. It uses an explicit marker for new templates and exact normalized legacy starter content for backward compatibility.

`inspect.ts` uses meaningful-Markdown scanning for knowledge-bearing Product/Architecture/Protocol/Quality areas and returns discovered placeholder paths. `doctor.ts` checks the configured canonical fillable files and maps `governance.placeholderDocs` to warning/error/off behavior.

`templates.ts` is responsible for placing the starter marker into newly generated fillable canonical docs.

## Data flow

```text
docs init
  -> starter canonical file + marker

inspect
  -> recognize marker/exact legacy starter
  -> placeholderDocuments[]
  -> knowledge signal false until meaningful content exists
  -> recommendations

doctor/check
  -> configured placeholderDocs severity
  -> placeholder-document diagnostic
```

## Compatibility

Config stays at version 1. `placeholderDocs` has a default, so existing configs remain valid. The new inspection JSON fields are additive.

Recognition intentionally avoids fuzzy semantic matching in the deterministic core. Semantic staleness or code/doc contradiction detection is a separate future problem.
