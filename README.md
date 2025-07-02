# typedash

## Getting started

1. `brew install sqlc pre-commit golangci-lint goimports golang-migrate redis postgresql`
2. `pre-commit install`
3. `make install`
4. Add `export PATH="$HOME/go/bin:$PATH"` to `~/.zshrc`
5. `make db-setup`
6. `make dev`

## Push database schema changes

We use `go-migrate` CLI to generate migrations, and `sqlc` to generate type-safe queries from the migrations

e.g. `migrate create -ext sql -dir server/db/migrations -seq add_users_table`

<!-- https://medium.com/gravel-engineering/using-sqlc-for-orm-alternative-in-golang-ft-go-migrate-pgx-b9e35ec623b2 -->

1. After making changes to db/queries or generating a new migration, run
2. `make sqlc`
