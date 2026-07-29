# Histórico da conversa de planejamento — Desafio Vortex

> Este arquivo é um resumo da conversa de planejamento feita com o Claude (fora do VS Code) antes de começar a implementação. Serve para dar contexto completo a quem continuar o projeto a partir daqui — incluindo o Claude Code no VS Code.

## O desafio

Processo seletivo de estágio Full-Stack no Laboratório Vortex (UNIFOR). Edital completo em [PS_Full_Stack.pdf](PS_Full_Stack.pdf). Resumo: construir um "Marketplace de Economia Circular do Campus" — plataforma onde estudantes anunciam itens (livros, calculadoras, eletrônicos, jalecos, móveis) para doação ou venda, com uma Landing Page pública e uma experiência PWA instalável no mobile.

Prazo: 15 dias, começando 2026-07-23, entrega em **2026-08-06**.

A nota final considera 4 eixos: qualidade/completude da entrega (Git & README), domínio técnico e autoria (vídeo — o candidato precisa explicar o próprio código ao vivo), atendimento aos requisitos obrigatórios, e uso inteligente/curadoria de IA (não só copiar cegamente). É obrigatório manter um "Diário de Bordo da IA" no README com ferramentas usadas, prompts reais, e um exemplo de erro/alucinação da IA que foi identificado e corrigido.

## Decisões já fechadas

