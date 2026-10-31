import { document, homeSections, active } from '../lib/content.mjs';
import { HomeSection } from '../components/content';
export async function generateMetadata() {
  const home = await document('home','Pages/home.json','home');
  return { title: active(home) && home.pageTitle?.trim() || 'Senior Software Engineer' };
}
export default async function Home() {
  return <main className="page-shell">{(await homeSections()).map(s=><HomeSection content={s} key={s.id}/>)}</main>;
}
