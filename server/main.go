package main

import (
	"log"
	"os"

	"github.com/clickclackers/typedash-v2/api/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func getAllowedOrigins() []string {
	if os.Getenv("IS_LOCAL_DEV") == "true" {
		return []string{"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"}
	}
	return []string{"https://typedash.songyang.dev", "https://typedash-v2.netlify.app"}
}

func main() {
	if err := InitDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	router := gin.Default()

	// Configure CORS middleware
	config := cors.Config{
		AllowOrigins:     getAllowedOrigins(),
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

	router.POST("/register", handlers.RegisterHandler(queries, pool))
	router.POST("/login", handlers.LoginHandler(queries))
	router.POST("/logout", handlers.LogoutHandler())

	router.GET("/challenges", handlers.GetChallengesByCategory(queries))
	router.GET("/categories", handlers.GetCategories(queries))

	// Protected routes
	protected := router.Group("/")
	protected.Use(handlers.AuthMiddleware())

	// User profile for auth checking (as we are using cookies for auth)
	protected.GET("/user", handlers.GetUserProfileHandler(queries))
	// Challenge stats
	protected.GET("/user_overview_stats", handlers.GetUserOverviewStats(queries))
	protected.POST("/user_overview_stats", handlers.CreateUserOverviewStats(queries))
	protected.GET("/single_challenge_stats", handlers.GetSingleChallengeStats(queries))
	protected.POST("/results_single", handlers.CreateSingleChallengeResults(queries, pool))
	protected.GET("/multi_challenge_stats", handlers.GetMultiChallengeStats(queries))
	protected.POST("/results_multi", handlers.CreateMultiChallengeStats(queries))

	// WebSocket endpoint - no auth to allow anonymous multiplayer
	router.GET("/ws", func(c *gin.Context) {
		HandleWebSocket(c.Writer, c.Request)
	})

	log.Println("Server starting on port 3000...")
	err := router.Run(":3000")
	if err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
