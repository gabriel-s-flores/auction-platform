# Mapeamento de Funcionalidades — Painel do Usuário

## 1. Objetivo

Definir o escopo funcional e técnico para implementar um **painel do usuário autenticado** no `auction-platform`, permitindo que ele acompanhe sua atuação como **vendedor** e como **arrematante** em um único lugar.

O foco deste documento é organizar um **MVP viável com o schema atual**, respeitando as regras do monorepo: segurança por padrão, payloads enxutos, paginação e separação arquitetural entre backend, frontend e contratos compartilhados.

---

## 2. Levantamento do estado atual

Com base no código já existente, o projeto já possui:

- autenticação completa (`login`, `logout`, `refresh`, `auth/me`);
- criação de leilões;
- envio de lances;
- fechamento de leilão;
- upload e gestão de imagens;
- solicitação de edição de leilões com aprovação administrativa;
- painel administrativo já implementado;
- dados persistidos para:
  - `User`
  - `Auction`
  - `Bid`
  - `PendingAuctionEdit`

### O que ainda não existe

- endpoints de **self-service** para o usuário consultar seus próprios dados consolidados;
- página/rota dedicada para o painel do usuário no frontend;
- contratos compartilhados para dashboard/listagens do usuário;
- consultas específicas para:
  - leilões publicados pelo usuário;
  - arremates ganhos pelo usuário;
  - histórico de lances do usuário;
  - solicitações de edição enviadas pelo usuário.

### Conclusão do levantamento

O **MVP do painel do usuário não exige migration**.

O schema atual já suporta o escopo principal através de:

- `Auction.sellerId`
- `Bid.bidderId`
- `Auction.status`
- `Auction.highestBid`
- `PendingAuctionEdit.submittedById`

---

## 3. Objetivos do painel do usuário

O painel deve permitir que o usuário:

1. acompanhe rapidamente sua situação na plataforma;
2. veja seus **últimos arremates**;
3. gerencie seus **leilões publicados**;
4. acompanhe seus **lances ativos e encerrados**;
5. veja o status de **edições pendentes** enviadas ao admin;
6. acesse informações básicas da própria conta.

---

## 4. Escopo funcional recomendado

## 4.1 MVP — obrigatório

### 4.1.1 Visão geral do painel

#### Objetivo
Dar contexto imediato do que está acontecendo com a conta do usuário.

#### Informações sugeridas

- total de leilões publicados;
- total de leilões ativos;
- total de leilões pendentes de aprovação;
- total de leilões encerrados;
- total de arremates ganhos;
- total de participações em lances ativos.

#### Ações rápidas

- criar novo leilão;
- ver meus leilões;
- ver meus arremates;
- ver meus lances.

#### Benefício
Reduz a navegação dispersa e transforma o painel em ponto central de operação.

---

### 4.1.2 Meus leilões publicados

#### Objetivo
Permitir que o usuário acompanhe os leilões em que atua como vendedor.

#### Funcionalidades

- listar leilões do usuário com paginação;
- filtrar por status:
  - `PENDING_APPROVAL`
  - `OPEN`
  - `CLOSED`
  - `REJECTED`
- exibir:
  - título;
  - melhor lance atual;
  - status;
  - data de encerramento;
  - data de criação;
  - motivo de rejeição, quando existir.

#### Ações recomendadas

- ver detalhes do leilão;
- fechar leilão manualmente, quando permitido;
- solicitar edição;
- gerenciar imagens.

#### Observações

- esta é a área mais importante para o perfil de vendedor;
- deve deixar claro quando um leilão ainda depende de aprovação administrativa.

---

### 4.1.3 Últimos arremates

#### Objetivo
Dar visibilidade aos leilões encerrados em que o usuário venceu.

#### Funcionalidades

- listar arremates ganhos pelo usuário;
- exibir:
  - título do leilão;
  - valor final do arremate;
  - data de encerramento;
  - vendedor;
  - link para detalhes.

#### Observações

- no modelo atual, o sistema consegue identificar o ganhador pelo maior lance igual ao `highestBid` em leilão `CLOSED`;
- o MVP cobre o resultado do arremate, mas **não** cobre pagamento, retirada, entrega ou disputa pós-venda.

