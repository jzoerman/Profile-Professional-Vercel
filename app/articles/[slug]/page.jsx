import { notFound } from 'next/navigation';
import { articleBySlug, articles, date } from '../../../lib/content.mjs';
import { ArticleMeta, ArticleCard } from '../../../components/content';
export async function generateMetadata({params}) {
  const article = await articleBySlug((await params).slug);
  return {title:article?.title || 'Article not found'};
}
export default async function Article({params}) {
  const a = await articleBySlug((await params).slug);
  if (!a) notFound();
  const related = (await articles()).filter(x=>x.urlPath!==a.urlPath).slice(0,2);
  return <main className="page-shell article-page"><article><header className="section article-header" id="writing"><a className="text-link back-link" href="/blog">Back to writing</a><ArticleMeta article={a}><span>{date(a.publishDate,{month:'long',day:'numeric',year:'numeric'})}</span></ArticleMeta><h1>{a.title}</h1><p className="lead">{a.summary}</p></header><section className="section article-body" dangerouslySetInnerHTML={{__html:a.bodyHtml}}/></article>{related.length>0 && <section className="section related-articles" aria-labelledby="related-title"><p className="eyebrow">Keep Reading</p><h2 id="related-title">Related notes</h2><div className="article-grid">{related.map(x=><ArticleCard article={x} key={x.urlPath}/>)}</div></section>}</main>;
}
