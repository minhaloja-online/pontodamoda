/* ==========================================================
   CATÁLOGO
   URL aceita:  ?cat=feminino   ?only=ofertas   ?only=novidades   ?q=termo
   ========================================================== */
import { loadData, state, cfg, esc, catName, filterProducts } from "./store.js";
import { $, $$, mountShell, mountReveals, mountMotion, stagger, productCard, paintFavs } from "./site.js";

const params = new URLSearchParams(location.search);
const view = {
  cat:  params.get("cat")  || "",
  only: params.get("only") || "",
  term: params.get("q")    || "",
  sort: params.get("sort") || "destaque"
};

function pushUrl(){
  const p = new URLSearchParams();
  if(view.cat)  p.set("cat", view.cat);
  if(view.only) p.set("only", view.only);
  if(view.term) p.set("q", view.term);
  if(view.sort !== "destaque") p.set("sort", view.sort);
  const qs = p.toString();
  history.replaceState(null, "", qs ? "?"+qs : location.pathname);
}

function headings(){
  let title = "TODO O CATÁLOGO", eyebrow = "Catálogo", lede = cfg("banda.lede");

  if(view.cat){
    const c = state.categories.find(x=>x.slug===view.cat);
    title = (c?.name || view.cat).toUpperCase();
    eyebrow = "Categoria";
    lede = c?.desc || "";
  } else if(view.only === "ofertas"){
    title = "OFERTAS"; eyebrow = "Preço de virada"; lede = cfg("ofertas.lede");
  } else if(view.only === "novidades"){
    title = "NOVIDADES"; eyebrow = "Chegou agora"; lede = cfg("selecao.lede");
  } else if(view.term){
    title = "BUSCA"; eyebrow = "Resultados para"; lede = `“${view.term}”`;
  }

  $("#catTitle").textContent = title;
  $("#catEyebrow").textContent = eyebrow;
  $("#catLede").textContent = lede || "";
  $("#crumbNow").textContent = view.cat ? catName(view.cat) : title.charAt(0)+title.slice(1).toLowerCase();
  document.title = (view.cat ? catName(view.cat) : "Catálogo") + " — " + cfg("brand.name");
}

function chips(){
  const items = [
    { label:"Tudo",      on: !view.cat && !view.only, set:()=>{ view.cat=""; view.only=""; } },
    ...state.categories.map(c=>({ label:c.name, on: view.cat===c.slug, set:()=>{ view.cat=c.slug; view.only=""; } })),
    { label:"Novidades", on: view.only==="novidades", set:()=>{ view.only="novidades"; view.cat=""; } },
    { label:"Ofertas",   on: view.only==="ofertas",   set:()=>{ view.only="ofertas";   view.cat=""; } }
  ];
  const box = $("#catFilters");
  box.innerHTML = items.map((it,i)=>`<button class="fchip${it.on?" on":""}" data-i="${i}">${esc(it.label)}</button>`).join("");
  box.onclick = e=>{
    const b = e.target.closest("[data-i]");
    if(!b) return;
    items[+b.dataset.i].set();
    view.term = "";
    render();
  };
}

function render(){
  headings();
  chips();
  pushUrl();

  const list = filterProducts(view);
  $("#catCount").textContent = list.length
    ? list.length + (list.length === 1 ? " peça" : " peças")
    : "";

  const grid = $("#catGrid"), empty = $("#catEmpty");
  grid.innerHTML = list.map(p=>productCard(p)).join("");
  empty.hidden = list.length > 0;

  stagger("#catGrid .card");
  paintFavs();
  mountReveals();
  mountMotion();
  requestAnimationFrame(()=>$$("#catGrid .card").forEach(c=>c.classList.add("is-in")));
}

(async ()=>{
  await loadData();
  mountShell();

  $("#sortSel").value = view.sort;
  $("#sortSel").addEventListener("change", e=>{ view.sort = e.target.value; render(); });

  render();
})();
