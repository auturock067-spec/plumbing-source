import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const site = pathToFileURL(resolve('public/index.html')).href;
const widths = [320, 390, 768, 1440];

test('Chromium responsive layout, navigation, and live product filtering', async (t) => {
  const browser = await chromium.launch({ headless: true });
  try {
    await mkdir('artifacts', { recursive: true });
    for (const width of widths) {
      await t.test(width + 'px viewport', async () => {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        try {
          const response = await page.goto(site, { waitUntil: 'load' });
          assert.ok(response, 'HTML page should load');
          await page.locator('#product-search').waitFor();
          assert.ok((await page.title()).length > 5);
          const overflow = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            page: document.documentElement.scrollWidth,
          }));
          assert.ok(overflow.page <= overflow.viewport + 1,
            'horizontal overflow: ' + JSON.stringify(overflow));

          const navTarget = page.locator('nav a[href^="#"]').first();
          const href = await navTarget.getAttribute('href');
          assert.ok(href && await page.locator(href).count() === 1);
          await navTarget.click();
          assert.equal(new URL(page.url()).hash, href);

          const allCards = page.locator('[data-product]');
          const total = await allCards.count();
          assert.ok(total >= 6, 'missing product references');
          const input = page.locator('#product-search');
          const firstName = await allCards.first().locator('h3').innerText();
          const query = firstName.split(/\s+/).slice(0, 2).join(' ');
          await input.fill(query);
          const matching = await page.locator('[data-product]:visible').count();
          assert.ok(matching > 0 && matching <= total, 'search did not filter cards');
          await input.fill('__not_a_product_reference__');
          assert.equal(await page.locator('[data-product]:visible').count(), 0);
          assert.equal(await page.locator('#no-results').isVisible(), true);
          assert.match(await page.locator('#result-count').innerText(), /^0 product references shown$/);
          await input.fill('');
          assert.equal(await page.locator('[data-product]:visible').count(), total);

          const chip = page.locator('[data-filter]').nth(1);
          const category = await chip.getAttribute('data-filter');
          await chip.click();
          assert.equal(await chip.getAttribute('aria-pressed'), 'true');
          assert.ok((await page.locator('[data-product]:visible').count()) > 0);
          assert.equal(await page.locator('[data-product]:not([data-category="' + category + '"]):visible').count(), 0);

          await page.screenshot({ path: 'artifacts/site-' + width + '.png', fullPage: true });
          assert.deepEqual(errors, [], 'uncaught browser errors');
        } finally {
          await page.close();
        }
      });
    }
  } finally {
    await browser.close();
  }
});
