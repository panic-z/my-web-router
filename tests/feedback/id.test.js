const test = require("node:test");
const assert = require("node:assert/strict");

const { createFeedbackId } = require("../../lib/feedback/id");

test("createFeedbackId returns an uppercase timestamp-prefixed identifier", () => {
  const id = createFeedbackId(new Date("2026-04-09T10:11:12.000Z"), "abc12345");

  assert.equal(id, "20260409-ABC123");
});
