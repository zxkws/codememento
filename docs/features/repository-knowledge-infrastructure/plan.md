# Repository Knowledge Infrastructure: Implementation plan

## Phases

1. Establish the TypeScript monorepo, reusable core, CLI, tests, CI, and release scaffolding.
2. Implement safe initialization, managed blocks, detection, and adapters.
3. Add Feature, ExecPlan, Change, and ADR lifecycle commands.
4. Add deterministic doctor/check governance.
5. Incorporate source-of-truth ordering, Feature vs ExecPlan separation,
   completed-plan lifecycle, generated-doc authority, and retired-path checks.
6. Add read-only inspection, repository status, JSON output, self-dogfooding,
   package validation, and final release review.

## Risks

- Too much default ceremony can make documentation a burden. Small fixes remain
  exempt from feature/change packages.
- Agent instruction formats can evolve. Keep adapters thin and replaceable.
- Static checks cannot prove semantic code/doc consistency. Keep future AI
  analysis optional instead of weakening deterministic core behavior.
