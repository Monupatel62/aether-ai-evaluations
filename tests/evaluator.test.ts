import { describe, expect, it } from "vitest";
import { evaluateDataset, validateDataset } from "../src/index.js";
import type { EvaluationDataset } from "../src/index.js";

const dataset: EvaluationDataset = {
  schemaVersion: "1",
  datasetId: "synthetic-chat-basic",
  version: "1.0.0",
  cases: [
    { id: "case-1", input: { prompt: "hello" }, expected: { answer: "hi", score: 1 } },
    { id: "case-2", input: { prompt: "world" }, expected: { answer: "earth" } },
    { id: "case-3", input: { prompt: "pending" }, expected: { answer: "later" } }
  ]
};

describe("deterministic evaluator", () => {
  it("validates dataset IDs, case IDs, uniqueness, and payload limits", () => {
    expect(validateDataset(dataset)).toEqual([]);
    expect(validateDataset({ ...dataset, cases: [...dataset.cases, dataset.cases[0]!] }).map(x => x.code)).toContain("duplicate_case_id");
    expect(validateDataset(dataset, { maxCaseBytes: 1 }).map(x => x.code)).toContain("oversized_case");
  });

  it("compares JSON objects independent of key order", () => {
    const report = evaluateDataset({
      ...dataset,
      cases: [{ id: "case-1", input: {}, expected: { a: 1, b: { c: 2 } } }]
    }, new Map([["case-1", { status: "completed", actual: { b: { c: 2 }, a: 1 } }]]));
    expect(report.passed).toBe(1);
  });

  it("marks missing or incomplete cases as incomplete, never passing", () => {
    const report = evaluateDataset(dataset, new Map([
      ["case-1", { status: "completed", actual: { answer: "hi", score: 1 } }],
      ["case-2", { status: "incomplete", reason: "timeout" }]
    ]));
    expect(report).toMatchObject({ total: 3, passed: 1, failed: 0, incomplete: 2 });
    expect(report.results[1]).toMatchObject({ status: "incomplete", reason: "timeout" });
    expect(report.results[2]).toMatchObject({ status: "incomplete", reason: "not_run" });
  });

  it("does not pass mismatched results", () => {
    const report = evaluateDataset({ ...dataset, cases: [dataset.cases[0]!] }, new Map([
      ["case-1", { status: "completed", actual: { answer: "wrong" } }]
    ]));
    expect(report).toMatchObject({ passed: 0, failed: 1, incomplete: 0 });
    expect(report.results[0]).toMatchObject({ status: "failed", reason: "mismatch" });
  });
});
