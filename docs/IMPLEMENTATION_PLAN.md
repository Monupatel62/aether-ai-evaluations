# Implementation Plan — aether-ai-evaluations

## Phase 0 — gates
- [ ] Define dataset schema, data classification, and synthetic-data policy.
- [ ] Define metric owners, score semantics, thresholds, and baseline policy.
- [ ] Define isolated execution and tool allowlists.

## Phase 1 — deterministic evaluator
- [ ] Validate fixture datasets and run deterministic contract tests.
- [ ] Produce versioned reports from mocked agent/gateway responses.

## Phase 2 — model/agent evaluation
- [ ] Add approved non-production targets with explicit budgets and timeouts.
- [ ] Add safety, correctness, latency, cost, and regression comparisons.

## Phase 3 — release gate
- [ ] Verify reproducibility, redaction, access controls, and failure handling.
- [ ] Require human review for threshold changes and probabilistic score interpretation.

No implementation phase is marked complete.
