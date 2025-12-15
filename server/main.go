package main

import (
	"log"

	"github.com/clickclackers/typedash-v2/server/api/handlers"
	"github.com/clickclackers/typedash-v2/server/api/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("Warning: .env file not found. This is normal in production as we are using Docker secrets.")
	}

	// Initialize database
	if err := InitDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Initialize WebSocket hub
	// hub := NewHub(rdb)
	// go hub.Run()

	router := gin.Default()

	// Configure CORS middleware
	config := cors.Config{
		AllowOrigins:     []string{"https://typedash.songyang.dev", "https://typedash-v2.netlify.app", "http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}

	// Apply the middleware
	router.Use(cors.New(config))

	// Health check endpoint
	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "OK",
		})
	})

	router.POST("/register", handlers.RegisterHandler(queries))
	router.POST("/login", handlers.LoginHandler(queries))
	router.POST("/logout", handlers.LogoutHandler())

	routes.ChallengesRoutes(router.Group("/"), queries)

	// Protected routes
	protected := router.Group("/")
	protected.Use(handlers.AuthMiddleware())

	// Routes for user overview stats, singleplayer and multiplayer stats
	routes.UserOverviewStatsRoutes(protected, queries)
	routes.SingleplayerChallengeStatsRoutes(protected, queries)
	routes.MultiplayerChallengeStatsRoutes(protected, queries)

	// WebSocket endpoint - no auth to allow anonymous multiplayer
	// router.GET("/ws", func(c *gin.Context) {
	// 	hub.handleWebsocket(c.Writer, c.Request)
	// })

	log.Println("Server starting on port 3000...")
	err := router.Run(":3000")
	if err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
