package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/jackc/pgx/v5/pgxpool"
)

var queries *db.Queries

// getSecret reads a value from Docker secrets file or falls back to environment variable.
// Docker secrets are mounted at /run/secrets/<secret_name>.
func getSecret(secretName string) string {
	secretPath := "/run/secrets/" + secretName
	if data, err := os.ReadFile(secretPath); err == nil {
		return strings.TrimSpace(string(data))
	}
	return ""
}

// InitDB initializes the database connection and sqlc queries
func InitDB() error {
	var postgresUser, postgresPassword, postgresDb string

	if os.Getenv("IS_LOCAL_DEV") == "true" {
		// Development: read from environment variables
		postgresUser = os.Getenv("POSTGRES_USER")
		postgresPassword = os.Getenv("POSTGRES_PASSWORD")
		postgresDb = os.Getenv("POSTGRES_DB")
	} else {
		// Production: read from Docker secrets
		postgresUser = getSecret("postgres_user")
		postgresPassword = getSecret("postgres_password")
		postgresDb = getSecret("postgres_db")
	}

	// Validate that we have all required values
	if postgresUser == "" {
		return fmt.Errorf("POSTGRES_USER is not set")
	}
	if postgresPassword == "" {
		return fmt.Errorf("POSTGRES_PASSWORD is not set")
	}
	if postgresDb == "" {
		return fmt.Errorf("POSTGRES_DB is not set")
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