---

### 4.1.4 Meus lances

#### Objetivo
Permitir que o usuário acompanhe sua atuação como participante de leilões.

#### Funcionalidades

- listar leilões nos quais o usuário já deu lance;
- mostrar o maior lance do usuário por leilão;
- indicar situação atual:
  - vencendo;
  - ultrapassado;
  - leilão encerrado com vitória;
  - leilão encerrado sem vitória.

#### Benefício
Complementa a seção de arremates, porque mostra também as disputas em andamento.

---

### 4.1.5 Minhas solicitações de edição

#### Objetivo
Permitir que o vendedor acompanhe pedidos de alteração enviados para revisão do admin.

#### Funcionalidades

- listar solicitações por leilão;
- exibir:
  - tipo da edição (`TITLE`, `DESCRIPTION`, `IMAGES`);
  - status da solicitação;
  - data de envio;
  - motivo de rejeição, quando existir.

#### Benefício
Evita que o usuário precise descobrir o resultado da revisão apenas entrando no leilão.

---

### 4.1.6 Conta / perfil

#### Objetivo
Centralizar informações básicas do usuário autenticado.

#### MVP sugerido

- exibir nome;
- exibir email;
- exibir data de cadastro;
- exibir tipo de conta (`USER`, `ADMIN`, `SUPER_ADMIN`) apenas como informação.

#### Opcional ainda no MVP

- editar nome;
- trocar senha.

#### Recomendação
Se for necessário reduzir escopo, a seção de perfil pode entrar como **somente leitura** na primeira entrega.

---

## 4.2 Fase 2 — recomendadas, mas não obrigatórias no MVP

Estas funcionalidades agregam valor, mas hoje exigem ampliação de domínio, novos contratos ou novas tabelas.

### 4.2.1 Notificações do usuário

- aviso de leilão vencido;
- aviso de leilão ultrapassado;
- aviso de aprovação/rejeição de edição;
- aviso de aprovação/rejeição do leilão publicado.

### 4.2.2 Favoritos / watchlist

- salvar leilões de interesse;
- acompanhar sem precisar dar lance;
- filtrar favoritos ativos e encerrados.

### 4.2.3 Pós-arremate

- status de pagamento;
- status de retirada/entrega;
- histórico financeiro;
- comprovantes.

### 4.2.4 Reputação / confiança

- avaliação entre comprador e vendedor;
- score de confiabilidade;
- histórico de transações concluídas.

### 4.2.5 Preferências de conta

- preferências de notificação;
- configurações de privacidade;
- idioma/experiência futura.

---

## 5. Priorização recomendada

| Prioridade | Módulo | Motivo |
| --- | --- | --- |
| P0 | Visão geral | entrega valor imediato e organiza navegação |
| P0 | Meus leilões publicados | principal necessidade do vendedor |
| P0 | Últimos arremates | principal necessidade do arrematante |
| P0 | Meus lances | acompanhamento de disputa ativa e histórico |
| P0 | Minhas solicitações de edição | reduz fricção com fluxo de moderação |
| P1 | Perfil/conta editável | útil, mas menos crítico que operação de leilões |
| P2 | Notificações | depende de desenho adicional de produto |
| P2 | Favoritos/watchlist | exige novas entidades/contratos |
| P2 | Pós-arremate | exige expansão de domínio |

---

## 6. Recomendação de UX e navegação

## 6.1 Rota principal

### Recomendação

- **rota técnica:** `/account`
- **label de navegação:** `Meu painel`

### Motivo

As rotas existentes do projeto estão majoritariamente em inglês (`/login`, `/register`, `/auctions`, `/admin`), então `/account` mantém consistência técnica, enquanto o texto exibido na interface pode continuar em português.

---

## 6.2 Estrutura de navegação sugerida

### Opção recomendada para MVP

Uma única página `/account` com seções ou tabs:

- Resumo
- Meus leilões
- Meus arremates
- Meus lances
- Minhas edições
- Conta

### Motivo

- menor complexidade de roteamento;
- entrega mais rápida;
- reaproveita layout único com React Query;
- facilita evolução futura para nested routes, se necessário.

---

