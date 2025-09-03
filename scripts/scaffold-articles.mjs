import { promises as fs } from 'fs';
import path from 'path';
const DOMAIN = 'https://Dloran1.github.io';
const SLUGS = './config/slugs.txt';
function toTitle(s){ return s.replace(/[-_]+/g,' ').replace(/\b\w/g, m=>m.toUpperCase()); }
const raw = await fs.readFile(SLUGS,'utf8').catch(()=>'');
const slugs = raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
await fs.mkdir('articles', { recursive: true });
for (const s of slugs) {
  if (!s.endsWith('.html')) continue;
  if (s === 'vpn-na-routerze.html') continue;
  const file = path.join('articles', s);
  try { await fs.access(file); console.log('skip (exists):', file); continue; } catch {}
  const base = s.replace(/\.html$/,'');
  const meta = {
    slug: `articles/${s}`,
    title: toTitle(base),
    desc: 'Opis do uzupełnienia.',
    date: new Date().toISOString().slice(0,10),
    tags: [],
    thumb: `/assets/img/thumbs/${base}.webp`,
    hero: `/assets/img/hero/${base}.webp`,
    status: 'published'
  };
  const html = `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.desc}">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="canonical" href="https://Dloran1.github.io/${meta.slug}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.desc}">
  <meta property="og:url" content="https://Dloran1.github.io/${meta.slug}">
  <meta property="og:image" content="https://Dloran1.github.io${meta.hero}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.desc}">
  <meta name="twitter:image" content="https://Dloran1.github.io${meta.hero}">
  <script type="application/json" id="post-meta">${JSON.stringify(meta)}</script>
</head>
<body>
  <div class="wrap">
    <article class="article">
      <h1>${meta.title}</h1>
      <figure class="hero"><img src="${meta.hero}" width="1200" height="628" alt=""><figcaption>${meta.title}</figcaption></figure>
      <p>Treść artykułu do uzupełnienia.</p>
    </article>
  </div>
</body>
</html>`;
  await fs.writeFile(file, html, 'utf8');
  console.log('created:', file);
}
console.log('Scaffold complete.');
