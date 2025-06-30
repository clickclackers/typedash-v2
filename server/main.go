package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Initialize database
	if err := InitDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Set JWT secret if not provided
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET is not set in the environment variables")
	}

	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:4173", "https://typedash.songyang.dev", "https://typedash-v2.netlify.app"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowCredentials = true

	router.Use(cors.New(config))

	// Health check endpoint
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Authentication routes
	router.POST("/register", RegisterHandler)
	router.POST("/login", LoginHandler)
	router.POST("/logout", LogoutHandler)

	// Protected routes
	protected := router.Group("/")
	protected.Use(AuthMiddleware())
	{
		protected.GET("/profile", GetUserProfileHandler)
		// Add other protected routes here
	}

	log.Println("Server starting on port 3000...")
	err := router.Run(":3000")
	if err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
