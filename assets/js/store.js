/* ==========================================================
   STORE — lê o conteúdo do Firebase e entrega pro site
   Se o Firebase não estiver configurado ou o banco estiver
   vazio, cai no conteúdo padrão e o site continua no ar.
   ========================================================== */
import { getFirebase, isConfigured } from "./firebase.js";
import { DEFAULT_CONFIG, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from "./defaults.js";

export const state = {
  config: { ...DEFAULT_CONFIG },
  categories: DEFAULT_CATEGORIES.map((c,i)=>({ id:"seed-"+i, ...c })),
  products: DEFAULT_PRODUCTS.map((p,i)=>({ id:"seed-"+i, ...p })),
  live: false
};

export const cfg = (key, fallback="") =>
  state.config[key] ?? DEFAULT_CONFIG[key] ?? fallback;

export const BRL = n =>
  "R$ " + Number(n||0).toFixed(2).replace(".", ",");

export const slugify = s => String(s||"")
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

export const waLink = msg =>
  "https://wa.me/" + cfg("contato.whatsapp") + "?text=" + encodeURIComponent(msg);

export const catName = slug =>
  state.categories.find(c=>c.slug===slug)?.name || slug || "";

export const discount = p =>
  p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price/p.oldPrice) * 100) : 0;

export const esc = s => String(s??"")
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");

/* ----------------------------------------------------------
   Carregamento
   ---------------------------------------------------------- */
let loading = null;

export function loadData(){
  if(loading) return loading;
  loading = (async ()=>{
    if(!isConfigured) return state;
    try{
      const fb = await getFirebase();
      const { db, doc, getDoc, collection, getDocs } = fb;

      const [cfgSnap, catSnap, prodSnap] = await Promise.all([
        getDoc(doc(db, "config", "site")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "products"))
      ]);

      if(cfgSnap.exists()) state.config = { ...DEFAULT_CONFIG, ...cfgSnap.data() };

      if(!catSnap.empty){
        state.categories = catSnap.docs
          .map(d=>({ id:d.id, ...d.data() }))
          .filter(c=>c.active !== false)
          .sort((a,b)=>(a.order??99)-(b.order??99));
      }

      if(!prodSnap.empty){
        state.products = prodSnap.docs
          .map(d=>({ id:d.id, ...d.data() }))
          .filter(p=>p.active !== false)
          .sort((a,b)=>(a.order??999)-(b.order??999));
      }

      state.live = true;
    }catch(err){
      console.warn("[Ponto da Moda] Não deu pra ler o Firebase, usando conteúdo padrão.", err);
    }
    return state;
  })();
  return loading;
}

/* ----------------------------------------------------------
   Aplicar o conteúdo nos elementos marcados
     data-bind="chave"       -> troca o texto (Enter vira <br>)
     data-bind-src="chave"   -> troca o src da imagem
     data-bind-href="chave"  -> troca o link
   ---------------------------------------------------------- */
export function applyBindings(root=document){
  root.querySelectorAll("[data-bind]").forEach(el=>{
    const v = state.config[el.dataset.bind];
    if(v == null || v === "") return;
    el.innerHTML = esc(v).replace(/\n/g,"<br>");
  });
  root.querySelectorAll("[data-bind-src]").forEach(el=>{
    const v = state.config[el.dataset.bindSrc];
    if(v) el.src = v;
  });
  root.querySelectorAll("[data-bind-href]").forEach(el=>{
    const v = state.config[el.dataset.bindHref];
    if(v) el.href = v;
  });
}

/* ----------------------------------------------------------
   Filtros do catálogo
   ---------------------------------------------------------- */
export function filterProducts({ cat="", term="", only="", sort="destaque" } = {}){
  let list = state.products.slice();

  if(cat) list = list.filter(p=>p.cat === cat);
  if(only === "ofertas") list = list.filter(p=>p.offer || discount(p) > 0);
  if(only === "novidades") list = list.filter(p=>p.tag);

  if(term){
    const t = term.toLowerCase();
    list = list.filter(p =>
      (p.name+" "+catName(p.cat)+" "+(p.desc||"")).toLowerCase().includes(t)
    );
  }

  const sorters = {
    destaque: (a,b)=>(a.order??999)-(b.order??999),
    menor:    (a,b)=>a.price-b.price,
    maior:    (a,b)=>b.price-a.price,
    nome:     (a,b)=>a.name.localeCompare(b.name,"pt-BR"),
    desconto: (a,b)=>discount(b)-discount(a)
  };
  return list.sort(sorters[sort] || sorters.destaque);
}
