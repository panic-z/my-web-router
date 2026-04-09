const test = require("node:test");
const assert = require("node:assert/strict");

const { validateFeedbackSubmission } = require("../../lib/feedback/validation");

test("accepts a bug submission with required fields", () => {
  const result = validateFeedbackSubmission({
    feedbackType: "bug",
    title: "AI Info page freezes",
    product: "ai-info",
    pageUrl: "https://www.cybershiba.cn/ai-info/article-1",
    steps: "Open the article and scroll to the chart",
    expectedResult: "Chart renders",
    actualResult: "Page becomes blank",
    sourcePath: "/ai-info/article-1",
    referrer: "https://www.cybershiba.cn/ai-info",
    userAgent: "Mozilla/5.0",
    locale: "zh-CN",
    honeypot: "",
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.feedbackType, "bug");
  assert.equal(result.value.product, "ai-info");
});

test("rejects feature submissions without a proposal", () => {
  const result = validateFeedbackSubmission({
    feedbackType: "feature",
    title: "Need a template picker",
    product: "resume-maker",
    currentProblem: "Too few starting points",
    useCase: "I need to create different resumes quickly",
    honeypot: "",
  });

  assert.equal(result.ok, false);
  assert.match(result.error.message, /proposal/i);
});

test("rejects submissions with unsupported products", () => {
  const result = validateFeedbackSubmission({
    feedbackType: "bug",
    title: "Broken page",
    product: "blog",
    pageUrl: "https://www.cybershiba.cn/blog",
    steps: "Open page",
    expectedResult: "Works",
    actualResult: "404",
    honeypot: "",
  });

  assert.equal(result.ok, false);
  assert.match(result.error.message, /product/i);
});

test("rejects submissions when honeypot is filled", () => {
  const result = validateFeedbackSubmission({
    feedbackType: "feature",
    title: "Add export presets",
    product: "resume-maker",
    currentProblem: "Manual formatting takes time",
    proposal: "Preset layouts",
    useCase: "Applying to different roles",
    honeypot: "spam",
  });

  assert.equal(result.ok, false);
  assert.match(result.error.message, /spam/i);
});
