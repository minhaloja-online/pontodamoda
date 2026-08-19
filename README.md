# Ponto da Moda — site da loja

Site da loja Ponto da Moda (Cipoal, Santarém — PA). Página inicial, catálogo por
categoria e painel de administração. Sem build, sem dependências: é HTML, CSS e
JavaScript puro. O conteúdo fica no Firebase e é editado pelo próprio site.

```
├── index.html              página inicial
├── catalogo.html           catálogo (?cat=feminino, ?only=ofertas, ?q=busca)
├── admin.html              painel do administrador
├── 404.html
├── assets/
│   ├── css/style.css       visual do site
│   ├── css/admin.css       visual do painel
│   └── js/
│       ├── config.js       ← COLE AQUI OS DADOS DO SEU FIREBASE
│       ├── firebase.js     inicialização do Firebase
│       ├── defaults.js     conteúdo padrão e lista de campos editáveis
│       ├── store.js        leitura dos dados
│       ├── site.js         carrinho, quick view, animações
│       ├── home.js         página inicial
│       ├── catalogo.js     catálogo
│       ├── admin.js        painel
│       └── uploader.js     envio de fotos (GitHub, Cloudinary ou ImgBB)
├── img/                    fotos, quando o envio for pelo GitHub
├── firestore.rules         permissões do banco
├── firebase.json
└── .github/workflows/deploy-pages.yml
```

---

## 1. Subir para o GitHub

```bash
git init
git add .
git commit -m "Site da Ponto da Moda"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ponto-da-moda.git
git push -u origin main
```

No repositório: **Settings → Pages → Source: GitHub Actions**. Em um ou dois
minutos o site fica no ar em `https://SEU_USUARIO.github.io/ponto-da-moda/`.

> Para testar na sua máquina, use um servidor local (os arquivos usam módulos
> JavaScript e não funcionam abrindo com duplo clique):
> `python3 -m http.server 8000` e abra `http://localhost:8000`.

---

## 2. Criar o projeto no Firebase

1. Acesse **console.firebase.google.com** e crie um projeto.
2. **Criação → Firestore Database → Criar banco de dados** (modo de produção).
3. **Criação → Authentication → Começar → E-mail/senha → Ativar**.
4. **Configurações do projeto → Seus apps → Web (`</>`)**, registre o app e copie
   o objeto `firebaseConfig`.
5. Cole esses valores em `assets/js/config.js`, salve e envie para o GitHub:

> O **Firebase Storage não é usado** neste projeto, justamente porque hoje ele
> exige o plano Blaze com cartão. As fotos ficam em outro lugar — veja a seção 6.

```bash
git add assets/js/config.js && git commit -m "Configura Firebase" && git push
```

### Liberar o domínio

Em **Authentication → Settings → Domínios autorizados**, adicione
`SEU_USUARIO.github.io`. Sem isso o login do painel não funciona.

---

## 3. Publicar as regras de segurança

As regras já estão prontas neste repositório. Você pode colá-las direto no
console (Firestore → Regras e Storage → Regras) ou usar a linha de comando:

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # escolha o seu projeto
firebase deploy --only firestore:rules
```

O que as regras garantem:

- qualquer visitante **lê** o conteúdo do site;
- só quem está na coleção `admins` **escreve** qualquer coisa;
- o registro de administrador só pode ser criado **uma vez** sem já ser admin —
  é o que faz o primeiro acesso virar dono e trancar a porta depois;
- a coleção `secrets`, onde ficam as credenciais do envio de fotos, **não é
  legível por visitantes** — só por quem está em `admins`.

---

## 4. Primeiro acesso ao painel

1. Abra `admin.html` (no rodapé do site tem um `·` discreto que leva até lá).
2. Preencha e-mail e senha e clique em **Criar acesso**.
3. Essa primeira conta vira a administradora. A partir daí, quem tentar criar
   outra conta entra sem permissão nenhuma.
4. Na aba **Ferramentas**, clique em **Publicar conteúdo inicial** para copiar os
   textos, categorias e produtos de exemplo para o banco.

Para liberar outra pessoa depois: peça para ela criar a conta em
**Authentication → Usuários** no console, copie o UID e cole na aba
**Ferramentas → Administradores**.

> Depois que o seu acesso estiver criado, vale desativar o cadastro aberto em
> **Authentication → Settings → Proteção de enumeração / registro de usuários**.

---

## 5. O que dá pra editar no painel

| Aba | O que muda |
|---|---|
| **Conteúdo** | Todos os textos do site, fotos de fundo, número do WhatsApp, link do Instagram, endereço do mapa, horários, rodapé |
| **Categorias** | Nome, foto, descrição e ordem das categorias do menu e da página inicial |
| **Produtos** | Cadastro completo: fotos, preço, preço antigo, cores, tamanhos, selo, descrição, se aparece na home e se é oferta |
| **Ferramentas** | Envio de imagens, conteúdo inicial e quem tem acesso ao painel |

---

## 6. Onde ficam as fotos

Em qualquer campo de foto você pode **colar o endereço de uma imagem** e pronto —
isso funciona sem configurar nada. Para enviar fotos direto do celular ou do
computador pelo painel, escolha um dos três caminhos em **Ferramentas → Envio de
imagens**. Todos são gratuitos e nenhum pede cartão.

Antes de subir, a foto é redimensionada para no máximo 1600px e convertida para
WebP dentro do próprio navegador. Uma foto de 4 MB do celular costuma virar algo
entre 150 e 300 KB.

### GitHub — recomendado

As fotos entram na pasta `img/` do próprio repositório, junto com o site. Não
precisa de mais nenhuma conta, não tem limite prático para uma loja e as imagens
ficam versionadas com o resto do projeto.

1. Vá em **github.com/settings/tokens → Fine-grained tokens → Generate new token**.
2. Em *Repository access*, escolha **apenas** o repositório do site.
3. Em *Permissions → Repository permissions*, marque **Contents: Read and write**.
4. Copie o token e cole no painel, junto com seu usuário e o nome do repositório.

O token fica salvo no Firestore, numa coleção que só o administrador consegue
ler. Ainda assim, dê a ele acesso só a este repositório e troque se vazar.

### Cloudinary

25 GB grátis e entrega otimizada. Crie a conta, vá em **Settings → Upload →
Upload presets**, adicione um preset com **Signing Mode: Unsigned** e cole no
painel o *cloud name* e o nome do preset. O preset não assinado foi feito
justamente para envio direto do navegador, então não há segredo exposto.

### ImgBB

O mais rápido de configurar: crie a conta em imgbb.com, pegue a chave em
api.imgbb.com e cole no painel. Bom para começar, mas é o que dá menos controle
sobre as imagens depois.

## 7. Como o site é organizado

- **Página inicial** — apresentação da loja, categorias, seleção da semana,
  ofertas e chamadas para o catálogo completo.
- **Catálogo** — abre filtrado pela categoria clicada no topo
  (`catalogo.html?cat=feminino`), com filtros, ordenação e busca.
- **Carrinho** — fica guardado no navegador do cliente e fecha o pedido pelo
  WhatsApp com a lista completa e o total.

Sem Firebase configurado o site continua abrindo normalmente, com o conteúdo
padrão de `defaults.js` — só não dá pra salvar nada.
