# Diário de Bordo da IA — Desafio Vortex

Registro do uso de IA no desenvolvimento do projeto, com prompts reais e decisões tomadas. Ferramenta usada: **Claude** (conversa de planejamento fora do VS Code) e **Claude Code** (dentro do VS Code, a partir do dia 24/07).

> Nota de transparência: as entradas de 24/07 foram reconstruídas a partir do resumo salvo em [historico.md](historico.md) e dos commits do dia, não copiadas de um log mantido em tempo real naquele dia — o registro em tempo real só começou a valer, de fato, a partir de 25/07. Prompts marcados como "(resumido)" refletem o teor da conversa registrado no histórico, não a transcrição literal.

---

## 2026-07-24 — Dia 1/2: planejamento e scaffolding do frontend

**Contexto:** conversa de planejamento com o Claude (fora do VS Code, ver [historico.md](historico.md)) para fechar escopo, modelo de dados e cronograma antes de escrever código.

**Prompt (resumido):** discussão sobre stack de backend — sugestão dada foi Node.js + TypeScript + Express + Prisma + SQLite, com o argumento de que usar TypeScript nos dois lados reduz o número de conceitos novos a dominar em 15 dias e facilita explicar o código no vídeo de defesa. Decisão registrada como **em aberto**, para ser confirmada pelo candidato antes da implementação.

**Resultado:** [PLANEJAMENTO.md](PLANEJAMENTO.md) e [REQUISITOS_TELAS.csv](REQUISITOS_TELAS.csv) escritos como saída dessa conversa — cronograma dia a dia, modelo de dados `Item`, e a lista de requisitos por tela.

**Depois, no VS Code:** scaffolding do frontend (React + Vite + TS + Tailwind + React Router), as 6 telas do CSV criadas com dados mockados (`mockItems.ts`) para validar layout e navegação antes do backend existir. Commit `b54806d`.

---

## 2026-07-25 — Dia 3: implementação do backend com Prisma

**Prompt real:** *"Vamos ver o que falta, por favor"*

Pedi ao Claude Code para mapear o estado atual do repositório (backend vs. frontend vs. o que o planejamento previa). Levantamento mostrou que o `backend/` tinha só `package.json` e um `schema.prisma` vazio — nenhum código de servidor.

**Prompt real:** *"Além de fazer a questão do Backend, por favor me explique passo a passo como vai ser a questão do backend usando o prisma"*

A partir daqui, implementação do backend explicada passo a passo: schema Prisma (`model Item`), configuração do datasource SQLite, driver adapter, migration, rotas Express, validação Zod, seed e testes manuais via `curl`.

### Erro identificado e corrigido (real, não hipotético)

Ao configurar o driver adapter do Prisma 7 para SQLite, a primeira tentativa foi `@prisma/adapter-better-sqlite3` — é o adapter "padrão" recomendado na documentação/skills do Prisma para SQLite. O `npm install` falhou: o pacote `better-sqlite3` precisa compilar um módulo nativo em C++ via `node-gyp`, o que exige o Visual Studio Build Tools instalado — não disponível nesta máquina Windows.

**Como percebi:** o próprio erro do `npm install` (log de `node-gyp`/`gyp ERR! find VS`) deixou claro que não era um problema de configuração do Prisma, e sim de toolchain de compilação ausente no ambiente.

**Correção:** troquei para `@prisma/adapter-libsql` (`@libsql/client`), que também conecta em um arquivo SQLite local (`file:./dev.db`) mas usa binários pré-compilados, sem exigir compilação nativa. Testado com `prisma migrate dev`, seed e os 4 endpoints (`GET /items`, `GET /items?category=`, `GET /items/:id`, `POST /items`, `DELETE /items/:id`) via `curl` — todos funcionando, incluindo os casos de erro (`400` de validação Zod, `404` de item inexistente).

**Lição:** ao seguir uma recomendação "padrão" de uma skill/documentação, vale checar se ela assume um ambiente de build completo — em máquinas Windows sem Visual Studio, adapters que dependem de compilação nativa (`better-sqlite3`, `bcrypt`, etc.) são um ponto de atrito real, não só teórico.

