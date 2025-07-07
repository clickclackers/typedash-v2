package routes

import (
	"github.com/clickclackers/typedash-v2/server/api/handlers"
	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/gin-gonic/gin"
)

func RegisterUserOverviewStatsRoutes(router *gin.RouterGroup, queries *db.Queries) {
	userOverviewStats := router.Group("/user_overview_stats")
	{
		userOverviewStats.GET("/:userId", handlers.GetUserOverviewStats(queries))
		userOverviewStats.POST("/:userId", handlers.CreateUserOverviewStats(queries))
	}
}
