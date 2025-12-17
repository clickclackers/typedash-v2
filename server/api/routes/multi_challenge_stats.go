package routes

import (
	"github.com/clickclackers/typedash-v2/api/handlers"
	db "github.com/clickclackers/typedash-v2/db/sqlc"
	"github.com/gin-gonic/gin"
)

func MultiplayerChallengeStatsRoutes(router *gin.RouterGroup, queries *db.Queries) {
	multiplayerChallengeStats := router.Group("/multi_challenge_stats")
	{
		multiplayerChallengeStats.GET("", handlers.GetMultiChallengeStats(queries))
		multiplayerChallengeStats.POST("", handlers.CreateMultiChallengeStats(queries))
	}
}
