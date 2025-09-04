# Auto SEO (sitemap + RSS) — bez Jekyll

Ten workflow generuje `sitemap.xml` i `feed.xml` **bez włączania Jekylla**.
Działa na każdym pushu do `main/master` z plikami w `/blog/` lub `data/posts.json`.

Co robi:
- zbiera wszystkie `blog/*.html`,
- wyciąga `<title>`, `<meta name="description">` i `<time datetime="...">` (jeśli jest),
- buduje `sitemap.xml` i `feed.xml` w **korzeniu repo**,
- zachowuje istniejący `robots.txt` (tworzy minimalny tylko jeśli go nie ma).

Instrukcja:
1. Skopiuj `.github/workflows/seo.yml` do repo.
2. Upewnij się, że `blog/` zawiera Twoje pliki `.html`.
3. Zrób commit — workflow sam doda/odświeży sitemap i RSS.