# V0.1 acceptance — Cloudflare Workers Static Assets

This draft uses **Cloudflare Workers Static Assets + Workers Builds**, not a Cloudflare Pages project. The production branch is `main`; the preview branch is `feat/v0-1-site-foundation`. No production publication is authorized by this checklist.

## Static and content gates

- [ ] Generated `public/` files match the reviewed PENG Nexus template and `site.json` at a recorded source commit
- [ ] CI `node --test test/site.test.mjs` passes on this PR head
- [ ] Desktop and 320/390/768px mobile review with screenshots, no layout overflow
- [ ] Search and category filters checked in a real browser, including zero results
- [ ] All technical product statements checked against appropriate authoritative/manufacturer documents
- [ ] No unlicensed photos/logos, fictitious manufacturers, stock, prices or unsupported certifications
- [ ] Supplier directory visibly marked planned; no endorsed or verified factory asserted
- [ ] Privacy, contact and legal notices reviewed before collecting any personal data

## Cloudflare deployment gates

- [ ] Existing Cloudflare Worker name verified as `plumbing-source` (do not duplicate an existing service)
- [ ] Workers Builds connected to this exact GitHub repository; production branch `main`
- [ ] `wrangler.jsonc` uses `assets.directory = "./public"`, with no server-side secrets in static assets
- [ ] Preview Builds enabled for non-production branches; preview command `npx wrangler preview` and Wrangler 4.135.0+ available
- [ ] Actual Worker Preview HTTPS URL captured for this PR and checked on mobile + desktop
- [ ] Only after separate acceptance, decide whether to merge draft PR and run production `npx wrangler deploy`
- [ ] Keep `noindex,nofollow` and `robots.txt Disallow: /` until explicit publication/SEO review

Official documentation:
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- https://developers.cloudflare.com/workers/previews/get-started/
