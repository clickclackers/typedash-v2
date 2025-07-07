package routes

import (
	"github.com/clickclackers/typedash-v2/server/api/handlers"
	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/gin-gonic/gin"
)

func RegisterSingleplayerChallengeStatsRoutes(router *gin.RouterGroup, queries *db.Queries) {
	singleplayerChallengeStats := router.Group("/user_overview_stats")
	{
		singleplayerChallengeStats.GET("/", handlers.GetSingleChallengeStats(queries))
		singleplayerChallengeStats.POST("/", handlers.CreateSingleChallengeStats(queries))
	}
}