**Resultado:** backend funcional — CRUD completo de `/items`, persistência SQLite, validação de campos. Documentado em [README.md](README.md).

### Integração do frontend com a API real

**Prompt real:** *"Siga por esse caminho, por favor. Lembrando de ir atualizando o readme.md e o ai_log.md"* — em resposta à sugestão de trocar os dados mockados do frontend por chamadas reais à API.

Trabalho: criado `frontend/src/lib/api.ts` (cliente HTTP único, com `ApiError` carregando os `issues` do Zod para exibir na UI), e as 5 telas que dependiam de dados passaram a consumir a API — `LandingPage` e `Vitrine` via `GET /items`, `ItemDetail` via `GET /items/:id`, `AdForm` via `POST /items`, `MyAds` via `GET /items?ownerId=` + `DELETE /items/:id`. `mockItems.ts` foi removido por ficar sem nenhum uso.

**Decisão de produto tomada sem perguntar antes (registrada aqui por transparência):** o schema do backend exige `ownerId` em todo item, mas a tela de Identificação (Camada 2, bônus) ainda é só um formulário sem persistência. Para o CRUD fechar de ponta a ponta sem esperar pela Camada 2, criei `frontend/src/lib/currentUser.ts` — um id anônimo gerado uma vez por navegador e salvo em `localStorage`. Não é autenticação, é só o mínimo para "Meus Anúncios" fazer sentido antes do login de verdade existir.

**Também acrescentado ao backend:** `GET /items` passou a aceitar `?ownerId=` além de `?category=` (antes só filtrava categoria) — necessário para "Meus Anúncios" buscar só os itens do usuário no servidor, em vez de trazer tudo e filtrar no cliente.

**Verificação manual do próprio usuário:** depois de eu subir os servidores locais, o candidato cadastrou um anúncio de teste ("Padrasto") pela UI e perguntou *"Acabei de fazer um anúncio do cadastro, ele está adicionando no Backend?"* — confirmei consultando `GET /items` direto e mostrando o registro salvo (`ownerId` gerado automaticamente, timestamp real). Esse é o tipo de checagem que evita aceitar "funciona" só porque a IA disse que funciona.

**Verificação (Playwright):** `tsc -b` e `vite build` limpos nos dois lados; depois, teste de ponta a ponta em navegador de verdade (Playwright headless, já que `chromium-cli` não estava disponível neste ambiente) cobrindo: landing carregando itens da API, filtro de categoria na vitrine, criação de anúncio via formulário até redirecionar para "Meus Anúncios", e exclusão removendo o item da lista — sem erros no console em nenhum passo.

### Validação do formulário (Camada 1)

**Prompt real:** *"Faça a questão da validação para dar certo colocar no backend"* — depois de eu apontar, na pergunta "O que falta?", que a validação existia só como `required` do HTML5 + uma mensagem genérica no topo do formulário.

Trabalho: mensagens do Zod (`backend/src/schemas/item.ts`) ficaram específicas por regra (`"Preço precisa ser maior que zero"`, `"Selecione uma categoria válida"`, etc.). No frontend, `AdForm.tsx` ganhou uma função `validate()` que roda antes de qualquer chamada à API — bloqueia o envio e mostra a mensagem embaixo do campo errado (borda vermelha + texto) em vez de deixar o navegador mostrar o balão de validação nativo. Se ainda assim o backend rejeitar (`400`), os `issues` da resposta são mapeados de volta pro campo certo via `issue.path[0]`, então o mesmo mecanismo de exibição cobre os dois casos.

**Por que validar nos dois lados em vez de confiar só no cliente:** validação de cliente é só UX — qualquer um pode chamar `POST /items` direto (Postman, `curl`, outro frontend) pulando o React inteiro. Sem a validação do Zod, dados inválidos (preço negativo, categoria fora da lista) entrariam no banco. As mensagens do Zod foram escritas pra já servir de resposta amigável nesse caso, não só pra alimentar o formulário.

