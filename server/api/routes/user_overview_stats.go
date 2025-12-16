package routes

import (
	"github.com/clickclackers/typedash-v2/server/api/handlers"
	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/gin-gonic/gin"
)

func UserOverviewStatsRoutes(router *gin.RouterGroup, queries *db.Queries) {
	userOverviewStats := router.Group("/user_overview_stats")
	{
		userOverviewStats.GET("", handlers.GetUserOverviewStats(queries))
		userOverviewStats.POST("", handlers.CreateUserOverviewStats(queries))
	}
}
