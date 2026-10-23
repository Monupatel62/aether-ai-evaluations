const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
export class EvaluationError extends Error {
  constructor(code, message = "Evaluation input is invalid") { super(message); this.name = "EvaluationError"; this.code = code; }
}
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function validId(value) { return typeof value === "string" && ID.test(value) && value.trim() === value; }
function normalize(value) { return value.normalize("NFKC").toLocaleLowerCase("en-US"); }

export function validateDataset(dataset, { maxCases = 1000, maxTextChars = 100_000, maxAssertionsPerCase = 100, maxDatasetBytes = 5_242_880 } = {}) {
  if (!Number.isSafeInteger(maxCases) || maxCases < 1 || maxCases > 10_000) throw new TypeError("maxCases is invalid");
  if (!Number.isSafeInteger(maxTextChars) || maxTextChars < 1 || maxTextChars > 1_000_000) throw new TypeError("maxTextChars is invalid");
  if (!Number.isSafeInteger(maxAssertionsPerCase) || maxAssertionsPerCase < 1 || maxAssertionsPerCase > 1000) throw new TypeError("maxAssertionsPerCase is invalid");
  if (!Number.isSafeInteger(maxDatasetBytes) || maxDatasetBytes < 1 || maxDatasetBytes > 20_971_520) throw new TypeError("maxDatasetBytes is invalid");
  let encoded;
  try { encoded = JSON.stringify(dataset); } catch { throw new EvaluationError("invalid_dataset", "Dataset must be JSON-serializable"); }
  if (typeof encoded !== "string" || Buffer.byteLength(encoded) > maxDatasetBytes) throw new EvaluationError("dataset_too_large", "Dataset exceeds the configured size limit");
  if (!isRecord(dataset) || dataset.schemaVersion !== 1 || !Array.isArray(dataset.cases) || dataset.cases.length === 0 || dataset.cases.length > maxCases) {
    throw new EvaluationError("invalid_dataset", "Dataset must be version 1 and contain a bounded non-empty cases array");
  }
  const ids = new Set();
  const cases = dataset.cases.map((item, index) => {
    if (!isRecord(item) || !validId(item.id) || ids.has(item.id)) throw new EvaluationError("invalid_case_id", `Case ${index} has an invalid or duplicate id`);
    ids.add(item.id);
    if (typeof item.input !== "string" || item.input.length > maxTextChars) throw new EvaluationError("invalid_input", `Case ${item.id} input is invalid`);
    if (!isRecord(item.assertions)) throw new EvaluationError("invalid_assertions", `Case ${item.id} assertions are invalid`);
    const a = item.assertions;
    if (a.exact !== undefined && (typeof a.exact !== "string" || a.exact.length > maxTextChars)) throw new EvaluationError("invalid_assertions", "exact must be a bounded string");
    for (const field of ["contains", "notContains"]) {
      if (a[field] !== undefined && (!Array.isArray(a[field]) || a[field].length > maxAssertionsPerCase || a[field].some((v) => typeof v !== "string" || !v.length || v.length > 1000))) {
        throw new EvaluationError("invalid_assertions", `${field} must be an array of bounded non-empty strings`);
      }
    }
    if (a.exact === undefined && !Array.isArray(a.contains) && !Array.isArray(a.notContains)) {
      throw new EvaluationError("empty_assertions", `Case ${item.id} has no supported assertions`);
    }
    return Object.freeze({ id: item.id, input: item.input, assertions: Object.freeze({
      ...(a.exact !== undefined ? { exact: a.exact } : {}),
      ...(a.contains !== undefined ? { contains: Object.freeze([...a.contains]) } : {}),
      ...(a.notContains !== undefined ? { notContains: Object.freeze([...a.notContains]) } : {}),
    }) });
  });
  return Object.freeze({ schemaVersion: 1, cases: Object.freeze(cases) });
}

/** Deterministic string assertions only; not a substitute for human or model-quality review. */
export function evaluateResponse(testCase, response) {
  if (!isRecord(testCase) || !validId(testCase.id) || !isRecord(testCase.assertions)) throw new EvaluationError("invalid_case");
  if (typeof response !== "string" || response.length > 1_000_000) throw new EvaluationError("invalid_response");
  const assertions = [];
  const actual = normalize(response);
  const a = testCase.assertions;
  if (a.exact !== undefined) assertions.push({ name: "exact", passed: actual === normalize(a.exact) });
  for (const needle of a.contains ?? []) assertions.push({ name: `contains:${needle}`, passed: actual.includes(normalize(needle)) });
  for (const needle of a.notContains ?? []) assertions.push({ name: `notContains:${needle}`, passed: !actual.includes(normalize(needle)) });
  const passed = assertions.filter((x) => x.passed).length;
  return Object.freeze({
    caseId: testCase.id,
    score: assertions.length ? passed / assertions.length : 0,
    passed: passed === assertions.length && assertions.length > 0,
    assertions: Object.freeze(assertions.map(Object.freeze)),
  });
}

export function summarizeEvaluations(results) {
  if (!Array.isArray(results) || results.some((r) => !isRecord(r) || typeof r.score !== "number" || !Number.isFinite(r.score) || r.score < 0 || r.score > 1)) {
    throw new EvaluationError("invalid_results");
  }
  const count = results.length;
  const passed = results.filter((r) => r.passed === true).length;
  return Object.freeze({ total: count, passed, failed: count - passed, passRate: count ? passed / count : 0, meanScore: count ? results.reduce((sum, r) => sum + r.score, 0) / count : 0 });
}
