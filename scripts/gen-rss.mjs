import { promises as fs } from 'fs';
const DOMAIN = 'https://Dloran1.github.io';
const raw = await fs.readFile('./data/posts.json','utf8');
const posts = JSON.parse(raw).filter(p => p.status === 'published' && !/\bvpn-na-routerze\.html$/.test(p.slug))
  .sort((a,b)=> (b.date||'').localeCompare(a.date||''));
const now = new Date().toUTCString();
const items = posts.map(p => `
  <item>
    <title>${p.title}</title>
    <link>${DOMAIN}/${encodeURI(p.slug)}</link>
    <guid>${DOMAIN}/${encodeURI(p.slug)}</guid>
    <pubDate>${new Date(p.date || Date.now()).toUTCString()}</pubDate>
    <description><![CDATA[${p.desc}]]></description>
  </item>`).join('');
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
 <channel>
  <title>VPN Blog</title>
  <link>${DOMAIN}/</link>
  <description>Nowe artykuły o VPN</description>
  <language>pl-PL</language>
  <lastBuildDate>${now}</lastBuildDate>
  ${items}
 </channel>
</rss>`;
await fs.writeFile('rss.xml', rss, 'utf8');
console.log('OK: rss.xml');
