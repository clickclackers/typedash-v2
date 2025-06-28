# typedash

## Getting started

### Server

1. `brew install sqlc pre-commit golangci-lint goimports redis postgresql`
2. `pre-commit install`
3. `brew services start redis postgresql`
4. `go install`
5. `go run server/main.go`

### Client

1. `cd frontend && npm i`
2. `npm run dev`

## Push database schema changes

1. Make changes to db/schema.sql or db/queries
2. `sqlc generate -f internal/db/sqlc.yaml`
