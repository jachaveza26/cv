import { test } from "node:test";
import assert from "node:assert/strict";
import { validate } from "../src/validate.mjs";

const schema = {
  type: "object",
  required: ["name", "start", "tags"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1 },
    start: { type: "string", pattern: "^\\d{4}-\\d{2}$" },
    end: { type: ["string", "null"], pattern: "^\\d{4}-\\d{2}$" },
    level: { type: "string", enum: ["a", "b"] },
    tags: { type: "array", minItems: 1, items: { type: "string" } },
  },
};

test("valid object returns no errors", () => {
  assert.deepEqual(validate({ name: "x", start: "2025-01", end: null, tags: ["t"] }, schema), []);
});

test("missing required property is reported with its path", () => {
  const errors = validate({ name: "x", tags: ["t"] }, schema);
  assert.deepEqual(errors, ["$.start: required"]);
});

test("wrong type, bad pattern, bad enum, empty array, extra property are all reported", () => {
  const errors = validate({ name: 3, start: "2025", end: "x", level: "c", tags: [], extra: 1 }, schema);
  assert.ok(errors.some((e) => e.startsWith("$.name: expected string")));
  assert.ok(errors.includes("$.start: does not match ^\\d{4}-\\d{2}$"));
  assert.ok(errors.includes("$.end: does not match ^\\d{4}-\\d{2}$"));
  assert.ok(errors.includes("$.level: not one of a, b"));
  assert.ok(errors.includes("$.tags: fewer than 1 items"));
  assert.ok(errors.includes("$.extra: unexpected property"));
});

test("array items are validated with their index in the path", () => {
  const errors = validate({ name: "x", start: "2025-01", tags: ["ok", 5] }, schema);
  assert.deepEqual(errors, ["$.tags[1]: expected string, got number"]);
});

import { readFileSync } from "node:fs";

test("content/cv.json validates against content/cv.schema.json", () => {
  const cv = JSON.parse(readFileSync(new URL("../content/cv.json", import.meta.url), "utf8"));
  const schema = JSON.parse(readFileSync(new URL("../content/cv.schema.json", import.meta.url), "utf8"));
  assert.deepEqual(validate(cv, schema), []);
});
