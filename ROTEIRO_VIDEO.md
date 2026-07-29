# Roteiro do Vídeo (6 min) — uso interno, não é entrega

Rascunho pra ensaiar antes de gravar. Segue exatamente a estrutura cronometrada do edital ([PS_Full_Stack.pdf](PS_Full_Stack.pdf), seção 5) — o tempo é rígido, vale ensaiar com cronômetro pelo menos uma vez.

**Antes de gravar:**
- [ ] Acessar https://empresa-vortex-backend.onrender.com/health uns 5 min antes (cold start do Render — sem isso a demo trava ~50s)
- [ ] Confirmar que o frontend na Vercel já fez o redeploy com a API de produção certa
- [ ] Celular carregado, na mesma tela que vai gravar/espelhar, com o site de produção aberto
- [ ] Ter o VS Code já aberto nos arquivos certos (evita perder tempo navegando ao vivo)

---

## Como o backend funciona, passo a passo (estudar isso ANTES de ensaiar o bloco de código)

Isso aqui não é pra falar no vídeo palavra por palavra — é material de estudo, pra você conseguir responder qualquer pergunta que a banca fizer sobre o backend, não só recitar o que está no roteiro do bloco 3:00–5:00. Segue a ordem real que uma requisição percorre, arquivo por arquivo.

### Modelo mental antes de tudo

O backend é um programa que **fica rodando pra sempre**, esperando pedidos chegarem pela rede, e respondendo com dados em JSON. Isso é uma **API REST**: um jeito padronizado de expor operações (criar, ler, atualizar, apagar) através de URLs e verbos HTTP (`GET`, `POST`, `DELETE`...). O frontend (React, rodando no navegador de quem acessa o site) é um programa **completamente separado**, que chama essa API pela internet usando `fetch`. Os dois só se conhecem pela URL e pelo formato JSON combinado entre eles — o backend nem sabe que existe React do outro lado.

### Passo 1 — o servidor liga (`backend/src/index.ts`)

