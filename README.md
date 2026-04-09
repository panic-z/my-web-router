# my-web-router

Vercel routing layer that serves one domain across two existing deployments:

- `/` serves a static welcome page
- `/_next` and `/api` rewrite to `ai-info`
- `/ai-info` and its subpaths rewrite to `ai-info`
- `/resume-maker` and its subpaths rewrite to `resume-maker`

## Environment variables

- This project currently uses fixed external rewrites in `vercel.json`
- `AI_INFO_ORIGIN` and `RESUME_MAKER_ORIGIN` are no longer required for routing

## Deploy

Deploy this directory as its own Vercel project, bind the shared custom domain here, and keep the two upstream apps on their existing Vercel project domains.
