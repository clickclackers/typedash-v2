package main

import (
	"context"
	"fmt"
	"log"
	"os"

	db "github.com/clickclackers/typedash-v2-backend/server/db/sqlc"
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

// CreateUser creates a new user in the database using sqlc
func CreateUser(username, email, passwordHash string) (int32, error) {
	ctx := context.Background()
	user, err := queries.CreateUser(ctx, db.CreateUserParams{
		Username:     username,
		Email:        email,
		PasswordHash: passwordHash,
	})
	if err != nil {
		return 0, err
	}
	// TODO: Create user overview stats entry
	return user.ID, nil
}

// GetUserByEmail retrieves a user by email using sqlc
func GetUserByEmail(email string) (int32, string, string, string, error) {
	ctx := context.Background()
	user, err := queries.GetUserByEmail(ctx, email)
	if err != nil {
		return 0, "", "", "", err
	}
	return user.ID, user.Username, user.Email, user.PasswordHash, nil
}

// GetUserByID retrieves a user by ID using sqlc
func GetUserByID(userID int32) (string, string, error) {
	ctx := context.Background()
	user, err := queries.GetUser(ctx, userID)
	if err != nil {
		return "", "", err
	}
	return user.Username, user.Email, nil
}

// GetUserOverviewStats retrieves user overview stats using sqlc
func GetUserOverviewStats(userID int32) (db.UserOverviewStat, error) {
	ctx := context.Background()
	return queries.GetOverviewStatsByUserID(ctx, userID)
}
