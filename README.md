# my-web-router

Vercel routing layer that serves one domain across two existing deployments:

- `/` serves a static welcome page
- `/_next` and `/api` proxy to `AI_INFO_ORIGIN` for Next.js assets and data requests
- `/ai-info` and its subpaths proxy to `AI_INFO_ORIGIN`
- `/resume-maker` and its subpaths proxy to `RESUME_MAKER_ORIGIN`

## Environment variables

- `AI_INFO_ORIGIN=https://your-ai-info.vercel.app`
- `RESUME_MAKER_ORIGIN=https://your-resume-maker.vercel.app`

## Deploy

Deploy this directory as its own Vercel project, bind the shared custom domain here, and keep the two upstream apps on their existing Vercel project domains.
