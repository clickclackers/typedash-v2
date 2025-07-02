# TypeDash Development Makefile

.PHONY: help
help:
	@echo "TypeDash Development Commands:"
	@echo "  make dev          - Start both server and client in development mode"
	@echo "  make server       - Start only the Go server"
	@echo "  make client       - Start only the React client"
	@echo "  make sqlc         - Run sqlc generate"
	@echo "  make db-setup     - Setup PostgreSQL database (db-start, db-create, db-schema)"
	@echo "  make db-start     - Start PostgreSQL service"
	@echo "  make db-create    - Create typedash database"
	@echo "  make db-schema    - Apply database schema"
	@echo "  make db-reset     - Drop and recreate database with schema"
	@echo "  make install      - Install all dependencies (Go modules + npm packages)"
	@echo "  make test         - Run tests for both server and client"
	@echo "  make lint         - Run linting for both server and client"

.PHONY: dev
dev:
	@trap 'kill $$(jobs -p)' EXIT; \
	make server & \
	make client & \
	wait

.PHONY: server
server:
	cd server && air

.PHONY: client
client:
	cd client && npm run dev

.PHONY: install
install:
	@echo "📦 Installing Go dependencies..."
	go mod tidy
	@echo "📦 Installing npm dependencies..."
	cd client && npm install
	@echo "✅ All dependencies installed!"

.PHONY: test
test:
	@echo "🧪 Running Go tests..."
	cd server && go test ./...
	@echo "🧪 Running React tests..."
	cd client && npm test
	@echo "✅ All tests complete!"

.PHONY: sqlc
sqlc:
	@echo "🗄️  Generating sqlc code..."
	cd server/db && sqlc generate
	@echo "✅ Database code generation complete!"

.PHONY: db-setup
db-setup: db-start db-create db-schema
	@echo "✅ Database setup complete!"
	@echo "📝 Set your environment variables:"
	@echo "   DATABASE_URL=\"postgres://$(shell whoami)@localhost:5432/typedash?sslmode=disable\""
	@echo "   export JWT_SECRET=\"your-super-secret-jwt-key-change-this-in-production\""

.PHONY: db-start
db-start:
	@echo "🚀 Starting PostgreSQL service..."
	@if ! brew services list | grep postgresql | grep started > /dev/null; then \
		brew services start postgresql; \
		echo "✅ PostgreSQL service started"; \
	else \
		echo "✅ PostgreSQL service already running"; \
	fi

.PHONY: db-create
db-create:
	@echo "🗄️  Creating typedash database..."
	@if ! psql -lqt | cut -d \| -f 1 | grep -qw typedash; then \
		createdb typedash; \
		echo "✅ Database 'typedash' created"; \
	else \
		echo "✅ Database 'typedash' already exists"; \
	fi

.PHONY: db-schema
db-schema:
	@echo "📋 Applying database schema..."
	@if [ "$$(psql -d typedash -t -c "\dt" | wc -l)" -gt 0 ]; then \
		echo "✅ Schema already applied"; \
	else \
		psql -d typedash -f server/db/schema.sql; \
		echo "✅ Schema applied successfully"; \
	fi

.PHONY: db-reset
db-reset:
	@echo "🔄 Resetting database..."
	@echo "⚠️  This will drop and recreate the database!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	dropdb typedash 2>/dev/null || true
	createdb typedash
	psql -d typedash -f server/db/schema.sql
	@echo "✅ Database reset complete!"

.PHONY: db-status
db-status:
	@echo "📊 Database Status:"
	@echo "PostgreSQL Service: $$(brew services list | grep postgresql | awk '{print $$2}')"
	@echo "Database exists: $$(psql -lqt | cut -d \| -f 1 | grep -qw typedash && echo "Yes" || echo "No")"
	@echo "Tables: $$(psql -d typedash -c "\dt" 2>/dev/null | wc -l | tr -d ' ')"

.PHONY: lint
lint:
	@echo "🔍 Linting Go code..."
	cd server && go vet ./...
	@echo "🔍 Linting React code..."
	cd client && npm run lint
	@echo "✅ Linting complete!"