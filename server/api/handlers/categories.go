package handlers

import (
	"net/http"

	db "github.com/clickclackers/typedash-v2/db/sqlc"
	"github.com/gin-gonic/gin"
)

// GetCategories GET /categories
func GetCategories(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		categories, err := q.GetAllCategories(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch categories"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"categories": categories})
	}
}