```ts
import 'dotenv/config'
import { app } from './app.js'

const port = Number(process.env.PORT) || 3333

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`)
})
```

- `import 'dotenv/config'` lê o arquivo `.env` e coloca cada linha dele em `process.env`, antes de qualquer outra coisa rodar — é por isso que `process.env.DATABASE_URL` funciona mais adiante.
- `app` vem de `app.ts` (próximo passo) — já é o "aplicativo" pronto, com rotas e regras montadas.
- `app.listen(port, ...)` abre uma porta e **fica esperando conexões pra sempre**. É por isso que `npm run dev` nunca "termina" sozinho no terminal — o processo não tem motivo pra parar, ele foi feito pra ficar de pé.

### Passo 2 — o Express monta as regras (`backend/src/app.ts`)

```ts
export const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/items', itemsRouter)
```

- `express()` cria a aplicação. Pense nela como uma **lista de regras testadas em ordem** — pra cada requisição que chega, o Express vai descendo essa lista até achar algo que bate.
- `app.use(cors())` é um **middleware**: uma função que roda antes da rota final, pode inspecionar a requisição, e decide se deixa passar. `cors()` especificamente adiciona os headers HTTP que autorizam o navegador a aceitar uma resposta vinda de um domínio diferente do site — sem isso, o navegador bloquearia o frontend (`vercel.app`) de falar com o backend (`onrender.com`), já que são domínios diferentes.
- `app.use(express.json())` é outro middleware: lê o corpo da requisição, e **se** vier como JSON, transforma em objeto JavaScript de verdade, disponível depois em `req.body`. Sem essa linha, `req.body` chegaria vazio nas rotas de `POST`.
- `app.get('/health', ...)` é uma rota simples direto aqui, só pra checar se o servidor está de pé — é essa rota que testamos com `curl` e é ela que "esquenta" o Render antes do vídeo.
- `app.use('/items', itemsRouter)` é a linha mais importante pra entender a organização: **qualquer requisição que comece com `/items` é repassada pro `itemsRouter` decidir o resto**. É por isso que uma chamada pra `/items/abc123` cai exatamente na rota `GET /:id` dentro do router — o `/items` já foi "consumido" aqui, o router só enxerga o `/abc123`.

### Passo 3 — conectando no banco de verdade (`backend/src/lib/prisma.ts`)

```ts
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./dev.db' })
export const prisma = new PrismaClient({ adapter })
```

- **Prisma é um ORM** (Object-Relational Mapper): em vez de escrever SQL na mão (`SELECT * FROM Item WHERE category = ?`), você chama métodos JavaScript (`prisma.item.findMany(...)`) e o Prisma traduz isso pra SQL de verdade por trás das cortinas.
- O **adapter** é a peça que sabe conversar com um banco específico — aqui, SQLite através da biblioteca `libsql`. O Prisma 7 separou isso de propósito, então trocar de banco no futuro (SQLite → Postgres, por exemplo) significaria trocar essa peça, sem reescrever as queries espalhadas pelas rotas.
- `export const prisma = ...` roda **uma única vez**, na primeira vez que esse arquivo é importado, e todo o resto do código reaproveita essa mesma instância (padrão *singleton*). Se cada rota criasse seu próprio `PrismaClient`, cada requisição abriria uma conexão nova com o banco — caro e desnecessário.

### Passo 4 — a validação (`backend/src/schemas/item.ts`)

- **Zod é uma biblioteca de validação**: você descreve o formato esperado de um dado (`z.object({ title: z.string()... })`), e ela confere se um valor bate com esse formato, apontando exatamente o que está errado quando não bate.
- `safeParse(req.body)`, usado na rota, tenta validar **sem lançar exceção** — devolve `{ success: true, data }` ou `{ success: false, error }`. Por isso a rota não precisa de `try/catch` pra isso, só olha `result.success`.
- O `.refine(...)` no final do schema é uma regra que não dá pra expressar campo a campo — ela depende de **dois campos juntos** ("se não é doação, o preço é obrigatório"). `refine` roda só depois que cada campo individual já passou na própria validação, e enxerga o objeto inteiro de uma vez.

### Passo 5 — as rotas em si (`backend/src/routes/items.ts`), uma por uma

**`GET /items`** — listar (com filtro opcional):
```ts
itemsRouter.get('/', async (req, res) => {
  const { category, ownerId } = req.query
  const items = await prisma.item.findMany({
    where: {
      ...(typeof category === 'string' ? { category } : {}),
      ...(typeof ownerId === 'string' ? { ownerId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(items)
})
```
`req.query` é tudo que vem depois do `?` na URL (`/items?category=Livros` → `{ category: 'Livros' }`). O `where` é montado dinamicamente: se `category` veio como texto, adiciona `{ category }` no filtro; se não veio, adiciona um objeto vazio (que não filtra nada). É assim que a mesma rota serve pra "listar tudo" e "listar filtrado" sem duas funções diferentes. `findMany` é "me dá todas as linhas que baterem com esse filtro" — o equivalente a um `SELECT * WHERE ...` em SQL.

**`GET /items/:id`** — buscar um específico:
```ts
itemsRouter.get('/:id', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: req.params.id } })
  if (!item) {
    res.status(404).json({ error: 'Item não encontrado' })
    return
  }
  res.json(item)
})
```
`:id` na URL é um **parâmetro de rota** — o Express captura o que vier ali e coloca em `req.params.id`. `findUnique` busca por uma coluna que garante no máximo uma linha (aqui, a chave primária `id`). O padrão "se não achou, responde 404 e `return` imediatamente" evita continuar executando o resto da função com um `item` que não existe.

**`POST /items`** — criar:
```ts
itemsRouter.post('/', async (req, res) => {
  const result = createItemSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: 'Dados inválidos', issues: result.error.issues })
    return
  }
  const { price, isDonation, ...rest } = result.data
  const item = await prisma.item.create({
    data: { ...rest, isDonation, price: isDonation ? null : (price ?? null) },
  })
  res.status(201).json(item)
})
```
Primeiro valida (se falhar, `400` com a lista de problemas, sem tocar no banco). Se passou, `result.data` é o corpo já validado e **tipado** — o TypeScript sabe exatamente quais campos existem ali. A lógica `price: isDonation ? null : (price ?? null)` garante que doação nunca fica com preço salvo, mesmo que alguém tente mandar um preço junto de `isDonation: true` na requisição. `create` gera o `INSERT` no banco e devolve a linha criada (com `id` e `createdAt` preenchidos pelo Prisma/banco). `201` é o código HTTP correto pra "criei um recurso novo" (diferente de `200`, que é só "deu certo").

**`DELETE /items/:id`** — apagar:
```ts
itemsRouter.delete('/:id', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: req.params.id } })
  if (!item) {
    res.status(404).json({ error: 'Item não encontrado' })
    return
  }
  await prisma.item.delete({ where: { id: req.params.id } })
  res.status(204).send()
})
```
Busca antes de apagar só pra poder responder `404` de forma correta se o item já não existir (`delete` sozinho lançaria um erro genérico do Prisma nesse caso, menos claro pro cliente da API). `204 No Content` é o código HTTP certo pra "deu certo, e não tem nada pra te devolver" — por isso `res.status(204).send()` sem `.json(...)`.

### Passo 6 — do `schema.prisma` até virar tabela de verdade

`backend/prisma/schema.prisma` descreve o formato (`model Item { ... }`), mas **não cria nada sozinho**. O fluxo é:
1. `npx prisma migrate dev` (local) ou `prisma migrate deploy` (produção, dentro do `start:prod`) lê o schema, compara com o estado atual do banco, e gera/aplica um arquivo `.sql` dentro de `prisma/migrations/` — isso É o banco sendo criado/alterado de verdade.
2. `npx prisma generate` lê o schema e gera código TypeScript tipado em `src/generated/prisma/` — é esse código gerado que dá autocomplete e checagem de tipo pra `prisma.item.findMany(...)` etc. Ele nunca é escrito à mão, sempre gerado a partir do schema.

### Juntando tudo: o que acontece quando alguém clica em "Publicar" no formulário

1. O navegador roda `fetch('https://.../items', { method: 'POST', body: JSON.stringify({...}) })` (código em `frontend/src/lib/api.ts`).
2. A requisição HTTP viaja pela internet até o Render.
3. O Express recebe, passa pelo middleware `cors` (autoriza), depois `express.json()` (transforma o corpo em objeto).
4. Bate na regra `app.use('/items', itemsRouter)`, cai em `itemsRouter.post('/')`.
5. `createItemSchema.safeParse` valida. Se falhar → `400` volta na hora, sem chegar perto do banco.
6. Se passou, `prisma.item.create(...)` monta um `INSERT` e escreve no arquivo SQLite.
7. O Prisma devolve a linha criada como objeto JS; `res.status(201).json(item)` serializa esse objeto pra texto JSON e manda de volta na resposta HTTP.
8. O `fetch()` no navegador recebe a resposta, o `AdForm.tsx` chama `navigate('/meus-anuncios')`.

Se você conseguir contar essa sequência de cabeça, sem olhar o código, já demonstra o domínio que a banca quer ver.

### Perguntas que a banca pode fazer (se antecipe)

- **"Por que separar rotas, schema de validação e conexão com banco em arquivos diferentes?"** — cada arquivo tem uma responsabilidade só; fica mais fácil de achar e de testar cada parte sem entender o resto inteiro.
- **"O que acontece se eu mandar um preço negativo?"** — o Zod rejeita antes de chegar no banco, `400` com a mensagem "Preço precisa ser maior que zero".
- **"Por que validar no frontend E no backend, não é redundante?"** — frontend é só experiência do usuário (feedback rápido); qualquer um pode chamar a API direto (Postman, `curl`) pulando o frontend inteiro, então o backend é quem garante de verdade que dado inválido não entra no banco.
- **"O que é esse adapter do Prisma, por que não usa direto?"** — Prisma 7 exige uma peça que sabe falar com o banco específico; pra SQLite, escolhi `libsql` em vez do padrão `better-sqlite3` porque este último precisa compilar código nativo, e essa máquina não tinha as ferramentas de compilação instaladas (documentado no [AI_LOG.md](AI_LOG.md)).

---

## 0:00–1:00 — Pitch e Visão Geral (1 min)

**O que a banca avalia:** síntese, comunicação clara, entendimento do problema de negócio.

Pontos a cobrir, nessa ordem:
1. Apresentação pessoal rápida (nome, curso, uma frase sobre você).
2. O problema: calouro chega na UNIFOR precisando de calculadora, livro, jaleco — caro comprar novo; veterano formando ou trocando de equipamento tem item parado sem serventia.
3. A proposta: "Desapego Universitário" — marketplace de economia circular só do campus, pra doar ou vender item de curso entre estudantes.
4. O fluxo de ponta a ponta em uma frase (é a melhor forma de mostrar que você entende o produto, não só o código): *"A Fernanda anuncia uma calculadora como doação pelo celular; o Lucas, calouro ainda nem matriculado, acha o item pela Landing Page no desktop, filtra por categoria, instala o app no celular dele, abre o item e vê o contato da Fernanda pra combinar a entrega — fora do app, por WhatsApp."*
5. Uma frase de transição pro próximo bloco ("vou mostrar isso funcionando agora").

**Evitar:** ler tela, recitar a lista de telas uma por uma — é pitch, não inventário de features.

---

## 1:00–3:00 — Demonstração Prática (2 min)

**O que a banca avalia:** funcionalidade real, UI/UX, responsividade, PWA funcionando de verdade.

Ordem sugerida (desktop → mobile, como o próprio edital pede):

1. **Desktop, Landing Page** (`https://empresa-vortex.vercel.app`):
   - Hero + proposta
   - Estatísticas simuladas
   - Filtro por categoria na própria Landing (rolar até a vitrine, clicar em uma categoria)
   - Vitrine dos últimos anúncios
   - Um dos dois CTAs (Anunciar ou Buscar)
