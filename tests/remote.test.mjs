import {test} from 'node:test';
import assert from 'node:assert/strict';
process.env.LEAFPLUS_ENABLED='true';
const {articles,articleBySlug,document}=await import('../lib/content.mjs');
test('CMS empty collections and missing/inactive articles remain authoritative',async()=>{
 globalThis.fetch=async url=>Response.json(String(url).includes('collection')?[]:{isActive:false});
 assert.deepEqual(await articles(),[]);
 assert.equal(await articleBySlug('owning-ai-assisted-code'),null);
 globalThis.fetch=async()=>new Response(null,{status:404});
 assert.equal(await articleBySlug('thoughts-on-ai-in-software-engineering'),null);
});
test('failures fall back independently, and related failures preserve remote bodies',async()=>{
 globalThis.fetch=async()=>{throw new Error('offline fixture');};
 assert.equal((await document('home/about','Sections/about.json','about')).id,'about');
 assert.equal((await articles()).length,3);
 globalThis.fetch=async url=> {
  if(String(url).includes('collection')) throw new Error('related fixture');
  return Response.json({title:'Remote title',summary:'Summary',category:'Engineering',readTime:'1 min',urlPath:'/articles/remote',bodyHtml:'<p>Remote body</p>',isActive:true});
 };
 assert.equal((await articleBySlug('remote')).bodyHtml,'<p>Remote body</p>');
 assert.equal((await articles()).length,3);
});
