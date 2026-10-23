# Dependencies and Contracts — aether-ai-evaluations

## Direct dependencies
aether-ai-agents, aether-ai-gateway, aether-ai-testing, and aether-ai-observability.

## Contracts
- Dataset schema includes case ID, input, expected assertions, tags, and data classification.
- Runner contract records model/agent version, configuration, seed where supported, timing, tool policy, and outcome.
- Report contract versions metrics, rubric, baseline, and threshold decision.
- Never persist real customer data by default.

## Compatibility
Changes to datasets, scoring rubrics, or metric definitions must be versioned; historical reports must retain the version used to produce them.
