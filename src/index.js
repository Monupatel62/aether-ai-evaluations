export class EvaluationError extends Error {
  constructor(code, message = "Evaluation failed") { super(message); this.name = "EvaluationError"; this.code = code; }
}
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function safeJsonSize(value) {
  try { return Buffer.byteLength(JSON.stringify(value)); }
  catch { throw new EvaluationError("invalid_dataset", "Dataset must be JSON-serializable"); }
}
export function scoreCase(output, expected, scorer) {
  if (typeof output !== "string") return 0;
  if (scorer === "non_empty") return output.trim().length > 0 ? 1 : 0;
  if (scorer === "exact_match") return typeof expected === "string" && output.trim() === expected.trim() ? 1 : 0;
  if (scorer === "contains") return typeof expected === "string" && output.toLowerCase().includes(expected.toLowerCase()) ? 1 : 0;
  throw new EvaluationError("unsupported_scorer", "Scoring function is not supported");
}

export function createEvaluationRunner({ runCase, maxCases = 200, maxCaseBytes = 262_144, timeoutMs = 60_000, clock = () => Date.now() }) {
  if (typeof runCase !== "function" || typeof clock !== "function") throw new TypeError("runCase and clock callbacks are required");
  if (!Number.isSafeInteger(maxCases) || maxCases < 1 || maxCases > 2000) throw new TypeError("maxCases is invalid");
  if (!Number.isSafeInteger(maxCaseBytes) || maxCaseBytes < 1 || maxCaseBytes > 1_048_576) throw new TypeError("maxCaseBytes is invalid");
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 300_000) throw new TypeError("timeoutMs is invalid");

  return Object.freeze({
    async run(cases) {
      if (!Array.isArray(cases) || cases.length === 0 || cases.length > maxCases) throw new EvaluationError("invalid_dataset", "Dataset size is invalid");
      const ids = new Set();
      const results = [];
      for (const item of cases) {
        if (!isRecord(item) || typeof item.id !== "string" || !/^[A-Za-z0-9._:-]{1,128}$/.test(item.id) || ids.has(item.id)
          || !isRecord(item.input) || !["exact_match", "contains", "non_empty"].includes(item.scorer)
          || (item.scorer !== "non_empty" && typeof item.expected !== "string")) {
          throw new EvaluationError("invalid_dataset", "Evaluation case is invalid");
        }
        ids.add(item.id);
        if (safeJsonSize(item) > maxCaseBytes) throw new EvaluationError("case_too_large", "Evaluation case exceeds the configured limit");
      }

      const startedAt = clock();
      for (const item of cases) {
        const start = clock();
        const controller = new AbortController();
        let timeout;
        try {
          const timeoutPromise = new Promise((_, reject) => {
            timeout = setTimeout(() => { controller.abort(); reject(new EvaluationError("timeout")); }, timeoutMs);
          });
          const execution = Promise.resolve().then(() => runCase({ caseId: item.id, input: item.input, signal: controller.signal }));
          const response = await Promise.race([execution, timeoutPromise]);
          const output = isRecord(response) ? response.output : undefined;
          const score = scoreCase(output, item.expected, item.scorer);
          results.push(Object.freeze({ caseId: item.id, score, passed: score === 1, durationMs: Math.max(0, clock() - start), errorCode: null }));
        } catch (error) {
          results.push(Object.freeze({ caseId: item.id, score: 0, passed: false, durationMs: Math.max(0, clock() - start), errorCode: error instanceof EvaluationError ? error.code : "case_failed" }));
        } finally { clearTimeout(timeout); }
      }
      const passed = results.filter((result) => result.passed).length;
      const score = results.reduce((sum, result) => sum + result.score, 0) / results.length;
      return Object.freeze({
        caseCount: results.length,
        passed,
        failed: results.length - passed,
        passRate: passed / results.length,
        meanScore: score,
        durationMs: Math.max(0, clock() - startedAt),
        results: Object.freeze(results),
      });
    },
  });
}