## 6.3 Estados de interface obrigatórios

Cada seção do painel deve ter:

- loading state;
- empty state;
- error state;
- paginação ou “carregar mais”, quando aplicável;
- filtros simples por status onde fizer sentido.

---

## 7. Mapeamento técnico — backend

## 7.1 Endpoints recomendados

> Todos os endpoints devem usar o usuário autenticado derivado do token/cookie. O cliente **não deve** enviar `userId` para consultar o próprio painel.

| Método | Endpoint | Objetivo |
| --- | --- | --- |
| GET | `/api/users/me/dashboard` | resumo do painel do usuário |
| GET | `/api/users/me/auctions?status=&page=&limit=` | listar leilões publicados pelo usuário |
| GET | `/api/users/me/wins?page=&limit=` | listar arremates ganhos |
| GET | `/api/users/me/bids?status=&page=&limit=` | listar atividade de lances do usuário |
| GET | `/api/users/me/edits?status=&page=&limit=` | listar solicitações de edição enviadas |
| PATCH | `/api/users/me/profile` | atualizar dados básicos do perfil (opcional no MVP) |
| PATCH | `/api/users/me/password` | trocar senha (opcional no MVP) |

---

## 7.2 Use cases recomendados

### Backend (`apps/api/src/application/use-cases`)

- `get-user-dashboard-summary.use-case.ts`
- `list-user-auctions.use-case.ts`
- `list-user-wins.use-case.ts`
- `list-user-bids.use-case.ts`
- `list-user-pending-edits.use-case.ts`
- `update-user-profile.use-case.ts` *(opcional no MVP)*
- `change-user-password.use-case.ts` *(opcional no MVP)*

---

## 7.3 Repositórios a evoluir

### `AuctionRepository`

Hoje cobre o fluxo público e operacional de leilões, mas precisa ganhar consultas voltadas ao usuário autenticado.

#### Sugestões de operações

- `getUserDashboardSummary(userId)`
- `listBySeller(input)`
- `listWinsByBidder(input)`
- `listBidActivityByUser(input)`

### `PendingEditRepository`

#### Sugestão de operação

- `listBySubmittedBy(input)`

### Observação

As consultas devem retornar apenas os dados necessários para a UI, evitando reaproveitar DTOs administrativos com payload maior que o necessário.

---

## 7.4 Contratos compartilhados

### `packages/shared-types`

Tipos recomendados:

- `UserDashboardSummaryDto`
- `UserAuctionListItemDto`
- `UserWinDto`
- `UserBidActivityDto`
- `UserPendingEditDto`
- `ListUserAuctionsResponse`
- `ListUserWinsResponse`
- `ListUserBidsResponse`
- `ListUserPendingEditsResponse`
- `GetUserDashboardResponse`

---

## 7.5 Regras de segurança obrigatórias

- autenticação obrigatória em todas as rotas do painel;
- nunca confiar em `userId` vindo do frontend;
- sanitizar mensagens de erro;
- aplicar paginação e limites máximos para evitar abuso;
- retornar somente dados do próprio usuário;
- não reutilizar rotas administrativas para self-service.

---

## 7.6 Regras de performance obrigatórias

- listagens paginadas;
- projeções enxutas no Prisma;
- evitar N+1 queries;
- consolidar contagens do dashboard com consultas objetivas;
- evitar trazer listas completas quando a tela exibe apenas resumo;
- considerar índices já existentes em `sellerId`, `bidderId` e `status`.

---

## 8. Mapeamento técnico — frontend

## 8.1 Organização sugerida

### Frontend (`apps/web/src/features/user-panel`)

- `services/user-panel.service.ts`
- `hooks/useUserDashboard.ts`
- `hooks/useUserAuctions.ts`
- `hooks/useUserWins.ts`
- `hooks/useUserBids.ts`
- `hooks/useUserPendingEdits.ts`
- `components/UserSummaryCards.tsx`
- `components/UserAuctionsList.tsx`
- `components/UserWinsList.tsx`
- `components/UserBidsList.tsx`
- `components/UserPendingEditsList.tsx`

### Página

- `apps/web/src/pages/UserDashboardPage.tsx`

### Roteamento

