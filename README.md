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
├── backend/     # API REST (Express + Prisma)
├── frontend/    # React + Vite (PWA)
└── README.md
```

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
| `GET` | `/items` | Lista itens. Aceita `?category=` para filtrar |
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

### Telas implementadas

Landing Page, Vitrine/Busca, Detalhe do Item, Formulário de Anúncio, Meus Anúncios e Identificação — ver [REQUISITOS_TELAS.csv](REQUISITOS_TELAS.csv) para o detalhamento por tela.

## Estado atual

- ✅ Backend: CRUD completo de itens (`GET`, `GET/:id`, `POST`, `DELETE`), validação de campos, persistência SQLite
- ✅ Frontend: as 6 telas montadas com roteamento, ainda consumindo dados mockados (`frontend/src/lib/mockItems.ts`)
- ⏳ Pendente: integrar o frontend com a API real (trocar mocks pelos `fetch` para `/items`), PWA (manifest + service worker), autenticação/identificação de usuário, deploy

## Diário de Bordo da IA

Ver [AI_LOG.md](AI_LOG.md).
