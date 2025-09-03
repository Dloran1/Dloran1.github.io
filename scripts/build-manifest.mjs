import { promises as fs } from 'fs';
import path from 'path';

const ROOT = './articles';
const OUT  = './data/posts.json';

const EX_FILES = new Set(['index.html','404.html','sitemap.html','rss.html','vpn-na-routerze.html']);
const EX_DIRS  = new Set(['drafts','_partials','_includes']);

function normalize(p){ return p.replaceAll('\\','/'); }

async function walk(dir, acc = []) {
  const ents = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EX_DIRS.has(e.name)) continue;
      await walk(p, acc);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      const slug = normalize(p).replace(/^\.\//,'');
      const base = path.basename(slug);
      if (EX_FILES.has(base)) continue;
      acc.push(slug);
    }
  }
  return acc;
}

function parseMeta(html) {
  const metaBlock = html.match(
    /<script\s+type=["']application\/json["']\s+id=["']post-meta["']>([\s\S]*?)<\/script>/i
  );
  if (metaBlock) { try { return JSON.parse(metaBlock[1]); } catch {} }

  const title = (html.match(/<title>([^<]+)<\/title>/i)?.[1] || '').trim();

  let desc = (html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"]*)["'][^>]*>/i
  )?.[1] || '').trim();

  if (!desc) {
    const inArticle = html.match(/<article[\s\S]*?<\/article>/i)?.[0] || html;
    const firstP = inArticle.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '';
    const clean = firstP.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    if (clean) desc = clean.slice(0, 160);
  }

  return { title, desc, status: 'published' };
}

await fs.mkdir('./data', { recursive: true });

const files = await walk(ROOT, []);
const posts = [];

for (const slug of files) {
  const html = await fs.readFile(slug, 'utf8');
  const meta = parseMeta(html);
  if (/\bvpn-na-routerze\.html$/.test(slug)) continue;

  const base = slug.split('/').pop().replace(/\.html$/,'');
  const stat = await fs.stat(slug).catch(() => null);

  posts.push({
    slug,
    title: meta.title || base.replace(/[-_]+/g,' '),
    desc:  meta.desc  || 'Czytaj więcej →',
    date:  meta.date  || (stat ? stat.mtime.toISOString().slice(0,10) : ''),
    tags:  Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
    thumb: meta.thumb || `/assets/img/thumbs/${base}.webp`,
    hero:  meta.hero  || `/assets/img/hero/${base}.webp`,
    status: meta.status || 'published'
  });
}

await fs.writeFile(OUT, JSON.stringify(posts, null, 2), 'utf8');
console.log(`OK: wrote ${posts.length} posts → ${OUT}`);