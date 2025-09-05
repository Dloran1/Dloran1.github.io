# VPN Polska — Info-Projekt 2025

![GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-blue)
![HTML5](https://img.shields.io/badge/made%20with-HTML5-orange)
![CSS3](https://img.shields.io/badge/style-CSS3-blue)
![Status](https://img.shields.io/badge/status-developing-green)

**VPN Polska** to nowy, rozwijający się projekt informacyjny poświęcony tematyce prywatności, bezpieczeństwa w sieci oraz wykorzystania VPN w codziennym życiu.  
Naszym celem jest dostarczenie użytkownikom rzetelnych poradników, testów oraz rankingów, które pomogą w wyborze najlepszego VPN i w pełni świadomym korzystaniu z internetu.

Projekt jest tworzony i rozwijany w oparciu o etalony SEO oraz nowoczesne standardy webowe:  
- **Struktura HTML5 + schema.org (JSON-LD)** dla lepszego zrozumienia przez wyszukiwarki.  
- **Responsywne karty artykułów** i czytelny layout (CSS Grid + Flexbox).  
- **CTA z ofertami partnerów** (NordVPN, Surfshark) z lokalnymi przekierowaniami `/go/...`.  
- **Multijęzyczność** — oprócz polskiej wersji rozwijamy także `/de/` (Niemcy), w planach `/fr/` (Francja) i `/en/` (Anglia).  

---

## 📂 Struktura projektu

```
/                   ← Strona główna (PL)
/blog/              ← Blog (PL)
/de/                ← Strona główna (DE)
/de/blog/           ← Blog (DE)
/assets/style.css   ← Style globalne
/assets/img/        ← Grafiki (hero 1200×628, thumbs 400×210)
/rss.xml            ← Kanał RSS PL
/feed.xml           ← Alias RSS PL
/de/rss.xml         ← Kanał RSS DE
/de/feed.xml        ← Alias RSS DE
/sitemap.xml        ← Pełna mapa strony (PL + DE)
```

---

## ✨ Główne elementy każdej strony

- **Hero image** — sztywne rozmiary 1200×628, optymalizacja dla OpenGraph/Twitter.  
- **Table of Contents (TOC)** — automatyczny spis treści na początku artykułu.  
- **CTA (Call to Action)** — linki do `/go/nordvpn.html` i `/go/surfshark.html`.  
- **Top 5 VPN w Polsce/Niemczech** — krótki ranking w każdym artykule (Google lubi listy).  
- **FAQ** — sekcja rozwijanych pytań/odpowiedzi.  
- **YouTube block** — embedowane wideo na końcu artykułu.  
- **Breadcrumbs** — nawigacja wewnętrzna + schema.org.  
- **JSON-LD Article** — z danymi autora, wydawcy, datą publikacji i aktualizacji.  

---

## 🌍 Multijęzyczność

Projekt jest rozwijany w wielu językach, aby dotrzeć do szerszego grona odbiorców:  
- 🇵🇱 Polska — `/` i `/blog/`  
- 🇩🇪 Niemcy — `/de/` i `/de/blog/`  
- 🇫🇷 Francja — (planowane) `/fr/`  
- 🇬🇧 Anglia — (planowane) `/en/`  

Dzięki `hreflang` wyszukiwarki otrzymują jasny sygnał, która wersja językowa powinna być wyświetlana użytkownikowi.

---

## 🛠️ Techniczne podstawy

- **Hosting**: GitHub Pages (stabilność, szybkość, darmowy CDN).  
- **SEO**: kanoniczne adresy, OpenGraph, Twitter Cards, schema.org.  
- **Optymalizacja**: preload obrazów, atrybuty `width`/`height`, lazy-loading miniaturek.  
- **Dostępność**: aria-labels, focus states, kontrast, mobile-first.  

---

## 🎯 Cele projektu

1. **Budowa wartościowego zasobu wiedzy** — poradniki, testy, rankingi VPN.  
2. **Pozycjonowanie SEO** — wysokiej jakości unikalne teksty (2000–2500 słów, unikalność 85%+).  
3. **Monetyzacja** — współpraca z partnerami (NordVPN, Surfshark, wkrótce kolejne oferty).  
4. **Ekspansja międzynarodowa** — skalowanie na inne rynki i języki.  
5. **Rozszerzenie tematyczne** — w przyszłości dodatkowe kategorie produktów i usług (nie tylko VPN).  

---

## 📊 Status projektu

- [x] Etalonowy szablon stron (PL)  
- [x] 47 artykułów PL (przygotowane)  
- [ ] Publikacja 47 artykułów PL na GitHub Pages  
- [ ] Sitemap i RSS → zgłoszenie do Google Search Console  
- [ ] Rozwój wersji niemieckiej `/de/`  
- [ ] Kolejne wersje językowe `/fr/`, `/en/`  

---

## 🔧 Uruchomienie lokalnie

Aby podejrzeć stronę bezpośrednio na komputerze (bez GitHub Pages):

```bash
cd repozytorium
python3 -m http.server 8000
```

Następnie w przeglądarce otwórz:  
👉 [http://localhost:8000](http://localhost:8000)

---

## 🚀 Jak dodać nowy artykuł

1. Utwórz plik w `/blog/` lub w `/de/blog/` (dla wersji DE).  
2. Dodaj obrazki:
   - Hero → `/assets/img/hero/nazwa.webp` (1200×628).  
   - Thumb → `/assets/img/thumbs/nazwa.webp` (400×210).  
3. Wklej szablon etalonu (TOC, CTA, FAQ, Top-5, YouTube).  
4. Uzupełnij `sitemap.xml` i `rss.xml`.  
5. Sprawdź w Google Search Console (indeksacja).  

---

## 📈 Roadmap

- [x] Etalon szablonu (PL)  
- [x] 47 artykułów PL  
- [ ] Publikacja i test indeksacji (Google)  
- [ ] Rozwój `/de/` (Niemcy)  
- [ ] Rozwój `/fr/` (Francja)  
- [ ] Rozwój `/en/` (Anglia)  
- [ ] Rozszerzenie na inne produkty (np. bezpieczeństwo online, fintech)

---

## 📜 Licencja

© 2025 **VPN Polska**  
Wszystkie prawa zastrzeżone.  

---

## 👤 Autor

**Denys Shchur** — praktyk VPN i SEO.  
Kontakt: [denger88@gmail.com](mailto:denger88@gmail.com)
