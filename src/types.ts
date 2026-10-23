export type EvaluationJsonPrimitive = string | number | boolean | null;
export type EvaluationJsonValue = EvaluationJsonPrimitive | EvaluationJsonValue[] | { [key: string]: EvaluationJsonValue };

export interface EvaluationCase {
  readonly id: string;
  readonly input: EvaluationJsonValue;
  readonly expected: EvaluationJsonValue;
  readonly tags?: readonly string[];
}

export interface EvaluationDataset {
  readonly schemaVersion: "1";
  readonly datasetId: string;
  readonly version: string;
  readonly cases: readonly EvaluationCase[];
}

export type CaseExecution =
  | { readonly status: "completed"; readonly actual: EvaluationJsonValue }
  | { readonly status: "incomplete"; readonly reason: "timeout" | "cancelled" | "error" | "not_run" };

export interface CaseEvaluation {
  readonly caseId: string;
  readonly status: "passed" | "failed" | "incomplete";
  readonly reason?: "timeout" | "cancelled" | "error" | "not_run" | "mismatch";
}

export interface EvaluationReport {
  readonly schemaVersion: "1";
  readonly datasetId: string;
  readonly datasetVersion: string;
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly incomplete: number;
  readonly results: readonly CaseEvaluation[];
}
