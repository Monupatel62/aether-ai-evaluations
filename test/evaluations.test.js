import test from "node:test";
import assert from "node:assert/strict";
import { createEvaluationRunner, EvaluationError, scoreCase } from "../src/index.js";

const cases = [
  { id: "exact", input: { prompt: "synthetic" }, expected: "hello", scorer: "exact_match" },
  { id: "contains", input: { prompt: "synthetic" }, expected: "world", scorer: "contains" },
  { id: "nonempty", input: { prompt: "synthetic" }, scorer: "non_empty" },
];

test("scores exact, contains, and non-empty outputs", () => {
  assert.equal(scoreCase("hello", "hello", "exact_match"), 1);
  assert.equal(scoreCase("Hello WORLD", "world", "contains"), 1);
  assert.equal(scoreCase("  ", null, "non_empty"), 0);
});

test("runs dataset and returns aggregate metrics without raw outputs", async () => {
  const runner = createEvaluationRunner({ runCase: async ({ caseId }) => ({ output: caseId === "exact" ? "hello" : caseId === "contains" ? "a world" : "done" }), clock: () => 100 });
  const result = await runner.run(cases);
  assert.equal(result.caseCount, 3);
  assert.equal(result.passed, 3);
  assert.equal(result.passRate, 1);
  assert.equal("output" in result.results[0], false);
});

test("rejects duplicate IDs, malformed cases, and oversized datasets", async () => {
  const runner = createEvaluationRunner({ runCase: async () => ({ output: "ok" }), maxCases: 3, maxCaseBytes: 100 });
  await assert.rejects(runner.run([cases[0], cases[0]]), EvaluationError);
  await assert.rejects(runner.run([{ id: "x", input: {}, scorer: "regex" }]), EvaluationError);
  await assert.rejects(runner.run([{ id: "large", input: { prompt: "x".repeat(200) }, scorer: "non_empty" }]), EvaluationError);
});

test("captures per-case failure and timeout without aborting the whole suite", async () => {
  let index = 0;
  const runner = createEvaluationRunner({ timeoutMs: 10, runCase: async () => { index += 1; if (index === 1) throw new Error("private provider response"); if (index === 2) return new Promise(() => {}); return { output: "ok" }; } });
  const result = await runner.run([
    { id: "fails", input: {}, scorer: "non_empty" },
    { id: "times-out", input: {}, scorer: "non_empty" },
    { id: "passes", input: {}, scorer: "non_empty" },
  ]);
  assert.equal(result.failed, 2);
  assert.equal(result.results[0].errorCode, "case_failed");
  assert.equal(result.results[1].errorCode, "timeout");
  assert.equal(result.results[2].passed, true);
});
