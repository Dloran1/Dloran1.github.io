// Generator (no deps):
// - Рекурсивно сканит /articles (в т.ч. подпапки)
// - Достаёт мета (из <script id="post-meta"> и/или из HTML)
// - Создаёт/обновляет: data/posts.json, rss.xml, sitemap.xml
// - Создаёт descriptions/<slug>.txt, если файла нет
// - Аккуратно встраивает <script src="/assets/js/lead.js" defer> в конец каждой статьи, если его нет

const fs = require('fs');
const path = require('path');

const ROOT   = process.cwd();
const SITE   = 'https://dloran1.github.io';
const A_DIR  = path.join(ROOT, 'articles');
const D_DIR  = path.join(ROOT, 'descriptions');
const DATA   = path.join(ROOT, 'data');

ensureDir(D_DIR);
ensureDir(DATA);

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function read(p){ return fs.existsSync(p) ? fs.readFileSync(p,'utf8') : ''; }
function write(p, txt){ fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, txt); }
function stripHtml(s){ return s.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }
function between(html, re){ const m = re.exec(html); return m ? m[1].trim() : ''; }
function short(s, n=220){ s = String(s); if(s.length<=n) return s; const cut=s.slice(0,n); const i=cut.lastIndexOf(' '); return (i>120?cut.slice(0,i):cut)+'…'; }
function iso(d){ return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }
function mtimeISO(p){ try{ const st=fs.statSync(p); return new Date(st.mtime).toISOString().slice(0,10);}catch{ return new Date().toISOString().slice(0,10);} }
function xmlEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function walk(dir){
  const out=[];
  for(const name of fs.readdirSync(dir)){
    const fp = path.join(dir,name);
    const st = fs.statSync(fp);
    if(st.isDirectory()) out.push(...walk(fp));
    else if(st.isFile() && name.endsWith('.html') && name!=='index.html') out.push(fp);
  }
  return out;
}

const files = fs.existsSync(A_DIR) ? walk(A_DIR) : [];
const posts = [];

for(const full of files){
  const rel   = path.posix.join('articles', path.relative(A_DIR, full).split(path.sep).join('/'));
  const base  = rel.replace(/^articles\//,'').replace(/\.html$/,'');
  const html0 = read(full);

  // встройка lead.js (если нет)
  if (!/assets\/js\/lead\.js/.test(html0)){
    const injected = html0.replace(/<\/body>\s*<\/html>\s*$/i,
      '  <script src="/assets/js/lead.js" defer></script>\n</body>\n</html>\n');
    if(injected !== html0){
      write(full, injected);
      console.log(`patched lead.js -> ${rel}`);
    }
  }
  const html = read(full);

  // Сначала пробуем JSON из <script id="post-meta">
  let pm = {};
  const metaRaw = between(html, /<script[^>]*id=["']post-meta["'][^>]*>([\s\S]*?)<\/script>/i);
  try{ if(metaRaw) pm = JSON.parse(metaRaw); }catch{}

  const h1       = between(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const titleTag = between(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc = between(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const firstP   = between(html, /<p[^>]*>([\s\S]*?)<\/p>/i);
  const ogImg    = between(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  const firstImg = between(html, /<img[^>]*src=["']([^"']+)["']/i);

  const title = pm.title || h1 || titleTag || base;
  const hero  = pm.hero  || ogImg || firstImg || '';
  const thumb = pm.thumb || (hero ? hero.replace('/hero/','/thumbs/') : '');
  let desc    = pm.desc  || metaDesc || stripHtml(firstP) || 'Treść artykułu do uzupełnienia.';

  const descShort = short(desc);

  // descriptions/<slug>.txt — создадим, если нет
  const descFile = path.join(D_DIR, `${base}.txt`);
  if(!fs.existsSync(descFile)){
    write(descFile, descShort + '\n');
    console.log(`+ descriptions/${base}.txt`);
  }

  const date = iso(pm.date) || mtimeISO(full);
  const tags = Array.isArray(pm.tags) ? pm.tags : [];

  posts.push({
    slug: rel,
    title,
    desc: descShort,
    date,
    tags,
    thumb: thumb || '',
    hero: hero || '',
    status: 'published'
  });
}

// newest first
posts.sort((a,b)=> a.date<b.date ? 1 : -1);

// posts.json
write(path.join(DATA,'posts.json'), JSON.stringify(posts,null,2));
console.log(`✓ data/posts.json (${posts.length})`);

// rss.xml
const rssItems = posts.map(p=>`
  <item>
    <title>${xmlEsc(p.title)}</title>
    <link>${SITE}/${p.slug}</link>
    <guid>${SITE}/${p.slug}</guid>
    <pubDate>${new Date(p.date+'T00:00:00Z').toUTCString()}</pubDate>
    <description><![CDATA[${p.desc}]]></description>
  </item>`).join('\n');

write(path.join(ROOT,'rss.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Dlorgan1 Blog</title>
  <link>${SITE}/</link>
  <description>Aktualizacje artykułów</description>
  <language>pl</language>
${rssItems}
</channel></rss>`);
console.log('✓ rss.xml');

// sitemap.xml
const urls = posts.map(p=>`  <url>
    <loc>${SITE}/${p.slug}</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

write(path.join(ROOT,'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
${urls}
</urlset>`);
console.log('✓ sitemap.xml');