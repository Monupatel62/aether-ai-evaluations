# Architecture — aether-ai-evaluations

## Boundary
The evaluation system orchestrates controlled experiments; it does not become a production execution or authorization authority.

## Flow
1. Load a versioned, validated synthetic dataset.
2. Resolve the approved agent/gateway target and pinned configuration.
3. Execute in an isolated non-production environment with bounded tools/timeouts.
4. Score using a versioned rubric and safety/correctness metrics.
5. Store a redacted report with provenance and compare against an explicit baseline.

## Reliability
Failed/incomplete runs are not silently scored as passes. Preserve failed-case diagnostics without secrets or sensitive payloads. Separate deterministic checks from probabilistic model scores.
