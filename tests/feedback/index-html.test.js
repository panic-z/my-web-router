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

test("feedback page includes bilingual language-switch content", () => {
  assert.match(html, /data-lang-button="en"/);
  assert.match(html, /data-lang-button="zh"/);
  assert.match(html, /const messages = \{/);
  assert.match(html, /submitIdle/);
  assert.match(html, /submitLoading/);
});

test("feedback submit errors prefer server messages for 400 and 429", () => {
  assert.match(html, /body\.error/);

  const helperStart = html.indexOf('      function getErrorMessage(status, serverErrorMessage = "") {');
  const helperEnd = html.indexOf("      function prefillProductFromQuery() {", helperStart);

  assert.ok(helperStart >= 0 && helperEnd > helperStart, "expected getErrorMessage helper to be present");

  const helperSource = html.slice(helperStart, helperEnd).trimEnd();

  const getErrorMessage = new Function(
    "getMessage",
    `${helperSource}\nreturn getErrorMessage;`,
  )(() => ({
    statusGeneric: "localized generic",
    statusUnavailable: "localized unavailable",
  }));

  assert.equal(getErrorMessage(400, "Server says no"), "Server says no");
  assert.equal(getErrorMessage(429, ""), "localized generic");
});
