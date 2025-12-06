package handlers

import (
	"fmt"
	"net/http"

	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/gin-gonic/gin"
)

// GetChallengesByCategory GET /challenges
func GetChallengesByCategory(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("inside GetChallengesByCategory")
		category := c.Query("category")
		challenges, err := q.GetChallengesByCategory(c.Request.Context(), category)
		if err != nil {
			fmt.Println("Failed to fetch challenges", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch challenges"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"challenges": challenges})
	}
}
