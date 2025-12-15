package main

import (
	"context"
	"fmt"
	"log"
	"os"

	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/jackc/pgx/v5/pgxpool"
)

var queries *db.Queries

// InitDB initializes the database connection and sqlc queries
func InitDB() error {
	var postgresUser, postgresPassword, postgresDb []byte
	if os.Getenv("IS_LOCAL_DEV") == "true" {
		postgresUser = []byte(os.Getenv("POSTGRES_USER"))
		postgresPassword = []byte(os.Getenv("POSTGRES_PASSWORD"))
		postgresDb = []byte(os.Getenv("POSTGRES_DB"))
	} else {
		var err error
		postgresUser, err = os.ReadFile("/run/secrets/postgres_user")
		if err != nil {
			return fmt.Errorf("failed to read POSTGRES_USER_FILE: %v", err)
		}
		postgresPassword, err = os.ReadFile("/run/secrets/postgres_password")
		if err != nil {
			return fmt.Errorf("failed to read POSTGRES_PASSWORD_FILE: %v", err)
		}
		postgresDb, err = os.ReadFile("/run/secrets/postgres_db")
		if err != nil {
			return fmt.Errorf("failed to read POSTGRES_DB_FILE: %v", err)
		}
	}

	dsn := fmt.Sprintf("postgres://%s:%s@db:5432/%s", postgresUser, postgresPassword, postgresDb)

	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	// Test the connection
	if err := pool.Ping(context.Background()); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	// Initialize sqlc queries
	queries = db.New(pool)

	log.Println("Database connected successfully")
	return nil
}
