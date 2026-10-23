# aether-ai-evaluations

**Status:** Initial deterministic evaluation harness implemented on a feature branch. No model-quality claims are implied.

## Implemented

- [Evaluation source](src/index.js): bounded dataset validation, unique case IDs, exact/contains/not-contains string assertions, and aggregate pass-rate/mean-score summaries.
- [Unit tests](test/evaluations.test.js): schema validation, duplicate IDs, scoring, Unicode normalization, summary metrics, and malformed inputs.
- Dependency-free Node.js package with Node 20/22 CI.

## Limitations

These are deterministic string checks, not semantic quality or safety evaluations. No model runner, evaluator model, golden dataset suite, regression baseline, benchmark report, judge calibration, or PII-safe result store is included. Dataset owners must review test coverage and avoid committing secrets or private user content.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
