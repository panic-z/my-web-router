const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const html = readFileSync(join(__dirname, "../../index.html"), "utf8");

test("portal homepage keeps feedback out of the primary card nav", () => {
  assert.doesNotMatch(html, /<nav>[\s\S]*data-i18n="feedback"[\s\S]*<\/nav>/);
  assert.match(html, /data-i18n="supportPrompt"/);
  assert.match(html, /href="\/feedback\?product=portal"/);
});
