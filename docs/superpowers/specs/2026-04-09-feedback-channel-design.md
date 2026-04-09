# Feedback Channel Design

Date: 2026-04-09
Project: `my-web-router`
Status: Draft for user review

## Goal

Add a low-friction feedback channel for two user intents:

- Bug reports
- Feature requests

The solution should collect feedback from the shared portal and from the two routed products, while keeping the implementation small enough for a first release.

## Scope

This design covers:

- A shared feedback entry on the `my-web-router` homepage
- Product-level feedback entries inside `ai-info` and `resume-maker`
- A single shared feedback page
- A lightweight feedback submission API
- Centralized storage for submissions
- Manual triage into GitHub Issues

This design does not cover:

- User accounts or login
- Real-time chat or customer support
- File or screenshot uploads
- Automatic GitHub Issue creation
- A full admin dashboard

## Recommended Approach

Use a shared first-party feedback form hosted under the main site, backed by a lightweight serverless API and a small structured storage table.

Why this approach:

- Lower friction than sending users directly to GitHub
- Better context capture than an external generic form
- Small enough to ship quickly in the current Vercel-based setup
- Easy to extend later if issue volume grows

## Alternatives Considered

### Option 1: External form only

Examples: Tencent form, Google Form, Airtable form.

Pros:

- Fastest to ship
- Minimal engineering work

Cons:

- Weak source context
- Harder to prefill product/page metadata
- Less consistent user experience

### Option 2: Shared first-party form with API and storage

Pros:

- Best control over UX and metadata
- Can prefill product and page context
- Good foundation for later automation

Cons:

- Slightly more implementation effort than an external form

### Option 3: Customer support or ticketing platform

Pros:

- Mature workflows
- Better long-term operations if support volume becomes high

Cons:

- Overbuilt for the current product shape
- Higher setup and maintenance cost

Recommendation: Option 2.

## User Experience

### Entry Points

Feedback should be available in three places:

- `my-web-router` homepage as a general feedback entry
- `ai-info` as an in-product feedback entry
- `resume-maker` as an in-product feedback entry

Homepage entry purpose:

- Catch users who have site-level issues
- Provide a consistent fallback path

Product entry purpose:

- Capture feedback close to the user’s actual task
- Improve report quality by attaching product context automatically

### Feedback Page

Create a single route such as `/feedback`.

Users land on the same page regardless of entry point. The page should:

1. Let the user choose feedback type:
   - `Bug report`
   - `Feature request`
2. Show only the fields relevant to that type
3. Allow anonymous submission
4. Treat contact information as optional
5. Show a confirmation state with a feedback ID after successful submission

### Prefill Rules

When a user opens the feedback page from a product page:

- `product` is prefilled from query params or page context
- `pageUrl` is prefilled from the current page

When a user opens from the portal homepage:

- `product` defaults to `portal` or requires explicit selection

## Form Design

### Shared Rules

Common behavior for both forms:

- Title-like summary is required
- Contact is optional
- Provide a short privacy note that contact is only used for follow-up
- Reject blank or whitespace-only submissions
- Keep the form short enough to complete in under two minutes

### Bug Report Fields

- `title`: short summary of the issue
- `product`: `portal` | `ai-info` | `resume-maker`
- `pageUrl`: current page URL, editable
- `steps`: reproduction steps
- `expectedResult`: what the user expected
- `actualResult`: what actually happened
- `contact`: optional email or other contact detail

### Feature Request Fields

- `title`: short summary of the suggestion
- `product`: `portal` | `ai-info` | `resume-maker`
- `currentProblem`: what is limited or frustrating today
- `proposal`: what capability the user wants
- `useCase`: the user’s scenario
- `contact`: optional email or other contact detail

### Auto-Captured Metadata

The client or API should attach:

- `feedbackType`
- `sourcePath`
- `pageUrl`
- `referrer`
- `userAgent`
- `locale`
- `submittedAt`

## Data Flow

1. User opens `/feedback` from portal or product entry point.
2. Frontend prefills `product` and `pageUrl` when available.
3. User submits the form to `POST /api/feedback`.
4. API validates payload, rate-limits requests, and applies basic anti-abuse checks.
5. API writes the record to centralized storage.
6. API returns success with a short feedback ID.
7. User sees a confirmation message.
8. Maintainer reviews submissions and manually converts qualified items into GitHub Issues.

## Storage

Use a simple structured store with one table such as `feedback_submissions`.

Recommended columns:

- `id`
- `feedback_type`
- `title`
- `product`
- `page_url`
- `source_path`
- `current_problem`
- `proposal`
- `use_case`
- `steps`
- `expected_result`
- `actual_result`
- `contact`
- `referrer`
- `user_agent`
- `locale`
- `submitted_at`
- `status`

`status` is optional for MVP but useful if later you want to track:

- `new`
- `triaged`
- `converted`
- `closed`

Recommended implementation choice: a lightweight hosted database such as Supabase or another database already used in the broader project stack.

## GitHub Triage Workflow

GitHub remains the engineering workflow system, but not the public intake surface.

Manual triage rules:

- Reproducible defects become GitHub `bug` issues
- Actionable ideas become GitHub `feature` issues
- Duplicates or low-signal submissions stay in storage and do not need conversion

Keep the GitHub templates simple:

- `bug`
- `feature`

## Abuse and Quality Controls

Required for MVP:

- Required-field validation
- Max-length limits on free text fields
- Whitespace-only rejection
- Basic rate limiting by IP or equivalent request fingerprint
- A hidden honeypot field or equivalent lightweight anti-spam control

Not required for MVP:

- CAPTCHA
- Attachment virus scanning
- Identity verification

## Success Criteria

The MVP is successful if:

- Users can submit bug reports and feature requests from all three entry points
- Product context is captured automatically when feedback is launched from a product page
- Submissions are stored in a structured format
- Maintainer can review submissions and manually create GitHub Issues from them
- Anonymous submission works without requiring login

## Testing Strategy

Cover these cases:

- Portal entry opens the shared feedback flow correctly
- Product entry points prefill `product` correctly
- `Bug report` and `Feature request` switch fields correctly
- Invalid payloads are rejected by the API
- Valid payloads are persisted and return a feedback ID
- Confirmation state renders after successful submission

## Open Implementation Notes

Keep the first implementation deliberately small:

- Use one feedback page, not multiple specialized pages
- Do not build an admin UI yet
- Do not automate GitHub sync yet
- Add storage and triage automation only after real submission volume justifies it
