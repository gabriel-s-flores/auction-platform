.PHONY: help setup dev down clean logs shell-api shell-web migrate seed

help:
	@echo "Available commands:"
	@echo "  make setup      - Build containers and setup database (migrations + seed)"
	@echo "  make dev        - Start development environment"
	@echo "  make down       - Stop development environment"
	@echo "  make clean      - Stop and remove volumes (reset db)"
	@echo "  make logs       - View logs"
	@echo "  make shell-api  - Open bash in api container"
	@echo "  make shell-web  - Open bash in web container"
	@echo "  make migrate    - Run prisma migrations"
	@echo "  make seed       - Run database seed"

setup:
	docker compose build
	docker compose up -d postgres
	@echo "Waiting for postgres to be ready..."
	@sleep 5
	docker compose run --rm api bun run prisma:migrate:deploy
	docker compose run --rm api bun run db:seed
	docker compose down
	@echo "Setup complete. Run 'make dev' to start."

dev:
	docker compose up

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

migrate:
	docker compose run --rm api bun run prisma:migrate:deploy

seed:
	docker compose run --rm api bun run db:seed
