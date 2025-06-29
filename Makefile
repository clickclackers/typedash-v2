# TypeDash Development Makefile

# Default target
.PHONY: help
help:
	@echo "TypeDash Development Commands:"
	@echo "  make dev          - Start both server and client in development mode"
	@echo "  make server       - Start only the Go server"
	@echo "  make client       - Start only the React client"
	@echo "  make db           - Run sqlc generate"
	@echo "  make install      - Install all dependencies (Go modules + npm packages)"
	@echo "  make test         - Run tests for both server and client"
	@echo "  make lint         - Run linting for both server and client"

# Development targets
.PHONY: dev
dev:
	@echo "🚀 Starting TypeDash Development Environment..."
	@echo "📱 Client will be available at: http://localhost:5173"
	@echo "🔧 Server will be available at: http://localhost:8080"
	@echo "Press Ctrl+C to stop both servers"
	@trap 'kill $$(jobs -p)' EXIT; \
	cd server && go run main.go & \
	cd client && npm run dev & \
	wait

.PHONY: server
server:
	@echo "📡 Starting Go server on port 8080..."
	cd server && go run main.go

.PHONY: client
client:
	@echo "⚛️  Starting React client on port 5173..."
	cd client && npm run dev

# Installation targets
.PHONY: install
install:
	@echo "📦 Installing Go dependencies..."
	go mod download
	@echo "📦 Installing npm dependencies..."
	cd client && npm install
	@echo "✅ All dependencies installed!"

# Test targets
.PHONY: test
test:
	@echo "🧪 Running Go tests..."
	cd server && go test ./...
	@echo "🧪 Running React tests..."
	cd client && npm test
	@echo "✅ All tests complete!"

# Database targets (if you have database setup)
.PHONY: db
db:
	@echo "🗄️  Setting up database..."
	sqlc generate -f db/sqlc.yaml
	@echo "✅ Database setup complete!"

# Linting targets
.PHONY: lint
lint:
	@echo "🔍 Linting Go code..."
	cd server && go vet ./...
	@echo "🔍 Linting React code..."
	cd client && npm run lint
	@echo "✅ Linting complete!" 