const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const vercelConfig = JSON.parse(readFileSync(join(__dirname, "../../vercel.json"), "utf8"));
const sitemap = readFileSync(join(__dirname, "../../sitemap.xml"), "utf8");

test("vercel rewrites top-or-flop path to its upstream deployment", () => {
  assert.deepEqual(
    vercelConfig.rewrites.filter((rewrite) => rewrite.source.startsWith("/top-or-flop")),
    [
      {
        source: "/top-or-flop",
        destination: "https://top-or-flop.vercel.app/",
      },
      {
        source: "/top-or-flop/:path*",
        destination: "https://top-or-flop.vercel.app/:path*",
      },
    ]
  );
});

test("sitemap exposes top-or-flop under the shared CyberShiba domain", () => {
  assert.match(sitemap, /<loc>https:\/\/www\.cybershiba\.cn\/top-or-flop<\/loc>/);
});
