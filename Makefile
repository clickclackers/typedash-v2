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
	@echo "🚀 Starting development environment..."
	@trap 'echo "🛑 Stopping docker services..."; \
		docker compose -f server/compose.yaml down 2>/dev/null || true; \
		exit' INT TERM EXIT; \
	make server & \
	make client & \
	wait

.PHONY: server
server:
	docker compose -f server/compose.yaml up db server-dev

.PHONY: client
client:
	cd client && pnpm dev

.PHONY: install
install:
	@echo "🍺 Installing system dependencies via Homebrew..."
	brew install sqlc pre-commit golangci-lint goimports golang-migrate redis postgresql
	@echo "🔧 Installing Go development tools..."
	@AIR_VERSION=$${AIR_VERSION:-v1.62.0}; \
		echo "Installing air $$AIR_VERSION..."; \
		go install github.com/air-verse/air@$$AIR_VERSION
	@echo "🔍 Installing pre-commit hooks..."
	pre-commit install
	@echo "📦 Installing Go dependencies..."
	go mod tidy
	@echo "📦 Installing pnpm dependencies..."
	cd client && pnpm install
	@echo "✅ All dependencies installed!"

.PHONY: test
test:
	@echo "🧪 Running Go tests..."
	cd server && go test ./...
	@echo "🧪 Running React tests..."
	cd client && pnpm test
	@echo "✅ All tests complete!"

.PHONY: sqlc
sqlc:
	@echo "🗄️  Generating sqlc code..."
	cd server/db && sqlc generate
	@echo "✅ Database code generation complete!"

.PHONY: redis-start
redis-start:
	@echo "🚀 Starting PostgreSQL service..."
	@if ! brew services list | grep redis | grep started > /dev/null; then \
		brew services start redis; \
		echo "✅ Redis service started"; \
	else \
		echo "✅ Redis service already running"; \
	fi

.PHONY: db-migrate
db-migrate:
	@echo "📋 Applying database migrations..."
	migrate -path server/db/migrations -database "postgres://typedash:typedash@localhost:5432/typedash?sslmode=disable" up
	@echo "✅ Migrations applied successfully !"

.PHONY: db-seed
db-seed:
	@echo "🌱 Seeding..."
	psql "postgres://typedash:typedash@localhost:5432/typedash?sslmode=disable" -f server/db/seeds/*.sql
	@echo "✅ Seeded successfully!"

.PHONY: lint
lint:
	@echo "🔍 Linting Go code..."
	cd server && go vet ./...
	@echo "🔍 Linting React code..."
	cd client && pnpm lint
	@echo "✅ Linting complete!"