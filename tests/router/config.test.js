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

test("vercel rewrites video-downloader path to its upstream deployment", () => {
  assert.deepEqual(
    vercelConfig.rewrites.filter((rewrite) => rewrite.source.startsWith("/video-downloader")),
    [
      {
        source: "/video-downloader",
        destination: "https://video-downloader-one-chi.vercel.app/video-downloader",
      },
      {
        source: "/video-downloader/:path*",
        destination: "https://video-downloader-one-chi.vercel.app/video-downloader/:path*",
      },
    ]
  );
});

test("sitemap exposes top-or-flop under the shared CyberShiba domain", () => {
  assert.match(sitemap, /<loc>https:\/\/www\.cybershiba\.cn\/top-or-flop<\/loc>/);
});

test("sitemap exposes video-downloader under the shared CyberShiba domain", () => {
  assert.match(sitemap, /<loc>https:\/\/www\.cybershiba\.cn\/video-downloader<\/loc>/);
});
