import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const site=pathToFileURL(resolve('public/index.html')).href;
test('RFQ builder bilingual local-only flows across mobile and desktop',async t=>{
  const browser=await chromium.launch({headless:true});
  await mkdir('artifacts',{recursive:true});
  try{
    for(const width of [320,390,768,1440]){
      await t.test(width+'px RFQ',async()=>{
        const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});
        const errors=[];page.on('pageerror',e=>errors.push(String(e)));
        try{
          await page.goto(site+'?lang=zh',{waitUntil:'load'});
          assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
          await page.locator('.hero .actions a[href="#rfq-builder"]').click();
          assert.equal(new URL(page.url()).hash,'#rfq-builder');
          await page.selectOption('#rfq-product','elbow');
          await page.fill('#rfq-size','DN20');
          await page.fill('#rfq-material','Brass CW617N (buyer example)');
          await page.fill('#rfq-connection','BSPP (pending verification)');
          await page.fill('#rfq-pressure','1.6');
          await page.fill('#rfq-temperature','20');
          await page.fill('#rfq-medium','Water');
          await page.fill('#rfq-quantity','100');
          await page.fill('#rfq-market','Singapore');
          await page.fill('#rfq-extra','Female threads, sealing detail to confirm');
          await page.locator('#rfq-generate').click();
          let content=await page.locator('#rfq-output').innerText();
          assert.ok(content.includes('黄铜螺纹弯头'));
          assert.ok(content.includes('Brass threaded elbow'));
          assert.ok(content.includes('DN20'));
          assert.ok(content.includes('不是报价'));
          assert.ok(!content.includes('[TO CONFIRM WITH SUPPLIER / BUYER]'),'complete fields should not be marked missing');
          assert.equal(await page.locator('#rfq-copy').isEnabled(),true);
          assert.equal(await page.locator('#rfq-save').isEnabled(),true);
          await page.locator('#language-switch').click();
          assert.equal(await page.locator('html').getAttribute('lang'),'en');
          assert.equal(await page.locator('#rfq-size').inputValue(),'DN20','language switch lost user input');
          assert.match(await page.locator('#rfq-generate').innerText(),/Generate/);
          const downloaded=page.waitForEvent('download');
          await page.locator('#rfq-save').click();
          const dl=await downloaded;assert.equal(dl.suggestedFilename(),'plumbingsource-rfq-checklist.txt');
          const fileText=await readFile(await dl.path(),'utf8');
          assert.ok(fileText.includes('黄铜螺纹弯头'));
          await page.fill('#rfq-quantity','0');
          await page.fill('#rfq-extra','');
          await page.locator('#rfq-generate').click();
          assert.match(await page.locator('#rfq-missing').innerText(),/Quantity|connection|details/i);
          content=await page.locator('#rfq-output').innerText();
          assert.match(content,/TO CONFIRM WITH SUPPLIER/);
          await page.selectOption('#rfq-product','check');
          await page.locator('#rfq-generate').click();
          assert.match(await page.locator('#rfq-output').innerText(),/Check valve/);
          assert.match(await page.locator('#rfq-output').innerText(),/止回阀/);
          const sizes=await page.evaluate(()=>({client:document.documentElement.clientWidth,page:document.documentElement.scrollWidth}));
          assert.ok(sizes.page<=sizes.client+1,'horizontal overflow '+JSON.stringify(sizes));
          await page.screenshot({path:'artifacts/rfq-'+width+'.png',fullPage:true});
          assert.deepEqual(errors,[]);
        }finally{await page.close();}
      });
    }
  }finally{await browser.close();}
});