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
	postgresUser := os.Getenv("POSTGRES_USER")
	if postgresUser == "" {
		return fmt.Errorf("POSTGRES_USER is not set in the environment variables")
	}
	postgresPassword := os.Getenv("POSTGRES_PASSWORD")
	if postgresPassword == "" {
		return fmt.Errorf("POSTGRES_PASSWORD is not set in the environment variables")
	}
	postgresDb := os.Getenv("POSTGRES_DB")
	if postgresDb == "" {
		return fmt.Errorf("POSTGRES_DB is not set in the environment variables")
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
