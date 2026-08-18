/* ==========================================================
   CONTEÚDO PADRÃO
   ----------------------------------------------------------
   É o que aparece antes de existir qualquer coisa no Firebase.
   No painel do admin, o botão "Publicar conteúdo inicial"
   copia tudo isto para o banco e a partir daí tudo é editável.
   ========================================================== */

export const DEFAULT_CONFIG = {
  "brand.name": "PONTO DA MODA",

  "hero.eyebrow": "Ponto da Moda",
  "hero.title1": "SEU ESTILO",
  "hero.title2": "COMEÇA AQUI.",
  "hero.lede": "Moda feminina, masculina e infantil para quem gosta de vestir personalidade.",
  "hero.cta1": "Explorar coleção",
  "hero.cta2": "Comprar pelo WhatsApp",
  "hero.image": "https://picsum.photos/seed/pdm-hero-01/1800/2200",
  "hero.meta1": "Loja física no Cipoal",
  "hero.meta2": "Santarém — Pará",

  "marquee.a": "Ponto da Moda",
  "marquee.b": "Moda para todos os momentos",
  "marquee.c": "Estilo para toda a família",

  "bento.eyebrow": "Categorias",
  "bento.title": "ENCONTRE O\nSEU ESTILO",
  "bento.lede": "Seis frentes da loja, das peças do dia a dia aos detalhes que fecham o look.",

  "editorial.eyebrow": "Editorial",
  "editorial.title": "VISTA\nSUA\nPERSONALIDADE.",
  "editorial.lede": "Peças escolhidas para acompanhar diferentes momentos, estilos e histórias. A gente separa, você prova, e leva só o que tem a sua cara.",
  "editorial.image": "https://picsum.photos/seed/pdm-editorial/1200/1500",
  "editorial.tag": "Coleção 2026",

  "selecao.eyebrow": "Novidades",
  "selecao.title": "SELEÇÃO DA SEMANA",
  "selecao.lede": "Chegou essa semana na loja. Estoque limitado — dá pra reservar pelo WhatsApp.",

  "banda.title": "TODO O CATÁLOGO,\nEM UM LUGAR SÓ.",
  "banda.lede": "Feminino, masculino, infantil, calçados, bolsas e acessórios reunidos.",
  "banda.cta": "Ver todo o catálogo",

  "campanha.eyebrow": "Nova coleção",
  "campanha.l1": "UMA NOVA",
  "campanha.l2": "FASE",
  "campanha.l3": "COMEÇA.",
  "campanha.lede": "Novas peças chegando toda semana na loja do Cipoal. Vem ver antes de todo mundo.",
  "campanha.cta": "Descobrir novidades",
  "campanha.image": "https://picsum.photos/seed/pdm-camp/1800/1200",

  "ofertas.eyebrow": "Ofertas especiais",
  "ofertas.title": "PREÇO DE VIRADA",
  "ofertas.lede": "Últimas peças de cada numeração. Quando acaba, sai do site.",
  "ofertas.cta": "Ver todas as ofertas",

  "insta.eyebrow": "Instagram",
  "insta.handle": "@PONTODAMODA.STM",
  "insta.lede": "Moda que continua além da loja.",
  "insta.cta": "Seguir no Instagram",
  "insta.images": [
    "https://picsum.photos/seed/pdm-ig1/600/600",
    "https://picsum.photos/seed/pdm-ig2/600/600",
    "https://picsum.photos/seed/pdm-ig3/600/600",
    "https://picsum.photos/seed/pdm-ig4/600/600",
    "https://picsum.photos/seed/pdm-ig5/600/600",
    "https://picsum.photos/seed/pdm-ig6/600/600"
  ],

  "loja.eyebrow": "A loja",
  "loja.title": "VENHA NOS VISITAR",
  "loja.lede": "Cipoal, Santarém — Pará. Provador aberto, atendimento sem pressa.",
  "loja.mapQuery": "Cipoal, Santarém - PA",
  "loja.mapsUrl": "https://maps.app.goo.gl/tBo56Pivdh17xiQL9",
  "loja.dia1": "Segunda a sexta",
  "loja.hora1": "08:00 — 12:00\n14:00 — 18:30",
  "loja.dia2": "Sábado",
  "loja.hora2": "Atendimento online",
  "loja.dia3": "Domingo",
  "loja.hora3": "Fechado",

  "final.eyebrow": "Ponto da Moda",
  "final.l1": "SEU PRÓXIMO",
  "final.l2": "LOOK ESTÁ",
  "final.l3": "AQUI.",
  "final.lede": "Descubra nossas novidades e encontre peças que combinam com você.",
  "final.cta": "Explorar produtos",

  "contato.whatsapp": "5593991356874",
  "contato.whatsappLabel": "(93) 99135-6874",
  "contato.instagram": "https://instagram.com/pontodamoda.stm",
  "contato.instagramHandle": "@pontodamoda.stm",

  "footer.sub": "Moda feminina • masculina • infantil",
  "footer.copy": "© 2026 Ponto da Moda",
  "footer.city": "Santarém — Pará"
};