**Verificação:** teste em navegador (Playwright) cobrindo 3 cenários — formulário vazio (4 campos acusam erro, não navega), venda com preço `0` e URL inválida (2 erros específicos), depois corrigido (publica e navega pra "Meus Anúncios"). Também validado direto na API via `curl` que categoria fora da lista e preço `0` voltam `400` com a mensagem nova.

### Filtro na Landing + PWA (fechando o obrigatório)

**Prompt real:** *"Faça isso, por favor"* — em resposta à sugestão de fechar os dois últimos itens do escopo obrigatório: filtro por categoria na Landing Page e o PWA (manifest + service worker).

**Filtro na Landing:** só faltava reaproveitar o componente `CategoryFilter` (já existia, usado na Vitrine) dentro de `LandingPage.tsx`, e trocar o `fetchItems()` sem argumento por `fetchItems({ category })` quando uma categoria é selecionada. Sem novidade de arquitetura, só fechar um requisito (1.4) que tinha ficado pra trás na integração anterior.

**PWA:** instalado `vite-plugin-pwa` com estratégia `generateSW` (gera o service worker automaticamente via Workbox — não escrevi nenhum `sw.js` na mão). O ponto que exigiu mais decisão foi o ícone: o projeto não tinha nenhuma arte própria pra usar no manifest (só um favicon genérico do template do Vite e uma sprite de ícones de UI). Desenhei um SVG simples (broto/folha, combinando com o emoji 🌱 já usado no cabeçalho e com o verde `emerald-600` do resto da UI) e precisei convertê-lo pra PNG nos tamanhos que o manifest e o iOS esperam (192, 512, 512 maskable, apple-touch-icon 180).

**Decisão técnica (aprendendo com o erro do driver adapter de antes):** a conversão SVG→PNG normalmente seria feita com `sharp` ou `canvas`, mas ambos frequentemente dependem de compilação nativa — o mesmo tipo de problema que já tinha travado o `better-sqlite3` nesta máquina sem Visual Studio Build Tools. Usei `@resvg/resvg-js` em vez disso: é da mesma família de pacotes Rust com binário pré-compilado (como `esbuild`/`swc`), então instalou e rodou sem exigir nenhum toolchain — mesma lição de antes, aplicada preventivamente dessa vez em vez de descoberta por tentativa e erro.

**Verificação:** o service worker só roda em build de produção, não no `npm run dev` — então rodei `npm run build` + `npm run preview` e testei com Playwright contra o build real: manifest.webmanifest acessível com nome/ícones/`display: standalone` corretos, service worker registrando e chegando a `activating`, e o filtro por categoria funcionando na Landing. **Não testado:** instalação num celular físico — o [PLANEJAMENTO.md](PLANEJAMENTO.md) já apontava esse risco (PWA no iOS é mais restrita), então fica como pendência explícita no README em vez de assumida como resolvida.

### Identificação de usuário (Camada 2)

**Contexto:** ao perguntar "o que falta", listei a Camada 2 (identificação) como bônus ainda não iniciado. Antes de implementar, perguntei explicitamente: *"Como você sugere que seja feita a identificação?"* — pra decidir a abordagem junto antes de escrever código, não só aceitar o que a IA emplacasse primeiro.

**Discussão real:** propus duas opções — nome simples sem senha (rápido, cobre o requisito do edital nessa camada) vs. JWT completo com `User`, senha com hash e rotas protegidas (mais impressionante, mas caro em tempo, e o Deploy — outro bônus pendente — já tinha sido classificado como maior custo-benefício no [PLANEJAMENTO.md](PLANEJAMENTO.md)). O candidato escolheu a versão simples, com a ressalva: *"Ela parece ser escalável se precisar adicionar funções ou adicionar código se acabar precisando"* — ou seja, queria a opção barata mas sem fechar a porta pra evoluir depois.

**Como isso virou código:** `frontend/src/lib/currentUser.ts` virou o único ponto de contato com "quem é o usuário atual" — `getCurrentUser()` (nome + id) e `identify(nome)`/`signOut()`. Nenhuma tela (Header, AdForm, MyAds) sabe *como* a identidade é obtida, só chama essas funções. Se um dia isso virar login de verdade, a troca fica contida nesse arquivo: `identify()` passaria a chamar `POST /auth/login` em vez de escrever no `localStorage`, `getCurrentUser()` passaria a ler de um token/`/auth/me` em vez do `localStorage` — as telas que consomem não mudam.

