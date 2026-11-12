import { document, homeSections, active, leafStatus } from '../lib/content.mjs';
import { HomeSection } from '../components/content';
export async function generateMetadata() {
  const home = await document('home','Pages/home.json','home');
  return { title: active(home) && home.pageTitle?.trim() || 'Senior Software Engineer', other: {'leaf-status': await leafStatus('home')} };
}
export default async function Home() {
  return <main className="page-shell">{(await homeSections()).map(s=><HomeSection content={s} key={s.id}/>)}</main>;
}
