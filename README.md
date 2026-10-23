# aether-ai-evaluations

**Status:** Initial bounded evaluation runner implemented on a feature branch. No model benchmarks or production evaluation dataset have been run.

## Implemented

- [Evaluation runner](src/index.js): deterministic exact/contains/non-empty scorers, bounded dataset/case sizes, per-case timeout, aggregate pass-rate/score/duration metrics, and result metadata that excludes raw outputs.
- [Unit tests](test/evaluations.test.js): scoring, aggregate metrics, malformed/duplicate cases, size limits, per-case failures, and timeouts.
- Dependency-free Node.js package with Node 20/22 CI.

## Safety and limitations

Use synthetic or sanitized fixtures by default. This runner does not store raw prompts or outputs, but the injected `runCase` adapter may still send input to an external model; that data path must be explicitly approved. No benchmark dataset, LLM-as-judge rubric, regression threshold, provider integration, or result persistence is included.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
