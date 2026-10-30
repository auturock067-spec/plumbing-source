# V0.2 product reference sample

Scope: three product-type reference pages (ball valve, check valve, brass threaded elbow), image-led homepage/catalog refinement, and linked bilingual RFQ preparation. Existing six product cards, original illustrations, RFQ behavior, translations and source branches are preserved.

Source of truth for the three references: `docs/product-references.json`. All prose is original editorial procurement guidance. Manufacturer links identify examples and further reading; no manufacturer photo, drawing, brand mark, precise pressure/temperature rating or certification claim is reproduced as a property of the generic type. Source review date: 2026-10-30.

Sources:
- Watts LFFBV-3C: https://www.watts.com/products/plumbing-flow-control-solutions/shutoff-valves/ball-valves/lffbv-3c
- Watts LF600: https://www.watts.com/products/Plumbing-Flow-Control-Solutions/Check-Valves/LF600
- Swagelok B-4-E: https://products.swagelok.com/en/c/90-degree-elbows/p/B-4-E
- Swagelok pipe fittings catalog MS-01-147: https://www.swagelok.com/downloads/webcatalogs/en/MS-01-147.pdf

## Image provenance

| Asset | Origin | Use | Limitation |
|---|---|---|---|
| public/images/ball-valve.svg | Existing original project SVG in Draft head c61b14d5bd4926d5b787d9bf840504c0c419d048 | Home, catalog, ball-valve reference | Generic illustration, not photograph, dimensioned drawing or Watts model depiction |
| public/images/check-valve.svg | Same existing project asset set | Catalog, check-valve reference | Generic illustration, not photograph or Watts model depiction |
| public/images/brass-threaded-elbow.svg | Same existing project asset set | Catalog, elbow reference | Generic illustration, not photograph or Swagelok model depiction |

These assets are reused without editing. No externally sourced imagery is added. The credit visible on detail pages is “Original project illustration”. Brand-specific real photos remain out of scope until permissions are recorded.

## Regeneration

1. Edit docs/product-references.json for reference content in both languages.
2. Run `python scripts/build-references.py` to generate the three pages and home/catalog links. This also updates site.json hero copy and catalog translation strings while preserving RFQ markup.
3. Run `node scripts/localize.mjs` to compile the bilingual homepage runtime.
4. Commit source data, scripts and generated public files together.

Do not run the upstream PENG Nexus generator for these standalone changes. The original six-product overview remains in site.json; the three detailed references have their own reviewed data file. Content count expansion and product comparison are subsequent work, not represented as complete here.

Preview/noindex remains mandatory until owner approval for production.