2. **Desktop, Vitrine** (`/vitrine`): filtro por categoria + busca por palavra-chave, clicar num card → Detalhe do Item (categoria, preço ou "Doação", contato do anunciante).
3. **Celular físico (ou espelhamento de tela):**
   - Abrir o mesmo site no celular — mostrar a responsividade mudando de layout
   - **Instalar o PWA de verdade** ("Adicionar à tela inicial") — esse é o momento mais importante do bloco, é requisito obrigatório
   - Abrir o app já instalado (ícone próprio, sem barra do navegador)
   - Fluxo mobile completo: Identificação (digitar um nome) → Anunciar item (preencher formulário, mostrar validação de campo errado rapidinho) → Publicar → Meus Anúncios (o item aparece, testar excluir)

**Cronometrar esse bloco separadamente no ensaio** — é o mais fácil de estourar o tempo. Se sobrar tempo curto, prioridade: instalar o PWA > criar anúncio > o resto.

---

## 3:00–5:00 — Explicação Técnica do Código (2 min)

**O que a banca avalia:** domínio técnico, organização, clareza, autoria real.

Não dá pra mostrar tudo em 2 min — escolher os pontos que provam entendimento, não decorar arquivo por arquivo:

1. **Estrutura de pastas** (uns 10s): `backend/` (API) e `frontend/` (React + PWA), rapidamente.
2. **Backend — uma rota do CRUD**: abrir `backend/src/routes/items.ts`, mostrar `GET /items` com o filtro por `category`/`ownerId`, e o `POST` chamando a validação Zod antes de gravar. Explicar em uma frase por que a validação existe nos dois lados (cliente = UX, servidor = garantia real).
3. **Prisma**: `backend/prisma/schema.prisma` (model `Item`) e explicar rapidamente por que SQLite + driver adapter `libsql` em vez do padrão `better-sqlite3` (Prisma 7 exige adapter; o padrão pede compilação nativa que não rodava nesta máquina).
4. **Frontend — estado/identidade**: `frontend/src/lib/currentUser.ts` — explicar a decisão de identificação simples (sem senha) e por que ficou isolada num módulo só (fácil trocar por login de verdade depois sem mexer nas telas).
5. **PWA**: `frontend/vite.config.ts` — o bloco do `VitePWA`, manifest e a estratégia `generateSW` (Workbox gera o service worker sozinho).