- rota protegida em `/account`

---

## 8.2 Ajustes de navegação

No header principal da aplicação, quando o usuário estiver autenticado, incluir:

- link `Meu painel`;
- manter `Criar leilão` como atalho operacional.

---

## 8.3 Requisitos de UI

- cards de resumo no topo;
- tabs ou seções bem separadas;
- ações contextuais nas listas;
- datas formatadas em `pt-BR`;
- valores monetários formatados em BRL;
- feedback visual claro para status de leilão e status de revisão.

---

## 9. Fluxos de usuário que o painel deve cobrir

## 9.1 Fluxo do vendedor

1. usuário autenticado acessa `Meu painel`;
2. visualiza resumo dos seus leilões;
3. entra em `Meus leilões`;
4. identifica quais estão ativos, pendentes, encerrados ou rejeitados;
5. acessa detalhes do leilão ou solicita edição.

## 9.2 Fluxo do arrematante

1. usuário participa de lances;
2. acessa `Meus lances` para acompanhar disputas abertas;
3. quando vence um leilão encerrado, o item aparece em `Últimos arremates`.

## 9.3 Fluxo de moderação de edição

1. usuário solicita alteração em um leilão;
2. acompanha o andamento em `Minhas solicitações de edição`;
3. vê aprovação ou rejeição com motivo quando aplicável.

---

## 10. Backlog técnico sugerido

## 10.1 Backend

- [ ] criar contratos de consulta do painel do usuário nos repositórios;
- [ ] implementar use cases de dashboard, leilões, arremates, lances e edições;
- [ ] criar controllers HTTP e registrar rotas em `app.ts`;
- [ ] adicionar schemas de query params com paginação/filtros;
- [ ] garantir respostas com payload enxuto e seguro.

## 10.2 Shared types

- [ ] definir DTOs e responses do painel do usuário;
- [ ] exportar os novos tipos em `packages/shared-types/src/index.ts`.

## 10.3 Frontend

- [ ] criar serviço de consumo das rotas do painel;
- [ ] criar hooks com React Query;
- [ ] criar página `UserDashboardPage`;
- [ ] adicionar rota protegida `/account`;
- [ ] adicionar link `Meu painel` no header;
- [ ] implementar componentes de lista, cards, estados vazios e filtros.

## 10.4 Qualidade

- [ ] validar estados vazios e de erro;
- [ ] revisar segurança de acesso aos dados do usuário;
- [ ] executar `bun run lint`;
- [ ] executar `bun run typecheck`.

---

## 11. Critérios de aceite do MVP

- o usuário autenticado consegue acessar seu painel sem informar `userId`;
- o painel mostra resumo coerente com seus dados reais;
- o usuário consegue listar seus leilões publicados por status;
- o usuário consegue visualizar seus últimos arremates;
- o usuário consegue visualizar seus lances e sua situação em cada disputa;
- o usuário consegue visualizar solicitações de edição enviadas;
- nenhuma rota do painel expõe dados de outros usuários;
- a navegação principal passa a oferecer acesso claro ao painel.

---

## 12. Decisões recomendadas

### Decisões já recomendadas

- implementar primeiro como **MVP sem migration**;
- usar rota `/account` com label `Meu painel`;
- começar com **uma página única com seções/tabs**;
- separar claramente o painel do usuário das rotas administrativas;
- priorizar valor operacional antes de funcionalidades sociais/futuras.

### Itens que podem ser decididos na implementação

- tabs na mesma página vs nested routes;
- edição de perfil no MVP ou fase seguinte;
- inclusão de paginação clássica ou botão “carregar mais”.

---

## 13. Resumo executivo

O painel do usuário deve consolidar duas perspectivas principais:

- **como vendedor:** meus leilões, status e solicitações de edição;
- **como arrematante:** meus lances e últimos arremates.

Com a modelagem atual, já é possível entregar um MVP sólido contendo:

1. visão geral;
2. meus leilões publicados;
3. últimos arremates;
4. meus lances;
5. minhas solicitações de edição;
6. perfil básico.

O próximo passo recomendado é transformar este mapeamento em implementação incremental por camadas: **shared-types -> API -> Web -> validação final**.