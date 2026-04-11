const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const html = readFileSync(join(__dirname, "../../index.html"), "utf8");

test("portal homepage includes stronger SEO metadata and share image", () => {
  assert.match(html, /<title>CyberShiba \| AI News Hub, Resume Builder, and Web Tools<\/title>/);
  assert.match(html, /<meta[\s\S]*name="keywords"[\s\S]*content="[^"]*AI news hub[^"]*resume builder[^"]*web tools/i);
  assert.match(html, /<meta property="og:image" content="https:\/\/www\.cybershiba\.cn\/portal-og\.svg"/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/www\.cybershiba\.cn\/portal-og\.svg"/);
});

test("portal homepage contains crawlable product copy and FAQ content", () => {
  assert.match(html, /data-i18n="platformSummaryTitle"/);
  assert.match(html, /data-i18n="platformSummaryBody"/);
  assert.match(html, /data-i18n="faqTitle"/);
  assert.match(html, /data-i18n="faqPortalQuestion"/);
});

test("portal homepage exposes organization and item list structured data", () => {
  assert.match(html, /"@type":\s*"Organization"/);
  assert.match(html, /"@type":\s*"ItemList"/);
  assert.match(html, /"sameAs":\s*\[/);
});
