import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const file = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');
const [html, js, css, robots, wranglerText, cfgText] = await Promise.all([
  file('public/index.html'), file('public/app.js'), file('public/styles.css'),
  file('public/robots.txt'), file('wrangler.jsonc'), file('site.json'),
]);
const cfg = JSON.parse(cfgText);
const wrangler = JSON.parse(wranglerText);

test('correct brand and number of product references', () => {
  assert.ok(html.includes('<title>' + cfg.brand));
  assert.equal((html.match(/data-product data-category=/g) || []).length, cfg.products.length);
});

test('preview remains non-indexable and avoids supplier endorsement', () => {
  assert.match(html, /noindex,nofollow/);
  assert.match(html, /No factory is currently endorsed/);
  assert.match(robots, /Disallow:\s*\//);
});

test('all in-page navigation targets exist', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.ok(anchors.length >= 4, 'expected visible navigation anchors');
  for (const id of anchors) assert.ok(ids.has(id), 'missing target: #' + id);
});

test('search and category controls have accessible states', () => {
  assert.match(html, /id="product-search"\s+type="search"/);
  assert.match(html, /data-filter="all"\s+aria-pressed="true"/);
  assert.match(html, /id="result-count"[^>]*aria-live="polite"/);
  assert.match(js, /addEventListener\('input',filter\)/);
  assert.match(js, /card\.hidden=!match/);
  assert.match(css, /\[hidden\]\{display:none!important\}/);
});

test('Cloudflare Workers serves only reviewed static assets', () => {
  assert.equal(wrangler.name, 'plumbing-source');
  assert.equal(wrangler.assets.directory, './public');
  assert.match(html, /<script\s+src="\.\/app\.js"\s+defer><\/script>/);
  assert.match(html, /href="\.\/styles\.css"/);
});


test('all six product cards have original local SVG illustrations and accessible alt text', async () => {
  const pictureCards = [...html.matchAll(/<article class="card product-card"[\s\S]*?<\/article>/g)].map(m => m[0]);
  assert.equal(pictureCards.length, cfg.products.length);
  for (const [index, product] of cfg.products.entries()) {
    assert.match(product.image || '', /^\.\/images\/[a-z0-9-]+\.svg$/);
    const svg = await file('public/' + product.image.replace(/^\.\//, ''));
    assert.match(svg, /^<svg[\s\S]*viewBox="0 0 800 480"/);
    assert.match(svg, /<\/svg>$/);
    assert.doesNotMatch(svg, /<script|<foreignObject|<image\b|(?:href|src)=["\x27]https?:/i);
    const card = pictureCards[index];
    assert.ok(card.includes('src="' + product.image + '"'), 'missing image: ' + product.name);
    assert.ok(card.includes('alt="' + product.name + '"'), 'missing accessible alt: ' + product.name);
  }
  assert.match(html, /Original illustrations for identification only/);
  assert.match(css, /\.product-card \.product-image/);
  assert.match(js, /'\[aria-label\]/);
});
