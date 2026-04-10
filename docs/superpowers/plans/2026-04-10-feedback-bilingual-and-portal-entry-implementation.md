# Feedback Bilingual And Portal Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the feedback page bilingual and reposition feedback on the portal homepage as a secondary support entry instead of a third primary tool.

**Architecture:** Keep the existing static-site pattern. Extend `feedback/index.html` with the same lightweight `messages`-driven language switch model already used on `index.html`, and simplify the portal homepage so feedback is rendered as a support sentence/link outside the primary two-card navigation. Reuse the current Node built-in test runner by adding or extending static HTML assertions.

**Tech Stack:** Static HTML/CSS/JS, Node.js built-in test runner, Git

---

## File Map

Existing files to modify:

- `index.html`
  Responsibility: portal homepage layout, bilingual homepage copy, and structured metadata
- `feedback/index.html`
  Responsibility: shared feedback page UI, copy, client-side localization, and submit behavior
- `tests/feedback/index-html.test.js`
  Responsibility: static verification of feedback page constraints

New files to create:

- `tests/feedback/portal-index-html.test.js`
  Responsibility: static verification that the homepage keeps two primary tool cards and moves feedback into a secondary support entry

## Task 1: Reposition Portal Feedback As A Support Entry

**Files:**
- Modify: `index.html`
- Create: `tests/feedback/portal-index-html.test.js`

- [ ] **Step 1: Write the failing homepage structure test**

Create `tests/feedback/portal-index-html.test.js`.

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/feedback/portal-index-html.test.js`
Expected: FAIL because `index.html` still places feedback inside the `<nav>` and does not have `supportPrompt`.

- [ ] **Step 3: Write minimal implementation**

Update `index.html` so that:

- The primary `<nav>` contains only `/ai-info` and `/resume-maker`
- A secondary support sentence appears below the description paragraph
- The support sentence contains a link to `/feedback?product=portal`
- The `messages.en` and `messages.zh` objects replace `feedback` with `supportPrompt` and `supportLink`
- Homepage description/meta copy is adjusted so feedback is described as support, not as a third product
- Structured data remains internally consistent with the visible copy

Use this support pattern in the body:

```html
      <p class="support-copy">
        <span data-i18n="supportPrompt">Need to report a bug or suggest an improvement?</span>
        <a class="support-link" href="/feedback?product=portal" data-i18n="supportLink">
          Open feedback
        </a>
      </p>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/feedback/portal-index-html.test.js`
Expected: PASS

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html tests/feedback/portal-index-html.test.js
git commit -m "feat: reposition portal feedback entry"
```

## Task 2: Add Bilingual Copy To The Feedback Page

**Files:**
- Modify: `feedback/index.html`
- Modify: `tests/feedback/index-html.test.js`

- [ ] **Step 1: Write the failing feedback bilingual test**

Update `tests/feedback/index-html.test.js` to include a second test.

```js
test("feedback page includes bilingual language-switch content", () => {
  assert.match(html, /data-lang-button="en"/);
  assert.match(html, /data-lang-button="zh"/);
  assert.match(html, /const messages = \{/);
  assert.match(html, /submitIdle/);
  assert.match(html, /submitLoading/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/feedback/index-html.test.js`
Expected: FAIL because the current feedback page does not yet define a bilingual `messages` object or language buttons.

- [ ] **Step 3: Write minimal implementation**

Update `feedback/index.html` so that:

- A language switcher matching the homepage pattern is added near the top of the page
- A `messages` object contains both `en` and `zh` strings
- All user-facing interface strings move behind `data-i18n` or equivalent keyed updates
- Metadata (`document.title`, description meta) switches with language
- Product option labels localize while option values remain `portal`, `ai-info`, and `resume-maker`
- Success and error messages use localized strings
- Submit button text switches between localized idle/loading labels
- Existing submit payload shape and field requirements remain unchanged

Use these message keys at minimum:

```js
submitIdle
submitLoading
feedbackType
product
title
pageUrl
bugDetails
featureDetails
contact
supportIntro
successTitle
successBody
statusGeneric
statusUnavailable
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/feedback/index-html.test.js`
Expected: PASS

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add feedback/index.html tests/feedback/index-html.test.js
git commit -m "feat: localize feedback page"
```

## Task 3: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run the full automated test suite**

Run: `npm test`
Expected: PASS with `0` failures.

- [ ] **Step 2: Verify worktree status**

Run: `git status --short`
Expected: clean working tree, except for any known untracked local-only files that predate this plan.

- [ ] **Step 3: Final commit only if verification fixes were required**

```bash
git add .
git commit -m "chore: finalize feedback bilingual support verification"
```

Expected: skip this step unless verification required additional code changes.
