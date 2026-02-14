# auction-platform

Monorepo profissional com **Bun** (runtime + package manager), orientado a Windows/PowerShell.

## Arquitetura adotada

- **Monorepo com Bun Workspaces**: menor complexidade operacional e ótima integração com Bun.
- **Backend em Clean Architecture**: separação entre domínio, casos de uso, interfaces e infraestrutura.
- **Frontend feature-based**: organização por contexto de negócio para escalar funcionalidades.
- **Design System desacoplado**: pacote `@auction/ui` consumido pelo frontend.
- **Config centralizada**: pacote `@auction/config` para ESLint, Prettier, TSConfig e Tailwind.

## Estrutura

```txt
apps/
  web/      # React + Vite
  api/      # REST API (Bun)
packages/
  ui/       # Design System compartilhado
  config/   # Configs compartilhadas
infra/
  *.ps1     # automações Windows PowerShell
```

## Requisitos

- Windows + PowerShell
- Bun instalado (https://bun.sh)
- PostgreSQL instalado localmente no Windows (sem Docker)

## Comandos principais

```powershell
bun run setup
bun run db:setup
bun run db:setup:staging
bun run db:migrate
bun run db:migrate:staging
bun run dev
bun run staging
bun run lint
bun run typecheck
```

## PostgreSQL no Windows (setup rápido)

1. Instale PostgreSQL para Windows (instalador oficial da EDB).
2. Durante a instalação, defina usuário/senha (ex.: `postgres` / `postgres`).
3. Adicione o diretório `bin` ao PATH (exemplo):
   - `C:\Program Files\PostgreSQL\17\bin`
4. Valide no PowerShell:

```powershell
psql --version
```

5. Configure `apps/api/.env.development` e `apps/api/.env.staging` com:
   - `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
   - `DATABASE_URL`
   - `NODE_ENV`, `APP_ENV`

6. Execute bootstrap de banco + migrations + seed por ambiente:

```powershell
bun run db:setup
bun run db:setup:staging
```

## Como evitamos race conditions em lances

No caso de uso de lance, o backend usa transação SQL com Prisma `$transaction` + isolamento `SERIALIZABLE` e lock pessimista (`SELECT ... FOR UPDATE`) na linha do leilão. Com isso, lances concorrentes no mesmo leilão são serializados: apenas uma transação consegue validar/atualizar `highestBid` e gravar o lance vencedor por vez.

As operações críticas (validação de status/valor, insert em `bids`, update de `auctions.highestBid` e incremento de `version`) ocorrem no mesmo bloco transacional, garantindo atomicidade: ou tudo comita, ou nada persiste.

## Ambientes

- `development`
- `staging` (homologação local)

No frontend (`apps/web`), use `.env.development`, `.env.staging` e `.env.example`.

### Portas e bancos (dev + staging simultâneos)

| Serviço | Development | Staging |
|---|---:|---:|
| API | `http://localhost:3333` | `http://localhost:3334` |
| Web | `http://localhost:5173` | `http://localhost:4173` |
| PostgreSQL DB | `auction_dev` | `auction_staging` |

Com isso, os dois ambientes podem rodar na mesma máquina sem conflito.

## Frontend web (Bun + React + Vite)

Stack utilizada no app web: 

- Bun
- React + Vite
- TypeScript (strict)
- Tailwind
- React Query
- Axios

### Páginas implementadas (fluxo mínimo)

- `/login`
- `/register`
- `/auctions`
- `/auctions/new` (protegida)
- `/auctions/:auctionId`

### Scripts Bun (web)

```powershell
bun run --filter @auction/web dev
bun run --filter @auction/web dev:staging
```

### Variáveis de ambiente do frontend

Arquivos esperados:

- `apps/web/.env.development`
- `apps/web/.env.staging`

Exemplo (`apps/web/.env.development`):

```env
VITE_APP_NAME=Auction Platform (development)
VITE_API_BASE_URL=http://localhost:3333
```

Exemplo (`apps/web/.env.staging`):

```env
VITE_APP_NAME=Auction Platform (staging)
VITE_API_BASE_URL=http://localhost:3334
```

### Setup local no Windows (frontend)

1. Instale dependências:

```powershell
bun install
```

2. Suba backend e frontend em local:

```powershell
bun run dev
```

3. Ou rode só frontend/backend por ambiente:

```powershell
bun run dev:web:staging
bun run dev:api:staging
```

4. Ou use scripts PowerShell dedicados:

```powershell
bun run ps:web:dev
bun run ps:web:staging
bun run ps:api:dev
bun run ps:api:staging
```

## Backend: healthcheck, logs estruturados e flags

- `GET /health` retorna `status`, `appEnv`, `nodeEnv`, `uptimeInSeconds` e `timestamp`.
- Logs estruturados em JSON via logger nativo do Fastify.
- Flags de ambiente aplicadas na API: `NODE_ENV` e `APP_ENV`.

## Troubleshooting (Prisma Client)

Se ao subir a API aparecer `@prisma/client did not initialize yet`, gere o client e tente novamente:

```powershell
bun run --filter @auction/api prisma:generate
bun run --filter @auction/api dev
```

Os scripts `dev`/`dev:staging` da API já executam `prisma:generate` automaticamente para evitar recorrência.

## Qualidade e governança

- ESLint + Prettier compartilhados
- Husky + lint-staged
- Commitlint (Conventional Commits)

Consulte também: `infra/README.md`.
