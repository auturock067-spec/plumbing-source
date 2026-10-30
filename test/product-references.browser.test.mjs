import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const home=pathToFileURL(resolve('public/index.html')).href;
const refs=[['ball-valve','球阀','Ball valve'],['check-valve','止回阀','Check valve'],['brass-threaded-elbow','黄铜螺纹弯头','Brass threaded elbow']];
test('Three source-backed bilingual references preserve catalog and RFQ navigation',async t=>{
 const browser=await chromium.launch({headless:true});
 await mkdir('artifacts',{recursive:true});
 try{
  for(const width of [320,390,768,1440])await t.test(width+'px reference pages',async()=>{
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   try{
    for(const [slug,zh,en] of refs){
     await page.goto(home+'?lang=zh');
     await page.locator('a.detail-link[href*="'+slug+'.html"]').click();
     assert.equal(new URL(page.url()).searchParams.get('lang'),'zh');
     assert.equal(await page.locator('h1').innerText(),zh);
     assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
     assert.equal(await page.locator('.spec-table tr').count(),5);
     assert.equal(await page.locator('#questions li').count(),4);
     assert.equal(await page.locator('#mistakes li').count(),3);
     assert.match(await page.locator('.detail-art figcaption').innerText(),/并非实物照片/);
     assert.ok(await page.locator('.source-card a[href^="https://"]').count()>0);
     assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex,nofollow');
     assert.ok(await page.locator('.detail-art img').evaluate(img=>img.complete&&img.naturalWidth>0),'illustration failed');
     const size=await page.evaluate(()=>({client:document.documentElement.clientWidth,page:document.documentElement.scrollWidth}));
     assert.ok(size.page<=size.client+1,'overflow '+JSON.stringify(size));
     await page.screenshot({path:'artifacts/reference-'+slug+'-zh-'+width+'.png',fullPage:true});
     await page.locator('#language-switch').click();
     assert.equal(await page.locator('h1').innerText(),en);
     assert.equal(await page.locator('html').getAttribute('lang'),'en');
     const enSize=await page.evaluate(()=>({client:document.documentElement.clientWidth,page:document.documentElement.scrollWidth}));
     assert.ok(enSize.page<=enSize.client+1,'English overflow');
     await page.locator('#language-switch').click();
     const rfq=page.locator('.detail-summary a[data-language-link]');
     assert.match(await rfq.getAttribute('href'),/lang=zh/);
     await rfq.click();
     assert.equal(new URL(page.url()).hash,'#rfq-builder');
     assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
     assert.equal(await page.locator('#rfq-generate').isVisible(),true);
    }
    assert.deepEqual(errors,[]);
   }finally{await page.close();}
  });
 }finally{await browser.close();}
});