/* Campos que aparecem no painel do admin, agrupados por aba */
export const FIELD_SCHEMA = [
  { group: "Marca e contato", fields: [
    ["brand.name", "Nome da marca", "text"],
    ["contato.whatsapp", "WhatsApp (só números, com 55 e DDD)", "text"],
    ["contato.whatsappLabel", "WhatsApp como aparece escrito", "text"],
    ["contato.instagram", "URL do Instagram", "url"],
    ["contato.instagramHandle", "Arroba do Instagram", "text"],
    ["footer.sub", "Linha abaixo do nome no rodapé", "text"],
    ["footer.copy", "Direitos no rodapé", "text"],
    ["footer.city", "Cidade no rodapé", "text"]
  ]},
  { group: "Topo do site", fields: [
    ["hero.eyebrow", "Texto pequeno acima do título", "text"],
    ["hero.title1", "Título — primeira linha", "text"],
    ["hero.title2", "Título — segunda linha (dourada)", "text"],
    ["hero.lede", "Texto de apoio", "textarea"],
    ["hero.cta1", "Botão principal", "text"],
    ["hero.cta2", "Botão do WhatsApp", "text"],
    ["hero.image", "Foto de fundo", "image"],
    ["hero.meta1", "Canto direito — linha 1", "text"],
    ["hero.meta2", "Canto direito — linha 2", "text"],
    ["marquee.a", "Faixa rolante — trecho 1", "text"],
    ["marquee.b", "Faixa rolante — trecho 2", "text"],
    ["marquee.c", "Faixa rolante — trecho 3", "text"]
  ]},
  { group: "Categorias e editorial", fields: [
    ["bento.eyebrow", "Rótulo da seção de categorias", "text"],
    ["bento.title", "Título das categorias (Enter quebra linha)", "textarea"],
    ["bento.lede", "Texto de apoio das categorias", "textarea"],
    ["editorial.eyebrow", "Rótulo do editorial", "text"],
    ["editorial.title", "Título do editorial (Enter quebra linha)", "textarea"],
    ["editorial.lede", "Texto do editorial", "textarea"],
    ["editorial.image", "Foto do editorial", "image"],
    ["editorial.tag", "Etiqueta sobre a foto", "text"]
  ]},
  { group: "Produtos e ofertas", fields: [
    ["selecao.eyebrow", "Rótulo da seleção", "text"],
    ["selecao.title", "Título da seleção", "text"],
    ["selecao.lede", "Texto da seleção", "textarea"],
    ["banda.title", "Faixa do catálogo — título", "textarea"],
    ["banda.lede", "Faixa do catálogo — texto", "textarea"],
    ["banda.cta", "Faixa do catálogo — botão", "text"],
    ["ofertas.eyebrow", "Rótulo das ofertas", "text"],
    ["ofertas.title", "Título das ofertas", "text"],
    ["ofertas.lede", "Texto das ofertas", "textarea"],
    ["ofertas.cta", "Botão das ofertas", "text"]
  ]},
  { group: "Campanha e chamada final", fields: [
    ["campanha.eyebrow", "Rótulo da campanha", "text"],
    ["campanha.l1", "Campanha — linha 1", "text"],
    ["campanha.l2", "Campanha — linha 2 (dourada)", "text"],
    ["campanha.l3", "Campanha — linha 3", "text"],
    ["campanha.lede", "Campanha — texto", "textarea"],
    ["campanha.cta", "Campanha — botão", "text"],
    ["campanha.image", "Campanha — foto de fundo", "image"],
    ["final.eyebrow", "Chamada final — rótulo", "text"],
    ["final.l1", "Chamada final — linha 1", "text"],
    ["final.l2", "Chamada final — linha 2", "text"],
    ["final.l3", "Chamada final — linha 3 (dourada)", "text"],
    ["final.lede", "Chamada final — texto", "textarea"],
    ["final.cta", "Chamada final — botão", "text"]
  ]},
  { group: "Instagram e loja", fields: [
    ["insta.eyebrow", "Rótulo do Instagram", "text"],
    ["insta.handle", "Arroba grande na seção", "text"],
    ["insta.lede", "Texto do Instagram", "text"],
    ["insta.cta", "Botão do Instagram", "text"],
    ["loja.eyebrow", "Rótulo da loja", "text"],
    ["loja.title", "Título da loja", "text"],
    ["loja.lede", "Texto da loja", "textarea"],
    ["loja.mapQuery", "Endereço que o mapa procura", "text"],
    ["loja.mapsUrl", "Link do 'Como chegar'", "url"],
    ["loja.dia1", "Horário — dia 1", "text"],
    ["loja.hora1", "Horário — horas 1 (Enter quebra linha)", "textarea"],
    ["loja.dia2", "Horário — dia 2", "text"],
    ["loja.hora2", "Horário — horas 2", "textarea"],
    ["loja.dia3", "Horário — dia 3", "text"],
    ["loja.hora3", "Horário — horas 3", "textarea"]
  ]}
];