**Regra de ouro pra esse bloco:** fale como se estivesse explicando pra alguém que nunca viu o código — é isso que prova autoria, não jargão.

---

## 5:00–6:00 — Uso Prático da Inteligência Artificial (1 min)

**O que a banca avalia:** maturidade no uso de IA, senso crítico, curadoria técnica.

1. Ferramentas: Claude (planejamento) + Claude Code (implementação) — uma frase.
2. Mostrar rapidamente a seção "Diário de Bordo da IA" no `README.md` (já rolar até lá antes de gravar).
3. **O erro real** (é o ponto mais valioso do minuto — mostra senso crítico de verdade): abrir `frontend/src/lib/currentUser.ts`, mostrar o comentário sobre o cache do snapshot, e contar em 20-30s: *"a IA escreveu esse hook devolvendo um objeto novo a cada chamada, o que quebra uma regra do `useSyncExternalStore` e travou a aplicação num loop infinito de render — percebi pelo erro no terminal, e a correção foi cachear o objeto."*
4. Fechar com uma frase sobre o que isso ensina: IA acelera, mas só funciona se você entender e revisar o que ela escreve — não é só aceitar.

**Evitar:** ler o AI_LOG inteiro na tela — é só apontar que existe e contar de cabeça o erro específico, com mais confiança do que lendo.

---

## Depois do ensaio

- [ ] Cronometrar cada bloco separado, não só o total
- [ ] Se algum bloco estourar, cortar detalhe técnico do bloco 3 antes de cortar a demo do bloco 2 — funcionalidade real pesa mais que profundidade de código, pela própria tabela do edital
- [ ] Gravar, subir em plataforma com link (YouTube não-listado, Drive público, Loom ou Vimeo)