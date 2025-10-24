// // server/redis.go
package main

import (
	"context"
	"os"

	"github.com/redis/go-redis/v9"
)

// A context for our application (e.g., for Redis operations)
var ctx = context.Background()

var redisHost = func() string {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost:6379"
	}
	return host
}()

var rdb = redis.NewClient(&redis.Options{
	Addr: redisHost,
})
