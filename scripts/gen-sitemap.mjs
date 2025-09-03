import { promises as fs } from 'fs';
const DOMAIN = 'https://Dloran1.github.io';
const raw = await fs.readFile('./data/posts.json','utf8');
const posts = JSON.parse(raw).filter(p => p.status === 'published' && !/\bvpn-na-routerze\.html$/.test(p.slug));
const today = new Date().toISOString().slice(0,10);
const urls = posts.map(p => `
  <url>
    <loc>${DOMAIN}/${encodeURI(p.slug)}</loc>
    <lastmod>${p.date || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${DOMAIN}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  ${urls}
</urlset>`;
await fs.writeFile('sitemap.xml', xml, 'utf8');
console.log('OK: sitemap.xml');
