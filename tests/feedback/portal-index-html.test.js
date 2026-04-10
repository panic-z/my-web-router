const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const html = readFileSync(join(__dirname, "../../index.html"), "utf8");

test("portal homepage keeps feedback out of the primary card nav", () => {
  assert.match(html, /<p class="support-copy">[\s\S]*href="\/feedback\?product=portal"/);
  assert.doesNotMatch(html, /<nav>[\s\S]*href="\/feedback\?product=portal"/);
  assert.match(html, /data-i18n="supportPrompt"/);
});
