const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const html = readFileSync(join(__dirname, "../../index.html"), "utf8");

test("portal homepage keeps feedback out of the primary card nav", () => {
  assert.match(html, /<p class="support-copy">[\s\S]*?href="\/feedback\?product=portal"[\s\S]*?<\/p>/);
  assert.doesNotMatch(html, /<nav>[\s\S]*href="\/feedback\?product=portal"/);
  assert.match(html, /data-i18n="supportPrompt"/);
});

test("portal homepage links to Top or Flop", () => {
  assert.match(html, /<nav>[\s\S]*href="\/top-or-flop"[\s\S]*<\/nav>/);
  assert.match(html, /data-i18n="topOrFlop"/);
  assert.match(html, /\/top-or-flop/);
});

test("portal homepage links to Video Downloader", () => {
  assert.match(html, /<nav>[\s\S]*href="\/video-downloader"[\s\S]*<\/nav>/);
  assert.match(html, /data-i18n="videoDownloader"/);
  assert.match(html, /\/video-downloader/);
});
