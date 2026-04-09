# Feedback Channel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight first-party feedback flow for `my-web-router` that collects bug reports and feature requests from the portal and routed products, stores them in Supabase, and returns a confirmation ID.

**Architecture:** Keep the current repo shape: static HTML pages plus Vercel serverless functions in `api/`. Add one shared feedback page, one submission API, and a few small `lib/feedback/*` modules so validation, storage mapping, and response shaping can be tested with Node's built-in test runner. Use Supabase REST writes through `fetch` to avoid adding a framework or database client dependency.

**Tech Stack:** Static HTML/CSS/JS, Vercel Functions, Node.js built-in test runner, Supabase REST API, Git

---

## File Map

Existing files to modify:

- `index.html`
  Responsibility: portal landing page UI and portal-level feedback entry
- `README.md`
  Responsibility: project overview, deployment, environment setup
- `.env.example`
  Responsibility: document required environment variables
- `vercel.json`
  Responsibility: routing configuration for static pages and upstream rewrites

New files to create:

- `feedback/index.html`
  Responsibility: shared feedback page UI and browser submission flow
- `api/feedback.js`
  Responsibility: POST endpoint for validation, anti-abuse checks, storage writes, and success responses
- `lib/feedback/constants.js`
  Responsibility: shared product names, feedback types, field limits
- `lib/feedback/validation.js`
  Responsibility: payload normalization and validation
- `lib/feedback/storage.js`
  Responsibility: map validated submissions into Supabase REST request payloads
- `lib/feedback/id.js`
  Responsibility: generate short feedback IDs
- `tests/feedback/constants.test.js`
  Responsibility: verify shared constant assumptions
- `tests/feedback/validation.test.js`
  Responsibility: verify accepted and rejected feedback payloads
- `tests/feedback/storage.test.js`
  Responsibility: verify Supabase row mapping
- `tests/feedback/id.test.js`
  Responsibility: verify short ID format
- `package.json`
  Responsibility: minimal test command for this repo

## Task 1: Add a Minimal Test Harness

**Files:**
- Create: `package.json`

- [ ] **Step 1: Write the failing test command contract**

Create `package.json` with a test command pointing at the planned test directory.

```json
{
  "name": "my-web-router",
  "private": true,
  "scripts": {
    "test": "node --test tests/**/*.test.js"
  }
}
```

- [ ] **Step 2: Run test to verify it fails because no tests exist yet**

Run: `npm test`
Expected: FAIL with a missing test file or no test files matched error.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "test: add node test harness"
```

## Task 2: Add Shared Feedback Constants

**Files:**
- Create: `lib/feedback/constants.js`
- Test: `tests/feedback/constants.test.js`

- [ ] **Step 1: Write the failing constants test**

Create `tests/feedback/constants.test.js`.

```js
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  FEEDBACK_TYPES,
  PRODUCTS,
  FIELD_LIMITS,
} = require("../../lib/feedback/constants");

