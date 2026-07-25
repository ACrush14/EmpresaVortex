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
