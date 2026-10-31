import { test } from 'node:test';
import assert from 'node:assert/strict';
import { active, ordered } from '../lib/order.mjs';
process.env.LEAFPLUS_ENABLED='false';
const {homeSections,articleBySlug,articles,document} = await import('../lib/content.mjs');
test('activation, legacy compatibility, and stable numeric ordering',()=>{
 assert.equal(active({isActive:false}),false);
 assert.equal(active({}),true);
 assert.deepEqual(ordered([{id:'a',sortKey:20},{id:'off',sortKey:0,isActive:false},{id:'b',sortKey:10},{id:'c',sortKey:10}]).map(x=>x.id),['b','c','a']);
});
test('bundled home and nested content preserve section contract',async()=>{
 const sections=await homeSections();
 assert.equal(sections.length,9);
 assert.equal(sections[0].id,'overview');
 assert.equal(ordered(sections.find(x=>x.id==='skills').children)[0].children.length,4);
 assert.equal((await document('home','Pages/home.json','home')).pageTitle,'Senior Software Engineer');
});
test('article bodies, inactive and missing articles, and unsafe slugs',async()=>{
 assert.ok((await articleBySlug('thoughts-on-ai-in-software-engineering')).bodyHtml.includes('<p>'));
 assert.equal(await articleBySlug('owning-ai-assisted-code'),null);
 assert.equal(await articleBySlug('missing'),null);
 assert.equal(await articleBySlug('../home'),null);
 assert.equal((await articles()).length,3);
});
