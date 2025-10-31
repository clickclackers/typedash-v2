package handlers

import (
	"net/http"

	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/gin-gonic/gin"
)

// GetUserOverviewStats GET /user_overview_stats
func GetUserOverviewStats(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "User not authenticated"})
			return
		}

		userIdInt, ok := userId.(int32)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Invalid user ID type"})
			return
		}

		stats, err := q.GetOverviewStatsByUserID(c.Request.Context(), int32(userIdInt))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get user overview stats"})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}

// CreateUserOverviewStats POST /user_overview_stats
func CreateUserOverviewStats(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"message": "User ID is required"})
			return
		}

		userIdInt, ok := userId.(int32)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Invalid user ID type"})
			return
		}

		var stats db.UserOverviewStat
		if err := c.ShouldBindJSON(&stats); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
			return
		}

		stats.UserID = int32(userIdInt)

		newStats, err := q.CreateUserOverviewStats(c.Request.Context(), db.CreateUserOverviewStatsParams(stats))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create user overview stats"})
			return
		}

		c.JSON(http.StatusCreated, newStats)
	}

}
