// Minimalist content generator for GitHub Pages (no deps)
// - scans /articles/*.html
// - extracts meta: title, description, date, thumb, hero, tags (from <script id="post-meta"> if present)
// - builds /data/posts.json
// - creates /descriptions/<slug>.txt if missing (from meta description or first <p>)
// - builds /rss.xml and /sitemap.xml

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, 'articles');
const DATA_DIR = path.join(ROOT, 'data');
const DESC_DIR = path.join(ROOT, 'descriptions');

ensureDir(DATA_DIR);
ensureDir(DESC_DIR);

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, {recursive:true}); }
function read(file){ return fs.existsSync(file) ? fs.readFileSync(file,'utf8') : ''; }
function write(file, txt){ fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, txt); }
function stripHtml(s){ return s.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }
function textBetween(html, re){ const m = re.exec(html); return m ? m[1].trim() : ''; }
function shorten(s, n=180){ if(s.length<=n) return s; const cut = s.slice(0,n); const i=cut.lastIndexOf(' '); return (i>100?cut.slice(0,i):cut)+'…'; }
function isoDateFromStr(d){ return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }
function fileMTimeISO(p){ try{ const st = fs.statSync(p); return new Date(st.mtime).toISOString().slice(0,10); } catch{ return new Date().toISOString().slice(0,10); } }

const files = fs.readdirSync(ARTICLES_DIR)
  .filter(f => f.endsWith('.html') && f !== 'index.html');

const posts = [];

for(const fname of files){
  const full = path.join(ARTICLES_DIR, fname);
  const html = read(full);
  const slugPath = `articles/${fname}`;
  const base = fname.replace(/\.html$/,'');
  const descFile = path.join(DESC_DIR, `${base}.txt`);

  // 1) try structured JSON from <script id="post-meta">
  let metaRaw = textBetween(html, /<script[^>]*id\s*=\s*["']post-meta["'][^>]*>([\s\S]*?)<\/script>/i);
  let pm = {};
  try{ if(metaRaw) pm = JSON.parse(metaRaw); } catch{ pm = {}; }

  // 2) Extract fallback fields from HTML
  const h1 = textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const titleTag = textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc = textBetween(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const firstP = textBetween(html, /<p[^>]*>([\s\S]*?)<\/p>/i);
  const ogImg = textBetween(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const firstImg = textBetween(html, /<img[^>]*src=["']([^"']+)["'][^>]*>/i);

  const title = pm.title || h1 || titleTag || base;
  const hero  = pm.hero  || ogImg || firstImg || '';
  const thumb = pm.thumb || hero.replace('/hero/','/thumbs/');
  let desc    = pm.desc || metaDesc || stripHtml(firstP);
  if(!desc) desc = 'Treść artykułu do uzupełnienia.'; // last resort

  // normalize desc (short file for cards)
  const short = shorten(stripHtml(desc), 220);

  // 3) Create description file if missing
  if(!fs.existsSync(descFile)){
    write(descFile, short + '\n');
    console.log(`+ descriptions/${base}.txt`);
  }

  // 4) Date
  const date = isoDateFromStr(pm.date) || fileMTimeISO(full);

  // 5) Tags
  const tags = Array.isArray(pm.tags) ? pm.tags : [];

  // 6) Push to posts
  posts.push({
    slug: slugPath,
    title,
    desc: short,
    date,
    tags,
    thumb: thumb || '',
    hero: hero || '',
    status: 'published'
  });
}

// Sort newest first
posts.sort((a,b)=> (a.date<b.date?1:-1));

// 7) Write posts.json
write(path.join(DATA_DIR,'posts.json'), JSON.stringify(posts, null, 2));
console.log(`✓ data/posts.json (${posts.length} posts)`);

// 8) Build RSS
const site = 'https://dloran1.github.io';
const rssItems = posts.map(p => `
  <item>
    <title>${xmlEsc(p.title)}</title>
    <link>${site}/${p.slug}</link>
    <guid>${site}/${p.slug}</guid>
    <pubDate>${new Date(p.date+'T00:00:00Z').toUTCString()}</pubDate>
    <description><![CDATA[${p.desc}]]></description>
  </item>`).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Dlorgan1 Blog</title>
  <link>${site}/</link>
  <description>Aktualizacje artykułów</description>
  <language>pl</language>
${rssItems}
</channel>
</rss>`;
write(path.join(ROOT,'rss.xml'), rss);
console.log('✓ rss.xml');

// 9) Build sitemap
const urls = posts.map(p => `  <url>
    <loc>${site}/${p.slug}</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;
write(path.join(ROOT,'sitemap.xml'), sitemap);
console.log('✓ sitemap.xml');

function xmlEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }