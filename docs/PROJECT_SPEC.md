# Project Specification — aether-ai-evaluations

## Purpose
Repeatable model/agent evaluation datasets, runners, scoring, regression detection, and release gates.

## Scope
- Synthetic/sanitized datasets, deterministic configuration, rubric/versioning, safety and correctness metrics, regression thresholds, and report format.
- Keep dataset, rubric, runner, model configuration, and report versions explicit.
- Make evaluation results reproducible and suitable for release decisions.

## Out of scope
Owning production model routing, agent runtime, customer data, or authorization policy.

## Acceptance criteria
- Every run records dataset/rubric/runner/model versions and configuration.
- Default datasets are synthetic or sanitized and reviewed for sensitive data.
- Scoring and release thresholds are explainable and tested.

## Status
Documentation only; no evaluation source, dataset runner, package manifest, tests, or CI workflow was found in the inspected default-branch tree.
