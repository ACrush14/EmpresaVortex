# Desapego Universitário — Marketplace de Economia Circular do Campus

Projeto do processo seletivo de estágio Full-Stack do Laboratório Vortex (UNIFOR). Plataforma onde estudantes anunciam itens (livros, calculadoras, eletrônicos, jalecos, móveis) para doação ou venda, com uma Landing Page pública e uma experiência PWA instalável no mobile.

Edital completo em [PS_Full_Stack.pdf](PS_Full_Stack.pdf). Contexto de planejamento em [PLANEJAMENTO.md](PLANEJAMENTO.md), [REQUISITOS_TELAS.csv](REQUISITOS_TELAS.csv) e [historico.md](historico.md). Diário de bordo do uso de IA em [AI_LOG.md](AI_LOG.md).

## Stack

| Camada   | Tecnologias |
| -------- | ----------- |
| Frontend | React + Vite + TypeScript + Tailwind CSS + React Router |
| Backend  | Node.js + TypeScript + Express + Prisma ORM 7 + SQLite (via driver adapter `@prisma/adapter-libsql`) + Zod |

## Estrutura do repositório

```
VortexFullStack/
├── backend/               # API REST (Express + Prisma)
├── frontend/              # React + Vite (PWA)
├── README.md              # este arquivo — entrega final
├── AI_LOG.md              # diário de bordo do uso de IA
├── PLANEJAMENTO.md        # plano de trabalho (uso interno, não é entrega)
├── REQUISITOS_TELAS.csv   # requisitos por tela
└── historico.md           # resumo da conversa de planejamento fora do VS Code
```

## Como rodar tudo (backend + frontend)

Em dois terminais separados:

```bash
# terminal 1 — backend
cd backend
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev              # http://localhost:3333

# terminal 2 — frontend
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Abra `http://localhost:5173` com o backend já no ar. Detalhes de cada lado abaixo.

## Backend

### Rodando localmente

```bash
cd backend
npm install
npx prisma migrate dev   # cria/atualiza o banco SQLite (dev.db) a partir do schema
npx tsx prisma/seed.ts   # popula o banco com itens de exemplo
npm run dev              # sobe a API em http://localhost:3333
```

### Modelo de dados (`Item`)

```prisma
model Item {
  id          String   @id @default(cuid())
  title       String
  description String
  category    String
  price       Float?
  isDonation  Boolean  @default(false)
  imageUrl    String
  contact     String
  ownerId     String
  createdAt   DateTime @default(now())
}
```

Categorias aceitas (validadas no Zod, `backend/src/schemas/item.ts`): `Livros`, `Engenharia`, `Computação`, `Eletrônicos`, `Jalecos`, `Móveis`, `Outros`.

### Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/items` | Lista itens. Aceita `?category=` e `?ownerId=` para filtrar (combináveis) |
| `GET` | `/items/:id` | Detalhe de um item. `404` se não existir |
| `POST` | `/items` | Cria um item. Corpo validado com Zod, `400` com lista de erros se inválido |
| `DELETE` | `/items/:id` | Remove um item. `404` se não existir, `204` se removido |

### Por que Prisma 7 + SQLite + libsql

O Prisma 7 tornou obrigatório o uso de um "driver adapter" para bancos SQL — não dá mais para conectar só com a `DATABASE_URL` no schema. Para SQLite, o caminho padrão seria `@prisma/adapter-better-sqlite3`, mas ele exige compilar um módulo nativo (`node-gyp` + Visual Studio Build Tools), que não estava disponível no ambiente de desenvolvimento. Optamos por `@prisma/adapter-libsql`, que também fala SQLite localmente (arquivo `file:./dev.db`) mas usa binário pré-compilado — sem exigir toolchain de compilação nativa.

## Frontend

### Rodando localmente

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Por padrão o frontend chama a API em `http://localhost:3333` (ver `frontend/.env`, variável `VITE_API_URL`). Rode o backend antes ou junto do frontend para as telas carregarem dados de verdade.

Para testar o PWA (manifest + service worker, que não rodam em `npm run dev`): `npm run build && npm run preview`.

### Telas implementadas

