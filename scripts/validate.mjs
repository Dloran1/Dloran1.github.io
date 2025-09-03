import { promises as fs } from 'fs';

const raw = await fs.readFile('./data/posts.json','utf8').catch(()=> '[]');
const posts = JSON.parse(raw).filter(p => p.status === 'published' && !/\bvpn-na-routerze\.html$/.test(p.slug));

if (!posts.length) { console.log('No posts yet, skipping validation.'); process.exit(0); }

const missing = [];
for (const p of posts) {
  for (const k of ['slug','thumb','hero']) {
    const v = p[k];
    const local = v.startsWith('/') ? `.${v}` : `./${v}`;
    try { await fs.access(local); }
    catch { missing.push({slug:p.slug, field:k, path:local}); }
  }
  const fp = p.slug.startsWith('/') ? `.${p.slug}` : `./${p.slug}`;
  try { await fs.access(fp); }
  catch { missing.push({slug:p.slug, field:'file', path:fp}); }
}
if (missing.length) {
  console.error('❌ Missing files:\n', missing);
  process.exit(1);
}
console.log('✅ All assets present.');