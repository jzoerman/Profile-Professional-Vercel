import { active, ordered } from '../lib/order.mjs';
export function TextLink({item, className='text-link'}) { return active(item) ? <a className={className} href={item.url}>{item.label}</a> : null; }
export function ArticleMeta({article,children}) { return <div className="article-meta"><span>{article.category}</span>{children}<span>{article.readTime}</span></div>; }
export function ArticleCard({article, featured=false}) { return <article className={`article-card ${featured?'featured-article':''}`}><ArticleMeta article={article}/><h3><a href={article.urlPath}>{article.title}</a></h3><p>{article.summary}</p>{featured && <a className="text-link" href={article.urlPath}>{article.readLinkLabel}</a>}</article>; }
export function HomeSection({content:s}) {
  if (!active(s)) return null;
  const items = ordered(s.children);
  const heading = <><p className="eyebrow">{s.eyebrow}</p><h2>{s.heading}</h2></>;
  switch(s.id) {
    case 'overview': return <section className="hero section" id="overview"><div className="hero-copy"><p className="eyebrow">{s.eyebrow}</p><h1>{ordered(s.headingLines).map((line,i)=><span key={i}>{i>0 && <br/>}{line.text}</span>)}</h1><p className="lead">{s.description}</p><div className="highlight-strip" aria-label={s.highlightsLabel}>{items.map((x,i)=><span key={i}>{x.text}</span>)}</div></div>{active(s.image) && <div className="hero-visual" aria-label={s.image.label}><img src={s.image.url} alt={s.image.alt}/></div>}</section>;
    case 'what-i-do': return <section className="section compact" aria-labelledby="what-i-do-title"><p className="eyebrow">{s.eyebrow}</p><h2 className="sr-only" id="what-i-do-title">{s.heading}</h2><div className="services-grid">{items.map((x,i)=><article className="service" key={i}><div className="service-icon">{x.number}</div><h3>{x.heading}</h3><p>{x.text}</p></article>)}</div></section>;
    case 'projects': return <section className="section" id="projects"><p className="eyebrow">{s.eyebrow}</p>{items.map((x,i)=><article className="feature-card" key={i}><div><h2>{x.heading}</h2><p>{x.text}</p></div><TextLink item={x.link}/></article>)}</section>;
    case 'blog-preview': return <section className="section blog-preview" id="writing"><div className="section-heading"><div>{heading}</div><TextLink item={s.viewAllLink}/></div><div className="article-grid">{items.map((x,i)=><ArticleCard article={x} featured={x.isFeatured} key={i}/>)}</div></section>;
    case 'about': return <section className="section two-column" id="about"><div>{heading}</div><div className="copy-stack">{items.map((x,i)=><p key={i}>{x.text}</p>)}</div></section>;
    case 'skills': return <section className="section" id="skills"><p className="eyebrow">{s.eyebrow}</p><div className="skills-layout"><div><h2>{s.heading}</h2><p>{s.description}</p></div><div className="skill-groups">{items.map((x,i)=><div key={i}><h3>{x.heading}</h3><div className="chips">{ordered(x.children).map((c,j)=><span key={j}>{c.text}</span>)}</div></div>)}</div></div></section>;
    case 'experience': return <section className="section two-column" id="experience"><div>{heading}</div><div className="timeline">{items.map((x,i)=><div className="timeline-item" key={i}><span className="timeline-dot"/><h3>{x.heading}</h3><p>{x.text}</p></div>)}</div></section>;
    case 'philosophy': return <section className="section quote-section"><p className="eyebrow">{s.eyebrow}</p><div className="quotes">{items.map((x,i)=><blockquote key={i}>{x.text}</blockquote>)}</div></section>;
    case 'contact': return <section className="section contact-section" id="contact">{heading}<TextLink item={s.link} className="primary-action"/></section>;
    default: return null;
  }
}
