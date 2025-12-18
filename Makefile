# TypeDash Development Makefile

.PHONY: help
help:
	@echo "TypeDash Development Commands:"
	@echo "  make dev          - Start both server and client in development mode"
	@echo "  make server       - Start only the Go server"
	@echo "  make client       - Start only the React client"
	@echo "  make sqlc         - Run sqlc generate"
	@echo "  make db-migrate   - Apply migrations to the Docker Compose Postgres"
	@echo "  make db-seed      - Seed the Docker Compose Postgres"
	@echo "  make install      - Install all dependencies (Go modules + pnpm packages)"
	@echo "  make test         - Run tests for both server and client"
	@echo "  make lint         - Run linting for both server and client"

.PHONY: dev
dev:
	@trap ' \
		docker compose -f server/compose.dev.yaml down 2>/dev/null || true; \
		exit' INT TERM EXIT; \
	make server & \
	for i in $$(seq 1 60); do \
		if curl -s http://localhost:3000/healthz >/dev/null 2>&1; then \
			break; \
		fi; \
		if [ $$i -eq 60 ]; then \
			echo "❌ Server failed to start within 60 seconds"; \
			docker compose -f server/compose.dev.yaml down 2>/dev/null || true; \
			exit 1; \
		fi; \
		sleep 1; \
	done; \
	make client & \
	wait

.PHONY: server
server:
	docker compose -f server/compose.dev.yaml up

.PHONY: client
client:
	cd client && pnpm dev

.PHONY: install
install:
	@echo "🍺 Installing system dependencies via Homebrew..."
	brew install sqlc pre-commit golangci-lint goimports golang-migrate
	@echo "🔧 Installing Go development tools..."
	@AIR_VERSION=$${AIR_VERSION:-v1.62.0}; \
		echo "Installing air $$AIR_VERSION..."; \
		go install github.com/air-verse/air@$$AIR_VERSION
	@echo "🔍 Installing pre-commit hooks..."
	pre-commit install
	@echo "📦 Installing Go dependencies..."
	cd server && go mod tidy
	@echo "📦 Installing pnpm dependencies..."
	cd client && pnpm install

.PHONY: test
test:
	@echo "🧪 Running Go tests..."
	cd server && go test ./...
	@echo "🧪 Running React tests..."
	cd client && pnpm test

.PHONY: sqlc
sqlc:
	cd server/db && sqlc generate

.PHONY: db-migrate
db-migrate:
	migrate -path server/db/migrations -database "postgres://typedash:typedash@localhost:5432/typedash?sslmode=disable" up

.PHONY: db-seed
db-seed:
	docker compose -f server/compose.dev.yaml up -d db
	docker compose -f server/compose.dev.yaml exec -T db psql -U typedash -d typedash < server/db/seed.sql

.PHONY: lint
lint:
	@echo "🔍 Linting Go code..."
	cd server && go vet ./...
	@echo "🔍 Linting React code..."
	cd client && pnpm lint