/* ==========================================================
   SITE — comportamento compartilhado por todas as páginas
   ========================================================== */
import { state, cfg, BRL, waLink, catName, discount, esc, applyBindings } from "./store.js";

export const $  = (s,r=document)=>r.querySelector(s);
export const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ----------------------------------------------------------
   Avisos rápidos
   ---------------------------------------------------------- */
let toastTimer;
export function toast(msg){
  const t = $("#toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove("on"), 2600);
}

/* ----------------------------------------------------------
   Carrinho (guardado no próprio navegador do cliente)
   ---------------------------------------------------------- */
const CART_KEY = "pdm.cart.v1";
export let cart = [];

try{ cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ cart = []; }
const saveCart = ()=>{ try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(e){} };

export function renderCart(){
  const body = $("#cartBody");
  if(body){
    body.innerHTML = cart.length
      ? cart.map((it,i)=>`
        <div class="cart-item">
          <img src="${esc(it.img)}" alt="">
          <div>
            <h4>${esc(it.name)}</h4>
            <span>${it.qty}× ${BRL(it.price)}${it.size?" · "+esc(it.size):""}${it.color?" · "+esc(it.color):""}</span>
          </div>
          <button class="rm" data-rm="${i}">Remover</button>
        </div>`).join("")
      : `<p class="cart-empty">Seu carrinho está vazio.<br>Escolha uma peça no catálogo.</p>`;
  }
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const tEl = $("#cartTotal"); if(tEl) tEl.textContent = BRL(total);
  const n = cart.reduce((s,i)=>s+i.qty,0);
  $$(".cart-badge").forEach(b=>{ b.textContent = n; b.classList.toggle("on", n>0); });
  saveCart();
}

export function addToCart(id, opts={}){
  const p = state.products.find(x=>x.id===id);
  if(!p) return;
  const key = id+"|"+(opts.size||"")+"|"+(opts.color||"");
  const found = cart.find(i=>i.key===key);
  if(found) found.qty++;
  else cart.push({ key, id, name:p.name, price:p.price, img:p.imgA, qty:1, size:opts.size||"", color:opts.color||"" });
  renderCart();
  toast(p.name + " no carrinho");
}

function checkout(){
  if(!cart.length){ toast("Adicione uma peça primeiro"); return; }
  const linhas = cart.map(i=>{
    const det = [i.size,i.color].filter(Boolean).join(", ");
    return `• ${i.qty}× ${i.name}${det?" ("+det+")":""} — ${BRL(i.price*i.qty)}`;
  }).join("\n");
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  window.open(waLink(`Olá! Quero fechar este pedido no site da ${cfg("brand.name")}:\n\n${linhas}\n\nTotal: ${BRL(total)}\n\nPode confirmar a disponibilidade?`),"_blank");
}

/* ----------------------------------------------------------
   Favoritos
   ---------------------------------------------------------- */
const FAV_KEY = "pdm.favs.v1";
let favs = new Set();
try{ favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY)) || []); }catch(e){}
const saveFavs = ()=>{ try{ localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); }catch(e){} };

function paintFavs(){
  $$("[data-fav]").forEach(el=>el.classList.toggle("on", favs.has(el.dataset.fav)));
  $$(".fav-badge").forEach(b=>{ b.textContent = favs.size; b.classList.toggle("on", favs.size>0); });
}

/* ----------------------------------------------------------
   Card de produto
   ---------------------------------------------------------- */
export function productCard(p, animated=true){
  const off = discount(p);
  return `
  <article class="card${animated?" rv":""}" data-id="${esc(p.id)}">
    <div class="card-media">
      <img class="a" src="${esc(p.imgA)}" alt="${esc(p.name)}" loading="lazy">
      <img class="b" src="${esc(p.imgB || p.imgA)}" alt="" aria-hidden="true" loading="lazy">
      <div class="card-tags">
        ${p.tag ? `<span class="tag tag--gold">${esc(p.tag)}</span>` : ""}
        ${off ? `<span class="tag">-${off}%</span>` : ""}
      </div>
      <button class="fav" data-fav="${esc(p.id)}" aria-label="Favoritar ${esc(p.name)}">
        <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5c0 5-7 9.5-7 9.5z"/></svg>
      </button>
      <div class="card-quick">
        <button class="mini" data-qv="${esc(p.id)}">Ver</button>
        <button class="mini mini--solid" data-add="${esc(p.id)}">Adicionar</button>
      </div>
    </div>
    <div class="card-info">
      <p class="card-cat">${esc(catName(p.cat))}</p>
      <h3 class="card-name">${esc(p.name)}</h3>
      <div class="card-price"><b>${BRL(p.price)}</b>${p.oldPrice?`<s>${BRL(p.oldPrice)}</s>`:""}</div>
    </div>
  </article>`;
}

/* ----------------------------------------------------------
   Quick view
   ---------------------------------------------------------- */
let qvState = { id:null, size:null, color:null };

