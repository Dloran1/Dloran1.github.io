// build-manifest.mjs — парсит ТОЛЬКО из HTML контента
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = './articles';
const OUT  = './data/posts.json';

// что игнорим
const EX_FILES = new Set(['index.html','404.html','sitemap.html','rss.html','vpn-na-routerze.html']);
const EX_DIRS  = new Set(['drafts','_partials','_includes']);

function normalize(p){ return p.replaceAll('\\','/'); }
function strip(html){ return html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,''); }
function untag(s){ return s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }

// рекурсивный обход /articles
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

// вытягиваем из HTML: h1, первый абзац, дату, теги, картинку
function extractFromHtml(html) {
  const clean = strip(html);

  // область статьи, если есть
  const articleBlock = clean.match(/<article[\s\S]*?<\/article>/i)?.[0] || clean;

  // title: h1 в статье, иначе <title>, иначе имя файла
  const h1 = untag(articleBlock.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
  const titleTag = untag(clean.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');

  // desc: первый <p> в article; если нет — первый <p> в документе; если нет — первые 200 символов текста
  let firstP = articleBlock.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1];
  if (!firstP) firstP = clean.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1];
  let desc = untag(firstP || '');
  if (!desc) {
    const text = untag(articleBlock);
    desc = text.slice(0, 200);
  }

  // дата: <time datetime="YYYY-MM-DD"> в article или во всём доке; иначе og:published_time; иначе пусто (потом возьмём mtime)
  let date =
    articleBlock.match(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/i)?.[1] ||
    clean.match(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/i)?.[1] ||
    clean.match(/property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    '';

  if (date) date = (new Date(date)).toISOString().slice(0,10);

  // теги: <meta name="keywords" content="a,b,c"> И/ИЛИ <a rel="tag"> И/ИЛИ data-tags="a,b"
  const kw = clean.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';
  const kwTags = kw.split(',').map(s=>s.trim()).filter(Boolean);

  const relTags = [...clean.matchAll(/<a[^>]*rel=["']tag["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m=>untag(m[1])).filter(Boolean);

  const dataTags = clean.match(/<article[^>]*data-tags=["']([^"']+)["']/i)?.[1] || '';
  const dataTagsArr = dataTags.split(',').map(s=>s.trim()).filter(Boolean);

  const tags = Array.from(new Set([...kwTags, ...relTags, ...dataTagsArr]));

  // hero/thumb: <img class="hero"> или og:image; иначе первая картинка в article; иначе дефолтные пути
  const heroAttr = articleBlock.match(/<img[^>]*class=["'][^"']*\bhero\b[^"']*["'][^>]*src=["']([^"']+)["']/i)?.[1] ||
                   clean.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
                   articleBlock.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)?.[1] ||
                   '';

  return { h1, titleTag, desc, date, tags, heroAttr };
}

await fs.mkdir('./data', { recursive: true });
const files = await walk(ROOT, []);
const posts = [];

for (const slug of files) {
  const html = await fs.readFile(slug, 'utf8');
  const { h1, titleTag, desc, date, tags, heroAttr } = extractFromHtml(html);

  const base = slug.split('/').pop().replace(/\.html$/,'');
  const stat = await fs.stat(slug).catch(() => null);

  // финальные поля
  const title = h1 || titleTag || base.replace(/[-_]+/g,' ');
  const safeDesc = (desc || 'Czytaj więcej →').slice(0, 160);
  const finalDate = date || (stat ? stat.mtime.toISOString().slice(0,10) : '');

  // нормализуем hero/thumb
  const hero = heroAttr || `/assets/img/hero/${base}.webp`;
  const thumb = `/assets/img/thumbs/${base}.webp`;

  // статус: если есть noindex в robots или data-status="draft" → draft
  const isNoindex = /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["']/i.test(html);
  const isDraftData = /<article[^>]*data-status=["']draft["']/i.test(html);
  const status = (isNoindex || isDraftData) ? 'draft' : 'published';

  posts.push({
    slug,
    title,
    desc: safeDesc,
    date: finalDate,
    tags,
    thumb,
    hero,
    status
  });
}

// пишем манифест
await fs.writeFile(OUT, JSON.stringify(posts, null, 2), 'utf8');
console.log(`OK: wrote ${posts.length} posts → ${OUT}`);