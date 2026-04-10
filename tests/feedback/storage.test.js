const test = require("node:test");
const assert = require("node:assert/strict");

const { toStorageRow } = require("../../lib/feedback/storage");

test("toStorageRow maps validated feedback into snake_case columns", () => {
  const row = toStorageRow({
    id: "20260409-ABC123",
    feedbackType: "feature",
    title: "Add resume presets",
    product: "resume-maker",
    pageUrl: "https://www.cybershiba.cn/resume-maker",
    sourcePath: "/resume-maker",
    currentProblem: "Starting from scratch is slow",
    proposal: "Add presets",
    useCase: "Tailor resumes for multiple applications",
    steps: "",
    expectedResult: "",
    actualResult: "",
    contact: "hello@example.com",
    referrer: "https://www.cybershiba.cn/",
    userAgent: "Mozilla/5.0",
    locale: "en",
    submittedAt: "2026-04-09T10:11:12.000Z",
  });

  assert.deepEqual(row, {
    id: "20260409-ABC123",
    feedback_type: "feature",
    title: "Add resume presets",
    product: "resume-maker",
    page_url: "https://www.cybershiba.cn/resume-maker",
    source_path: "/resume-maker",
    current_problem: "Starting from scratch is slow",
    proposal: "Add presets",
    use_case: "Tailor resumes for multiple applications",
    steps: "",
    expected_result: "",
    actual_result: "",
    contact: "hello@example.com",
    referrer: "https://www.cybershiba.cn/",
    user_agent: "Mozilla/5.0",
    locale: "en",
    submitted_at: "2026-04-09T10:11:12.000Z",
    status: "new",
  });
});