Landing Page, Vitrine/Busca, Detalhe do Item, Formulário de Anúncio, Meus Anúncios e Identificação — ver [REQUISITOS_TELAS.csv](REQUISITOS_TELAS.csv) para o detalhamento por tela. Todas já consomem a API real (`frontend/src/lib/api.ts`); não há mais dados mockados no código. A Landing Page também tem filtro por categoria (requisito 1.4), aplicado sobre os últimos anúncios.

### Identificação de usuário (Camada 2, sem senha)

Não é login/JWT — é identificação simples, do jeito que o edital aceita como bônus nessa camada: a pessoa digita um nome em `/identificacao`, sem senha, e ele fica salvo neste navegador (`frontend/src/lib/currentUser.ts`) junto do id anônimo que já associa os itens ao dono (`ownerId`, exigido pelo backend). O Header mostra o nome quando identificado; "Sair / trocar nome" limpa nome **e** id, então a pessoa seguinte no mesmo navegador não herda os anúncios de quem saiu.

Decisão consciente de manter simples: dá pra qualquer um se identificar como qualquer nome (não valida senha nem impede duplicidade) — é o suficiente pro requisito 6 (identificação, associação de anúncios, persistência de sessão), sem gastar o tempo que um login de verdade exigiria. Ver [AI_LOG.md](AI_LOG.md) pra decisão completa e por que ficou desenhado assim (módulo único, fácil de trocar por auth real depois sem mexer nas telas que o usam).

### Validação do formulário de anúncio

Duas camadas, redundantes de propósito:

1. **Cliente** (`frontend/src/pages/AdForm.tsx`): antes de chamar a API, valida título/descrição preenchidos, preço > 0 quando não é doação, URL de imagem bem formada e contato preenchido — mostra a mensagem embaixo do campo específico, sem deixar enviar.
2. **Servidor** (`backend/src/schemas/item.ts`, Zod): mesma validação de novo, porque a API não pode confiar que só esse formulário vai chamá-la. Se o backend rejeitar (`400`), o frontend usa o campo `issues` da resposta pra apontar o erro no campo certo — cobre os casos que a validação do cliente não pegar.

### PWA

Configurado com `vite-plugin-pwa` (`frontend/vite.config.ts`), estratégia `generateSW` (service worker gerado automaticamente com o Workbox, sem escrever nada na mão). O build de produção (`npm run build`) gera `dist/manifest.webmanifest` e `dist/sw.js`; **o service worker não roda no `npm run dev`**, só em build+preview (`npm run preview`) ou no deploy final.

- Manifest: nome, `theme_color` (`#059669`, o mesmo verde do resto da UI), `display: standalone`, ícones em `frontend/public/pwa-*.png` (192, 512 e uma versão `maskable` com margem de segurança pro Android).
- Ícones gerados a partir de `frontend/public/pwa-icon.svg` (um SVG próprio, não reaproveitando o favicon genérico que veio do template do Vite).
- Testado: manifest válido, service worker registra e ativa, ícones nos tamanhos certos — via Playwright contra o build de produção servido localmente (`npm run preview`).
- Não testado ainda: instalação real num celular físico (Android/iOS). O [PLANEJAMENTO.md](PLANEJAMENTO.md) já sinalizava esse risco — PWA no iOS é mais restrita — então vale testar em um aparelho antes do vídeo e documentar aqui qual foi validado.

## Estado atual

- ✅ Backend: CRUD completo de itens (`GET`, `GET/:id`, `POST`, `DELETE`), filtro por categoria e por dono, validação de campos com mensagens específicas, persistência SQLite
- ✅ Frontend: as 6 telas integradas com a API real, incluindo filtro por categoria na Landing e na Vitrine, formulário com validação por campo, e "Meus Anúncios" com exclusão real — testado de ponta a ponta em navegador (Playwright)
- ✅ PWA: manifest + service worker gerados e validados em build de produção
- ✅ Identificação (Camada 2): nome simples persistido no navegador, associando anúncios ao usuário
- ⏳ Pendente: teste de instalação em celular físico, deploy, commit do trabalho recente

## Diário de Bordo da IA

Ver [AI_LOG.md](AI_LOG.md).
