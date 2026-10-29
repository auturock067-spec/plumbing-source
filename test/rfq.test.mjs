import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const [html,js,css,robots,config]=await Promise.all([
  read('public/index.html'),read('public/rfq-builder.js'),read('public/rfq-builder.css'),
  read('public/robots.txt'),read('site.json')
]);
test('RFQ builder linked from homepage and remains review-only',()=>{
  for(const term of ['href="#rfq-builder"','id="rfq-builder"','id="rfq-form"','id="rfq-product"','id="rfq-output"','id="rfq-missing"','src="./rfq-builder.js"','href="./rfq-builder.css"'])assert.ok(html.includes(term),term);
  assert.match(html,/noindex,nofollow/);
  assert.match(robots,/Disallow:\s*\//);
  assert.doesNotMatch(html,/action="https?:/);
  assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
});
test('local-only bilingual export, missing field validation and responsive layout',()=>{
  for(const term of ["Brass threaded elbow","Ball valve","Check valve","黄铜螺纹弯头","球阀","止回阀","buyer","Bilingual"])assert.ok(html.includes(term)||js.includes(term),term);
  for(const term of ['"product"','"size"','"connection"','"pressure"','"temperature"','"quantity"','"market"'])assert.ok(js.includes(term.replaceAll('"',"'"))||html.includes(term.replaceAll('"',"name=")),term);
  assert.match(js,/navigator\.clipboard\.writeText/);
  assert.match(js,/new Blob\(/);
  assert.match(js,/text\/plain;charset=utf-8/);
  assert.match(css,/grid-template-columns:1fr/);
  assert.match(css,/#rfq-builder/);
  assert.ok(JSON.parse(config).locales['zh-CN']);
});