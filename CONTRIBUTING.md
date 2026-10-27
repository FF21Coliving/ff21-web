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
against the live site. They run again every morning at 9:00 India time.

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

In this order. The site must already be indexable when www.ff21.in first
reaches Vercel: Google keeps a robots.txt for up to a day, so even a short
spell of `Disallow: /` on the real domain would stop it crawling.

1. **Domains.** Add `www.ff21.in` and `ff21.in` to the Vercel project, with
   `ff21.in` redirecting to `www`. Visitors see no change: DNS still points
   at Wix.
2. **vercel.app stays hidden.** `curl -sI https://ff21-web.vercel.app | grep -i x-robots`
   shows `noindex, nofollow`.
3. **Indexable.** In GitHub → Settings → Variables → Actions, set
   `EXPECT_INDEXABLE=1`. In Vercel's production environment variables, set
   `SITE_ENV=production` and `NEXT_PUBLIC_SITE_URL=https://www.ff21.in`,
   then redeploy. The *Production check* still watches ff21-web.vercel.app
   and should pass.
4. **DNS.** At GoDaddy, point `ff21.in` (A `76.76.21.21`) and `www`
   (CNAME `cname.vercel-dns.com`) at Vercel. Leave the MX and TXT records
   alone (email and verification).
5. **Check.** When Vercel shows both domains valid with certificates, set
   `PRODUCTION_URL=https://www.ff21.in` and run *Production check* by hand.
   `curl -sI https://www.ff21.in` shows no `x-robots-tag`, and
   `https://ff21.in` redirects to `https://www.ff21.in`.
6. **Search Console.** Submit `https://www.ff21.in/sitemap.xml` and ask for
   the main pages to be indexed.

To undo before step 4, put `SITE_ENV` back to `preview` and redeploy. After
step 4, point the GoDaddy records back at Wix (A records `185.230.63.107`,
`.171`, `.186`; `www` CNAME `gcdn0.wixdns.net`).