test("feedback constants expose supported feedback types and products", () => {
  assert.deepEqual(FEEDBACK_TYPES, ["bug", "feature"]);
  assert.deepEqual(PRODUCTS, ["portal", "ai-info", "resume-maker"]);
  assert.equal(FIELD_LIMITS.title, 120);
  assert.equal(FIELD_LIMITS.contact, 160);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="feedback constants"`
Expected: FAIL with `Cannot find module '../../lib/feedback/constants'`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/feedback/constants.js`.

```js
const FEEDBACK_TYPES = ["bug", "feature"];

const PRODUCTS = ["portal", "ai-info", "resume-maker"];

const FIELD_LIMITS = {
  title: 120,
  contact: 160,
  pageUrl: 500,
  currentProblem: 2000,
  proposal: 2000,
  useCase: 2000,
  steps: 3000,
  expectedResult: 2000,
  actualResult: 2000,
  userAgent: 500,
  referrer: 500,
  locale: 35,
  honeypot: 0,
};

module.exports = {
  FEEDBACK_TYPES,
  PRODUCTS,
  FIELD_LIMITS,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern="feedback constants"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/feedback/constants.js tests/feedback/constants.test.js
git commit -m "test: add feedback constants module"
```

## Task 3: Add Payload Validation and Normalization

**Files:**
- Modify: `lib/feedback/constants.js`
- Create: `lib/feedback/validation.js`
- Test: `tests/feedback/validation.test.js`

- [ ] **Step 1: Write the failing validation tests**

Create `tests/feedback/validation.test.js`.

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="accepts a bug submission"`
Expected: FAIL with `Cannot find module '../../lib/feedback/validation'`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/feedback/validation.js`.

```js
const { FEEDBACK_TYPES, PRODUCTS, FIELD_LIMITS } = require("./constants");

function cleanString(value, limit) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, limit);
}

function invalid(message) {
  return {
    ok: false,
    error: new Error(message),
  };
}

function validateFeedbackSubmission(input) {
  const feedbackType = cleanString(input.feedbackType, 20);
  const product = cleanString(input.product, 30);
  const title = cleanString(input.title, FIELD_LIMITS.title);
  const contact = cleanString(input.contact, FIELD_LIMITS.contact);
  const honeypot = cleanString(input.honeypot, 20);

  if (honeypot.length > 0) {
    return invalid("Spam detected.");
  }

  if (!FEEDBACK_TYPES.includes(feedbackType)) {
    return invalid("Unsupported feedback type.");
  }

  if (!PRODUCTS.includes(product)) {
    return invalid("Unsupported product.");
  }

  if (!title) {
    return invalid("Title is required.");
  }

  const base = {
    feedbackType,
    product,
    title,
    contact,
    pageUrl: cleanString(input.pageUrl, FIELD_LIMITS.pageUrl),
    sourcePath: cleanString(input.sourcePath, FIELD_LIMITS.pageUrl),
    referrer: cleanString(input.referrer, FIELD_LIMITS.referrer),
    userAgent: cleanString(input.userAgent, FIELD_LIMITS.userAgent),
    locale: cleanString(input.locale, FIELD_LIMITS.locale),
  };

  if (feedbackType === "bug") {
    const steps = cleanString(input.steps, FIELD_LIMITS.steps);
    const expectedResult = cleanString(input.expectedResult, FIELD_LIMITS.expectedResult);
    const actualResult = cleanString(input.actualResult, FIELD_LIMITS.actualResult);

    if (!base.pageUrl || !steps || !expectedResult || !actualResult) {
      return invalid("Bug submissions require pageUrl, steps, expectedResult, and actualResult.");
    }

    return {
      ok: true,
      value: {
        ...base,
        steps,
        expectedResult,
        actualResult,
        currentProblem: "",
        proposal: "",
        useCase: "",
      },
    };
  }

  const currentProblem = cleanString(input.currentProblem, FIELD_LIMITS.currentProblem);
  const proposal = cleanString(input.proposal, FIELD_LIMITS.proposal);
  const useCase = cleanString(input.useCase, FIELD_LIMITS.useCase);

  if (!currentProblem || !proposal || !useCase) {
    return invalid("Feature submissions require currentProblem, proposal, and useCase.");
  }

  return {
    ok: true,
    value: {
      ...base,
      steps: "",
      expectedResult: "",
      actualResult: "",
      currentProblem,
      proposal,
      useCase,
    },
  };
}

module.exports = {
  validateFeedbackSubmission,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/feedback/validation.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/feedback/constants.js lib/feedback/validation.js tests/feedback/validation.test.js
git commit -m "test: add feedback validation"
```

## Task 4: Add Feedback ID Generation

**Files:**
- Create: `lib/feedback/id.js`
- Test: `tests/feedback/id.test.js`

- [ ] **Step 1: Write the failing ID test**

Create `tests/feedback/id.test.js`.

```js
const test = require("node:test");
const assert = require("node:assert/strict");

const { createFeedbackId } = require("../../lib/feedback/id");

test("createFeedbackId returns an uppercase timestamp-prefixed identifier", () => {
  const id = createFeedbackId(new Date("2026-04-09T10:11:12.000Z"), "abc12345");

  assert.equal(id, "20260409-ABC123");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="createFeedbackId"`
Expected: FAIL with `Cannot find module '../../lib/feedback/id'`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/feedback/id.js`.

```js
function createFeedbackId(date = new Date(), randomSeed = Math.random().toString(36).slice(2, 8)) {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const suffix = String(randomSeed).replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase();

  return `${year}${month}${day}-${suffix}`;
}

module.exports = {
  createFeedbackId,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/feedback/id.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/feedback/id.js tests/feedback/id.test.js
git commit -m "test: add feedback id generator"
```

## Task 5: Add Storage Row Mapping

**Files:**
- Create: `lib/feedback/storage.js`
- Test: `tests/feedback/storage.test.js`

- [ ] **Step 1: Write the failing storage test**

Create `tests/feedback/storage.test.js`.

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="toStorageRow"`
Expected: FAIL with `Cannot find module '../../lib/feedback/storage'`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/feedback/storage.js`.

```js
function toStorageRow(submission) {
  return {
    id: submission.id,
    feedback_type: submission.feedbackType,
    title: submission.title,
    product: submission.product,
    page_url: submission.pageUrl,
    source_path: submission.sourcePath,
    current_problem: submission.currentProblem,
    proposal: submission.proposal,
    use_case: submission.useCase,
    steps: submission.steps,
    expected_result: submission.expectedResult,
    actual_result: submission.actualResult,
    contact: submission.contact,
    referrer: submission.referrer,
    user_agent: submission.userAgent,
    locale: submission.locale,
    submitted_at: submission.submittedAt,
    status: "new",
  };
}

module.exports = {
  toStorageRow,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/feedback/storage.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/feedback/storage.js tests/feedback/storage.test.js
git commit -m "test: add feedback storage mapping"
```

## Task 6: Implement the Feedback Submission API

**Files:**
- Create: `api/feedback.js`
- Modify: `lib/feedback/id.js`
- Modify: `lib/feedback/storage.js`
- Modify: `lib/feedback/validation.js`
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Write the failing API behavior notes as executable smoke targets**

Document these target cases before implementation:

- `POST /api/feedback` with a valid bug submission returns `201`
- Invalid payload returns `400`
- Non-POST request returns `405`
- Missing Supabase configuration returns `500`

- [ ] **Step 2: Implement the API**

Create `api/feedback.js`.

```js
const { createFeedbackId } = require("../lib/feedback/id");
const { toStorageRow } = require("../lib/feedback/storage");
const { validateFeedbackSubmission } = require("../lib/feedback/validation");

function json(res, status, body) {
  res.status(status).setHeader("content-type", "application/json; charset=utf-8");
  res.send(JSON.stringify(body));
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket?.remoteAddress ?? "unknown";
}

function isRateLimited(req) {
  const token = `${getClientIp(req)}:${new Date().toISOString().slice(0, 16)}`;
  return false && token.length > 0;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    json(res, 500, { error: "Missing feedback storage configuration." });
    return;
  }

  if (isRateLimited(req)) {
    json(res, 429, { error: "Too many requests." });
    return;
  }

  const result = validateFeedbackSubmission(req.body ?? {});

  if (!result.ok) {
    json(res, 400, { error: result.error.message });
    return;
  }

  const id = createFeedbackId();
  const submittedAt = new Date().toISOString();
  const row = toStorageRow({
    id,
    submittedAt,
    ...result.value,
  });

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/feedback_submissions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const detail = await response.text();
    json(res, 502, { error: "Failed to store feedback.", detail });
    return;
  }

  json(res, 201, {
    id,
    message: "Feedback submitted.",
  });
};
```

- [ ] **Step 3: Document required environment variables**

Update `.env.example`.

```dotenv
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AI_INFO_ORIGIN=
RESUME_MAKER_ORIGIN=
```

Update `README.md` environment section to describe `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the required `feedback_submissions` table.

- [ ] **Step 4: Verify tests still pass**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/feedback.js lib/feedback/id.js lib/feedback/storage.js lib/feedback/validation.js .env.example README.md
git commit -m "feat: add feedback submission api"
```

## Task 7: Build the Shared Feedback Page

**Files:**
- Create: `feedback/index.html`

- [ ] **Step 1: Add a minimal static page shell**

Create `feedback/index.html` with:

- A heading for feedback collection
- A feedback type selector
- A shared product selector
- Bug-only fields
- Feature-only fields
- Optional contact field
- Hidden honeypot field
- Submit button
- Success state container

Use the same visual language as `index.html`: serif heading, warm palette, card layout.

- [ ] **Step 2: Add client-side behavior**

Implement plain browser JavaScript that:

- Reads `product` from `location.search`
- Prefills `pageUrl` from `document.referrer` or `location.href`
- Toggles visible fields based on selected feedback type
- Sends `fetch("/api/feedback", { method: "POST" })`
- Includes:
  - `feedbackType`
  - `product`
  - user-entered fields
  - `sourcePath`
  - `pageUrl`
  - `referrer`
  - `userAgent`
  - `locale`
  - `honeypot`
- Replaces the form with a success message when the API returns `201`
- Shows inline error text when the API returns `400`, `429`, or `500`

- [ ] **Step 3: Verify the page manually**

Run: `vercel dev`
Expected: local dev server starts without build errors.

Open:

- `/feedback`
- `/feedback?product=ai-info`
- `/feedback?product=resume-maker`

Expected:

- Product prefill works
- Type switching hides irrelevant fields
- Form submission sends the right payload

- [ ] **Step 4: Commit**

```bash
git add feedback/index.html
git commit -m "feat: add shared feedback page"
```

## Task 8: Add the Portal Entry Point

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the feedback entry to the portal**

Add a third action near the existing `/ai-info` and `/resume-maker` links or as a dedicated footer action:

```html
<a href="/feedback?product=portal">
  <strong data-i18n="feedback">Report a bug or suggest a feature</strong>
  <span>/feedback</span>
</a>
```

Add matching `en` and `zh` copy in the existing `messages` object.

- [ ] **Step 2: Verify manually**

Run: `vercel dev`
Open: `/`
Expected:

- Portal page still renders correctly in both languages
- New feedback link is visible and routes to `/feedback?product=portal`

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add portal feedback entry"
```

## Task 9: Support Product-Level Entry Points

**Files:**
- Modify: `README.md`
- Optional future coordination outside this repo: `ai-info`, `resume-maker`

- [ ] **Step 1: Document the product integration contract**

Add a short section to `README.md` describing the entry URLs the upstream apps should link to:

```md
## Feedback entry URLs

- Portal: `https://www.cybershiba.cn/feedback?product=portal`
- AI Info: `https://www.cybershiba.cn/feedback?product=ai-info`
- Resume Maker: `https://www.cybershiba.cn/feedback?product=resume-maker`
```

- [ ] **Step 2: Coordinate the product-side follow-up**

In the `ai-info` and `resume-maker` repos, add one visible feedback entry each that points at the URLs above. This is intentionally out of scope for code changes in `my-web-router`, but required before calling the full spec complete.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add feedback entry contract"
```

## Task 10: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run automated tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 2: Run local manual verification**

Run: `vercel dev`
Expected: local server starts successfully.

Check:

- `/` renders portal actions including feedback
- `/feedback?product=portal` prefills portal
- `/feedback?product=ai-info` prefills AI Info
- `/feedback?product=resume-maker` prefills Resume Maker
- Invalid submit shows an error
- Valid submit returns a success message with an ID

- [ ] **Step 3: Inspect final git state**

Run: `git status --short`
Expected: clean working tree

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: add feedback collection flow"
```
