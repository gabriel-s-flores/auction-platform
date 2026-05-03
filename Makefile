POSTGRES_USER ?= admin
POSTGRES_PASSWORD ?= admin
POSTGRES_DB ?= auction_dev
POSTGRES_TEST_DB ?= auction_test
TEST_DATABASE_URL_DOCKER ?= postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@postgres:5432/$(POSTGRES_TEST_DB)?schema=public

.PHONY: help setup dev storybook storybook-build down clean logs shell-api shell-web shell-storybook migrate seed lint typecheck test test-db test-db-migrate test-integration test-all

help:
	@echo "Available commands:"
	@echo "  make setup      - Build containers and setup database (migrations + seed)"
	@echo "  make dev        - Start development environment"
	@echo "  make storybook  - Start Storybook in Docker"
	@echo "  make storybook-build - Build Storybook in Docker"
	@echo "  make down       - Stop development environment"
	@echo "  make clean      - Stop and remove volumes (reset db)"
	@echo "  make logs       - View logs"
	@echo "  make shell-api  - Open bash in api container"
	@echo "  make shell-web  - Open bash in web container"
	@echo "  make shell-storybook - Open bash in storybook container"
	@echo "  make migrate    - Run prisma migrations"
	@echo "  make seed       - Run database seed"
	@echo "  make lint       - Run lint in Docker"
	@echo "  make typecheck  - Run typecheck in Docker"
	@echo "  make test       - Run fast automated tests"
	@echo "  make test-db    - Create the integration test database"
	@echo "  make test-integration - Run database integration tests"
	@echo "  make test-all   - Run fast tests and database integration tests"

setup:
	@if [ ! -f apps/web/.env ]; then cp apps/web/.env.example apps/web/.env && echo "Created apps/web/.env from .env.example"; else echo "apps/web/.env already exists"; fi
	docker compose build
	docker compose up -d postgres
	@echo "Waiting for postgres to be ready..."
	@sleep 5
	docker compose run --rm api bun run prisma:migrate:deploy
	docker compose run --rm api bun run db:seed
	docker compose down
	@echo "Setup complete. Run 'make dev' to start."


# Start development environment
dev:
	docker compose up

storybook:
	docker compose up storybook

storybook-build:
	docker compose run --rm storybook bun run --cwd packages/ui storybook:build

# Rebuild containers and force refresh of anonymous volumes (node_modules)
# Use this when dependencies change (e.g. package.json updates) or when seeing stale errors
rebuild:
	docker compose down
	docker compose up -d --build --force-recreate -V


down:
	docker compose down

clean:
	docker compose down -v
	docker system prune -f

logs:
	docker compose logs -f

shell-api:
	docker compose exec api /bin/bash

shell-web:
	docker compose exec web /bin/bash

shell-storybook:
	docker compose exec storybook /bin/bash

migrate:
	docker compose run --rm api bun run prisma:migrate:deploy

seed:
	docker compose run --rm api bun run db:seed

lint:
	docker compose run --rm web bun run lint

typecheck:
	docker compose run --rm web bun run typecheck

test:
	docker compose run --rm web bun run test

test-db:
	docker compose up -d postgres
	@echo "Waiting for postgres to be ready..."
	@until docker compose exec -T postgres pg_isready -U $(POSTGRES_USER) -d $(POSTGRES_DB) >/dev/null 2>&1; do sleep 1; done
	docker compose exec -T postgres sh -lc 'createdb -U "$${POSTGRES_USER:-admin}" "$(POSTGRES_TEST_DB)" 2>/dev/null || true'
	@echo "Test database '$(POSTGRES_TEST_DB)' is ready."

test-db-migrate: test-db
	docker compose run --rm -e DATABASE_URL="$(TEST_DATABASE_URL_DOCKER)" api bun run prisma:migrate:deploy

test-integration: test-db-migrate
	docker compose run --rm -e DATABASE_URL="$(TEST_DATABASE_URL_DOCKER)" -e TEST_DATABASE_URL="$(TEST_DATABASE_URL_DOCKER)" -e NODE_ENV=test api bun run test:integration

test-all: test test-integration
