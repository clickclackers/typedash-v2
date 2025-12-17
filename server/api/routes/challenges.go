package routes

import (
	"github.com/clickclackers/typedash-v2/api/handlers"
	db "github.com/clickclackers/typedash-v2/db/sqlc"
	"github.com/gin-gonic/gin"
)

func ChallengesRoutes(router *gin.RouterGroup, queries *db.Queries) {
	challenges := router.Group("/challenges")
	{
		challenges.GET("", handlers.GetChallengesByCategory(queries))
	}
}