export const DEFAULT_CATEGORIES = [
  { slug:"feminino",   name:"Feminino",   desc:"Vestidos, alfaiataria e básicos", image:"https://picsum.photos/seed/pdm-fem/1000/1200",  order:1, active:true },
  { slug:"masculino",  name:"Masculino",  desc:"Camisas, calças e camisetas",     image:"https://picsum.photos/seed/pdm-masc/1000/700",  order:2, active:true },
  { slug:"infantil",   name:"Infantil",   desc:"Do 2 ao 12",                      image:"https://picsum.photos/seed/pdm-inf/700/700",    order:3, active:true },
  { slug:"calcados",   name:"Calçados",   desc:"Tênis, sandálias e rasteiras",    image:"https://picsum.photos/seed/pdm-cal/700/700",    order:4, active:true },
  { slug:"bolsas",     name:"Bolsas",     desc:"Estruturadas e de ombro",         image:"https://picsum.photos/seed/pdm-bol/1000/700",   order:5, active:true },
  { slug:"acessorios", name:"Acessórios", desc:"Óculos, cintos e bijuterias",     image:"https://picsum.photos/seed/pdm-ace/1000/700",   order:6, active:true }
];

export const DEFAULT_PRODUCTS = [
  { name:"Vestido midi acetinado", cat:"feminino", price:189.90, oldPrice:249.90, tag:"Novo",
    imgA:"https://picsum.photos/seed/pdm-p1a/900/1125", imgB:"https://picsum.photos/seed/pdm-p1b/900/1125",
    colors:["Preto","Vinho","Verde"], sizes:["P","M","G","GG"], featured:true, offer:false, active:true, order:1,
    desc:"Caimento fluido, alça fina e brilho discreto. Vai bem de sandália no dia ou de salto à noite." },
  { name:"Camisa de linho off-white", cat:"masculino", price:159.90, oldPrice:null, tag:"Novo",
    imgA:"https://picsum.photos/seed/pdm-p2a/900/1125", imgB:"https://picsum.photos/seed/pdm-p2b/900/1125",
    colors:["Off-white","Areia","Preto"], sizes:["P","M","G","GG"], featured:true, offer:false, active:true, order:2,
    desc:"Linho leve, feito pro calor de Santarém. Fica bem aberta sobre camiseta ou fechada com calça social." },
  { name:"Conjunto infantil verão", cat:"infantil", price:99.90, oldPrice:129.90, tag:null,
    imgA:"https://picsum.photos/seed/pdm-p3a/900/1125", imgB:"https://picsum.photos/seed/pdm-p3b/900/1125",
    colors:["Amarelo","Azul","Rosa"], sizes:["2","4","6","8","10"], featured:true, offer:false, active:true, order:3,
    desc:"Algodão macio, blusa e shorts no mesmo tom. Aguenta escola, praça e banho de rio." },
  { name:"Tênis chunky branco", cat:"calcados", price:279.90, oldPrice:null, tag:null,
    imgA:"https://picsum.photos/seed/pdm-p4a/900/1125", imgB:"https://picsum.photos/seed/pdm-p4b/900/1125",
    colors:["Branco","Off + bege"], sizes:["34","35","36","37","38","39"], featured:true, offer:false, active:true, order:4,
    desc:"Solado alto e palmilha acolchoada. Combina com jeans, saia e vestido curto." },
  { name:"Bolsa estruturada caramelo", cat:"bolsas", price:219.90, oldPrice:279.90, tag:"Últimas",
    imgA:"https://picsum.photos/seed/pdm-p5a/900/1125", imgB:"https://picsum.photos/seed/pdm-p5b/900/1125",
    colors:["Caramelo","Preto"], sizes:["Único"], featured:true, offer:false, active:true, order:5,
    desc:"Formato firme, alça de mão e tiracolo removível. Cabe carteira, celular e necessaire." },
  { name:"Blazer de alfaiataria preto", cat:"feminino", price:299.90, oldPrice:null, tag:"Novo",
    imgA:"https://picsum.photos/seed/pdm-p6a/900/1125", imgB:"https://picsum.photos/seed/pdm-p6b/900/1125",
    colors:["Preto","Off-white"], sizes:["P","M","G","GG"], featured:true, offer:false, active:true, order:6,
    desc:"Ombro marcado e forro leve. A peça que transforma um look simples em produção." },
  { name:"Óculos metal dourado", cat:"acessorios", price:89.90, oldPrice:119.90, tag:null,
    imgA:"https://picsum.photos/seed/pdm-p7a/900/1125", imgB:"https://picsum.photos/seed/pdm-p7b/900/1125",
    colors:["Dourado","Prata"], sizes:["Único"], featured:true, offer:false, active:true, order:7,
    desc:"Armação fina em metal com proteção UV400. Leve, não marca o nariz." },
  { name:"Calça cargo bege", cat:"masculino", price:179.90, oldPrice:null, tag:null,
    imgA:"https://picsum.photos/seed/pdm-p8a/900/1125", imgB:"https://picsum.photos/seed/pdm-p8b/900/1125",
    colors:["Bege","Verde militar","Preto"], sizes:["38","40","42","44","46"], featured:true, offer:false, active:true, order:8,
    desc:"Sarja com elastano e bolsos laterais. Confortável o dia todo sem parecer largada." },
  { name:"Blusa cropped canelada", cat:"feminino", price:49.90, oldPrice:89.90, tag:null,
    imgA:"https://picsum.photos/seed/pdm-o1/900/1125", imgB:"https://picsum.photos/seed/pdm-o1b/900/1125",
    colors:["Preto","Branco","Terracota"], sizes:["P","M","G"], featured:false, offer:true, active:true, order:9,
    desc:"Malha canelada com boa elasticidade. Fecha look com saia, short ou calça de cintura alta." },
  { name:"Sandália rasteira trançada", cat:"calcados", price:79.90, oldPrice:129.90, tag:null,
    imgA:"https://picsum.photos/seed/pdm-o2/900/1125", imgB:"https://picsum.photos/seed/pdm-o2b/900/1125",
    colors:["Caramelo","Preto"], sizes:["34","35","36","37","38"], featured:false, offer:true, active:true, order:10,
    desc:"Trançado à mão e solado macio. Aguenta o dia inteiro sem machucar o pé." },
  { name:"Camiseta básica algodão", cat:"masculino", price:39.90, oldPrice:69.90, tag:null,
    imgA:"https://picsum.photos/seed/pdm-o3/900/1125", imgB:"https://picsum.photos/seed/pdm-o3b/900/1125",
    colors:["Branco","Preto","Cinza"], sizes:["P","M","G","GG"], featured:false, offer:true, active:true, order:11,
    desc:"Algodão penteado, gola que não deforma. A base de qualquer look." },
  { name:"Cinto de couro fivela dourada", cat:"acessorios", price:69.90, oldPrice:null, tag:null,
    imgA:"https://picsum.photos/seed/pdm-p12a/900/1125", imgB:"https://picsum.photos/seed/pdm-p12b/900/1125",
    colors:["Preto","Caramelo"], sizes:["Único"], featured:false, offer:false, active:true, order:12,
    desc:"Couro legítimo com fivela dourada discreta. Fecha a produção sem gritar." }
];
