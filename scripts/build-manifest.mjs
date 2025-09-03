import { promises as fs } from 'fs';
import path from 'path';

const ROOT = './articles';
const OUT = './data/posts.json';
const EX_FILES = new Set(['index.html','404.html','sitemap.html','rss.html','vpn-na-routerze.html']);
const EX_DIRS = new Set(['drafts','_partials','_includes']);

function normalize(p){ return p.replaceAll('\\','/'); }

async function walk(dir, acc=[]) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EX_DIRS.has(e.name)) continue;
      await walk(p, acc);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      const slug = normalize(p).replace(/^\.\/?/, '');
      const base = path.basename(slug);
      if (EX_FILES.has(base)) continue;
      acc.push(slug);
    }
  }
  return acc;
}

function parseMeta(html) {
  const m = html.match(/<script\s+type=["']application\/json["']\s+id=["']post-meta["']>([\s\S]*?)<\/script>/i);
  if (m) { try { return JSON.parse(m[1]); } catch {} }
  const title = (html.match(/<title>([^<]+)<\/title>/i) || [,''])[1].trim();
  const desc = (html.match(/<meta\s+name=["']description["']\s+content=["']([^"]*)["'][^>]*>/i) || [,''])[1].trim();
  return { title, desc, status: 'published' };
}

await fs.mkdir('./data', { recursive: true });
let posts = [];
try {
  const files = await walk(ROOT, []);
  for (const slug of files) {
    const html = await fs.readFile(slug,'utf8');
    const meta = parseMeta(html);
    if (/\bvpn-na-routerze\.html$/.test(slug)) continue;
    const base = slug.split('/').pop().replace(/\.html$/,'');
    posts.push({
      slug,
      title: meta.title || base.replace(/[-_]+/g,' '),
      desc: meta.desc || 'Opis do uzupełnienia.',
      date: meta.date || '',
      tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
      thumb: meta.thumb || `/assets/img/thumbs/${base}.webp`,
      hero: meta.hero || `/assets/img/hero/${base}.webp`,
      status: meta.status || 'published'
    });
  }
} catch (e) {
  console.warn('No /articles directory yet, creating empty posts.json');
}
await fs.writeFile(OUT, JSON.stringify(posts, null, 2), 'utf8');
console.log(`OK: wrote ${posts.length} posts → ${OUT}`);
