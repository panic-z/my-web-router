# Feedback Bilingual And Portal Entry Design

Date: 2026-04-10
Project: `my-web-router`
Status: Draft for user review

## Goal

Adjust the current feedback experience in two ways:

- Make the feedback page bilingual with the same `EN / 中文` switching pattern used on the portal homepage
- Reposition feedback on the portal homepage so it is clearly a support channel, not a third tool alongside `AI Info` and `Resume Maker`

## Scope

This design covers:

- `feedback/index.html` language model and copy structure
- Portal homepage layout and copy adjustments in `index.html`
- Copy and metadata updates needed to keep the homepage and feedback page internally consistent

This design does not cover:

- New backend behavior
- New feedback fields
- Product-side feedback entry changes in `ai-info` or `resume-maker`
- A redesign of the portal visual system

## Recommended Approach

Use the same lightweight bilingual architecture already present on the homepage:

- A shared `messages` object with `en` and `zh`
- A top-right language switcher
- Runtime updates for visible copy and metadata

On the portal homepage, keep only the two product cards in the main navigation. Move feedback into a secondary support sentence directly below the hero description.

Why this approach:

- It matches an established pattern in the repo instead of inventing a second localization mechanism
- It keeps feedback visible without implying it is a product on equal footing with the two main tools
- It is a small, low-risk change to the current page structure

## Alternatives Considered

### Option 1: Keep feedback as a third card and only translate the feedback page

Pros:

- Minimal homepage change

Cons:

- Preserves the core problem: feedback still reads like a third product

### Option 2: Move feedback to a secondary inline support entry and translate the feedback page

Pros:

- Best fit for the stated product hierarchy
- Keeps support discoverable
- Reuses the portal's existing bilingual pattern

Cons:

- Requires modest copy and layout edits on two pages

### Option 3: Move feedback to a tiny footer-only link and translate the feedback page

Pros:

- Strongest separation from the product cards

Cons:

- Too easy to miss
- Weakens bug-report collection

Recommendation: Option 2.

## Homepage Design

### Primary Hierarchy

The homepage should continue to present exactly two primary destinations:

- `AI Info`
- `Resume Maker`

These remain the only items in the main card-style navigation.

### Feedback Placement

Feedback should move out of the card grid and become a secondary support entry placed directly below the main description paragraph.

Recommended pattern:

- A short support sentence
- A linked action to `/feedback?product=portal`

Representative tone:

- English: "Need to report a bug or suggest an improvement? Open feedback."
- Chinese: "想反馈问题或提出建议？进入反馈。"

The support entry should be visually lighter than the product cards. It should read as help/support infrastructure, not as a third feature.

### Metadata Alignment

Homepage metadata should stop presenting feedback as a peer to the two tools.

That means:

- Page description copy should focus on the two products first
- Feedback may be mentioned as a support path, but not framed as a third product
- Structured data should remain internally consistent with the visible page copy

## Feedback Page Design

### Language Model

The feedback page should adopt the same language-switching model used on the homepage:

- Default `en`
- Toggle between `en` and `zh`
- Update visible copy in place without changing routes

### Translated Surface Area

Translate all user-facing interface copy, including:

- Eyebrow text
- Page title and intro
- Field labels
- Placeholders
- Helper text
- Section headings
- Submit button label
- Loading label
- Error messages
- Success state text

Validation and response messaging must also switch language so the entire form feels coherent.

### Product Labels

Product options in the selector should also localize:

- `CyberShiba Portal`
- `AI Info`
- `Resume Maker`

The underlying submitted values should remain unchanged:

- `portal`
- `ai-info`
- `resume-maker`

## Data And Behavior

The feedback page should keep the existing submission flow and payload contract unchanged.

Allowed changes:

- How text is rendered
- How localized strings are selected
- How button and message labels update with language

Disallowed changes for this iteration:

- Changing API payload keys
- Changing form field requirements
- Changing the success/error response contract

## Testing Strategy

Verify these cases:

- Homepage shows only two primary cards
- Homepage feedback entry appears as a secondary support link below the description
- Homepage language switch updates the support entry copy correctly
- Feedback page language switch updates labels, placeholders, helper text, button text, and success/error text
- Product query prefill still works after localization changes
- Existing form submission behavior remains intact

## Success Criteria

This adjustment is successful if:

- The portal homepage no longer presents feedback as a third tool
- Feedback remains easy to discover from the homepage
- The feedback page provides a complete Chinese and English experience
- Localization changes do not alter the feedback payload format or submission flow
