# Auction Platform

Monorepo profissional desenvolvido com **Bun**, utilizando **Clean Architecture** no backend e **Feature-based Architecture** no frontend.

O projeto foca em:
- **Segurança e Performance por padrão**.
- **Consistência técnica** através de linting rigoroso e tipos compartilhados.
- **Experiência de desenvolvimento** flexível (Docker para Linux/WSL e Nativo para Windows).

---

## 🏗️ Arquitetura e Estrutura

O projeto é um Monorepo organizado com Bun Workspaces:

```txt
apps/
  api/          # Backend (Fastify + Prisma + Clean Arch)
  web/          # Frontend (React + Vite + Feature-based)

packages/
  ui/           # Design System compartilhado (Componentes React)
  config/       # Configurações compartilhadas (TS, ESLint, Tailwind)
  shared-types/ # Tipos compartilhados entre API e Web (Contratos)

infra/          # Scripts de automação (PowerShell) e Docker
```

### Backend (`apps/api`)
Segue **Clean Architecture** estrita com as seguintes camadas:
- **Domain**: Entidades e regras de negócio puras (sem dependências externas).
- **Application**: Casos de uso (Use Cases) que orquestram o fluxo da aplicação.
- **Infrastructure**: Implementações concretas (Banco de dados/Prisma, Hash, Token, etc).
- **Interfaces**: Controladores HTTP (Fastify) e DTOs.

### Frontend (`apps/web`)
Organizado por **Features** para escalar melhor:
- `features/*`: Cada funcionalidade tem sua própria pasta com componentes, hooks e serviços isolados.
- `shared/*`: Componentes de UI genéricos e utilitários globais.
- `pages/*`: Rotas da aplicação que compõem as features.

---

## ⚡ Core Business: Concorrência em Lances

Um ponto crítico deste projeto é a garantia de integridade em leilões concorrentes.

**Como evitamos Race Conditions:**
No caso de uso de lance (`PlaceBidUseCase`), o backend utiliza:
1.  **Transação SQL** com Prisma `$transaction`.
2.  Nível de isolamento **SERIALIZABLE**.
3.  Lock pessimista (`SELECT ... FOR UPDATE`) na linha do leilão.

Isso garante que lances simultâneos no mesmo leilão sejam processados serialmente: apenas uma transação consegue validar o valor, atualizar o `highestBid` e gravar o lance vencedor por vez. **Ou tudo comita, ou nada persiste.**

---

## 🚀 Como rodar o projeto

Escolha o método mais adequado para o seu sistema operacional.

### 🐧 Opção 1: Linux / WSL (Recomendado)

Utiliza **Docker Compose** para orquestrar API, Web e Banco de Dados. Ideal para garantir o mesmo ambiente independente da máquina.

**Pré-requisitos:**
- [Docker](https://docs.docker.com/engine/install/) e [Docker Compose](https://docs.docker.com/compose/install/)
- [Make](https://www.gnu.org/software/make/) (opcional, para usar os atalhos)

#### Passos Rápidos

1. **Setup Inicial**
   Cria os arquivos `.env` locais, constrói os containers da API/Web, sobe o banco, aplica migrações e popula com dados de teste (`seed`).
   ```bash
   make setup
   ```

2. **Iniciar Aplicação**
   Inicia a API, o Frontend e o Banco de Dados em modo de desenvolvimento com hot-reload.
   ```bash
   make dev
   ```
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **API:** [http://localhost:3333](http://localhost:3333)

   Usuários criados pelo seed:
   - `superadmin@auction.local` / `superadmin123456`
   - `admin@auction.local` / `admin123456`
   - `user@auction.local` / `user123456`

#### Comandos Úteis (Make)

| Comando | Descrição |
|---|---|
| `make down` | Para e remove os containers da execução atual. |
| `make logs` | Visualiza logs unificados de todos os serviços. |
| `make shell-api` | Acessa o shell do container da API. |
| `make migrate` | Executa `prisma migrate deploy` no container. |

---

### 🪟 Opção 2: Windows (Nativo)

Método tradicional usando PowerShell. Requer instalação local das ferramentas.

**Pré-requisitos:**
- [Bun](https://bun.sh/) instalado.
- [PostgreSQL](https://www.postgresql.org/download/windows/) instalado e rodando localmente.
- PowerShell.

#### Configuração do Banco
1. Instale o PostgreSQL (versão 16+ recomendada).
2. Configure as variáveis em `apps/api/.env.development`:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/auction_dev?schema=public"
   ```

#### Passos Rápidos

1. **Instalar Dependências**
   ```powershell
   bun install
   ```

2. **Setup do Banco (Migrations + Seed)**
   ```powershell
   bun run db:setup
   ```

3. **Iniciar Aplicação**
   Roda API e Frontend simultaneamente.
   ```powershell
   bun run dev
   ```

---



## 🌍 Ambientes e Portas

O projeto suporta ambientes de `development` e `staging` rodando simultaneamente (útil para testar features sem quebrar o dev).

| Serviço | Development | Staging |
|---|---:|---:|
| API | `http://localhost:3333` | `http://localhost:3334` |
| Web | `http://localhost:5173` | `http://localhost:4173` |
| PostgreSQL DB | `auction_dev` | `auction_staging` |

No frontend, as variáveis são carregadas de `.env.development` ou `.env.staging` baseadas no script executado (`dev` vs `dev:staging`).

---

## 🛑 Como parar a aplicação

Para encerrar a execução do servidor e garantir que todos os processos do Bun sejam finalizados:

### Windows (PowerShell)

1. No terminal onde o comando está rodando, pressione **`Ctrl + C`**.
2. Geralmente isso é suficiente. Caso o processo persista ou o terminal trave, você pode forçar o encerramento de todos os processos do Bun com o comando:
   ```powershell
   taskkill /IM bun.exe /F
   ```

### Linux / WSL

1. Se estiver rodando via **Docker/Make**:
   ```bash
   make down
   ```
   Isso irá parar e remover os containers corretamente.

2. Se estiver rodando **nativamente** no terminal:
   - Pressione **`Ctrl + C`**.
   - Se necessário forçar o encerramento:
     ```bash
     pkill -f bun
     ```

---

## ✅ Qualidade e Governança

Mantemos alto padrão de código com ferramentas automatizadas que rodam antes de cada commit (`husky` + `lint-staged`).

### Ferramentas
- **ESLint**: Análise estática de código (regras estritas).
- **Prettier**: Formatação automática de código.
- **Commitlint**: Padronização de mensagens de commit (Conventional Commits).
- **TypeScript**: Configurado em modo estrito (`strict: true`).

### Comandos de Verificação
Antes de abrir um PR, é obrigatório rodar:

```bash
# Verifica estilo e erros de código em todo o monorepo
bun run lint

# Verifica integridade de tipos TypeScript em todo o monorepo
bun run typecheck
```

## 🛠️ Troubleshooting

**Erro: `@prisma/client did not initialize yet`**
Se a API falhar com este erro, significa que o cliente do Prisma precisa ser regerado.
- No Docker: Reinicie o container (`make dev` faz isso automaticamente).
- No Windows: Rode `bun run --filter @auction/api prisma:generate`.

**Erro: Porta já está em uso**
Certifique-se de que não há outros serviços rodando nas portas 3333, 5173 ou 5432.
- Linux: `sudo lsof -i :3333`
- Windows: `netstat -ano | findstr :3333`
