import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

import { active, ordered } from './order.mjs';
export { active, ordered };
const local = async file => JSON.parse(await readFile(path.join(process.cwd(), 'content', file), 'utf8'));
const settings = JSON.parse(await readFile(path.join(process.cwd(), 'leafplus.settings.json'), 'utf8'));
const enabled = () => (process.env.LEAFPLUS_ENABLED ?? 'true').toLowerCase() === 'true';
async function remote(resource) {
  const base = process.env.LEAFPLUS_BASE_URL || 'https://leaf-plus-plus-d9htfbg4fufzd9hy.westcentralus-01.azurewebsites.net/';
  const project = process.env.LEAFPLUS_PROJECT || settings.LeafPlus.Project;
  const response = await fetch(new URL(`api/projects/${encodeURIComponent(project)}/${resource}`, base), {
    cache: 'no-store', signal: AbortSignal.timeout(Math.max(1, Number(process.env.LEAFPLUS_TIMEOUT_SECONDS) || 3) * 1000)
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Leaf++ HTTP ${response.status}`);
  return response.json();
}
function validTree(value) {
  if (Array.isArray(value)) return value.every(item => item && typeof item === 'object' && validTree(item));
  if (!value || typeof value !== 'object') return true;
  if (value.isActive !== undefined && typeof value.isActive !== 'boolean') return false;
  if (value.sortKey !== undefined && (typeof value.sortKey !== 'number' || !Number.isFinite(value.sortKey))) return false;
  for (const key of ['children','headingLines']) {
    if (value[key] !== undefined && !Array.isArray(value[key])) return false;
  }
  for (const key of ['image','link','viewAllLink','brand','navigation']) {
    if (value[key] !== undefined && (!value[key] || typeof value[key] !== 'object' || Array.isArray(value[key]))) return false;
  }
  return Object.values(value).every(item => typeof item !== 'object' || validTree(item));
}
function validDocument(data, id) {
  return validTree(data) && data && typeof data === 'object' && !Array.isArray(data) && (id === 'home' || data.id === id)
    && (data.children === undefined || (Array.isArray(data.children) && data.children.every(x => x && typeof x === 'object')))
    && (id !== 'sidebar' || (data.brand && data.navigation && Array.isArray(data.navigation.children)))
    && (id !== 'blog-preview' || data.viewAllLink);
}
export const document = cache(async (resource, file, id) => {
  if (enabled()) {
    try { const data = await remote(`content/${resource}`); if (!validDocument(data,id)) throw new Error('Invalid document'); return data; }
    catch (error) { console.warn(`Leaf++ ${resource}: ${error.message}; using bundled content.`); }
  }
  try { const data = await local(file); return validDocument(data,id) ? data : null; } catch { return null; }
});
export const sectionIds = ['overview','what-i-do','projects','blog-preview','about','skills','experience','philosophy','contact'];
export const homeSections = () => Promise.all(sectionIds.map(id => document(`home/${id}`,`Sections/${id}.json`,id))).then(ordered);
const validArticle = data => data && typeof data.title === 'string' && typeof data.urlPath === 'string' && typeof data.summary === 'string' && typeof data.category === 'string' && typeof data.readTime === 'string';
const sortArticles = items => items.filter(active).sort((a,b) => (a.sortKey ?? 0)-(b.sortKey ?? 0) || String(b.publishDate).localeCompare(String(a.publishDate)));
async function localArticles() {
  return sortArticles(await Promise.all((await readdir(path.join(process.cwd(),'content/Articles'))).filter(f=>f.endsWith('.json')).map(f=>local(`Articles/${f}`))));
}
export const articles = cache(async () => {
  if (enabled()) {
    try {
      const data = await remote('collection?prefix=/articles');
      if (!Array.isArray(data) || !data.every(x=>validArticle(x?.data))) throw new Error('Invalid article collection');
      return sortArticles(data.map(x=>x.data));
    } catch(error) { console.warn(`Leaf++ articles: ${error.message}; using bundled content.`); }
  }
  return localArticles();
});
export const articleBySlug = cache(async slug => {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return null;
  if (enabled()) {
    try {
      const data = await remote(`content/articles/${encodeURIComponent(slug)}`);
      if (data === null || !active(data)) return null;
      if (!validArticle(data) || typeof data.bodyHtml !== 'string') throw new Error('Invalid article');
      return data;
    } catch(error) { console.warn(`Leaf++ article ${slug}: ${error.message}; using bundled content.`); }
  }
  try {
    const data = await local(`Articles/${slug}.json`);
    if (!active(data)) return null;
    const file = path.resolve(process.cwd(),'content/Articles',data.htmlFile);
    if (!file.startsWith(path.resolve(process.cwd(),'content/Articles') + path.sep)) return null;
    return {...data, bodyHtml: await readFile(file,'utf8')};
  } catch { return null; }
});
export const date = (value, options) => new Date(`${String(value).slice(0,10)}T12:00:00Z`).toLocaleDateString('en-US', {...options,timeZone:'UTC'});
