package main

import (
	"context"
	"os"

	"github.com/redis/go-redis/v9"
)

// Shared context for Redis operations.
var ctx = context.Background() //nolint:all

var redisHost = func() string { //nolint:all
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost:6379"
	}
	return host
}()

func newRedisClient() *redis.Client { //nolint:all
	return redis.NewClient(&redis.Options{
		Addr: redisHost,
	})
}

var rdb = newRedisClient() //nolint:all
