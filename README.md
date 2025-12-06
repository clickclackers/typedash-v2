# typedash

[![Netlify Status](https://api.netlify.com/api/v1/badges/daf7afaa-f590-4244-b8ea-b57ae6fd1352/deploy-status)](https://app.netlify.com/projects/typedash-v2/deploys)

Deployment link: <https://typedash.songyang.dev>

## Getting started

1. `brew install sqlc pre-commit golangci-lint goimports golang-migrate redis postgresql`
2. `make install`
3. Add `export PATH="$HOME/go/bin:$PATH"` to `~/.zshrc` for pre-commit
4. `make db-setup`
5. `make dev`

## Push database schema changes

We use `go-migrate` CLI to generate migrations, and `sqlc` to generate type-safe queries from the migrations. Manual is found at `migrate -help`

### To update schema

1. `migrate create -ext sql -dir server/db/migrations -seq <migration_name>`
2. Write up and down migrations, ensuring idempotency (refer to the [tutorial](https://github.com/golang-migrate/migrate/blob/master/database/postgres/TUTORIAL.md))
3. `make sqlc` to generate queries
4. `make db-schema` to run migrations

### To update queries

1. Update db/queries/\*
2. `make sqlc` to generate queries
3. `make db-schema` to run migrations
