package routes

import (
	"github.com/clickclackers/typedash-v2/api/handlers"
	db "github.com/clickclackers/typedash-v2/db/sqlc"
	"github.com/gin-gonic/gin"
)

func CategoriesRoutes(router *gin.RouterGroup, queries *db.Queries) {
	categories := router.Group("/categories")
	{
		categories.GET("", handlers.GetCategories(queries))
	}
}
