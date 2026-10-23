import test from "node:test";
import assert from "node:assert/strict";
import { EvaluationError, evaluateResponse, summarizeEvaluations, validateDataset } from "../src/index.js";

const dataset = { schemaVersion: 1, cases: [
  { id: "greeting", input: "Say hello", assertions: { contains: ["hello"], notContains: ["password"] } },
  { id: "exact", input: "Return OK", assertions: { exact: "OK" } },
] };

test("validates and freezes a dataset", () => {
  const result = validateDataset(dataset);
  assert.equal(result.cases.length, 2);
  assert.equal(Object.isFrozen(result.cases), true);
});

test("rejects duplicate IDs, unsupported versions, and empty assertions", () => {
  assert.throws(() => validateDataset({ ...dataset, schemaVersion: 2 }), EvaluationError);
  assert.throws(() => validateDataset({ schemaVersion: 1, cases: [dataset.cases[0], dataset.cases[0]] }), EvaluationError);
  assert.throws(() => validateDataset({ schemaVersion: 1, cases: [{ id: "empty", input: "x", assertions: {} }] }), EvaluationError);
});

test("scores exact, contains, and not-contains assertions", () => {
  const testCase = validateDataset(dataset).cases[0];
  const result = evaluateResponse(testCase, "Hello there");
  assert.equal(result.score, 1);
  assert.equal(result.passed, true);
  assert.equal(evaluateResponse(testCase, "Hello password").passed, false);
  assert.equal(evaluateResponse(validateDataset(dataset).cases[1], "ok").passed, true);
});

test("normalizes Unicode compatibility and case", () => {
  const result = evaluateResponse({ id: "unicode", assertions: { contains: ["café"] } }, "CAFÉ");
  assert.equal(result.passed, true);
});

test("summarizes pass rate and mean score", () => {
  assert.deepEqual(summarizeEvaluations([{ passed: true, score: 1 }, { passed: false, score: 0.5 }]), { total: 2, passed: 1, failed: 1, passRate: 0.5, meanScore: 0.75 });
  assert.deepEqual(summarizeEvaluations([]), { total: 0, passed: 0, failed: 0, passRate: 0, meanScore: 0 });
});

test("rejects malformed responses and summaries", () => {
  assert.throws(() => evaluateResponse({ id: "x", assertions: {} }, null), EvaluationError);
  assert.throws(() => summarizeEvaluations([{ score: 2, passed: false }]), EvaluationError);
});


test("bounds assertion count, dataset bytes, and limit configuration", () => {
  assert.throws(() => validateDataset({ schemaVersion: 1, cases: [{ id: "a", input: "x", assertions: { exact: "x".repeat(100_001) } }] }), EvaluationError);
  assert.throws(() => validateDataset({ schemaVersion: 1, cases: [{ id: "a", input: "x", assertions: { contains: Array.from({ length: 101 }, () => "x") } }] }), EvaluationError);
  assert.throws(() => validateDataset(dataset, { maxCases: 0 }), /maxCases/);
  assert.throws(() => validateDataset(dataset, { maxDatasetBytes: 10 }), EvaluationError);
});
