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
          // Both locales must keep the active filter, search and accessibility labels.
          const englishHeading=await page.locator('h1').innerText();
          const englishName=await allCards.first().locator('h3').innerText();
          const englishTitle=await page.title();
          const categoryCount=await page.locator('[data-product]:visible').count();
          const language=page.locator('#language-switch');
          await language.click();
          assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
          assert.equal(await language.innerText(),'English');
          assert.notEqual(await page.locator('h1').innerText(),englishHeading);
          assert.notEqual(await page.title(),englishTitle);
          assert.equal(await page.locator('[data-product]:visible').count(),categoryCount);
          assert.equal(await chip.getAttribute('aria-pressed'),'true');
          assert.equal(await input.getAttribute('aria-label'),'搜索产品参考');
          assert.match(await input.getAttribute('placeholder'),/搜索/);
          assert.match(await page.locator('#suppliers').innerText(),/筹备中/);
          assert.match(await page.locator('#about .notice').innerText(),/知识原型/);
          const zhOverflow=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,page:document.documentElement.scrollWidth}));
          assert.ok(zhOverflow.page<=zhOverflow.viewport+1,'Chinese layout overflow');
          await page.locator('[data-filter="all"]').click();
          const chineseName=await allCards.first().locator('h3').innerText();
          await input.fill(chineseName);
          assert.ok(await page.locator('[data-product]:visible').count()>0,'Chinese search failed');
          await input.fill(englishName);
          assert.ok(await page.locator('[data-product]:visible').count()>0,'English search in Chinese failed');
          await input.fill('__no_match__');
          assert.equal(await page.locator('#no-results').isVisible(),true);
          assert.match(await page.locator('#no-results').innerText(),/未找到/);
          assert.equal(await page.locator('#result-count').innerText(),'显示 0 项产品参考');
          await input.fill('');
          await page.locator('nav a[href="#guides"]').click();
          assert.equal(new URL(page.url()).hash,'#guides');
          await page.goto(site+'?lang=zh');
          await page.screenshot({path:'artifacts/site-zh-'+width+'.png',fullPage:true});
          await page.goto(site);
          assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN','saved preference lost');
          await page.goto(site+'?lang=en');
          assert.equal(await page.locator('html').getAttribute('lang'),'en','URL must override saved preference');
          assert.equal(await page.locator('h1').innerText(),englishHeading);
          await page.locator('#language-switch').click();
          await page.locator('#language-switch').click();
          assert.equal(await page.title(),englishTitle);
          await input.fill(chineseName);
          assert.ok(await page.locator('[data-product]:visible').count()>0,'Chinese search in English failed');
          await input.fill('');

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



test('all six local illustrations render at mobile and desktop widths with bilingual alt text', async () => {
  const browser = await chromium.launch({headless: true});
  try {
    for (const width of [320, 390, 768, 1440]) {
      const page = await browser.newPage({viewport: {width, height: 900}});
      const errors = [];
      page.on('pageerror', err => errors.push(String(err)));
      try {
        await page.goto(site + '?lang=en', {waitUntil:'load'});
        const imgs=page.locator('[data-product] .product-image img');
        assert.equal(await imgs.count(),6);
        const loaded=await imgs.evaluateAll(async images => Promise.all(images.map(async img => {
          img.loading='eager'; try {await Promise.race([img.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('SVG image decode timed out')),8000))]);} catch (error) {return {ok:false,src:img.getAttribute('src'),error:String(error)};}
          return {ok:img.complete && img.naturalWidth===800 && img.naturalHeight===480,src:img.getAttribute('src'),width:img.naturalWidth};
        })));
        assert.ok(loaded.every(x=>x.ok),'broken SVG illustrations: '+JSON.stringify(loaded));
        assert.equal(await imgs.first().getAttribute('alt'),await page.locator('[data-product] h3').first().innerText());
        await page.locator('#language-switch').click();
        assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
        const chineseAlt=await imgs.first().getAttribute('alt');
        assert.equal(chineseAlt,await page.locator('[data-product] h3').first().innerText());
        const overflow=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
        assert.ok(overflow.scroll<=overflow.client+1,JSON.stringify(overflow));
        assert.deepEqual(errors,[]);
      } finally {await page.close();}
    }
  } finally {await browser.close();}
});


test('hero and guide artwork is decoded, labeled and responsive',async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    for(const width of [390,1440]){
      const page=await browser.newPage({viewport:{width,height:900}});
      try{
        await page.goto(site+'?lang=zh',{waitUntil:'load'});
        const pictures=page.locator('.hero-visual img, .guide-image img');
        assert.equal(await pictures.count(),4);
        const status=await pictures.evaluateAll(async images=>Promise.all(images.map(async img=>{
          img.loading='eager'; try{await Promise.race([img.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('SVG image decode timed out')),8000))]);return {ok:img.naturalWidth===800&&img.naturalHeight===480,alt:img.alt};}
          catch(e){return {ok:false,error:String(e),src:img.src};}
        })));
        assert.ok(status.every(x=>x.ok&&x.alt),'Broken illustration: '+JSON.stringify(status));
        const layout=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
        assert.ok(layout.scroll<=layout.viewport+1,'image layout overflow '+JSON.stringify(layout));
      }finally{await page.close();}
    }
  }finally{await browser.close();}
});
