<script>
// Конфиг офферов: меняешь ТОЛЬКО здесь
window.OFFERS = {
  nordvpn: {
    id: 'nordvpn',
    variants: {
      // текущий дефолтный оффер
      default: {
        href: 'https://go.nordvpn.net/aff_c?aff_id=2495&offer_id=312&url_id=2584',
        text: 'Zgarnij do -73% + 3 m-ce gratis z NordVPN'
      },
      // пример на будущее
      blackfriday: {
        href: 'https://go.nordvpn.net/aff_c?aff_id=2495&offer_id=312&url_id=2584',
        text: 'NordVPN Black Friday – największe rabaty roku'
      }
    }
  }
};

// Рендер всех CTA-контейнеров на странице
(function(){
  function makeCTA(href, text){
    const wrap = document.createElement('div');
    wrap.className = 'cta';
    wrap.innerHTML = `
      <a class="btn btn-primary" target="_blank" rel="nofollow sponsored noopener" href="${href}">
        ${text}
      </a>
      <p class="cta-note">Reklama • Link partnerski. Kupując wspierasz nasz serwis — bez dodatkowych kosztów dla Ciebie.</p>
    `;
    return wrap;
  }

  function resolveOffer(offerKey){
    // формат ключа: "nordvpn" или "nordvpn:default"
    const [prog, variant='default'] = offerKey.split(':');
    if(!window.OFFERS || !window.OFFERS[prog]) return null;
    const v = window.OFFERS[prog].variants[variant] || window.OFFERS[prog].variants['default'];
    return v || null;
  }

  function renderAll(){
    document.querySelectorAll('[data-offer]').forEach(node=>{
      const offerKey = node.getAttribute('data-offer').trim();
      const res = resolveOffer(offerKey);
      if(!res) return;
      const cta = makeCTA(res.href, res.text);
      node.innerHTML = '';
      node.appendChild(cta);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }
})();
</script>