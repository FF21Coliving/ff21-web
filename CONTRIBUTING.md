# How changes reach ff21.in

`main` is the live site: Vercel deploys every commit on `main` to production.
So nothing lands on `main` without a pull request, passing checks and a
review. This page is the whole process.

## 1. Branch

```bash
git switch main && git pull
git switch -c short-name-for-the-change
```

## 2. Check it on your machine

```bash
npm run check    # lint, types, production build, then every test (about 2 minutes)
```

`npm test` on its own tests the last build. The first time, run
`npx playwright install chromium`.

## 3. Pull request

Push the branch and open a pull request into `main`. Then:

- **CI** runs two jobs, and both must pass:
  - *Lint, types, build and tests* checks every key page on a laptop and a
    phone screen: no errors (React hydration errors included), one heading,
    the facts (prices, meals, FAQs), structured data, the lead API, and
    every old URL.
  - *Launch settings* builds with the live site's settings and checks it can
    be indexed and that every sitemap URL answers.
- **Vercel** builds a preview and comments its link. Open it on a phone and
  a laptop. Previews are hidden from search, keep the tags off, and never
  send leads to Zoho.
- **Review**: Claude reviews every pull request it opens before asking
  Madhvik to merge it (bugs, the lead flow, redirects and old URLs, facts,
  secrets, speed), and says what it checked in the pull request.

## 4. Merge

Only Madhvik merges into `main`. GitHub allows nobody else, and the merge
button stays locked until CI and Vercel's build pass.
Claude never merges: it opens the pull request and asks.

Squash and merge. Vercel deploys to production within about two minutes.
The *Production check* workflow then runs the read-only `@smoke` tests
against the live site. They run again every hour.

## If production breaks

1. **Roll back first**: Vercel → ff21-web → Deployments → the last good
   one → *Promote to Production* (or `npx vercel rollback`). It takes
   seconds and needs no code.
2. Then fix it on a branch, through a pull request like any other change.

A failed *Production check* emails the repo's admins. Its log names the
page and the problem; the `test-results` artifact has a trace you can open
with `npx playwright show-trace`.

The checks apply to admins too: the way out of an emergency is the
rollback above, never a merge that skips the checks.

## Rules the tests enforce

- **Never break an old URL.** `tests/fixtures/legacy-urls.txt` lists every
  URL Google sends people to. When a page moves or goes, add a redirect in
  `next.config.ts` and keep its line in that file.
- **Facts come from the team.** Prices, meals, the FFer count and policies
  live in `src/lib/site.ts`, `properties.ts` and `content.ts`, with the date
  they were confirmed.
- **No secrets in the code.** Keys live in Vercel's environment variables.
  The repository is public.
- **Tests never post leads or load the tags against the live site.**

## Launch (once)

When www.ff21.in points at Vercel:

- In Vercel's production environment variables, set `SITE_ENV=production`
  and `NEXT_PUBLIC_SITE_URL=https://www.ff21.in`, then redeploy.
- In GitHub → Settings → Variables → Actions, set the repository variables
  `PRODUCTION_URL=https://www.ff21.in` and `EXPECT_INDEXABLE=1`, so the
  hourly check watches the real domain and expects it to be indexable.
