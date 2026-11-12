import {test} from 'node:test';
import assert from 'node:assert/strict';
process.env.LEAFPLUS_ENABLED='true';
const {articles,articleBySlug,document,leafStatus}=await import('../lib/content.mjs');
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

test('page status reflects remote content and independent fallback',async()=>{
 globalThis.fetch=async url=> {
  const resource=String(url);
  if(resource.includes('collection')) return Response.json([]);
  if(resource.endsWith('shared/sidebar')) return Response.json({id:'sidebar',brand:{},navigation:{children:[]}});
  const id=resource.split('/').pop();
  return Response.json({id,children:[],...(id==='blog-preview'?{viewAllLink:{}}:{})});
 };
 assert.equal(await leafStatus('home'),'Leaf++');
 assert.equal(await leafStatus('blog'),'Leaf++');
 const remoteFetch=globalThis.fetch;
 globalThis.fetch=async url=> {
  if(String(url).endsWith('home/about')) throw new Error('section fixture');
  return remoteFetch(url);
 };
 assert.equal(await leafStatus('home'),'static-fallback');
 assert.equal(await leafStatus('blog'),'Leaf++');
 globalThis.fetch=async url=> {
  if(String(url).includes('collection')) throw new Error('related fixture');
  if(String(url).includes('articles/')) return Response.json({title:'Remote',summary:'Summary',category:'Engineering',readTime:'1 min',urlPath:'/articles/remote',bodyHtml:'<p>Body</p>'});
  return remoteFetch(url);
 };
 assert.equal(await leafStatus('article','remote'),'static-fallback');
 process.env.LEAFPLUS_ENABLED='false';
 assert.equal(await leafStatus('home'),'static-fallback');
 process.env.LEAFPLUS_ENABLED='true';
});
