package handlers

import (
	"net/http"
	"strconv"

	db "github.com/clickclackers/typedash-v2/db/sqlc"
	"github.com/gin-gonic/gin"
)

// GetChallengesByCategory GET /challenges
func GetChallengesByCategory(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryId := c.Query("categoryId")
		categoryIdInt, err := strconv.Atoi(categoryId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid categoryId"})
			return
		}
		challenges, err := q.GetChallengesByCategory(c.Request.Context(), int32(categoryIdInt))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch challenges"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"challenges": challenges})
	}
}
