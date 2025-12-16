package routes

import (
	"github.com/clickclackers/typedash-v2/server/api/handlers"
	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/gin-gonic/gin"
)

func SingleplayerChallengeStatsRoutes(router *gin.RouterGroup, queries *db.Queries) {
	singleplayerChallengeStats := router.Group("/single_challenge_stats")
	{
		singleplayerChallengeStats.GET("", handlers.GetSingleChallengeStats(queries))
		singleplayerChallengeStats.POST("", handlers.CreateSingleChallengeStats(queries))
	}
}
