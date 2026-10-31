# Professional profile — Next.js / React

Port of `Profile-Professional/ProfilePage.Web`, preserving its CSS, portrait, nine home sections, sidebar, blog listing, article bodies, and related articles. Uses the Next.js App Router and React server components; sidebar scroll highlighting runs in a client component.

Requires Node.js 20.9 or later.

```sh
npm install
npm run dev
```

Open http://localhost:3000. For production, run `npm run build` then `npm start`. `npm test` checks content ordering, activation, local article rendering, missing/inactive articles, and CMS fallback behavior.

## Content

Leaf++ is enabled by default with the original hosted endpoint and project from `leafplus.settings.json`. Copy `.env.example` to `.env.local` to override configuration. Set `LEAFPLUS_ENABLED=false` for local-only development. Other settings are `LEAFPLUS_BASE_URL`, `LEAFPLUS_PROJECT`, and `LEAFPLUS_TIMEOUT_SECONDS` (default 3).

Content requests run on the server without caching, so CMS edits appear on refresh without rebuilding. The app reads `/home`, `/home/{section-id}`, `/shared/sidebar`, and `/articles/{slug}` under `/api/projects/{project}/content`, plus `/collection?prefix=/articles`. No CMS writes are performed.

Bundled snapshots live in `content/`. Individual failed section requests fall back independently. Article failures use bundled JSON and HTML, while a successful empty collection stays empty and remote missing/inactive articles return 404. Related article failures preserve a loaded remote body. Active siblings render by ascending `sortKey`; inactive parents hide descendants. Missing legacy `isActive` flags default to true, matching the source application. The root `/home` controls the browser title, with `Senior Software Engineer` as fallback.

Article HTML is trusted publisher content, as in the original Razor application. Only allow trusted editors to publish it.

## Vercel

Import this directory as a Next.js project. Default build and output settings work; add the above environment variables if overriding defaults. Local fallback JSON and HTML are imported through the server's filesystem and included by Next.js output tracing. No .NET runtime or database connection is required. This repository does not deploy automatically by itself.
