# Security Review — aether-ai-evaluations

Status: review checklist; no implementation or test evidence is present.

## Threats
leakage of real prompts or customer data into datasets, metric gaming, non-reproducible results, unsafe evaluation tool execution, and false release confidence.

## Required controls
- [ ] Synthetic/sanitized datasets with provenance and sensitive-data scans.
- [ ] Isolated non-production execution; tools/network blocked by default.
- [ ] Strict dataset and result size limits.
- [ ] Secrets redacted from logs, traces, and report artifacts.
- [ ] Least-privilege report access and retention policy.
- [ ] Metric/threshold changes reviewed and audited.

## Required tests
Test dataset schema validation, deterministic reruns, scoring correctness, regression thresholds, unsafe tool-call blocking, redaction, and artifact access control. Use mock providers and synthetic datasets only.
