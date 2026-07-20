---
description: Ship the Phool Gobhi website — local build/lint check, then push to main to trigger Vercel's auto-deploy.
argument-hint: (no args)
allowed-tools: Bash(npm:*), Bash(git:*), Read
---

Deploy the Phool Gobhi marketing website. This project has **no manual deploy step** — Vercel is connected via GitHub integration (`.vercel/project.json` confirms the link) and auto-builds/deploys whenever `main` is pushed. There is no Vercel CLI installed locally, so do not attempt `vercel --prod`. This command's job is to make the push safe, not to invoke Vercel directly.

## Steps

1. **Status check.** Run `git status --short` and `git branch --show-current`. Confirm the current branch is `main` — Vercel's production deploy is tied to pushes on `main`. If on another branch, ask the user whether they want to merge/switch or just push that branch (which would only trigger a Vercel preview, not prod).

2. **Lint.** Run `npm run lint`. If it fails, stop and report the errors — do not push a broken lint state.

3. **Build check.** Run `npm run build` locally to catch type errors / build failures before they hit Vercel's build (cheaper to fail here than in Vercel's log). If it fails, stop and report.

4. **Diff review.** Run `git diff` (and `git diff --staged` if anything is staged) and summarize what's about to ship in 2-3 sentences.

5. **Confirm before push.** Since pushing to `main` immediately triggers a live prod deploy on www side, print the summary and explicitly ask the user to confirm before running `git push`. Never push without an explicit yes in this session.

6. **Push.** `git push origin main`.

7. **Report.** Tell the user the push succeeded and that Vercel will auto-build/deploy — remind them there's no CLI-based way from here to watch the build; they'd check the Vercel dashboard.
