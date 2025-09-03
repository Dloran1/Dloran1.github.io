// backfill-desc.mjs — дописывает desc в posts.json из HTML статей
import { promises as fs } from 'fs';
import path from 'path';

const JSON_PATH = './data/posts.json';

const PLACEHOLDER_PAT = new RegExp(
  [
    'Treść artykułu do uzupełnienia',
    'Opis do uzupełnienia',
    'Czytaj więcej'
  ].join('|'),
  'i'
);

function strip(html){
  return html
    .replace(/<script[\s\S]*?<\/script>/gi,'')
    .replace(/<style[\s\S]*?<\/style>/gi,'');
}
function untag(s){ return (s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }

function firstParagraph(html){
  const clean = strip(html);
  // сначала ищем в <article>, если нет — по всему документу
  const article = clean.match(/<article[\s\S]*?<\/article>/i)?.[0] || clean;
  const p = article.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]
        || clean.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]
        || '';
  return untag(p) || untag(article).slice(0, 200);
}

(async () => {
  const raw = await fs.readFile(JSON_PATH, 'utf8').catch(()=> null);
  if (!raw) { console.error('posts.json not found'); process.exit(1); }
  const posts = JSON.parse(raw);

  let changed = 0;

  for (const p of posts) {
    // работаем только с опубликованными
    if (p.status && p.status !== 'published') continue;

    const need =
      !p.desc || !p.desc.toString().trim() || PLACEHOLDER_PAT.test(p.desc);

    if (!need) continue;

    // локальный путь к файлу статьи
    const local = p.slug.startsWith('/') ? `.${p.slug}` : `./${p.slug}`;
    try {
      const html = await fs.readFile(local, 'utf8');
      const para = firstParagraph(html);
      if (para && para.length > 0) {
        p.desc = para.length > 160 ? para.slice(0,157) + '…' : para;
        changed++;
        console.log('desc from HTML:', p.slug);
      } else {
        console.log('no text found:', p.slug);
      }
    } catch (e) {
      console.log('skip (file not found):', local);
    }
  }

  if (changed > 0) {
    await fs.writeFile(JSON_PATH, JSON.stringify(posts, null, 2), 'utf8');
    console.log(`OK: updated ${changed} descriptions → ${JSON_PATH}`);
  } else {
    console.log('No descriptions updated.');
  }
})();