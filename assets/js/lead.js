// assets/js/lead.js
(function () {
  try {
    // slug текущей статьи: .../articles/<slug>.html  ->  <slug>
    var slug = location.pathname.split('/').pop().replace(/\.[^/.]+$/, '');
    var url = '/descriptions/' + slug + '.txt?v=' + Date.now(); // cache-buster

    fetch(url)
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (text) {
        if (!text) return;

        // 1) если есть параграф-заглушка — заменяем его
        var re = /(Treść artykułu do uzupełnienia|Opis do uzupełnienia|Текст статьи для заполнения|Article content placeholder)/i;
        var ph = Array.from(document.querySelectorAll('p'))
          .find(function (p) { return re.test((p.textContent || '').trim()); });

        if (ph) {
          ph.textContent = text;
          return;
        }

        // 2) иначе — добавим лидовый абзац в начало статьи
        var container =
          document.querySelector('article') ||
          document.querySelector('.article') ||
          document.querySelector('.wrap') ||
          document.body;

        var p = document.createElement('p');
        p.className = 'lead';
        p.textContent = text;
        container.prepend(p);
      })
      .catch(function () { /* молча игнорим */ });
  } catch (e) { /* no-op */ }
})();