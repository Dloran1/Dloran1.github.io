<script>
/* ===== Affiliates central config & renderer ===== */
(function () {
  const OFFERS = {
    nordvpn: {
      url: "https://go.nordvpn.net/aff_c?aff_id=2495&offer_id=312&url_id=2584",
      brand: "NordVPN",
      title: "NordVPN — do −73% + 3 mies.",
      bullets: [
        "Szybkie serwery (WireGuard)",
        "Działa z streamingiem i P2P",
        "30 dni gwarancji zwrotu"
      ],
      primaryLabel: "Pobierz NordVPN",
      secondaryLabel: "Zobacz ofertę"
    }
    // tu później łatwo dodamy kolejne programy/URL-e
  };

  function ctaHTML(o) {
    return `
<section class="cta" role="complementary" aria-label="${o.brand}">
  <h2>${o.title}</h2>
  <ul class="cta-list">
    ${o.bullets.map(li => `<li>${li}</li>`).join("")}
  </ul>
  <div class="btns">
    <a class="btn btn-primary" href="${o.url}" rel="nofollow sponsored noopener" target="_blank" aria-label="${o.primaryLabel}">${o.primaryLabel}</a>
    <a class="btn btn-ghost" href="${o.url}" rel="nofollow sponsored noopener" target="_blank">${o.secondaryLabel}</a>
  </div>
  <div class="cta-note">Link reklamowy (affiliate). Cena dla Ciebie się nie zmienia.</div>
</section>`;
  }

  function renderCTAs() {
    document.querySelectorAll("[data-offer]").forEach(box => {
      const key = (box.getAttribute("data-offer") || "").trim().toLowerCase();
      const offer = OFFERS[key];
      if (!offer) return;
      box.innerHTML = ctaHTML(offer);
      box.classList.add("cta-mounted");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderCTAs);
  } else {
    renderCTAs();
  }

  // expose for future dynamic changes
  window.__AFF__ = { OFFERS, renderCTAs };
})();
</script>