Pra Header (que fica montado entre navegações, ao contrário das páginas) reagir quando a identidade muda em outro lugar, usei `useSyncExternalStore` com um pub-sub mínimo (`identify`/`signOut` chamam `notify()`, que avisa os componentes inscritos).

### Erro identificado e corrigido (real, não hipotético) — `useSyncExternalStore`

Na primeira versão, `getCurrentUser()` devolvia um objeto novo (`{ id, name }`) a cada chamada. Como o Header usava esse objeto direto como snapshot do `useSyncExternalStore`, e esse hook exige que o snapshot seja a **mesma referência** enquanto nada mudou, cada render criava um objeto "diferente" na visão do React — resultando em loop infinito de re-render (`Maximum update depth exceeded`, visível no log do Vite: "The result of getSnapshot should be cached to avoid an infinite loop").

**Como percebi:** o teste em navegador (Playwright) simplesmente travou esperando um texto que nunca apareceu; o log do `npm run dev` no terminal mostrava o erro exato e a dica da própria React ("getSnapshot should be cached").

**Correção:** um objeto `cachedUser` guardado em closure, só substituído quando `id` ou `name` realmente mudam — `getSnapshot()` passa a devolver sempre a mesma referência entre chamadas idênticas.

**Segundo problema, achado por raciocínio antes de rodar (não por erro em produção):** o `signOut()` original só apagava o nome, mantendo o mesmo `ownerId` no `localStorage` — ou seja, "sair" não trocava de identidade de verdade, só "desnomeava" a mesma pessoa. Corrigido pra também apagar o id, forçando um novo id anônimo na próxima leitura, exatamente o comportamento que "sair" deveria ter.

**Verificação:** teste em navegador (Playwright) cobrindo o fluxo completo — visitante novo vê o formulário, `identify("Fernanda")` navega pra Meus Anúncios, revisitar `/identificacao` mostra "Você é Fernanda", um item criado nesse estado aparece em Meus Anúncios, `signOut()` volta ao formulário e o Header volta a mostrar "Identificar-se", e depois do sign out os itens da Fernanda somem de Meus Anúncios (id novo). `tsc -b` e `vite build` limpos.

---

## 2026-07-28 — Deploy real (Camada 3): Vercel + Render

**Prompt real:** *"Vamos fazer o deploy no vercel para poder testar. vou abrir o vercel"*

Antes de implementar, o candidato perguntou se fazia mais sentido separar backend/frontend em dois sites ou colocar tudo na Vercel, "lembrando que ele precisa obedecer as demandas específicas do PDF". Em vez de responder de memória, abri o `PS_Full_Stack.pdf` de novo e li a seção 2.2 palavra por palavra: o edital já recomenda explicitamente **API em Render/Railway/Fly.io** e **Frontend em Vercel/Netlify/GitHub Pages** — dois sites, não um. Isso resolveu a dúvida direto na fonte, e também evitou um trabalho bem maior: nosso backend é um servidor Express de vida longa com SQLite em arquivo, que não roda bem como função serverless (o modelo que a Vercel usa) sem migrar o banco pra algo remoto.

### Três erros reais, em sequência, no deploy do Render

Cada um só apareceu rodando de verdade (logs do Render), não foi hipótese:

1. **Build não gerava `dist/`.** O primeiro deploy falhou com `Error: Cannot find module '.../dist/index.js'`. O Build Command que ficou configurado no Render não estava rodando `npm run build` (só o `npm install` padrão), então o `tsc` nunca executava. Corrigido explicitando o Build Command: `npm install && npm run build`.

2. **Start Command não rodava as migrations.** Mesmo com o build certo, o Start Command estava em `npm start` (só `node dist/index.js`) — no banco novo e vazio do Render, isso teria quebrado na primeira query com "tabela não existe", já que nenhuma migration tinha rodado ali. Corrigido apontando o Start Command pra `npm run start:prod` (script que criei: `prisma migrate deploy && tsx prisma/seed.ts && node dist/index.js`).

