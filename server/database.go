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
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return fmt.Errorf("DATABASE_URL is not set in the environment variables")
	}

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
