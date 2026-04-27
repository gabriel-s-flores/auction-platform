# RULES — auction-platform

Este documento define as regras obrigatórias de engenharia para o monorepo `auction-platform`.

> **Regra-mãe:** todo código, arquitetura e operação **devem obedecer às melhores práticas e convenções de segurança e performance**.

## 1) Escopo e objetivos

Estas regras se aplicam a:

- `apps/api` (backend)
- `apps/web` (frontend)
- `packages/*` (código compartilhado)
- `infra/*` (scripts e operação local)

Objetivos:

1. manter consistência técnica no monorepo;
2. reduzir regressões e débito técnico;
3. elevar segurança e performance por padrão;
4. garantir previsibilidade em PRs e releases.

## 2) Princípios obrigatórios

1. **Segurança por padrão**
   - validar toda entrada externa;
   - nunca confiar em dados do cliente;
   - proteger segredos e credenciais;
   - evitar exposição de detalhes internos em erros.

2. **Performance por padrão**
   - evitar trabalho desnecessário no backend e frontend;
   - preferir consultas e payloads enxutos;
   - minimizar renderizações e recomputações no web app;
   - considerar custo computacional e de I/O em toda mudança.

3. **Simplicidade e clareza**
   - soluções simples e legíveis antes de abstrações complexas;
   - nomes explícitos e orientados ao domínio.

4. **Evolução segura**
   - alterações devem preservar compatibilidade sempre que possível;
   - mudanças de contrato exigem atualização coordenada (API, tipos compartilhados e frontend).

## 3) Regras de arquitetura

### 3.1 Backend (`apps/api`) — Clean Architecture

Camadas e responsabilidades:

- `domain/`: entidades e contratos de repositório (regras de negócio puras);
- `application/`: casos de uso, serviços e erros de aplicação;
- `interfaces/`: HTTP/controllers/tipos de interface;
- `infrastructure/`: banco, segurança, implementações concretas.

Regras de dependência:

- `domain` **não** depende de outras camadas;
- `application` pode depender de `domain`, nunca de framework;
- `interfaces` pode depender de `application`;
- `infrastructure` implementa contratos de `domain/application`.

### 3.2 Frontend (`apps/web`) — feature-based

Organização padrão:

- `entities/`: modelos e tipos de domínio na UI;
- `features/`: casos de uso da interface (hooks, services, componentes de feature);
- `shared/`: infra compartilhada (api, auth, config, routing);
- `pages/`: composição de telas e fluxos.

Regra: evitar dependências cruzadas desnecessárias entre features.

## 4) Padrões de código e naming

1. TypeScript em modo estrito; evitar `any`.
2. Funções e variáveis com nomes semânticos e orientados ao negócio.
3. Um arquivo, uma responsabilidade principal.
4. Evitar comentários óbvios; preferir código autoexplicativo.
5. Não duplicar regras de negócio (extrair para camada correta).

Regras de Linting (estritas):

- **Imports**: Organizados automaticamente (`simple-import-sort`) e remover não utilizados.
- **Tipos**: Usar `import type` para importações de tipos (facilita tree-shaking).
- **Promises**: Sempre aguardar promises (`await`) ou retornar; proibido "floating promises".

Convenções:

- Use cases: `*.use-case.ts`
- Controllers: `*.controller.ts`
- Repositories: `*-repository.ts` (contrato) / `prisma-*.repository.ts` (implementação)
- Hooks React: `use*.ts`

## 5) Regras de segurança (obrigatórias)

1. **Input validation** em toda fronteira HTTP.
2. **AuthN/AuthZ** obrigatórias em rotas protegidas.
3. **Nunca** commitar credenciais/tokens/segredos reais.
4. Erros devem ser sanitizados (sem stack/sensitive data para cliente).
5. Aplicar princípio do menor privilégio em acesso a recursos.
6. Dependências devem ser mantidas atualizadas e auditáveis.

## 6) Regras de performance (obrigatórias)

1. Banco de dados
   - evitar N+1 queries;
   - usar transações quando necessário para consistência;
   - revisar impacto de índices e filtros das consultas.

2. API
   - retornar apenas dados necessários;
   - evitar processamento redundante por request;
   - preservar latência previsível em rotas críticas.

3. Frontend
   - evitar re-renders desnecessários;
   - usar cache/estado remoto corretamente (React Query);
   - reduzir payloads e processamento no cliente.

## 7) Regras de dados e Prisma

1. Toda mudança de schema deve vir com migration.
2. Não editar migration já aplicada em ambiente compartilhado.
3. Seed deve ser idempotente sempre que possível.
4. Fluxos concorrentes (ex.: lances) devem manter atomicidade e isolamento.

## 8) Regras de API e contratos

1. Status HTTP coerentes com o cenário.
2. Mensagens de erro consistentes e legíveis.
3. Contratos compartilhados devem refletir `packages/shared-types` quando aplicável.
4. Mudança de contrato exige atualização coordenada no frontend.

## 9) Regras de qualidade e governança

Antes de abrir PR, é obrigatório passar:

```powershell
bun run lint
bun run typecheck
```

Também é obrigatório:

- respeitar ESLint + Prettier + EditorConfig do repositório;
- manter commits no padrão Conventional Commits (commitlint);
- manter PR pequeno, com objetivo claro e descrição técnica.
- toda feature nova implementada por agente deve incluir testes automatizados cobrindo o comportamento entregue; se não for tecnicamente possível, documentar o motivo e o risco residual no PR.

Restrições técnicas (CI/CD):

- `no-console`: Logs de produção devem usar logger estruturado, não `console.log`.
- `react-hooks/exhaustive-deps`: Dependências de hooks devem ser exaustivas.
- `tailwindcss`: Classes utilitárias devem ser válidas e ordenadas (prettier-plugin-tailwindcss).

## 10) Regras de ambiente e operação local

1. Ambiente oficial: **Windows + PowerShell + Bun**.
2. Usar scripts do repositório para setup/dev/migrate.
3. Não introduzir dependência obrigatória de Docker para fluxo local atual.

Comandos de referência:

```powershell
bun run setup
bun run db:setup
bun run db:setup:staging
bun run dev
bun run staging
```

## 11) Checklist obrigatório de PR

- [ ] Arquitetura respeitada (camadas/feature boundaries)
- [ ] Segurança revisada (validação, auth, segredos, erros)
- [ ] Performance revisada (queries, payloads, renderização)
- [ ] Contratos/tipos atualizados quando necessário
- [ ] Features novas implementadas por agente possuem testes automatizados correspondentes
- [ ] `bun run lint` sem erros
- [ ] `bun run typecheck` sem erros
- [ ] Sem código morto, logs temporários ou comentários de debug

---

## 12) Regra de decisão em caso de dúvida

Quando houver ambiguidade, escolher a alternativa que maximize, nesta ordem:

1. **Segurança**
2. **Corretude funcional**
3. **Performance**
4. **Manutenibilidade**
5. **Velocidade de entrega**

Se a decisão impactar arquitetura ou contrato, documentar no PR.