export function openQV(id){
  const p = state.products.find(x=>x.id===id);
  if(!p || !$("#sheet-qv")) return;
  const colors = p.colors?.length ? p.colors : ["Único"];
  const sizes  = p.sizes?.length  ? p.sizes  : ["Único"];
  qvState = { id, size:sizes[0], color:colors[0] };

  $("#qvImg").src = p.imgA; $("#qvImg").alt = p.name;
  $("#qvCat").textContent = catName(p.cat);
  $("#qvName").textContent = p.name;
  $("#qvPrice").textContent = BRL(p.price);
  $("#qvOld").textContent = p.oldPrice ? BRL(p.oldPrice) : "";
  $("#qvDesc").textContent = p.desc || "";
  $("#qvColors").innerHTML = colors.map((c,i)=>`<button class="chip${i===0?" on":""}" data-color="${esc(c)}">${esc(c)}</button>`).join("");
  $("#qvSizes").innerHTML  = sizes.map((s,i)=>`<button class="chip${i===0?" on":""}" data-size="${esc(s)}">${esc(s)}</button>`).join("");
  openSheet("qv");
}

/* ----------------------------------------------------------
   Painéis (carrinho, busca, menu, quick view)
   ---------------------------------------------------------- */
export function openSheet(name){
  const s = $("#sheet-"+name);
  if(!s) return;
  $$(".sheet.open").forEach(x=>{ if(x!==s) x.classList.remove("open"); });
  s.classList.add("open");
  document.body.classList.add("is-locked");
  if(name==="search") setTimeout(()=>$("#searchInput")?.focus(), 320);
}
export function closeSheets(){
  $$(".sheet.open").forEach(s=>s.classList.remove("open"));
  document.body.classList.remove("is-locked");
}

/* ----------------------------------------------------------
   Animações de entrada
   ---------------------------------------------------------- */
const io = new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(en.isIntersecting){ en.target.classList.add("is-in"); io.unobserve(en.target); }
  });
},{ threshold:.12, rootMargin:"0px 0px -6% 0px" });

export function mountReveals(root=document){
  $$(".rv:not(.is-in), .rv-img:not(.is-in), .cutline:not(.is-in), .camp .rv-line:not(.is-in)", root)
    .forEach(el=>{ if(!el.closest(".hero")) io.observe(el); });
}

export function stagger(sel, step=90, mod=4){
  $$(sel).forEach((el,i)=>el.style.setProperty("--d",(i%mod)*step+"ms"));
}

/* ----------------------------------------------------------
   Parallax, spotlight e botões magnéticos
   ---------------------------------------------------------- */
let ticking = false;
function frame(){
  const vh = window.innerHeight;
  $$("[data-parallax]").forEach(el=>{
    const r = el.getBoundingClientRect();
    if(r.bottom < -240 || r.top > vh + 240) return;
    const mid = r.top + r.height/2 - vh/2;
    el.style.transform = "translate3d(0," + (-mid * parseFloat(el.dataset.parallax)).toFixed(1) + "px,0)";
  });
  ticking = false;
}
function requestFrame(){ if(!ticking && !reduced){ ticking = true; requestAnimationFrame(frame); } }

