<script>
// ЕДИНОЕ МЕСТО ДЛЯ ССЫЛОК
window.AFF = {
  nordvpn: {
    name: "NordVPN",
    // сюда вставь ТВОЙ актуальный трекинговый URL из CJ
    url: "https://go.nordvpn.net/aff_c?aff_id=2495&offer_id=312&url_id=2584",
    note: "До 73% скидки + 3 мес. бесплатно"
  }
};

// Автоподстановка ссылок в кнопки .js-aff
(function () {
  function applyOffers() {
    document.querySelectorAll('[data-offer]').forEach(function (el) {
      var key = el.getAttribute('data-offer');
      if (window.AFF && window.AFF[key] && window.AFF[key].url) {
        el.setAttribute('href', window.AFF[key].url);
        el.classList.add('cta-mounted');
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOffers);
  } else {
    applyOffers();
  }
})();
</script>