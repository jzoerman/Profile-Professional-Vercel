'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { active, ordered } from '../lib/order.mjs';
export default function Sidebar({ content }) {
  const pathname = usePathname();
  const initial = pathname === '/' ? 'overview' : 'writing';
  const [selected, setSelected] = useState(initial);
  useEffect(() => {
    setSelected(initial);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (visible) setSelected(visible.target.id);
    }, {rootMargin:'-20% 0px -60% 0px',threshold:[0.1,0.25,0.5]});
    ordered(content?.navigation?.children).forEach(item => {
      const section = document.getElementById(item.id); if (section) observer.observe(section);
    });
    return ()=>observer.disconnect();
  }, [pathname, initial, content]);
  if (!active(content)) return null;
  return <aside className="sidebar" aria-label={content.label}>{ordered([
    {...content.brand, group:'brand'}, {...content.navigation, group:'navigation'}
  ]).map(group=>group.group==='brand' ? <div className="brand" key="brand"><div className="monogram" aria-hidden="true">{group.monogram}</div><div><p className="brand-name">{group.name}</p><p className="brand-role">{group.role}</p></div></div> : <nav className="nav" aria-label={group.label} key="nav">{ordered(group.children).map(item=><a key={item.id} className={`nav-link ${selected===item.id?'active':''}`} aria-current={selected===item.id?'location':undefined} href={item.url} data-section={item.id}>{item.label}</a>)}</nav>)}</aside>;
}