- **Frontend:** React + Vite + TypeScript + Tailwind + React Router, com PWA via `vite-plugin-pwa`
- **Backend:** Node.js + TypeScript + Express + Prisma ORM 7 (driver adapter `@prisma/adapter-libsql`, não `better-sqlite3` — esta máquina Windows não tem Visual Studio Build Tools para compilar módulos nativos) + SQLite + Zod para validação
- **Escopo:** mínimo obrigatório 100% sólido primeiro, depois bônus em camadas priorizadas por custo-benefício: validação de campos > identificação de usuário > deploy real > DB real/cache offline/polish visual
- **Identificação de usuário (Camada 2):** decidida como versão simples sem senha (nome em `localStorage` via `frontend/src/lib/currentUser.ts`), não JWT — desenhada para ser trocável por auth real depois sem reescrever as telas
- **Deploy (Camada 3):** já está no ar — backend no Render, frontend na Vercel
- **Repositório:** criado em [github.com/ACrush14/EmpresaVortex](https://github.com/ACrush14/EmpresaVortex), público, independente. Importante: a pasta do projeto (`D:\UNIFOR\Clones Github\VortexFullStack`) fica dentro da árvore de um monorepo pessoal bem maior do usuário (com arquivos pessoais sensíveis) — o `.git` deste projeto é próprio e isolado, nunca deve ser misturado com o repo pessoal externo.

## Documentos já produzidos (na raiz do repo)

- [PLANEJAMENTO.md](PLANEJAMENTO.md) — plano de trabalho vivo: stack, estrutura de pastas, modelo de dados, escopo em camadas obrigatório/bônus, cronograma dia a dia (23/07→06/08), estratégia do Diário de Bordo da IA, roteiro do vídeo de 6 minutos, riscos, e divisão de qual IA usar em qual tarefa
- [REQUISITOS_TELAS.csv](REQUISITOS_TELAS.csv) — lista de requisitos numerada por tela (`1, 1.1, 1.2...`), 6 telas: Landing Page, Vitrine/Busca, Detalhe do Item, Formulário de Anúncio, Meus Anúncios, Identificação/Autenticação — cada item marcado como Obrigatório ou Bônus

## Discussão sobre o fluxo de uso (economia circular na prática)

Simulamos o uso com duas personas para validar o fluxo do produto:
- **Fernanda** (veterana) anuncia uma calculadora científica como doação pelo PWA
- **Lucas** (calouro, ainda nem matriculado) encontra o item pela Landing Page no desktop, filtra por categoria, instala o PWA no celular, abre o item e vê o contato de Fernanda
- Eles combinam a entrega **fora do app** (WhatsApp/e-mail do próprio anúncio) — decisão de produto: **não construir chat interno**, isso seria escopo maior do que o edital pede (que só exige CRUD)
- Fernanda apaga o anúncio depois da entrega (`DELETE /items/:id`), o item some da vitrine, e a estatística da landing sobe ("+1 item recirculado")

Essa simulação é o motivo pelo qual existem a **Tela 3 (Detalhe do Item)** e o **campo de contato** no formulário/detalhe — eles não estão explícitos no edital, foram adicionados para o fluxo fazer sentido de ponta a ponta. Isso ainda pode ser simplificado se o usuário preferir.

## Divisão de IA por tarefa (rascunho para o Diário de Bordo)

| Tarefa | IA | Como usar sem perder autoria |
|---|---|---|
| Arquitetura, modelagem de dados, lógica de backend, debugging | Claude | Discutir a decisão antes de implementar, entender cada trecho antes de aceitar |
| Mockup visual das 6 telas (a partir do REQUISITOS_TELAS.csv) | Stitch (Google) | Usar como referência visual/inspiração, **não colar o código exportado direto** — reimplementar em React entendendo cada componente |
| Escrita do README + Diário de Bordo | Claude | Revisar e reescrever com as próprias palavras onde fizer sentido |
| Revisão de código / simplificação | Claude | Aplicar sugestões só depois de entender o motivo de cada uma |

Ideia central repetida na conversa: **IA para decisão e velocidade, nunca para pular a compreensão** — isso é literalmente um dos 4 eixos da nota e é checado ao vivo no vídeo (minuto 3 a 5, quando o candidato abre o VS Code e explica a arquitetura).

## Painel Admin (extra, ideia do usuário — não avaliado no edital)

O usuário pediu uma rota `/admin` protegida por senha (`2001`) para poder deletar anúncios de mau gosto ou piada. Ponto de atenção levantado na conversa: como o repositório é **público**, a senha nunca pode ficar escrita direto no código commitado — vira variável de ambiente no backend (`ADMIN_PASSWORD`, `.env` local já no `.gitignore`, secret na plataforma de deploy). Um `POST /admin/login` valida no servidor e devolve um token; ações de admin (deletar qualquer item) exigem esse token. Se o front for Vite, a variável nunca pode ter prefixo `VITE_` (isso a exporia no bundle do navegador). Adicionado como Tela 7 no REQUISITOS_TELAS.csv e seção 3.2 do PLANEJAMENTO.md.

## Prioridades recapituladas

**Obrigatório (piso mínimo):**
- Backend: CRUD completo (criar, listar, filtrar por categoria, deletar), JSON estrito, persistência confiável (SQLite resolve)
- Frontend: Landing Page com vitrine + filtro + estatísticas simuladas + CTAs, responsividade completa
- PWA: `manifest.json` válido + service worker básico + instalável de verdade no celular
- Fluxo mobile: formulário de anúncio + "meus anúncios"

**Bônus, em ordem de custo-benefício:**
1. Deploy real (API + frontend) — o edital chama de "fortíssimo diferencial"
2. Validação de campos + tratamento de erros — barato, eleva a percepção de qualidade
3. Autenticação/identificação de usuário — necessário para "meus anúncios" fazer sentido
4. TypeScript no frontend — já garantido pela stack escolhida
5. Banco de dados real (Postgres/Mongo) — só se sobrar tempo confortável
6. Cache offline no service worker — arriscado de demonstrar bem nos 2 min de demo do vídeo, prioridade mais baixa

## O que aconteceu depois, no VS Code (25 a 28/07, fora desta conversa)

Esta conversa de planejamento ficou pausada em 24/07 enquanto o candidato seguiu a implementação com o Claude Code, direto no VS Code. Resumo do que foi feito lá (detalhe completo, com prompts reais e erros corrigidos, em [AI_LOG.md](AI_LOG.md)):

- **25/07:** backend implementado (Prisma + Express + Zod, CRUD completo de `/items`), frontend integrado à API real (sem dados mockados), validação de campos nos dois lados, filtro por categoria na Landing, PWA (manifest + service worker via `vite-plugin-pwa`) e identificação de usuário simples (Camada 2) — todas testadas em navegador com Playwright.
- **28/07:** deploy real (Camada 3) — backend no Render, frontend na Vercel — incluindo três erros de configuração corrigidos em produção (build command, start command/migrations, script não commitado) e um problema sutil de `VITE_API_URL` sendo fixada em build-time.

**Ainda pendente segundo a memória do projeto:** teste de instalação do PWA em celular físico (Android/iOS) nunca confirmado.

## Estado atual e próximo passo (retomado em 29/07)

O candidato voltou a esta conversa (fora do VS Code) para discutir uma ideia nova: um Painel Admin (ver seção acima) protegido por senha via variável de ambiente. Isso foi registrado como Tela 7 (extra) no REQUISITOS_TELAS.csv e seção 3.2 do PLANEJAMENTO.md, mas **ainda não foi implementado**.

Também foi adicionada uma entrada de 29/07 no [AI_LOG.md](AI_LOG.md) real do projeto, documentando esse pedido e a decisão de segurança (senha nunca no código commitado).
