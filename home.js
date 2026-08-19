/* ==========================================================
   HOME
   ========================================================== */
import { loadData, state, cfg, BRL, esc, discount, applyBindings } from "./store.js";
import { $, $$, mountShell, mountReveals, mountMotion, stagger, productCard, paintFavs, reduced } from "./site.js";

function revealHero(){
  const c = $("#curtain");
  if(!c || c.classList.contains("done")) return;
  c.classList.add("done");
  $$(".hero .rv, .hero .rv-line").forEach(el=>el.classList.add("is-in"));
}
window.addEventListener("load", ()=>setTimeout(revealHero, reduced ? 0 : 1150));
setTimeout(revealHero, 2800);

(async ()=>{
  await loadData();
  mountShell();

  /* faixa rolante */
  const parts = [cfg("marquee.a"), cfg("marquee.b"), cfg("marquee.a"), cfg("marquee.c")];
  $("#mqTrack").innerHTML = [...parts, ...parts].map(t=>`<span>${esc(t)}</span>`).join("");

  /* categorias em bento */
  $("#bentoGrid").innerHTML = state.categories.slice(0,6).map(c=>`
    <a class="tile" href="catalogo.html?cat=${esc(c.slug)}">
      <img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy">
      <span class="tile-veil"></span>
      <span class="tile-txt">
        <span><h3>${esc(c.name)}</h3><p>${esc(c.desc||"")}</p></span>
        <span class="tile-arrow"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
      </span>
    </a>`).join("");

  /* seleção da semana */
  const destaques = state.products.filter(p=>p.featured).slice(0,8);
  const lista = destaques.length ? destaques : state.products.slice(0,8);
  $("#prodGrid").innerHTML = lista.map(p=>productCard(p)).join("");
  stagger("#prodGrid .card");

  /* ofertas */
  const ofertas = state.products.filter(p=>p.offer || discount(p) > 0).slice(0,3);
  $("#offerGrid").innerHTML = ofertas.map(o=>`
    <article class="offer rv">
      <div class="offer-img">
        <img src="${esc(o.imgA)}" alt="${esc(o.name)}" loading="lazy">
        ${discount(o) ? `<span class="offer-off">-${discount(o)}%</span>` : ""}
      </div>
      <div>
        <p class="offer-lim">Limited</p>
        <h3>${esc(o.name)}</h3>
        <div class="card-price"><b>${BRL(o.price)}</b>${o.oldPrice?`<s>${BRL(o.oldPrice)}</s>`:""}</div>
        <button class="mini" style="margin-top:12px;flex:none;padding:10px 16px" data-qv="${esc(o.id)}">Ver peça</button>
      </div>
    </article>`).join("");
  stagger("#offerGrid .offer", 110, 3);

  /* instagram */
  const imgs = cfg("insta.images") || [];
  const igUrl = cfg("contato.instagram");
  $("#instaGrid").innerHTML = imgs.map(src=>`
    <a class="ig" href="${esc(igUrl)}" target="_blank" rel="noopener" aria-label="Ver no Instagram">
      <img src="${esc(src)}" alt="" loading="lazy">
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>
    </a>`).join("");
  $("#instaCta").href = igUrl;

  /* mapa */
  $("#mapFrame").src = "https://www.google.com/maps?q=" + encodeURIComponent(cfg("loja.mapQuery")) + "&z=14&output=embed";

  applyBindings();
  paintFavs();
  mountReveals();
  mountMotion();
})();
