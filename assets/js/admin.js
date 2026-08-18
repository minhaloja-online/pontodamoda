/* ==========================================================
   PAINEL DO ADMINISTRADOR
   - primeiro acesso vira administrador
   - edita textos, fotos, contatos, categorias e produtos
   ========================================================== */
import { getFirebase, isConfigured } from "./firebase.js";
import { DEFAULT_CONFIG, FIELD_SCHEMA, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from "./defaults.js";
import { slugify, esc, BRL } from "./store.js";

const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];

let fb = null, user = null;
let config = { ...DEFAULT_CONFIG }, cats = [], prods = [], admins = [];

let toastTimer;
function toast(msg){
  const t = $("#toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove("on"), 2600);
}
const msgIn = (sel, txt)=>{ const el=$(sel); el.textContent = txt; setTimeout(()=>{ if(el.textContent===txt) el.textContent=""; }, 3200); };

/* ==========================================================
   ENTRADA
   ========================================================== */
if(!isConfigured){
  $("#loginLede").textContent = "O Firebase ainda não foi configurado.";
  $("#loginErro").textContent = "Preencha assets/js/config.js com os dados do seu projeto Firebase e recarregue esta página.";
  $("#btnEntrar").disabled = $("#btnCriar").disabled = true;
} else {
  start();
}

async function start(){
  fb = await getFirebase();
  const { auth, db, doc, getDoc, onAuthStateChanged } = fb;

  /* já existe algum administrador? */
  let boot = false;
  try{ boot = (await getDoc(doc(db,"meta","bootstrap"))).exists(); }catch(e){}
  if(!boot){
    $("#bootNote").hidden = false;
    $("#loginLede").textContent = "Primeiro acesso: crie a conta que vai administrar o site.";
  }

  onAuthStateChanged(auth, async u=>{
    if(!u){ showLogin(); return; }
    const ok = await ensureAdmin(u);
    if(ok){ user = u; await abrirPainel(); }
    else {
      await fb.signOut(auth);
      $("#loginErro").textContent = "Esse acesso não tem permissão de administrador.";
      showLogin();
    }
  });

  $("#btnEntrar").addEventListener("click", ()=>autenticar("entrar"));
  $("#btnCriar").addEventListener("click", ()=>autenticar("criar"));
  $("#admPass").addEventListener("keydown", e=>{ if(e.key==="Enter") autenticar("entrar"); });
  $("#btnSair").addEventListener("click", ()=>fb.signOut(fb.auth));
}

function showLogin(){ $("#loginView").hidden = false; $("#panelView").hidden = true; }

async function autenticar(modo){
  const email = $("#admEmail").value.trim();
  const pass  = $("#admPass").value;
  $("#loginErro").textContent = "";
  if(!email || pass.length < 6){ $("#loginErro").textContent = "Informe o e-mail e uma senha de pelo menos 6 caracteres."; return; }
  try{
    if(modo === "criar") await fb.createUserWithEmailAndPassword(fb.auth, email, pass);
    else await fb.signInWithEmailAndPassword(fb.auth, email, pass);
  }catch(err){
    const m = {
      "auth/invalid-credential":"E-mail ou senha não conferem.",
      "auth/wrong-password":"Senha incorreta.",
      "auth/user-not-found":"Não existe conta com esse e-mail. Use 'Criar acesso'.",
      "auth/email-already-in-use":"Esse e-mail já tem conta. Use 'Entrar'.",
      "auth/weak-password":"A senha precisa de pelo menos 6 caracteres.",
      "auth/operation-not-allowed":"Ative o login por e-mail e senha no Firebase Console."
    }[err.code] || err.message;
    $("#loginErro").textContent = m;
  }
}

/* primeiro que entra vira administrador */
async function ensureAdmin(u){
  const { db, doc, getDoc, writeBatch, serverTimestamp } = fb;
  try{
    const meAdmin = await getDoc(doc(db,"admins",u.uid));
    if(meAdmin.exists()) return true;

    const boot = await getDoc(doc(db,"meta","bootstrap"));
    if(boot.exists()) return false;

    const batch = writeBatch(db);
    batch.set(doc(db,"admins",u.uid), { email:u.email, criadoEm: serverTimestamp() });
    batch.set(doc(db,"meta","bootstrap"), { claimed:true, uid:u.uid, em: serverTimestamp() });
    await batch.commit();
    toast("Você é o administrador do site");
    return true;
  }catch(err){
    console.error(err);
    return false;
  }
}

/* ==========================================================
   PAINEL
   ========================================================== */
async function abrirPainel(){
  $("#loginView").hidden = true;
  $("#panelView").hidden = false;
  $("#admWho").textContent = user.email;

  await carregar();
  renderConfig();
  renderCats();
  renderProds();
  renderAdmins();

  $$(".adm-tab").forEach(t=>t.addEventListener("click", ()=>{
    $$(".adm-tab").forEach(x=>x.classList.remove("on"));
    t.classList.add("on");
    $$(".adm-panel").forEach(p=>p.hidden = true);
    $("#tab-"+t.dataset.tab).hidden = false;
    window.scrollTo({ top:0, behavior:"smooth" });
  }));

  $("#btnSalvarCfg").addEventListener("click", salvarConfig);
  $("#btnNovaCat").addEventListener("click", ()=>formCategoria(null));
  $("#btnNovoProd").addEventListener("click", ()=>formProduto(null));
  $("#btnSeed").addEventListener("click", publicarInicial);
  $("#btnAddAdm").addEventListener("click", liberarAdmin);
  $("#prodBusca").addEventListener("input", e=>renderProds(e.target.value));
  $$("[data-modal-close]").forEach(b=>b.addEventListener("click", fecharModal));
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") fecharModal(); });
}

async function carregar(){
  const { db, doc, getDoc, collection, getDocs } = fb;
  const [c, ct, pr, ad] = await Promise.all([
    getDoc(doc(db,"config","site")),
    getDocs(collection(db,"categories")),
    getDocs(collection(db,"products")),
    getDocs(collection(db,"admins"))
  ]);
  if(c.exists()) config = { ...DEFAULT_CONFIG, ...c.data() };
  cats  = ct.docs.map(d=>({ id:d.id, ...d.data() })).sort((a,b)=>(a.order??99)-(b.order??99));
  prods = pr.docs.map(d=>({ id:d.id, ...d.data() })).sort((a,b)=>(a.order??999)-(b.order??999));
  admins = ad.docs.map(d=>({ id:d.id, ...d.data() }));
}

/* ==========================================================
   CAMPOS
   ========================================================== */
function campoHTML(key, label, tipo, valor){
  const v = esc(valor ?? "");
  if(tipo === "textarea")
    return `<div class="field"><label>${esc(label)}</label><textarea data-key="${key}">${v}</textarea></div>`;
  if(tipo === "image")
    return `<div class="field imgfield">
      <img class="thumb" src="${v}" alt="">
      <div>
        <label>${esc(label)}</label>
        <input type="text" data-key="${key}" value="${v}" placeholder="cole o endereço da imagem">
        <div class="uploader">
          <label class="upbtn">Enviar foto<input type="file" accept="image/*" data-upload="${key}"></label>
          <small>JPG ou WebP, até 5 MB</small>
        </div>
      </div>
    </div>`;
  return `<div class="field"><label>${esc(label)}</label><input type="${tipo==="url"?"url":"text"}" data-key="${key}" value="${v}"></div>`;
}

function ligarUploads(root=document){
  $$("[data-upload]", root).forEach(inp=>{
    if(inp.dataset.ready) return;
    inp.dataset.ready = "1";
    inp.addEventListener("change", async e=>{
      const file = e.target.files[0];
      if(!file) return;
      if(file.size > 5*1024*1024){ toast("Imagem muito grande (máx. 5 MB)"); return; }
      toast("Enviando foto...");
      try{
        const path = `site/${Date.now()}_${file.name.replace(/[^\w.\-]/g,"_")}`;
        const r = fb.ref(fb.storage, path);
        await fb.uploadBytes(r, file);
        const url = await fb.getDownloadURL(r);
        const wrap = inp.closest(".imgfield") || inp.closest(".field");
        const target = wrap.querySelector(`[data-key="${inp.dataset.upload}"]`);
        if(target) target.value = url;
        const thumb = wrap.querySelector(".thumb");
        if(thumb) thumb.src = url;
        toast("Foto enviada");
      }catch(err){
        console.error(err);
        toast("Não deu pra enviar a foto");
      }
    });
  });
}

/* ==========================================================
   ABA CONTEÚDO
   ========================================================== */
function renderConfig(){
  $("#cfgGroups").innerHTML = FIELD_SCHEMA.map(g=>`
    <div class="adm-group">
      <h3>${esc(g.group)}</h3>
      ${g.fields.map(([k,l,t])=>campoHTML(k,l,t,config[k])).join("")}
    </div>`).join("");

  const igs = config["insta.images"] || DEFAULT_CONFIG["insta.images"];
  $("#igFields").innerHTML = `<div class="grid2">` +
    igs.map((src,i)=>campoHTML("ig"+i, "Foto "+(i+1), "image", src)).join("") + `</div>`;

  ligarUploads();
}

async function salvarConfig(){
  const dados = {};
  $$("#cfgGroups [data-key]").forEach(el=>{ dados[el.dataset.key] = el.value.trim(); });
  dados["insta.images"] = $$("#igFields [data-key]").map(el=>el.value.trim()).filter(Boolean);

  try{
    await fb.setDoc(fb.doc(fb.db,"config","site"), dados, { merge:true });
    config = { ...config, ...dados };
    msgIn("#cfgMsg", "Conteúdo salvo");
    toast("Site atualizado");
  }catch(err){
    console.error(err);
    toast("Não deu pra salvar");
  }
}

/* ==========================================================
   ABA CATEGORIAS
   ========================================================== */
function renderCats(){
  $("#catRows").innerHTML = cats.map(c=>`
    <tr>
      <td><img src="${esc(c.image||"")}" alt=""></td>
      <td>${esc(c.name)} ${c.active===false?'<span class="pill">oculta</span>':""}</td>
      <td style="color:var(--smoke)">catalogo.html?cat=${esc(c.slug)}</td>
      <td>${c.order ?? ""}</td>
      <td class="rowacts">
        <button class="tiny" data-editcat="${c.id}">Editar</button>
        <button class="tiny tiny--danger" data-delcat="${c.id}">Excluir</button>
      </td>
    </tr>`).join("") || `<tr><td colspan="5" style="color:var(--smoke)">Nenhuma categoria ainda.</td></tr>`;

  $$("[data-editcat]").forEach(b=>b.onclick = ()=>formCategoria(cats.find(c=>c.id===b.dataset.editcat)));
  $$("[data-delcat]").forEach(b=>b.onclick = ()=>excluir("categories", b.dataset.delcat, "categoria"));
}

function formCategoria(c){
  const nova = !c;
  c = c || { name:"", slug:"", desc:"", image:"", order:(cats.length+1), active:true };
  abrirModal(`
    <h3>${nova ? "Nova categoria" : "Editar categoria"}</h3>
    <div class="grid2">
      ${campoHTML("name","Nome","text",c.name)}
      ${campoHTML("slug","Endereço (deixe vazio para gerar)","text",c.slug)}
    </div>
    ${campoHTML("desc","Descrição curta","text",c.desc)}
    ${campoHTML("image","Foto da categoria","image",c.image)}
    <div class="grid2">
      ${campoHTML("order","Ordem no menu","text",c.order)}
      <div class="field"><label>Visibilidade</label>
        <label class="switch"><input type="checkbox" data-key="active" ${c.active!==false?"checked":""}> Aparecer no site</label>
      </div>
    </div>
  `, async root=>{
    const g = k=>root.querySelector(`[data-key="${k}"]`);
    const nome = g("name").value.trim();
    if(!nome){ toast("Dê um nome para a categoria"); return false; }
    const dados = {
      name: nome,
      slug: slugify(g("slug").value || nome),
      desc: g("desc").value.trim(),
      image: g("image").value.trim(),
      order: Number(g("order").value) || 99,
      active: g("active").checked
    };
    await salvarDoc("categories", nova ? null : c.id, dados);
    await carregar(); renderCats(); renderProds();
    return true;
  });
}

/* ==========================================================
   ABA PRODUTOS
   ========================================================== */
function renderProds(filtro=""){
  const t = filtro.trim().toLowerCase();
  const list = t ? prods.filter(p=>(p.name+" "+p.cat).toLowerCase().includes(t)) : prods;

  $("#prodRows").innerHTML = list.map(p=>`
    <tr>
      <td><img src="${esc(p.imgA||"")}" alt=""></td>
      <td>${esc(p.name)}</td>
      <td style="color:var(--smoke)">${esc(cats.find(c=>c.slug===p.cat)?.name || p.cat || "—")}</td>
      <td>${BRL(p.price)}${p.oldPrice?` <s style="color:var(--smoke)">${BRL(p.oldPrice)}</s>`:""}</td>
      <td>
        ${p.featured?'<span class="pill on">home</span> ':""}
        ${p.offer?'<span class="pill">oferta</span> ':""}
        ${p.active===false?'<span class="pill">oculto</span>':""}
      </td>
      <td class="rowacts">
        <button class="tiny" data-editprod="${p.id}">Editar</button>
        <button class="tiny tiny--danger" data-delprod="${p.id}">Excluir</button>
      </td>
    </tr>`).join("") || `<tr><td colspan="6" style="color:var(--smoke)">Nenhum produto ainda.</td></tr>`;

  $$("[data-editprod]").forEach(b=>b.onclick = ()=>formProduto(prods.find(p=>p.id===b.dataset.editprod)));
  $$("[data-delprod]").forEach(b=>b.onclick = ()=>excluir("products", b.dataset.delprod, "produto"));
}

function formProduto(p){
  const novo = !p;
  p = p || { name:"", cat:cats[0]?.slug||"", price:0, oldPrice:null, tag:"", imgA:"", imgB:"",
             colors:[], sizes:[], desc:"", featured:true, offer:false, active:true, order:prods.length+1 };

  abrirModal(`
    <h3>${novo ? "Novo produto" : "Editar produto"}</h3>
    ${campoHTML("name","Nome do produto","text",p.name)}
    <div class="grid3">
      <div class="field"><label>Categoria</label>
        <select data-key="cat">${cats.map(c=>`<option value="${esc(c.slug)}" ${c.slug===p.cat?"selected":""}>${esc(c.name)}</option>`).join("")}</select>
      </div>
      ${campoHTML("price","Preço (ex.: 189.90)","text",p.price)}
      ${campoHTML("oldPrice","Preço antigo (opcional)","text",p.oldPrice ?? "")}
    </div>
    <div class="grid2">
      ${campoHTML("imgA","Foto principal","image",p.imgA)}
      ${campoHTML("imgB","Segunda foto (aparece ao passar o mouse)","image",p.imgB)}
    </div>
    <div class="grid3">
      ${campoHTML("colors","Cores (separe por vírgula)","text",(p.colors||[]).join(", "))}
      ${campoHTML("sizes","Tamanhos (separe por vírgula)","text",(p.sizes||[]).join(", "))}
      ${campoHTML("tag","Selo (Novo, Últimas...)","text",p.tag)}
    </div>
    ${campoHTML("desc","Descrição","textarea",p.desc)}
    <div class="grid3">
      ${campoHTML("order","Ordem","text",p.order)}
      <div class="field"><label>Onde aparece</label>
        <label class="switch"><input type="checkbox" data-key="featured" ${p.featured!==false?"checked":""}> Seleção da semana</label>
        <label class="switch"><input type="checkbox" data-key="offer" ${p.offer?"checked":""}> Marcar como oferta</label>
      </div>
      <div class="field"><label>Visibilidade</label>
        <label class="switch"><input type="checkbox" data-key="active" ${p.active!==false?"checked":""}> Aparecer no site</label>
      </div>
    </div>
  `, async root=>{
    const g = k=>root.querySelector(`[data-key="${k}"]`);
    const nome = g("name").value.trim();
    if(!nome){ toast("Dê um nome para o produto"); return false; }
    const num = v=>{ const n = parseFloat(String(v).replace(",",".")); return isNaN(n) ? null : n; };
    const lista = v=>v.split(",").map(s=>s.trim()).filter(Boolean);

    const dados = {
      name: nome,
      cat: g("cat").value,
      price: num(g("price").value) || 0,
      oldPrice: num(g("oldPrice").value),
      imgA: g("imgA").value.trim(),
      imgB: g("imgB").value.trim(),
      colors: lista(g("colors").value),
      sizes: lista(g("sizes").value),
      tag: g("tag").value.trim() || null,
      desc: g("desc").value.trim(),
      order: Number(g("order").value) || 999,
      featured: g("featured").checked,
      offer: g("offer").checked,
      active: g("active").checked
    };
    await salvarDoc("products", novo ? null : p.id, dados);
    await carregar(); renderProds($("#prodBusca").value);
    return true;
  });
}

/* ==========================================================
   ABA FERRAMENTAS
   ========================================================== */
function renderAdmins(){
  $("#admRows").innerHTML = admins.map(a=>`
    <tr>
      <td>${esc(a.email||"—")}</td>
      <td style="color:var(--smoke);font-size:11px">${esc(a.id)}</td>
      <td class="rowacts">${a.id===user.uid ? '<span class="pill on">você</span>'
        : `<button class="tiny tiny--danger" data-deladm="${a.id}">Remover</button>`}</td>
    </tr>`).join("");
  $$("[data-deladm]").forEach(b=>b.onclick = ()=>excluir("admins", b.dataset.deladm, "acesso"));
}

async function liberarAdmin(){
  const uid = $("#novoAdmUid").value.trim();
  const email = $("#novoAdmEmail").value.trim();
  if(uid.length < 10){ toast("Cole o UID da pessoa"); return; }
  try{
    await fb.setDoc(fb.doc(fb.db,"admins",uid), { email, criadoEm: fb.serverTimestamp() }, { merge:true });
    $("#novoAdmUid").value = $("#novoAdmEmail").value = "";
    await carregar(); renderAdmins();
    toast("Acesso liberado");
  }catch(err){ console.error(err); toast("Não deu pra liberar"); }
}

async function publicarInicial(){
  try{
    msgIn("#seedMsg","Publicando...");
    const { db, doc, setDoc, collection, addDoc, getDocs } = fb;

    await setDoc(doc(db,"config","site"), { ...DEFAULT_CONFIG, ...config }, { merge:true });

    const catSnap = await getDocs(collection(db,"categories"));
    if(catSnap.empty) for(const c of DEFAULT_CATEGORIES) await addDoc(collection(db,"categories"), c);

    const prodSnap = await getDocs(collection(db,"products"));
    if(prodSnap.empty) for(const p of DEFAULT_PRODUCTS) await addDoc(collection(db,"products"), p);

    await carregar(); renderConfig(); renderCats(); renderProds();
    msgIn("#seedMsg","Pronto");
    toast("Conteúdo inicial publicado");
  }catch(err){ console.error(err); toast("Não deu pra publicar"); }
}

/* ==========================================================
   GRAVAÇÃO E MODAL
   ========================================================== */
async function salvarDoc(col, id, dados){
  const { db, doc, setDoc, collection, addDoc, serverTimestamp } = fb;
  if(id) await setDoc(doc(db,col,id), dados, { merge:true });
  else await addDoc(collection(db,col), { ...dados, criadoEm: serverTimestamp() });
  toast("Salvo");
}

async function excluir(col, id, rotulo){
  if(!confirm(`Excluir este ${rotulo}? Isso não tem volta.`)) return;
  try{
    await fb.deleteDoc(fb.doc(fb.db,col,id));
    await carregar();
    renderCats(); renderProds(); renderAdmins();
    toast("Excluído");
  }catch(err){ console.error(err); toast("Não deu pra excluir"); }
}

function abrirModal(html, onSalvar){
  const card = $("#modalCard");
  card.innerHTML = html + `
    <div style="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap">
      <button class="btn btn--gold" id="modalSave">Salvar</button>
      <button class="btn" data-modal-close>Cancelar</button>
    </div>`;
  ligarUploads(card);
  $("#modal").classList.add("open");
  document.body.style.overflow = "hidden";

  $$("[data-modal-close]", card).forEach(b=>b.onclick = fecharModal);
  $("#modalSave").onclick = async ()=>{
    const ok = await onSalvar(card);
    if(ok !== false) fecharModal();
  };
}

function fecharModal(){
  $("#modal").classList.remove("open");
  document.body.style.overflow = "";
}
