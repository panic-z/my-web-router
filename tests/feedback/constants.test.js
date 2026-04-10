const test = require("node:test");
const assert = require("node:assert/strict");

const {
  FEEDBACK_TYPES,
  PRODUCTS,
  FIELD_LIMITS,
} = require("../../lib/feedback/constants");

test("feedback constants expose supported feedback types and products", () => {
  assert.deepEqual(FEEDBACK_TYPES, ["bug", "feature"]);
  assert.deepEqual(PRODUCTS, ["portal", "ai-info", "resume-maker"]);
  assert.equal(FIELD_LIMITS.title, 120);
  assert.equal(FIELD_LIMITS.contact, 160);
});
