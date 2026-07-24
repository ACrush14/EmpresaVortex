# Planejamento — Desafio Técnico Vortex (UNIFOR)

> Rascunho v1, para discutirmos e ajustarmos juntos. Nada aqui é definitivo ainda.

**Prazo:** 15 dias, começando 23/07/2026 → entrega **06/08/2026**.
**Projeto:** Marketplace de Economia Circular do Campus (Desapego Universitário)

---

## 1. Decisão de stack

| Camada   | Escolha                                                                    | Status        |
| -------- | -------------------------------------------------------------------------- | ------------- |
| Frontend | React + Vite + TypeScript + `vite-plugin-pwa`                              | ✅ confirmado |
| Backend  | **A decidir** — sugestão: Node.js + TypeScript + Express + Prisma + SQLite | 🔶 em aberto  |
| Escopo   | Mínimo sólido primeiro, bônus em camadas                                   | ✅ confirmado |

**Por que sugiro Node+TS no backend:** você disse que é importante conseguir escrever e explicar o código de verdade (isso é literalmente 1/3 da nota do vídeo — "Domínio Técnico e Autoria"). Usar TypeScript nos dois lados significa uma linguagem só para dominar em 15 dias, os mesmos conceitos (tipos, async/await, estruturação de módulos) se repetem no front e no back, e isso reduz a distância entre "o que a IA gerou" e "o que eu realmente entendo". Se você já tem mais confiança em Python (FastAPI) ou outra stack, também funciona bem — é só uma escolha sua. **Me diga qual você quer fechar e eu ajusto o resto do plano.**

## 2. Estrutura do repositório (proposta)

```
VortexFullStack/
├── backend/          # API REST
├── frontend/          # React + Vite PWA
├── README.md          # entrega final: instruções + diário de bordo da IA
└── PLANEJAMENTO.md     # este arquivo (uso interno, não faz parte da entrega)
```

## 3. Modelo de dados (Item / Anúncio)

```
Item {
  id
  title
  description
  category      // Livros, Engenharia, Computação, etc.
  price         // null ou 0 se for doação
  isDonation    // boolean
  imageUrl      // string simulada
  ownerId       // dono do anúncio
  createdAt
}
```

Endpoints mínimos:

- `GET /items` (com filtro por `?category=`)
- `GET /items/:id`
- `POST /items`
- `DELETE /items/:id`

## 3.1. Lista de requisitos por tela

Detalhamento tela a tela (numeração `1, 1.1, 1.2...` = tela e seus itens/funções) está em [REQUISITOS_TELAS.csv](REQUISITOS_TELAS.csv). 6 telas: Landing Page, Vitrine/Busca, Detalhe do Item, Formulário de Anúncio, Meus Anúncios, Identificação/Autenticação.

## 4. Escopo — obrigatório vs bônus, em camadas

**Camada 0 — Obrigatório (não negociável):**

- CRUD de anúncios funcionando, JSON estrito
- Persistência (SQLite resolve isso com folga)
- Landing page pública: hero, estatísticas simuladas, vitrine com filtro por categoria, CTAs
- PWA: manifest.json válido + service worker básico + instalável no mobile
- Formulário de anúncio + "meus anúncios" no fluxo mobile
- Responsividade completa desktop → mobile

**Camada 1 (fazer logo após o obrigatório funcionar):**

- Validação de campos obrigatórios + tratamento de erros consistente (status codes corretos, mensagens claras)

**Camada 2:**

- Autenticação simples (JWT) ou identificação por usuário (mais rápido de implementar, ainda conta como diferencial)

**Camada 3 — maior custo-benefício de nota:**

- Deploy real: backend no Render/Railway, frontend na Vercel. O edital chama isso de "fortíssimo diferencial"

**Camada 4 (só se sobrar tempo confortável):**

- Cache offline no service worker
- Migrar SQLite → Postgres real
- Polish visual (transições, skeleton loading, etc.)
- TypeScript já está coberto pela escolha de stack acima

## 5. Cronograma (15 dias)

