import type { CaseEvaluation, CaseExecution, EvaluationDataset, EvaluationJsonValue, EvaluationReport } from "./types.js";

export interface DatasetValidationIssue {
  readonly path: string;
  readonly code: "invalid_id" | "duplicate_case_id" | "empty_cases" | "too_many_cases" | "oversized_case";
}

export function validateDataset(dataset: EvaluationDataset, limits: { maxCases?: number; maxCaseBytes?: number } = {}): readonly DatasetValidationIssue[] {
  const issues: DatasetValidationIssue[] = [];
  const maxCases = limits.maxCases ?? 10_000;
  const maxCaseBytes = limits.maxCaseBytes ?? 1024 * 1024;

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(dataset.datasetId) ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._+-]{0,63}$/.test(dataset.version)) {
    issues.push({ path: "/", code: "invalid_id" });
  }
  if (dataset.cases.length === 0) issues.push({ path: "/cases", code: "empty_cases" });
  if (dataset.cases.length > maxCases) issues.push({ path: "/cases", code: "too_many_cases" });

  const seen = new Set<string>();
  for (let index = 0; index < dataset.cases.length; index++) {
    const testCase = dataset.cases[index];
    if (!testCase) continue;
    const path = `/cases/${index}`;
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(testCase.id)) {
      issues.push({ path: `${path}/id`, code: "invalid_id" });
    }
    if (seen.has(testCase.id)) issues.push({ path: `${path}/id`, code: "duplicate_case_id" });
    seen.add(testCase.id);

    const bytes = new TextEncoder().encode(JSON.stringify({ input: testCase.input, expected: testCase.expected })).byteLength;
    if (bytes > maxCaseBytes) issues.push({ path, code: "oversized_case" });
  }
  return issues;
}

function canonicalJson(value: EvaluationJsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
}

export function evaluateDataset(
  dataset: EvaluationDataset,
  executions: ReadonlyMap<string, CaseExecution>
): EvaluationReport {
  const validationIssues = validateDataset(dataset);
  if (validationIssues.length > 0) {
    throw new TypeError(`Invalid evaluation dataset: ${validationIssues.map(issue => issue.code).join(", ")}`);
  }

  const results: CaseEvaluation[] = dataset.cases.map(testCase => {
    const execution = executions.get(testCase.id);
    if (!execution) return { caseId: testCase.id, status: "incomplete", reason: "not_run" };
    if (execution.status === "incomplete") return { caseId: testCase.id, status: "incomplete", reason: execution.reason };
    if (canonicalJson(execution.actual) === canonicalJson(testCase.expected)) {
      return { caseId: testCase.id, status: "passed" };
    }
    return { caseId: testCase.id, status: "failed", reason: "mismatch" };
  });

  // Extra execution records do not count as cases in this dataset and are intentionally ignored.
  const passed = results.filter(result => result.status === "passed").length;
  const failed = results.filter(result => result.status === "failed").length;
  const incomplete = results.filter(result => result.status === "incomplete").length;
  return {
    schemaVersion: "1",
    datasetId: dataset.datasetId,
    datasetVersion: dataset.version,
    total: results.length,
    passed,
    failed,
    incomplete,
    results
  };
}
