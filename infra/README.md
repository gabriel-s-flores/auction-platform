# Infra local (Windows / PowerShell)

Este diretório concentra scripts para operação local sem Docker.

## Scripts

- `setup.ps1`: instala dependências e prepara hooks.
- `dev.ps1`: sobe ambiente local (`development` ou `staging`).
- `run-web.ps1`: sobe apenas frontend por ambiente.
- `run-api.ps1`: sobe apenas backend por ambiente.
- `migrate.ps1`: executa migrations por ambiente.
- `check-env.ps1`: valida existência de arquivos `.env` esperados.
- `db-setup.ps1`: cria banco PostgreSQL, executa migrations e seed via comandos Bun.

## Uso

```powershell
bun run setup
bun run check-env
bun run db:setup
bun run db:setup:staging
bun run db:migrate
bun run db:migrate:staging
bun run dev
bun run staging
bun run ps:web:dev
bun run ps:web:staging
bun run ps:api:dev
bun run ps:api:staging
```

## Frontend web (envs)

- Development: `apps/web/.env.development`
- Staging: `apps/web/.env.staging`

O `check-env.ps1` valida esses arquivos para o app web.

## Ambientes simultâneos

- API dev: porta `3333`, DB `auction_dev`
- API staging: porta `3334`, DB `auction_staging`
- Web dev: porta `5173`
- Web staging: porta `4173`

## Observações

- O script `dev.ps1` abre a API em uma nova janela PowerShell e mantém o frontend na janela atual.
- Todos os fluxos foram desenhados para Windows, sem bash/sh/make, Docker ou docker-compose.
