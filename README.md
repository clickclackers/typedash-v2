# typedash

## Getting started

1. `brew install sqlc pre-commit golangci-lint goimports redis postgresql`
2. `pre-commit install`
3. `brew services start redis postgresql`
4. `make install`
5. `make dev`

## Push database schema changes

1. Make changes to db/schema.sql or db/queries
2. `make db`