3. **O script `start:prod` só existia na minha máquina.** Mesmo depois de acertar os dois campos no painel do Render, o deploy ainda ia falhar com "missing script: start:prod" — porque eu tinha editado o `package.json` localmente mas nunca tinha commitado nem enviado pro GitHub, e o Render builda a partir do repositório remoto, não do meu disco. **Lição:** configurar o painel do serviço de hospedagem não substitui ter o código correspondente no commit que está sendo implantado — são duas coisas independentes, e é fácil esquecer a segunda depois de mexer na primeira.

Pedido explícito antes de agir: *"Faça o commit, por favor"* — só commitei e enviei (`b140850`) depois dessa confirmação direta, e expliquei antes exatamente o que ia entrar (só `package.json`/`package-lock.json`, deixando de fora um `backend/dev.db` antigo sem relação).

**Verificação:** depois do push, o Render disparou o redeploy sozinho (Auto-Deploy: On Commit). Confirmei via `curl` na URL de produção: `GET /health` → `200 {"status":"ok"}`, `GET /items` → os 4 itens do seed, dados reais vindos do banco em produção, não suposição.

### Quarto ponto, achado por checagem própria (não por erro relatado)

Depois de o backend subir, o próximo passo era apontar `VITE_API_URL` na Vercel pro Render. Antes de dar como resolvido, resolvi conferir: baixei o bundle JS que a Vercel estava servindo em produção e procurei por `localhost:3333` nele. Estava lá — ou seja, mesmo com a variável de ambiente já salva no painel da Vercel, o site ainda estava servindo o build antigo. **Motivo:** `VITE_API_URL` é lida em *build time* (o Vite substitui `import.meta.env.VITE_API_URL` por um valor literal dentro do JavaScript compilado), não em runtime — salvar a variável não muda um build que já existe, precisa de um redeploy novo pra essa variável entrar no bundle. Detalhe que não é óbvio pra quem está acostumado com variáveis de ambiente de backend (essas sim, bastam reiniciar o processo).

---

## 2026-07-29 — Painel Admin (planejamento, fora do VS Code)

**Contexto:** conversa de continuação do planejamento (fora do VS Code, mesma conversa iniciada em 24/07 — ver [historico.md](historico.md)), retomada depois de a implementação já ter avançado bastante em paralelo dentro do VS Code (backend, integração, validação, PWA, identificação e deploy, todos documentados acima).

**Prompt real:** *"Eu queria que tivesse um /admin no projeto no qual precisa de uma senha sendo ela '2001'. Essa senha serve para entrar na página admin e conseguir administrar todos os anúncios, então se tiver anúncio que é mal gosto ou piada, eu conseguiria deletar"*

**Risco identificado antes de qualquer código existir:** o repositório é público (exigência do edital) — uma senha escrita direto no código-fonte ficaria visível para qualquer pessoa que abrisse o repo no GitHub, permitindo que qualquer um (não só a banca) deletasse qualquer anúncio.

**Direção proposta, ainda não implementada:** senha como variável de ambiente no backend (`ADMIN_PASSWORD`), nunca commitada; `POST /admin/login` valida no servidor e devolve um token; ações de admin (deletar qualquer item) exigem esse token; se a variável for lida pelo Vite no frontend, nunca pode ter prefixo `VITE_`, porque isso a embutiria em texto plano no bundle JS público (mesmo mecanismo do problema do `VITE_API_URL` documentado acima, mas aplicado a um segredo em vez de uma URL — aqui o risco é maior). Registrado como Tela 7 em [REQUISITOS_TELAS.csv](REQUISITOS_TELAS.csv) e seção 3.2 de [PLANEJAMENTO.md](PLANEJAMENTO.md), marcado como extra (não pontua no edital, ideia do próprio candidato para moderação).

**Pendente:** implementação real do endpoint de login, middleware de autorização e da tela `/admin` no frontend.
