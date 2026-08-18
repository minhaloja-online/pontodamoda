/* ==========================================================
   ENVIO DE IMAGENS — sem Firebase Storage
   ----------------------------------------------------------
   Três caminhos, todos gratuitos:

   1. github     — grava a foto na pasta /img do próprio
                   repositório. Não precisa de mais nenhuma
                   conta além da que você já tem.
   2. cloudinary — envio direto do navegador com "upload
                   preset" não assinado. 25 GB grátis.
   3. imgbb      — o mais simples: uma chave de API e pronto.

   Toda foto passa por uma compressão no navegador antes de
   subir: no máximo 1600px de largura, convertida para WebP.
   Uma foto de 4 MB do celular costuma sair com 150 a 300 KB.
   ========================================================== */

const slugFile = s => String(s||"foto")
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/\.[^.]+$/,"")
  .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "foto";

/* ----------------------------------------------------------
   Compressão no navegador
   ---------------------------------------------------------- */
export async function comprimir(file, maxLargura = 1600, qualidade = 0.82){
  if(!file.type.startsWith("image/") || file.type === "image/svg+xml") return { blob:file, ext:"" };

  let bmp;
  try{ bmp = await createImageBitmap(file); }
  catch(e){ return { blob:file, ext:"" }; }

  const escala = Math.min(1, maxLargura / bmp.width);
  const w = Math.round(bmp.width * escala);
  const h = Math.round(bmp.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();

  let blob = await new Promise(r=>canvas.toBlob(r, "image/webp", qualidade));
  let ext = "webp";
  if(!blob){
    blob = await new Promise(r=>canvas.toBlob(r, "image/jpeg", qualidade));
    ext = "jpg";
  }
  if(!blob || blob.size >= file.size) return { blob:file, ext:"" };
  return { blob, ext };
}

const paraBase64 = blob => new Promise((ok, erro)=>{
  const r = new FileReader();
  r.onload = ()=>ok(String(r.result).split(",")[1]);
  r.onerror = erro;
  r.readAsDataURL(blob);
});

/* ----------------------------------------------------------
   Envio
   ---------------------------------------------------------- */
export async function enviarImagem(file, cfg = {}){
  if(!cfg.provider) throw new Error("Escolha um serviço de imagens na aba Ferramentas.");

  const { blob, ext } = await comprimir(file);
  const nome = slugFile(file.name);
  const extensao = ext || (file.name.split(".").pop() || "jpg").toLowerCase();

  if(cfg.provider === "github")     return enviarGithub(blob, `${nome}.${extensao}`, cfg);
  if(cfg.provider === "cloudinary") return enviarCloudinary(blob, `${nome}.${extensao}`, cfg);
  if(cfg.provider === "imgbb")      return enviarImgbb(blob, nome, cfg);

  throw new Error("Serviço de imagens desconhecido.");
}

/* --- GitHub: commita o arquivo em /img do repositório ---- */
async function enviarGithub(blob, nomeArquivo, cfg){
  const { ghOwner, ghRepo, ghToken } = cfg;
  const branch = cfg.ghBranch || "main";
  if(!ghOwner || !ghRepo || !ghToken) throw new Error("Preencha usuário, repositório e token do GitHub.");

  const d = new Date();
  const pasta = `img/${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  const caminho = `${pasta}/${Date.now()}-${nomeArquivo}`;
  const conteudo = await paraBase64(blob);

  const r = await fetch(`https://api.github.com/repos/${ghOwner}/${ghRepo}/contents/${caminho}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${ghToken}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: `Foto: ${nomeArquivo}`, content: conteudo, branch })
  });

  const dados = await r.json();
  if(!r.ok) throw new Error(dados.message || "O GitHub recusou o envio.");
  return dados.content.download_url;
}

/* --- Cloudinary: upload preset não assinado --------------- */
async function enviarCloudinary(blob, nomeArquivo, cfg){
  const { cloudName, preset } = cfg;
  if(!cloudName || !preset) throw new Error("Preencha o cloud name e o upload preset do Cloudinary.");

  const form = new FormData();
  form.append("file", blob, nomeArquivo);
  form.append("upload_preset", preset);
  if(cfg.pasta) form.append("folder", cfg.pasta);

  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method:"POST", body:form });
  const dados = await r.json();
  if(!r.ok) throw new Error(dados.error?.message || "O Cloudinary recusou o envio.");
  return dados.secure_url;
}

/* --- ImgBB ------------------------------------------------ */
async function enviarImgbb(blob, nome, cfg){
  if(!cfg.imgbbKey) throw new Error("Preencha a chave da API do ImgBB.");

  const form = new FormData();
  form.append("image", await paraBase64(blob));
  form.append("name", nome);

  const r = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(cfg.imgbbKey)}`, { method:"POST", body:form });
  const dados = await r.json();
  if(!dados.success) throw new Error(dados.error?.message || "O ImgBB recusou o envio.");
  return dados.data.url;
}
