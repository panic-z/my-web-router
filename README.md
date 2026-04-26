# my-web-router

Vercel routing layer that serves one domain across existing deployments:

- `/` serves a static welcome page
- `/_next` and `/api` rewrite to `ai-info`
- `/ai-info` and its subpaths rewrite to `ai-info`
- `/resume-maker` and its subpaths rewrite to `resume-maker`
- `/top-or-flop` and its subpaths rewrite to `top-or-flop`

## Feedback Links

Upstream apps should link to these product-level entry URLs:

- Portal: `https://www.cybershiba.cn/feedback?product=portal`
- AI Info: `https://www.cybershiba.cn/feedback?product=ai-info`
- Resume Maker: `https://www.cybershiba.cn/feedback?product=resume-maker`
- Top or Flop: `https://www.cybershiba.cn/feedback?product=top-or-flop`

## Environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_INFO_ORIGIN`, `RESUME_MAKER_ORIGIN`, and `TOP_OR_FLOP_ORIGIN` are reserved for upstream origins if you switch back to environment-based rewrites
- Create a `feedback_submissions` table before using the feedback submission API

## Deploy

Deploy this directory as its own Vercel project, bind the shared custom domain here, and keep the two upstream apps on their existing Vercel project domains.
