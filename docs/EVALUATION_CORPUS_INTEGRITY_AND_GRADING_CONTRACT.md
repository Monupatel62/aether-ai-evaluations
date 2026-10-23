# Evaluation Corpus Integrity and Grading Contract

**Status:** proposal for review; not implemented or approved for production.
**Scope:** dataset provenance, adversarial examples, grading evidence, reproducibility, and release-gate interpretation.
**Non-goals:** selecting a runner, model judge, storage engine, aggregate score, or universal release threshold.

## 1. Ownership

Evaluations owns the repeatable dataset, evaluation-run, case-result, metric, baseline, and report contract. It does not own provider execution, orchestration durability, product authorization, or production policy decisions. Each result must identify the immutable dataset, rubric, evaluator, and configuration versions used.

## 2. Dataset provenance and integrity

Each dataset version should record:
- stable dataset ID, immutable version/content digest, and unique case IDs;
- provenance category (authored, synthetic, licensed, public, or approved internal);
- license/permission review status where applicable;
- task, risk category, expected observable, and grading method per case;
- data classification, sanitization status, maintainer, review timestamp, and known limitations.

Synthetic or sanitized data is the default. Do not include real customer prompts, private conversations, credentials, or unapproved production traces. Sanitization must consider indirect identifiers and embedded content. A scan is evidence for review, not proof that a dataset is free of sensitive information.

Changes create a new version; do not silently rewrite historical run meaning. Retired cases remain traceable in old reports and require explicit approval to be reused.

## 3. Adversarial and benign cases

Security corpora should include both adversarial cases and legitimate controls for the same capability. Where relevant, cover direct and indirect prompt injection, disclosure of dummy markers across sessions/tenants, unsafe tool arguments, malicious instructions in retrieved documents/tool results, unsafe output handling, and resource-exhaustion behavior.

Each adversarial case records the trust boundary, intended violation, observable evidence, instrumented mock state or dummy marker, expected policy outcome, and limits of the observable. A final refusal does not prove that no unauthorized tool call occurred.

Benign controls must include ordinary requests containing words that also occur in attack examples. Report false positives separately from legitimate task completion. Use mock providers, dummy data, instrumented tool substitutes, and isolated non-production targets; never test with destructive real actions or real customer data.

## 4. Grading contract

Every case result is one of:
- `pass`: expected outcome observed with sufficient evidence;
- `fail`: evidence shows the required property was violated;
- `inconclusive`: evidence is missing, contradictory, or the intended boundary was not exercised;
- `not_applicable`: case does not apply, with a recorded reason.

Missing telemetry, setup errors, malformed fixtures, and grader failures are not security passes. Use separate observables for data disclosure, unauthorized actions, output handling, task correctness, and reliability. For action claims, prefer instrumented tool logs, authorization decisions, and dummy-state changes.

A model-based grader is probabilistic and must not be the sole evidence for security-critical outcomes. If used for semantic quality, version its rubric/configuration, calibrate against human-reviewed examples, record disagreement, and provide human review for ambiguous or high-impact results.

## 5. Metrics and reproducibility

Define numerator, denominator, inclusion rules, and metric direction before evaluation. Report applicable case counts by outcome, security results by objective, benign false-positive rate, legitimate task-completion rate, incomplete/error rate, latency/cost under declared budgets, and all relevant dataset/model/prompt/tool/rubric/evaluator/baseline versions.

A hand-picked smoke corpus finds regressions; it does not estimate population attack probability. Do not claim statistical confidence without a suitable sampling design. Repeated runs of one case are not automatically independent samples.

Record configuration that can change outcomes, including provider/model version where available, sampling settings, prompt version, tool allowlist, mock behavior, dataset digest, rubric, evaluator, and environment. Deterministic fixtures should reproduce exactly or report the discrepancy. Comparisons should preserve paired per-case outcomes. Baselines and thresholds must not be silently changed after regressions appear.

## 6. Release-gate interpretation

Each release gate must name its dataset version, metric definitions, thresholds, required evidence, and accountable reviewer. This proposal does not set thresholds.

Keep a gate blocked if a mandatory case fails, evidence is inconclusive for a required property, required cases are missing, provenance cannot be established, the evaluator fails validation, or a rubric/threshold change lacks review. Aggregate scores must not hide a critical per-case failure. Probabilistic quality metrics are evidence for human decision-making, not guarantees.

## 7. Report access and retention

Reports can expose prompts, tool arguments, retrieved text, model output, or internal configuration. Store only the minimum diagnostic detail, redact by default, bound diagnostics, and define access and retention rules before storing raw traces. Apply least-privilege report access and preserve provenance/classification metadata in exports.

## 8. Proposed acceptance scenarios

These are design-level cases, not evidence of implemented tests.

| ID | Scenario | Required outcome |
| --- | --- | --- |
| EVAL-CORPUS-01 | Duplicate case IDs | Reject dataset version |
| EVAL-CORPUS-02 | Missing provenance or digest | Ineligible for release pass |
| EVAL-CORPUS-03 | Sensitive content detected | Block publication pending review |
| EVAL-CORPUS-04 | Injection embedded in retrieved mock content | Test indirect-content boundary |
| EVAL-CORPUS-05 | Final response refuses but unauthorized tool ran | Security failure |
| EVAL-CORPUS-06 | Required telemetry missing | Inconclusive, not pass |
| EVAL-CORPUS-07 | Benign request contains attack-associated wording | Grade task completion and false positives separately |
| EVAL-CORPUS-08 | Grader varies across repeats | Preserve results and grader version |
| EVAL-CORPUS-09 | Setup fails before target boundary | Mark incomplete/inconclusive |
| EVAL-CORPUS-10 | Case removed in a later version | Preserve old-run traceability |
| EVAL-CORPUS-11 | Baseline changes after a regression | Require reviewed, audited change |
| EVAL-CORPUS-12 | Aggregate passes but critical case fails | Keep gate blocked |
| EVAL-CORPUS-13 | Raw traces lack approved access rules | Block or restrict publication |
| EVAL-CORPUS-14 | Deterministic rerun differs | Report reproducibility failure |
| EVAL-CORPUS-15 | Judge alone supports a security claim | Require deterministic evidence or mark unsupported |
| EVAL-CORPUS-16 | Run omits cases due to setup failure | Incomplete run; missing cases never pass |

## 9. References and open decisions

- [Technical design](TECHNICAL_DESIGN.md)
- [Security review](SECURITY_REVIEW.md)
- [OWASP AI/LLM Application Security Testing and Red Teaming](https://owasp.github.io/DevSecOpsGuideline/2-Process/2-4-Test/2-4-6-AI-LLM-Application-Security-Testing/)
- [OWASP LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
- [OWASP LLMSVS v2.0](https://owasp.github.io/www-project-llm-verification-standard/LLMSVS-v2.0-en.html)

Dataset storage, runner technology, judge strategy, aggregation, retention periods, and release thresholds remain open. No implementation or security control is claimed complete.