| Dia | Data  | Foco                                                                                            |
| --- | ----- | ----------------------------------------------------------------------------------------------- |
| 1   | 23/07 | Setup dos dois projetos, decisão final de stack, modelagem de dados, wireframe rápido das telas |
| 2   | 24/07 | Backend: estrutura do projeto + `POST/GET /items` funcionando                                   |
| 3   | 25/07 | Backend: filtro por categoria, `DELETE`, persistência SQLite validada                           |
| 4   | 26/07 | Backend: validação de campos + tratamento de erros (camada 1)                                   |
| 5   | 27/07 | Frontend: setup Vite+React+TS, layout base da Landing Page                                      |
| 6   | 28/07 | Frontend: vitrine de itens consumindo a API + filtro por categoria                              |
| 7   | 29/07 | Frontend: estatísticas simuladas + CTAs da landing                                              |
| 8   | 30/07 | Frontend mobile: formulário de anúncio + "meus anúncios"                                        |
| 9   | 31/07 | PWA: manifest.json + service worker + teste real de instalação no celular                       |
| 10  | 01/08 | Integração fim a fim desktop+mobile, ajustes de responsividade                                  |
| 11  | 02/08 | Bônus camada 2: autenticação/identificação de usuário                                           |
| 12  | 03/08 | Deploy (API + frontend) + testes em produção                                                    |
| 13  | 04/08 | Bônus camada 4 se sobrar fôlego (offline cache, polish) — senão, buffer                         |
| 14  | 05/08 | README completo + revisão geral + fechamento do Diário de Bordo                                 |
| 15  | 06/08 | Roteiro e gravação do vídeo (6 min), buffer para imprevistos, submissão                         |

Isso assume dedicação diária moderada. Se você tiver dias cheios de aula/trabalho no meio disso, me avisa que redistribuímos.

## 6. Diário de Bordo da IA — como manter sem parecer forçado

Recomendo **não deixar para escrever no dia 14**. A banca provavelmente percebe diário escrito retroativamente. Sugestão:

- Criar `AI_LOG.md` (ou seção no README) desde o dia 1
- Cada vez que um prompt te destrava de verdade (bug feio, decisão de arquitetura, service worker), copiar o prompt ali na hora, com 1-2 linhas de contexto
- Guardar pelo menos 1 momento real de alucinação/erro da IA e como você percebeu e corrigiu — isso é peso explícito na nota, vale anotar assim que acontecer

## 7. Roteiro do vídeo (6 min, cronometrado pelo edital)

| Tempo     | Conteúdo                                                                                    |
| --------- | ------------------------------------------------------------------------------------------- |
| 0:00–1:00 | Pitch pessoal + visão geral do problema/proposta                                            |
| 1:00–3:00 | Demo: landing desktop → navegação mobile → criar anúncio → instalar PWA                     |
| 3:00–5:00 | Código no VS Code: arquitetura de pastas, rotas do backend, lógica do service worker/estado |
| 5:00–6:00 | Uso da IA: mostrar prompts/README, momento de correção de erro da IA                        |

Vale ensaiar isso pelo menos uma vez cronometrado — 6 minutos é curto para 4 blocos.

## 8. Riscos a vigiar

- **Free tier cold start** (Render dorme após inatividade) — gravar o vídeo com a API já "aquecida" ou avisar isso no README
- **PWA no iOS** é mais restrita que Android — testar instalação nos dois se possível, ou documentar qual foi testado
- **Scope creep nos bônus** — regra: só avança de camada se a camada anterior está 100% funcionando e testada

## 9. Divisão de IA por tarefa (rascunho pro Diário de Bordo)

| Tarefa                                                        | IA              | Como usar sem perder autoria                                                                                                    |
| ------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Arquitetura, modelagem de dados, lógica de backend, debugging | Claude          | Discutir a decisão antes de implementar, entender cada trecho antes de aceitar                                                  |
| Mockup visual das 6 telas (a partir do REQUISITOS_TELAS.csv)  | Stitch (Google) | Usar como referência visual/inspiração, não colar o código exportado direto — reimplementar em React entendendo cada componente |
| Escrita do README + Diário de Bordo                           | Claude          | Revisar e reescrever com as próprias palavras onde fizer sentido                                                                |
| Revisão de código / simplificação                             | Claude          | Aplicar sugestões só depois de entender o motivo de cada uma                                                                    |

Ideia central: **IA para decisão e velocidade, nunca para pular a compreensão** — isso é literalmente 25% da nota (eixo "Uso Inteligente e Curadoria de IA") e é checado ao vivo no vídeo.

---

**Pontos em aberto para decidirmos juntos:**

1. Backend: fecha em Node+TS ou prefere outra stack?
2. O cronograma acima faz sentido com sua rotina, ou tem dias que precisam ser mais leves?
3. Auth JWT de verdade ou identificação simples por usuário (mais rápido) na camada 2?
