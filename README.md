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

## Cloudflare Pages (manual setup after review)
- Repository: `auturock067-spec/plumbing-source`
- Production branch: `main`
- Framework: None, build command: blank
- Output directory: `public`
- Do not add project secrets, submit RFQs, or remove noindex without review.
