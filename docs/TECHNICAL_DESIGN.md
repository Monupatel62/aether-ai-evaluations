# Technical Design — aether-ai-evaluations

## Core records
DatasetVersion, EvaluationRun, CaseResult, MetricDefinition, RubricVersion, Baseline, and ReportArtifact. Each record carries an immutable version/provenance reference.

## Execution rules
- Validate dataset schema before running any case.
- Use synthetic inputs and isolated credentials; disable external side effects by default.
- Enforce per-case and overall timeout, token/cost budget, and tool allowlist.
- Store summaries and redacted diagnostics; gate raw traces behind explicit policy.
- Mark missing/incomplete cases as incomplete, never as passing.

## Open decisions
Runner language, artifact storage, model-judge approach, and score aggregation require ADRs and a reproducibility POC.
