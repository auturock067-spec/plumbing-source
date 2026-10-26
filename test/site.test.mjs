import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const cfg=JSON.parse(await readFile(new URL('../site.json',import.meta.url),'utf8'));
test('correct brand & product count',()=>{assert.ok(html.includes('<title>'+cfg.brand));assert.equal((html.match(/data-product data-category=/g)||[]).length,cfg.products.length)});
test('safe prototype flags',()=>{assert.match(html,/noindex,nofollow/);assert.match(html,/No factory is currently endorsed/)});
test('client search assets',async()=>{const code=await readFile(new URL('../public/app.js',import.meta.url),'utf8');assert.match(html,/id="product-search"/);assert.match(code,/addEventListener/)});
