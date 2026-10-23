# @aether-ai/evaluations

Deterministic dataset validation and exact-match scoring for Aether AI evaluation workflows.

## Status

Initial deterministic evaluator in review. Runner language/hosting, artifact storage, model-judge approach, score aggregation, thresholds, and release-baseline policy remain open decisions. This package does not call models or execute tools.

## Current implementation

- Versioned synthetic dataset and case types.
- Dataset validation for IDs, duplicate cases, case count, and per-case payload size.
- Deterministic exact JSON comparison independent of object key order.
- Explicit `passed`, `failed`, and `incomplete` case outcomes; missing, timed-out, cancelled, errored, or unrun cases never count as passes.
- Compact reports contain case IDs/status/reasons, not raw prompts or model outputs.

## Example

```ts
import { evaluateDataset } from "@aether-ai/evaluations";

const report = evaluateDataset(dataset, new Map([
  ["case-1", { status: "completed", actual: { answer: "synthetic" } }]
]));
```

Use only synthetic or reviewed sanitized datasets. Do not store raw production traces by default. Exact-match scoring is appropriate only for deterministic fixtures; it is not a general quality measure for probabilistic model outputs.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

CI is configured for Node.js 20 and 22. Model/agent evaluation, safety scoring, regression thresholds, artifact storage, and release gates are not implemented yet.
