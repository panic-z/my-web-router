const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const html = readFileSync(join(__dirname, "../../feedback/index.html"), "utf8");

test("feedback form calls native validity checks before submitting", () => {
  assert.match(html, /<form[^>]*id="feedback-form"[^>]*novalidate/);
  assert.match(html, /checkValidity\(\)/);
  assert.match(html, /reportValidity\(\)/);
});
