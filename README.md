# PlumbingSource

Independent specialist knowledge site in the PENG Nexus network. **Work computer** development only.

## Status
V0.1 educational reference prototype on a draft PR. Not a verified supplier directory, online shop or RFQ service. Noindex until verified publication.

## Content
- 6 educational product references, 3 topic summaries, 3 buying checklists.
- In-browser keyword search and category filtering.
- No manufacturer names, pricing, stock, certification or buyer information collected.

## Template maintenance
`site.json` is the source of truth for industry content. Regenerate using `peng-nexus` V0.1:
```powershell
cd D:\AgentForge\peng-nexus
node scripts/build.mjs --config ..\plumbing-source\site.json --out ..\plumbing-source\public
```
The generated `public/` files are committed in this standalone repository. No runtime dependence on PENG Nexus.

## Cloudflare Workers Static Assets (preview first)
- Repository: `auturock067-spec/plumbing-source`
- Worker name: `plumbing-source` (must match Cloudflare's existing project)
- The `wrangler.jsonc` file configures `assets.directory` as `./public`.
- Production branch: `main` (README only until PR approval/merge)
- Build command: leave empty; deploy command: `npx wrangler deploy`.
- Enable **Preview Builds** for feature branches; preview command: `npx wrangler preview`.
- Inspect the Worker Preview created from `feat/v0-1-site-foundation`. Only after acceptance, merge the PR to `main` for automatic production deployment.
- No API secrets needed in V0.1. Do not remove noindex or enable personal data collection without review.