export function mountMotion(){
  if(reduced || !window.matchMedia("(hover:hover)").matches) return;

  $$(".has-spot").forEach(sec=>{
    sec.addEventListener("mousemove",e=>{
      const r = sec.getBoundingClientRect();
      sec.style.setProperty("--mx",(e.clientX-r.left)+"px");
      sec.style.setProperty("--my",(e.clientY-r.top)+"px");
    },{ passive:true });
  });

  $$(".mag:not([data-mag])").forEach(btn=>{
    btn.dataset.mag = "1";
    btn.addEventListener("mousemove",e=>{
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) * .16;
      const y = (e.clientY - r.top - r.height/2) * .28;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener("mouseleave",()=>{ btn.style.transform = ""; });
  });
}

/* ----------------------------------------------------------
   Navegação por categoria (topo, menu e rodapé)
   ---------------------------------------------------------- */
export function mountNav(){
  const cats = state.categories;

  const nav = $("#navCats");
  if(nav) nav.innerHTML =
    cats.map(c=>`<a href="catalogo.html?cat=${esc(c.slug)}">${esc(c.name)}</a>`).join("") +
    `<a href="catalogo.html?only=novidades">Novidades</a>`;

  const menu = $("#menuCats");
  if(menu) menu.innerHTML =
    cats.map(c=>`<a href="catalogo.html?cat=${esc(c.slug)}">${esc(c.name)}</a>`).join("") +
    `<a href="catalogo.html">Todo o catálogo <small>ver tudo</small></a>`;

  const f1 = $("#ftCats1"), f2 = $("#ftCats2");
  if(f1) f1.innerHTML = cats.slice(0,3).map(c=>`<li><a href="catalogo.html?cat=${esc(c.slug)}">${esc(c.name)}</a></li>`).join("")
    + `<li><a href="catalogo.html">Todo o catálogo</a></li>`;
  if(f2) f2.innerHTML = cats.slice(3).map(c=>`<li><a href="catalogo.html?cat=${esc(c.slug)}">${esc(c.name)}</a></li>`).join("")
    + `<li><a href="catalogo.html?only=ofertas">Ofertas</a></li>`;

  const ftWa = $("#ftWhats");
  if(ftWa){ ftWa.href = waLink("Olá! Vim pelo site."); ftWa.textContent = "WhatsApp " + cfg("contato.whatsappLabel"); }
  const ftIg = $("#ftInsta");
  if(ftIg){ ftIg.href = cfg("contato.instagram"); ftIg.textContent = cfg("contato.instagramHandle"); }
}

/* ----------------------------------------------------------
   Busca no painel de busca
   ---------------------------------------------------------- */
function runSearch(q){
  const box = $("#searchResults");
  if(!box) return;
  const term = q.trim().toLowerCase();
  if(!term){ box.innerHTML = ""; return; }
  const hits = state.products.filter(p =>
    (p.name+" "+catName(p.cat)+" "+(p.desc||"")).toLowerCase().includes(term));
  box.innerHTML = hits.length
    ? `<div class="grid-prod" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">
         ${hits.slice(0,8).map(p=>productCard(p,false)).join("")}
       </div>
       <p style="margin-top:22px"><a class="btn btn--ghost" href="catalogo.html?q=${encodeURIComponent(q)}">Ver no catálogo completo</a></p>`
    : `<p class="lede">Nada encontrado para “${esc(q)}”. Chame a gente no WhatsApp que procuramos na loja.</p>`;
  paintFavs();
}

/* ----------------------------------------------------------
   Ligações globais
   ---------------------------------------------------------- */
export function mountShell(){
  applyBindings();
  mountNav();
  renderCart();
  paintFavs();

  const waFloat = $("#waFloat");
  if(waFloat) waFloat.href = waLink(`Olá! Vim pelo site da ${cfg("brand.name")} e tenho interesse em uma peça.`);

  $("#searchInput")?.addEventListener("input", e=>runSearch(e.target.value));

  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeSheets(); });

  document.addEventListener("click", e=>{
    const rm = e.target.closest("[data-rm]");
    if(rm){ cart.splice(+rm.dataset.rm,1); renderCart(); return; }

    const add = e.target.closest("[data-add]");
    if(add){ addToCart(add.dataset.add); return; }

    const qv = e.target.closest("[data-qv]");
    if(qv){ openQV(qv.dataset.qv); return; }

    const fav = e.target.closest("[data-fav]");
    if(fav){
      const id = fav.dataset.fav;
      favs.has(id) ? favs.delete(id) : favs.add(id);
      saveFavs(); paintFavs();
      toast(favs.has(id) ? "Salvo nos favoritos" : "Removido dos favoritos");
      return;
    }

    const color = e.target.closest("[data-color]");
    if(color){ $$("#qvColors .chip").forEach(x=>x.classList.remove("on")); color.classList.add("on"); qvState.color = color.dataset.color; return; }

    const size = e.target.closest("[data-size]");
    if(size){ $$("#qvSizes .chip").forEach(x=>x.classList.remove("on")); size.classList.add("on"); qvState.size = size.dataset.size; return; }

    const sug = e.target.closest("[data-sug]");
    if(sug){ const i = $("#searchInput"); i.value = sug.dataset.sug; runSearch(i.value); return; }

    const w = e.target.closest("[data-wa]");
    if(w){ e.preventDefault(); window.open(waLink(w.dataset.wa),"_blank"); return; }

    const sc = e.target.closest("[data-scroll]");
    if(sc){ closeSheets(); document.querySelector(sc.dataset.scroll)?.scrollIntoView({behavior:reduced?"auto":"smooth"}); return; }

    const open = e.target.closest("[data-open]");
    if(open){ openSheet(open.dataset.open); return; }

    if(e.target.closest("[data-close]")){ closeSheets(); return; }
  });

  $("#qvAdd")?.addEventListener("click", ()=>{ addToCart(qvState.id,{size:qvState.size,color:qvState.color}); closeSheets(); });
  $("#qvWa")?.addEventListener("click", ()=>{
    const p = state.products.find(x=>x.id===qvState.id);
    if(!p) return;
    window.open(waLink(`Olá! Vi o produto ${p.name} (${qvState.color}, tam. ${qvState.size}) no site da ${cfg("brand.name")} e gostaria de consultar a disponibilidade.`),"_blank");
  });
  $("#cartWa")?.addEventListener("click", checkout);
  $("#favBtn")?.addEventListener("click", ()=>{
    toast(favs.size ? favs.size+" peça(s) favoritada(s)" : "Você ainda não favoritou nada");
  });

  const hdr = $("#hdr");
  const sempreSolido = hdr?.hasAttribute("data-solid");
  const onScroll = ()=>{
    if(hdr && !sempreSolido) hdr.classList.toggle("stuck", window.scrollY > 40);
    requestFrame();
  };
  window.addEventListener("scroll", onScroll, { passive:true });
  window.addEventListener("resize", requestFrame, { passive:true });
  onScroll();

  mountMotion();
  mountReveals();
}

export { paintFavs };
